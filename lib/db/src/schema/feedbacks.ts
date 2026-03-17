import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feedbacksTable = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }),
  message: text("message").notNull(),
  category: varchar("category", { length: 64 }).notNull().default("Без категории"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbacksTable).omit({ id: true, createdAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacksTable.$inferSelect;
