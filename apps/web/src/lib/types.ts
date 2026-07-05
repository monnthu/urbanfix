import type { InstitutionStatus } from "./constants";
import { ReportCategory, ReportPriority, ReportStatus } from "./constants";

export type Profile = {
  id: string;
  role: "civilian" | "institution";
  full_name: string | null;
  created_at: string;
};

export type Institution = {
  id: string;
  profile_id: string;
  name: string;
  official_domain: string;
  category: string | null;
  zone: string | null;
  status: InstitutionStatus;
  created_at: string;
  reviewed_at: string | null;
};

export type ReportImage = {
  id: string;
  report_id: string;
  storage_path: string | null;
  thumbnail_path: string | null;
  content_type: string;
  file_size_bytes: number;
  sort_order: number;
  created_at: string;
};

export type Report = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  priority: ReportPriority | null;
  latitude: number;
  longitude: number;
  civilian_user_id: string;
  institution_id: string | null;
  status: ReportStatus;
  ai_category: string | null;
  ai_priority: string | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string | null;
  report_images?: ReportImage[];
};

export type ImageAnalysisResult = {
  category: ReportCategory;
  categorySlug: string;
  priority: ReportPriority;
  prioritySlug: string;
  confidence: number;
  reason: string;
};

export type InstitutionChatResponse = {
  answer: string;
  referencedReportIds: string[];
  reportsUsed: number;
};

export type InstitutionContext = {
  profile: Profile;
  institution: Institution;
};
