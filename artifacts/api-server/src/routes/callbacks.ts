import { Router, type IRouter } from "express";
import { eq, desc, asc, ilike, or, sql, count, gte, lte, and } from "drizzle-orm";
import { db, callbacksTable } from "@workspace/db";
import {
  CreateCallbackBody,
  ListCallbacksQueryParams,
  UpdateCallbackStatusBody,
  UpdateCallbackStatusParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 3 * 60 * 1000;

const VALID_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

function isValidCallDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date <= today) return false;

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  return true;
}

router.post("/v1/callbacks", async (req, res): Promise<void> => {
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

  const parsed = CreateCallbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: parsed.error.issues[0]?.message || "Ошибка валидации",
    });
    return;
  }

  const data = parsed.data;

  const phoneRegex = /^\+7\d{10}$/;
  if (!phoneRegex.test(data.phoneNumber)) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректный формат номера телефона",
    });
    return;
  }

  if (!isValidCallDate(data.callDate)) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректная дата звонка. Дата должна быть будущим рабочим днём.",
    });
    return;
  }

  if (!VALID_TIME_SLOTS.includes(data.callTime)) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректное время звонка. Допустимое время: 09:00–18:00.",
    });
    return;
  }

  const [callback] = await db
    .insert(callbacksTable)
    .values({
      name: data.name,
      phoneNumber: data.phoneNumber,
      callDate: data.callDate,
      callTime: data.callTime,
    })
    .returning();

  rateLimitMap.set(clientIp, now);

  res.status(201).json({
    id: callback.id,
    name: callback.name,
    phoneNumber: callback.phoneNumber,
    callDate: callback.callDate,
    callTime: callback.callTime,
    status: callback.status,
    createdAt: callback.createdAt.toISOString(),
  });
});

router.get("/v1/callbacks/stats", adminAuth, async (_req, res): Promise<void> => {
  const [totalResult] = await db
    .select({ count: count() })
    .from(callbacksTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayResult] = await db
    .select({ count: count() })
    .from(callbacksTable)
    .where(sql`${callbacksTable.createdAt} >= ${today}`);

  const statusResults = await db
    .select({
      status: callbacksTable.status,
      count: count(),
    })
    .from(callbacksTable)
    .groupBy(callbacksTable.status);

  res.json({
    total: totalResult?.count || 0,
    todayCount: todayResult?.count || 0,
    byStatus: statusResults.map((r) => ({
      status: r.status,
      count: r.count,
    })),
  });
});

router.get("/v1/callbacks", adminAuth, async (req, res): Promise<void> => {
  const queryWithDates = {
    ...req.query,
    dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
    dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
  };
  const queryParsed = ListCallbacksQueryParams.safeParse(queryWithDates);
  if (!queryParsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректные параметры запроса",
    });
    return;
  }

  const { page = 1, limit = 20, status, search, dateFrom, dateTo, sortBy = "createdAt", sortOrder = "desc" } = queryParsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) {
    conditions.push(eq(callbacksTable.status, status));
  }
  if (search) {
    conditions.push(
      or(
        ilike(callbacksTable.name, `%${search}%`),
        ilike(callbacksTable.phoneNumber, `%${search}%`)
      )!
    );
  }
  if (dateFrom) {
    conditions.push(gte(callbacksTable.createdAt, dateFrom));
  }
  if (dateTo) {
    const endOfDay = new Date(dateTo.getTime());
    endOfDay.setHours(23, 59, 59, 999);
    conditions.push(lte(callbacksTable.createdAt, endOfDay));
  }

  const whereClause = conditions.length > 0
    ? and(...conditions)
    : undefined;

  const sortColumn = sortBy === "status" ? callbacksTable.status : callbacksTable.createdAt;
  const orderDir = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const [totalResult] = await db
    .select({ count: count() })
    .from(callbacksTable)
    .where(whereClause);

  const total = totalResult?.count || 0;

  const callbacks = await db
    .select()
    .from(callbacksTable)
    .where(whereClause)
    .orderBy(orderDir)
    .limit(limit)
    .offset(offset);

  const data = callbacks.map((c) => ({
    id: c.id,
    name: c.name,
    phoneNumber: c.phoneNumber,
    callDate: c.callDate,
    callTime: c.callTime,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.patch("/v1/callbacks/:id", adminAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = UpdateCallbackStatusParams.safeParse({ id: parseInt(raw, 10) });
  if (!paramsParsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректный ID",
    });
    return;
  }

  const bodyParsed = UpdateCallbackStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректный статус",
    });
    return;
  }

  const [callback] = await db
    .update(callbacksTable)
    .set({ status: bodyParsed.data.status })
    .where(eq(callbacksTable.id, paramsParsed.data.id))
    .returning();

  if (!callback) {
    res.status(404).json({
      error: "not_found",
      message: "Заявка не найдена",
    });
    return;
  }

  res.json({
    id: callback.id,
    name: callback.name,
    phoneNumber: callback.phoneNumber,
    callDate: callback.callDate,
    callTime: callback.callTime,
    status: callback.status,
    createdAt: callback.createdAt instanceof Date ? callback.createdAt.toISOString() : callback.createdAt,
  });
});

export default router;
