// Enums alineados con Urbanfix (C#) y el esquema Supabase (columnas int)

export enum ReportCategory {
  Flooding = 0,
  Pothole = 1,
  Streetlight = 2,
  Garbage = 3,
  Graffiti = 4,
  Other = 5,
}

export enum ReportPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

export enum ReportStatus {
  Open = 0,
  Assigned = 1,
  InProgress = 2,
  Resolved = 3,
  Unassigned = 4,
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  [ReportCategory.Flooding]: "Inundación",
  [ReportCategory.Pothole]: "Bache",
  [ReportCategory.Streetlight]: "Alumbrado público",
  [ReportCategory.Garbage]: "Basura",
  [ReportCategory.Graffiti]: "Graffiti",
  [ReportCategory.Other]: "Otro",
};

export const PRIORITY_LABELS: Record<ReportPriority, string> = {
  [ReportPriority.Low]: "Baja",
  [ReportPriority.Medium]: "Media",
  [ReportPriority.High]: "Alta",
  [ReportPriority.Critical]: "Crítica",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.Open]: "Abierto",
  [ReportStatus.Assigned]: "Asignado",
  [ReportStatus.InProgress]: "En progreso",
  [ReportStatus.Resolved]: "Resuelto",
  [ReportStatus.Unassigned]: "Sin asignar",
};

export const CATEGORY_SLUGS: Record<ReportCategory, string> = {
  [ReportCategory.Flooding]: "flooding",
  [ReportCategory.Pothole]: "pothole",
  [ReportCategory.Streetlight]: "streetlight",
  [ReportCategory.Garbage]: "garbage",
  [ReportCategory.Graffiti]: "graffiti",
  [ReportCategory.Other]: "other",
};

export const SLUG_TO_CATEGORY: Record<string, ReportCategory> = {
  flooding: ReportCategory.Flooding,
  inundacion: ReportCategory.Flooding,
  inundación: ReportCategory.Flooding,
  pothole: ReportCategory.Pothole,
  bache: ReportCategory.Pothole,
  streetlight: ReportCategory.Streetlight,
  alumbrado: ReportCategory.Streetlight,
  garbage: ReportCategory.Garbage,
  basura: ReportCategory.Garbage,
  graffiti: ReportCategory.Graffiti,
  other: ReportCategory.Other,
  otro: ReportCategory.Other,
};

export const SLUG_TO_PRIORITY: Record<string, ReportPriority> = {
  low: ReportPriority.Low,
  baja: ReportPriority.Low,
  medium: ReportPriority.Medium,
  media: ReportPriority.Medium,
  high: ReportPriority.High,
  alta: ReportPriority.High,
  critical: ReportPriority.Critical,
  critica: ReportPriority.Critical,
  crítica: ReportPriority.Critical,
};

export const SLUG_TO_STATUS: Record<string, ReportStatus> = {
  open: ReportStatus.Open,
  abierto: ReportStatus.Open,
  assigned: ReportStatus.Assigned,
  asignado: ReportStatus.Assigned,
  in_progress: ReportStatus.InProgress,
  "en progreso": ReportStatus.InProgress,
  resolved: ReportStatus.Resolved,
  resuelto: ReportStatus.Resolved,
  unassigned: ReportStatus.Unassigned,
  "sin asignar": ReportStatus.Unassigned,
};

export const INSTITUTION_STATUSES = ["pending", "approved", "rejected"] as const;
export type InstitutionStatus = (typeof INSTITUTION_STATUSES)[number];

export function isReportCategory(value: number): value is ReportCategory {
  return value in CATEGORY_LABELS;
}

export function isReportPriority(value: number): value is ReportPriority {
  return value in PRIORITY_LABELS;
}

export function isReportStatus(value: number): value is ReportStatus {
  return value in STATUS_LABELS;
}

export function categoryLabel(value: number | null | undefined): string {
  if (value === null || value === undefined || !isReportCategory(value)) {
    return String(value ?? "—");
  }
  return CATEGORY_LABELS[value];
}

export function priorityLabel(value: number | null | undefined): string {
  if (value === null || value === undefined || !isReportPriority(value)) {
    return String(value ?? "—");
  }
  return PRIORITY_LABELS[value];
}

export function statusLabel(value: number | null | undefined): string {
  if (value === null || value === undefined || !isReportStatus(value)) {
    return String(value ?? "—");
  }
  return STATUS_LABELS[value];
}
