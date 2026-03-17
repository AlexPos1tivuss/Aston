import { Router, type IRouter } from "express";
import { eq, desc, asc, ilike, or, sql, count, gte, lte, and } from "drizzle-orm";
import { db, feedbacksTable } from "@workspace/db";
import {
  CreateFeedbackBody,
  ListFeedbacksQueryParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 3 * 60 * 1000;

const VALID_CATEGORIES = [
  "Без категории",
  "Отделение банка",
  "Банкоматы",
  "Сайт",
];

router.post("/v1/feedbacks", async (req, res): Promise<void> => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const lastRequest = rateLimitMap.get(clientIp);
  const now = Date.now();

  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    res.status(429).json({
      error: "rate_limit",
      message: "Превышена частота запросов. Повторите попытку позже.",
    });
    return;
  }

  const body = {
    ...req.body,
    timestamp: req.body.timestamp ? new Date(req.body.timestamp) : undefined,
  };
  const parsed = CreateFeedbackBody.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: parsed.error.issues[0]?.message || "Ошибка валидации",
    });
    return;
  }

  const data = parsed.data;

  if (!VALID_CATEGORIES.includes(data.category)) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректная категория",
    });
    return;
  }

  if (data.message.length < 20) {
    res.status(400).json({
      error: "validation_error",
      message: "Слишком короткий текст (минимальная длина - 20 символов)",
    });
    return;
  }

  if (data.message.length > 400) {
    res.status(400).json({
      error: "validation_error",
      message: "Слишком длинный текст (максимальное количество символов - 400).",
    });
    return;
  }

  const [feedback] = await db
    .insert(feedbacksTable)
    .values({
      name: data.name || null,
      message: data.message,
      category: data.category,
      timestamp: data.timestamp,
    })
    .returning();

  rateLimitMap.set(clientIp, now);

  res.status(201).json({
    id: feedback.id,
    name: feedback.name,
    message: feedback.message,
    category: feedback.category,
    timestamp: feedback.timestamp.toISOString(),
    createdAt: feedback.createdAt.toISOString(),
  });
});

router.get("/v1/feedbacks/stats", adminAuth, async (_req, res): Promise<void> => {
  const [totalResult] = await db
    .select({ count: count() })
    .from(feedbacksTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayResult] = await db
    .select({ count: count() })
    .from(feedbacksTable)
    .where(sql`${feedbacksTable.createdAt} >= ${today}`);

  const categoryResults = await db
    .select({
      category: feedbacksTable.category,
      count: count(),
    })
    .from(feedbacksTable)
    .groupBy(feedbacksTable.category);

  res.json({
    total: totalResult?.count || 0,
    todayCount: todayResult?.count || 0,
    byCategory: categoryResults.map((r) => ({
      category: r.category,
      count: r.count,
    })),
  });
});

router.get("/v1/feedbacks", adminAuth, async (req, res): Promise<void> => {
  const queryWithDates = {
    ...req.query,
    dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
    dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
  };
  const queryParsed = ListFeedbacksQueryParams.safeParse(queryWithDates);
  if (!queryParsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректные параметры запроса",
    });
    return;
  }

  const { page = 1, limit = 20, category, search, dateFrom, dateTo, sortBy = "createdAt", sortOrder = "desc" } = queryParsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (category) {
    conditions.push(eq(feedbacksTable.category, category));
  }
  if (search) {
    conditions.push(
      or(
        ilike(feedbacksTable.message, `%${search}%`),
        ilike(feedbacksTable.name, `%${search}%`)
      )!
    );
  }
  if (dateFrom) {
    conditions.push(gte(feedbacksTable.createdAt, dateFrom));
  }
  if (dateTo) {
    const endOfDay = new Date(dateTo.getTime());
    endOfDay.setHours(23, 59, 59, 999);
    conditions.push(lte(feedbacksTable.createdAt, endOfDay));
  }

  const whereClause = conditions.length > 0
    ? and(...conditions)
    : undefined;

  const sortColumn = sortBy === "category" ? feedbacksTable.category : feedbacksTable.createdAt;
  const orderDir = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const [totalResult] = await db
    .select({ count: count() })
    .from(feedbacksTable)
    .where(whereClause);

  const total = totalResult?.count || 0;

  const feedbacks = await db
    .select()
    .from(feedbacksTable)
    .where(whereClause)
    .orderBy(orderDir)
    .limit(limit)
    .offset(offset);

  const data = feedbacks.map((f) => ({
    id: f.id,
    name: f.name,
    message: f.message,
    category: f.category,
    timestamp: f.timestamp.toISOString(),
    createdAt: f.createdAt.toISOString(),
  }));

  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export default router;
