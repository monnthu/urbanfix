"use client";

import {
  ReportStatus,
  STATUS_LABELS,
  categoryLabel,
  priorityLabel,
  statusLabel,
} from "@/lib/constants";
import type { Report } from "@/lib/types";
import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  ReportStatus.Open,
  ReportStatus.Assigned,
  ReportStatus.InProgress,
  ReportStatus.Resolved,
  ReportStatus.Unassigned,
] as const;

type Props = {
  initialReports: Report[];
};

export function InstitutionDashboard({ initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [question, setQuestion] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    if (statusFilter === "all") return reports;
    return reports.filter((report) => report.status === statusFilter);
  }, [reports, statusFilter]);

  async function updateStatus(reportId: string, status: ReportStatus) {
    setUpdatingId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as {
        report?: Report;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo actualizar el estado");
      }

      if (payload.report) {
        setReports((current) =>
          current.map((report) =>
            report.id === reportId ? payload.report! : report
          )
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  }

  async function askAssistant(event: React.FormEvent) {
    event.preventDefault();
    setChatLoading(true);
    setChatError(null);
    setChatAnswer(null);

    try {
      const response = await fetch("/api/ai/institution-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          reportId: selectedReportId ?? undefined,
        }),
      });

      const payload = (await response.json()) as {
        answer?: string;
        error?: string;
        code?: string;
      };

      if (!response.ok) {
        if (payload.code === "quota_exceeded") {
          throw new Error(
            "Cuota de IA agotada. Intenta más tarde o revisa los límites de Gemini."
          );
        }
        if (payload.code === "missing_key") {
          throw new Error("IA no configurada. Agrega GEMINI_API_KEY al entorno.");
        }
        throw new Error(payload.error || "Falló la consulta a la IA");
      }

      setChatAnswer(payload.answer ?? "Sin respuesta.");
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "No se pudo contactar al asistente"
      );
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-header">
          <h2>Reportes asignados</h2>
          <label className="filter-label">
            Estado
            <select
              value={statusFilter === "all" ? "all" : String(statusFilter)}
              onChange={(event) => {
                const value = event.target.value;
                setStatusFilter(
                  value === "all" ? "all" : (Number(value) as ReportStatus)
                );
              }}
            >
              <option value="all">Todos</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredReports.length === 0 ? (
          <p className="muted">No hay reportes asignados con este filtro.</p>
        ) : (
          <ul className="report-list">
            {filteredReports.map((report) => (
              <li key={report.id} className="report-item">
                <div className="report-item-header">
                  <div>
                    <strong>{report.title}</strong>
                    <p className="muted report-id">{report.id}</p>
                  </div>
                  <span className={`badge badge-status-${report.status}`}>
                    {statusLabel(report.status)}
                  </span>
                </div>

                <p>{report.description}</p>

                <div className="meta-row">
                  <span>Categoría: {categoryLabel(report.category)}</span>
                  {report.ai_category && <span>IA: {report.ai_category}</span>}
                  <span>Prioridad: {priorityLabel(report.priority)}</span>
                  {report.ai_priority && (
                    <span>Prioridad IA: {report.ai_priority}</span>
                  )}
                  {report.ai_confidence != null && (
                    <span>Confianza IA: {report.ai_confidence}</span>
                  )}
                </div>

                <div className="actions-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    Preguntar a la IA sobre este caso
                  </button>

                  <label className="filter-label">
                    Actualizar estado
                    <select
                      value={report.status}
                      disabled={updatingId === report.id}
                      onChange={(event) =>
                        updateStatus(report.id, Number(event.target.value) as ReportStatus)
                      }
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Asistente de IA</h2>
        <p className="muted">
          Pregunta sobre tus reportes asignados, por ejemplo: &quot;Muéstrame
          reportes abiertos de inundación de la última semana&quot;.
        </p>

        {selectedReportId && (
          <p className="selected-case">
            Reporte en foco: <code>{selectedReportId}</code>{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => setSelectedReportId(null)}
            >
              Quitar
            </button>
          </p>
        )}

        <form onSubmit={askAssistant} className="chat-form">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Pregunta sobre tus reportes asignados..."
            rows={4}
            required
          />
          <button type="submit" disabled={chatLoading}>
            {chatLoading ? "Pensando..." : "Preguntar al asistente"}
          </button>
        </form>

        {chatError && <p className="error-box">{chatError}</p>}

        {chatAnswer && (
          <div className="answer-box">
            <strong>Asistente</strong>
            <p>{chatAnswer}</p>
          </div>
        )}
      </section>
    </div>
  );
}
