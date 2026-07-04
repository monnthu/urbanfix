import type { PriorityLevel, ReportCategory, ReportStatus } from "./constants";

export type Profile = {
  id: string;
  role: "civilian" | "institution" | "admin";
  display_name: string | null;
  institution_id: string | null;
  mfa_enrolled: boolean;
};

export type Report = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory | string;
  ai_category: string | null;
  priority: PriorityLevel | string;
  ai_priority: string | null;
  latitude: number;
  longitude: number;
  address_text: string | null;
  image_url: string | null;
  status: ReportStatus | string;
  civilian_user_id: string;
  assigned_institution_id: string | null;
  created_at: string;
};

export type ImageAnalysisResult = {
  category: ReportCategory;
  priority: PriorityLevel;
  confidence: number;
  reason: string;
};

export type InstitutionChatResponse = {
  answer: string;
  referencedReportIds: string[];
  reportsUsed: number;
};
