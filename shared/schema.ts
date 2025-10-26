import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb, integer, date } from "drizzle-orm/pg-core";
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
  
  // External references
  lab_id: text("lab_id"), // NULL for internal work orders
  template_id: text("template_id"),
  
  // Open Dental References (for crown work orders)
  opendental_patient_id: integer("opendental_patient_id"),
  opendental_procedure_id: integer("opendental_procedure_id"),
  opendental_appointment_id: integer("opendental_appointment_id"),
  opendental_lab_case_id: integer("opendental_lab_case_id"),
  
  // Legacy fields (for non-crown lab slips)
  patient_id: text("patient_id"),
  procedure_type: text("procedure_type"),
  laboratory_id: text("laboratory_id"),
  provider_id: text("provider_id"),
  notes: text("notes"),
  
  // Patient Information (for crown work orders)
  patient_name: text("patient_name"),
  patient_dob: date("patient_dob"),
  
  // Procedure Information (for crown work orders)
  procedure_code: text("procedure_code"),
  procedure_description: text("procedure_description"),
  tooth_number: text("tooth_number"),
  
  // Common fields
  shade: text("shade"),
  due_date: text("due_date"), // TEXT type matches current database
  
  // Work Order Data (JSONB for crown work orders)
  lab_slip_data: jsonb("lab_slip_data"),
  special_instructions: text("special_instructions"),
  
  // Status - now supports both lab slip and crown work order statuses
  // Lab slip statuses: draft, sent, received, completed, cancelled
  // Crown work order statuses: pending, scanned, designed, milling, sintering, finishing, qc, ready, seated, cancelled, on_hold
  status: text("status").notNull().default('draft'),
  
  // Files
  pdf_url: text("pdf_url"),
  pdf_storage_path: text("pdf_storage_path"),
  
  // Legacy metadata field
  metadata: jsonb("metadata"),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  sent_at: timestamp("sent_at"),
  completed_at: timestamp("completed_at"),
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
