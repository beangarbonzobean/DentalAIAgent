import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const automations = pgTable("automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  trigger: text("trigger").notNull(),
  action: text("action").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  config: jsonb("config"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const labSlips = pgTable("lab_slips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patient_id: text("patient_id").notNull(),
  procedure_type: text("procedure_type").notNull(),
  laboratory_id: text("laboratory_id"),
  provider_id: text("provider_id"),
  notes: text("notes"),
  shade: text("shade"),
  due_date: text("due_date"),
  status: text("status").notNull().default('draft'),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertLabSlipSchema = createInsertSchema(labSlips).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automations.$inferSelect;

export type InsertLabSlip = z.infer<typeof insertLabSlipSchema>;
export type LabSlip = typeof labSlips.$inferSelect;
