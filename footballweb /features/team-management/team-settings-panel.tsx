"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { ApiFailure, ApiSuccess, TeamSummary } from "./types";

const skillOptions = [
  { value: "L1_CASUAL", label: "L1 · Mới chơi / vui là chính" },
  { value: "L2_RECREATIONAL", label: "L2 · Phong trào cơ bản" },
  { value: "L3_INTERMEDIATE", label: "L3 · Trung bình khá" },
  { value: "L4_ADVANCED", label: "L4 · Khá - mạnh" },
  { value: "L5_COMPETITIVE", label: "L5 · Cạnh tranh cao" }
] as const;

type TeamUpdateResponse = ApiSuccess<TeamSummary>;

function readApiErrorMessage(payload: ApiFailure | null, fallback: string) {
  return payload?.error?.message || fallback;
}

export function TeamSettingsPanel({
  teamId,
  initialTeam
}: {
  teamId: string;
  initialTeam: TeamSummary;
}) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    name: initialTeam.name,
    logo_url: initialTeam.logo_url ?? "",
    description: initialTeam.description ?? "",
    home_city_code: initialTeam.home_city_code ?? "",
    home_district_code: initialTeam.home_district_code ?? "",
    skill_level_code: initialTeam.skill_level_code,
    play_style_code: initialTeam.play_style_code ?? "",
    primary_color: initialTeam.primary_color ?? "",
    secondary_color: initialTeam.secondary_color ?? ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/v1/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });

      const payload = (await response.json().catch(() => null)) as TeamUpdateResponse | ApiFailure | null;

      if (!response.ok || !payload || !("data" in payload)) {
        setErrorMessage(readApiErrorMessage(payload as ApiFailure | null, "Không thể cập nhật đội."));
        return;
      }

      setSuccessMessage("Đã lưu cập nhật đội.");
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-black/8 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Team Settings</p>
      <h3 className="mt-2 font-[var(--font-headline)] text-xl font-extrabold text-[var(--brand-strong)]">Chỉnh hồ sơ đội</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Cập nhật thông tin hiển thị để captain không phải tạo lại team khi đổi mô tả hoặc khu vực.</p>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Tên đội
            <input
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Logo URL
            <input
              value={formState.logo_url}
              onChange={(event) => setFormState((current) => ({ ...current, logo_url: event.target.value }))}
              disabled={isSaving}
              placeholder="https://example.com/team-logo.png"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Mô tả đội
          <textarea
            rows={3}
            value={formState.description}
            onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            disabled={isSaving}
            className="rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Thành phố
            <input
              value={formState.home_city_code}
              onChange={(event) => setFormState((current) => ({ ...current, home_city_code: event.target.value }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Quận / khu vực
            <input
              value={formState.home_district_code}
              onChange={(event) => setFormState((current) => ({ ...current, home_district_code: event.target.value }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Trình độ đội
            <select
              value={formState.skill_level_code}
              onChange={(event) => setFormState((current) => ({ ...current, skill_level_code: event.target.value as TeamSummary["skill_level_code"] }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            >
              {skillOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Phong cách đá
            <input
              value={formState.play_style_code}
              onChange={(event) => setFormState((current) => ({ ...current, play_style_code: event.target.value }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Màu chính
            <input
              value={formState.primary_color}
              onChange={(event) => setFormState((current) => ({ ...current, primary_color: event.target.value }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
            Màu phụ
            <input
              value={formState.secondary_color}
              onChange={(event) => setFormState((current) => ({ ...current, secondary_color: event.target.value }))}
              disabled={isSaving}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:opacity-70"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-[var(--brand-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Đang lưu..." : "Lưu cập nhật"}
        </button>
      </form>
    </section>
  );
}
