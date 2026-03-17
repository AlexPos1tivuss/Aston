import { Router, type IRouter } from "express";
import { eq, desc, asc, ilike, or, sql, count } from "drizzle-orm";
import { db, callbacksTable } from "@workspace/db";
import {
  CreateCallbackBody,
  ListCallbacksQueryParams,
  ListCallbacksResponse,
  UpdateCallbackStatusBody,
  UpdateCallbackStatusParams,
  UpdateCallbackStatusResponse,
  GetCallbackStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 3 * 60 * 1000;

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

router.get("/v1/callbacks", async (req, res): Promise<void> => {
  const queryParsed = ListCallbacksQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "Некорректные параметры запроса",
    });
    return;
  }

  const { page = 1, limit = 20, status, search, sortBy = "createdAt", sortOrder = "desc" } = queryParsed.data;
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

  const whereClause = conditions.length > 0
    ? conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`
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

router.patch("/v1/callbacks/:id", async (req, res): Promise<void> => {
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

router.get("/v1/callbacks/stats", async (_req, res): Promise<void> => {
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

export default router;
