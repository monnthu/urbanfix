export const REPORT_CATEGORIES = [
  "pothole",
  "streetlight",
  "garbage",
  "water_leak",
  "flooding",
  "other",
] as const;

export const PRIORITY_LEVELS = ["low", "medium", "high", "critical"] as const;

export const REPORT_STATUSES = ["open", "in_progress", "resolved"] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  pothole: "Pothole",
  streetlight: "Broken streetlight",
  garbage: "Garbage",
  water_leak: "Water leak",
  flooding: "Flooding",
  other: "Other",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};
