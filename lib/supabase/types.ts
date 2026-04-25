import type { NutritionalTarget, DietaryRestriction, MealItem } from "@/lib/types";

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: ClientRow;
        Insert: Omit<ClientRow, "id" | "created_at" | "last_active">;
        Update: Partial<Omit<ClientRow, "id" | "created_at">>;
      };
      meal_logs: {
        Row: MealLogRow;
        Insert: Omit<MealLogRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Pick<MealLogRow, "items" | "updated_at">>;
      };
      clinical_notes: {
        Row: ClinicalNoteRow;
        Insert: Omit<ClinicalNoteRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Pick<ClinicalNoteRow, "content" | "updated_at">>;
      };
      condition_templates: {
        Row: ConditionTemplateRow;
        Insert: Omit<ConditionTemplateRow, "id" | "created_at">;
        Update: Partial<Omit<ConditionTemplateRow, "id" | "created_at" | "practitioner_id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export interface ClientRow {
  id: string;
  practitioner_id: string;
  name: string;
  pin: string | null;
  restrictions: DietaryRestriction[];
  targets: NutritionalTarget[];
  condition_tags: string[];
  created_at: string;
  archived_at: string | null;
  last_active: string | null;
}

export interface MealLogRow {
  id: string;
  client_id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  items: MealItem[];
  created_at: string;
  updated_at: string;
}

export interface ClinicalNoteRow {
  id: string;
  client_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ConditionTemplateRow {
  id: string;
  practitioner_id: string;
  name: string;
  description: string | null;
  restrictions: DietaryRestriction[];
  targets: NutritionalTarget[];
  created_at: string;
}
