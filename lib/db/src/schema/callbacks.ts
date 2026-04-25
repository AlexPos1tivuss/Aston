import { pgTable, serial, varchar, date, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const callbacksTable = pgTable("callbacks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  callDate: varchar("call_date", { length: 20 }).notNull(),
  callTime: varchar("call_time", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("new"),
  operatorNumber: integer("operator_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCallbackSchema = createInsertSchema(callbacksTable).omit({ id: true, createdAt: true, status: true, operatorNumber: true });
export type InsertCallback = z.infer<typeof insertCallbackSchema>;
export type Callback = typeof callbacksTable.$inferSelect;
