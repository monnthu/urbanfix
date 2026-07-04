"use client";

import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  REPORT_STATUSES,
  STATUS_LABELS,
  type ReportStatus,
} from "@/lib/constants";
import type { Report } from "@/lib/types";
import { useMemo, useState } from "react";

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
        throw new Error(payload.error || "Could not update status");
      }

      if (payload.report) {
        setReports((current) =>
          current.map((report) =>
            report.id === reportId ? payload.report! : report
          )
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Update failed");
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
            "AI quota exceeded. Try again later or check your Gemini API limits."
          );
        }
        if (payload.code === "missing_key") {
          throw new Error("AI is not configured yet. Add GEMINI_API_KEY to .env.local.");
        }
        throw new Error(payload.error || "AI request failed");
      }

      setChatAnswer(payload.answer ?? "No answer returned.");
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "Could not reach AI assistant"
      );
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-header">
          <h2>Assigned reports</h2>
          <label className="filter-label">
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ReportStatus | "all")
              }
            >
              <option value="all">All</option>
              {REPORT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredReports.length === 0 ? (
          <p className="muted">No assigned reports for this filter.</p>
        ) : (
          <ul className="report-list">
            {filteredReports.map((report) => (
              <li key={report.id} className="report-item">
                <div className="report-item-header">
                  <div>
                    <strong>{report.title}</strong>
                    <p className="muted report-id">{report.id}</p>
                  </div>
                  <span className={`badge badge-${report.status}`}>
                    {STATUS_LABELS[report.status as ReportStatus] ??
                      report.status}
                  </span>
                </div>

                <p>{report.description}</p>

                <div className="meta-row">
                  <span>
                    Category:{" "}
                    {CATEGORY_LABELS[
                      report.category as keyof typeof CATEGORY_LABELS
                    ] ?? report.category}
                  </span>
                  {report.ai_category && (
                    <span>AI: {report.ai_category}</span>
                  )}
                  <span>
                    Priority:{" "}
                    {PRIORITY_LABELS[
                      report.priority as keyof typeof PRIORITY_LABELS
                    ] ?? report.priority}
                  </span>
                  {report.ai_priority && (
                    <span>AI priority: {report.ai_priority}</span>
                  )}
                </div>

                {report.address_text && (
                  <p className="muted">{report.address_text}</p>
                )}

                <div className="actions-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    Ask AI about this case
                  </button>

                  <label className="filter-label">
                    Update status
                    <select
                      value={report.status}
                      disabled={updatingId === report.id}
                      onChange={(event) =>
                        updateStatus(
                          report.id,
                          event.target.value as ReportStatus
                        )
                      }
                    >
                      {REPORT_STATUSES.map((status) => (
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
        <h2>AI assistant</h2>
        <p className="muted">
          Ask about assigned reports, e.g. &quot;Show open flooding reports in
          Zone 3 from the last week.&quot;
        </p>

        {selectedReportId && (
          <p className="selected-case">
            Focus report: <code>{selectedReportId}</code>{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => setSelectedReportId(null)}
            >
              Clear
            </button>
          </p>
        )}

        <form onSubmit={askAssistant} className="chat-form">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about your assigned reports..."
            rows={4}
            required
          />
          <button type="submit" disabled={chatLoading}>
            {chatLoading ? "Thinking..." : "Ask assistant"}
          </button>
        </form>

        {chatError && <p className="error-box">{chatError}</p>}

        {chatAnswer && (
          <div className="answer-box">
            <strong>Assistant</strong>
            <p>{chatAnswer}</p>
          </div>
        )}
      </section>
    </div>
  );
}
