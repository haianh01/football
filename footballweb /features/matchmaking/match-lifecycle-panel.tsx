"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { MatchApiFailure, MatchApiSuccess, MatchSummary } from "./types";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
] as const;

const fieldOptions = [
  { value: "five", label: "Sân 5" },
  { value: "seven", label: "Sân 7" },
  { value: "eleven", label: "Sân 11" }
] as const;

type MatchUpdateResponse = MatchApiSuccess<MatchSummary>;

function readApiErrorMessage(payload: MatchApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function MatchLifecyclePanel({
  matchId,
  initialMatch
}: {
  matchId: string;
  initialMatch: MatchSummary;
}) {
  const router = useRouter();
  const [scheduleState, setScheduleState] = useState({
    status: initialMatch.status,
    date: initialMatch.date,
    start_time: initialMatch.start_time,
    end_time: initialMatch.end_time ?? "",
    venue_name: initialMatch.venue_name ?? "",
    venue_address: initialMatch.venue_address ?? "",
    city_code: initialMatch.city_code ?? "",
    district_code: initialMatch.district_code ?? "",
    field_type: initialMatch.field_type
  });
  const [resultState, setResultState] = useState({
    home_score: initialMatch.home_score?.toString() ?? "",
    away_score: initialMatch.away_score?.toString() ?? "",
    result_note: initialMatch.result_note ?? ""
  });
  const [schedulePending, setSchedulePending] = useState(false);
  const [resultPending, setResultPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function syncFromMatch(match: MatchSummary) {
    setScheduleState({
      status: match.status,
      date: match.date,
      start_time: match.start_time,
      end_time: match.end_time ?? "",
      venue_name: match.venue_name ?? "",
      venue_address: match.venue_address ?? "",
      city_code: match.city_code ?? "",
      district_code: match.district_code ?? "",
      field_type: match.field_type
    });
    setResultState({
      home_score: match.home_score?.toString() ?? "",
      away_score: match.away_score?.toString() ?? "",
      result_note: match.result_note ?? ""
    });
  }

  async function submitUpdate(payload: Record<string, unknown>, fallbackMessage: string) {
    const response = await fetch(`/api/v1/matches/${matchId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const apiPayload = (await response.json().catch(() => null)) as MatchUpdateResponse | MatchApiFailure | null;

    if (!response.ok || !apiPayload || !("data" in apiPayload)) {
      throw new Error(readApiErrorMessage(apiPayload as MatchApiFailure | null, fallbackMessage));
    }

    syncFromMatch(apiPayload.data);
    router.refresh();

    return apiPayload.data;
  }

  async function onSubmitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSchedulePending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await submitUpdate(
        {
          status: scheduleState.status,
          date: scheduleState.date,
          start_time: scheduleState.start_time,
          end_time: scheduleState.end_time,
          venue_name: scheduleState.venue_name,
          venue_address: scheduleState.venue_address,
          city_code: scheduleState.city_code,
          district_code: scheduleState.district_code,
          field_type: scheduleState.field_type
        },
        "Không thể cập nhật lịch trận."
      );
      setSuccessMessage("Đã lưu fixture của trận.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật lịch trận.");
    } finally {
      setSchedulePending(false);
    }
  }

  async function onSubmitResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await submitUpdate(
        {
          status: "completed",
          home_score: resultState.home_score === "" ? null : Number(resultState.home_score),
          away_score: resultState.away_score === "" ? null : Number(resultState.away_score),
          result_note: resultState.result_note
        },
        "Không thể chốt kết quả trận."
      );
      setSuccessMessage("Đã chốt kết quả trận.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể chốt kết quả trận.");
    } finally {
      setResultPending(false);
    }
  }

  return (
    <section className="mt-6 surface-card rounded-[2rem] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Captain Controls</p>
          <h2 className="mt-2 font-[var(--font-headline)] text-2xl font-extrabold text-[var(--brand-strong)]">
            Quản lý fixture và kết quả
          </h2>
        </div>
        <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          {scheduleState.status}
        </span>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmitSchedule} className="rounded-3xl bg-[var(--card-muted)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Fixture</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Trạng thái
              <select
                value={scheduleState.status}
                onChange={(event) =>
                  setScheduleState((current) => ({ ...current, status: event.target.value as MatchSummary["status"] }))
                }
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Loại sân
              <select
                value={scheduleState.field_type}
                onChange={(event) =>
                  setScheduleState((current) => ({
                    ...current,
                    field_type: event.target.value as MatchSummary["field_type"]
                  }))
                }
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              >
                {fieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Ngày đá
              <input
                type="date"
                value={scheduleState.date}
                onChange={(event) => setScheduleState((current) => ({ ...current, date: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Giờ bắt đầu
              <input
                type="time"
                value={scheduleState.start_time}
                onChange={(event) => setScheduleState((current) => ({ ...current, start_time: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Giờ kết thúc
              <input
                type="time"
                value={scheduleState.end_time}
                onChange={(event) => setScheduleState((current) => ({ ...current, end_time: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Tên sân
              <input
                value={scheduleState.venue_name}
                onChange={(event) => setScheduleState((current) => ({ ...current, venue_name: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Địa chỉ sân
              <input
                value={scheduleState.venue_address}
                onChange={(event) => setScheduleState((current) => ({ ...current, venue_address: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Thành phố
              <input
                value={scheduleState.city_code}
                onChange={(event) => setScheduleState((current) => ({ ...current, city_code: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Quận / khu vực
              <input
                value={scheduleState.district_code}
                onChange={(event) => setScheduleState((current) => ({ ...current, district_code: event.target.value }))}
                disabled={schedulePending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={schedulePending || resultPending}
            className="mt-5 rounded-2xl bg-[var(--brand-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {schedulePending ? "Đang lưu..." : "Lưu fixture"}
          </button>
        </form>

        <form onSubmit={onSubmitResult} className="rounded-3xl bg-[var(--card-muted)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Result</p>
          <h3 className="mt-2 text-lg font-bold text-[var(--brand-strong)]">
            {initialMatch.home_team?.name || "Đội nhà"} vs {initialMatch.away_team?.name || "Đội khách"}
          </h3>

          <div className="mt-4 grid gap-4 grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Tỷ số đội nhà
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={resultState.home_score}
                onChange={(event) => setResultState((current) => ({ ...current, home_score: event.target.value }))}
                disabled={resultPending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Tỷ số đội khách
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={resultState.away_score}
                onChange={(event) => setResultState((current) => ({ ...current, away_score: event.target.value }))}
                disabled={resultPending}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
              />
            </label>
          </div>

          <label className="mt-4 grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Ghi chú kết quả
            <textarea
              rows={4}
              value={resultState.result_note}
              onChange={(event) => setResultState((current) => ({ ...current, result_note: event.target.value }))}
              disabled={resultPending}
              className="rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>

          <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">
            Chốt form này sẽ cập nhật trạng thái trận thành <span className="font-semibold text-[var(--brand-strong)]">completed</span>.
          </div>

          <button
            type="submit"
            disabled={resultPending || schedulePending}
            className="mt-5 rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resultPending ? "Đang chốt..." : "Chốt kết quả"}
          </button>
        </form>
      </div>
    </section>
  );
}
