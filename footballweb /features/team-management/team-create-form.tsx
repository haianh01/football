"use client";

import { useId, useState, type ChangeEvent } from "react";
import Link from "next/link";

import { TeamAvatar } from "@/components/shared";

import { createTeamAction } from "./actions";

const skillOptions = [
  { value: "L1_CASUAL", label: "L1 · Mới chơi / vui là chính" },
  { value: "L2_RECREATIONAL", label: "L2 · Phong trào cơ bản" },
  { value: "L3_INTERMEDIATE", label: "L3 · Trung bình khá" },
  { value: "L4_ADVANCED", label: "L4 · Khá - mạnh" },
  { value: "L5_COMPETITIVE", label: "L5 · Cạnh tranh cao" }
] as const;

export function TeamCreateForm() {
  const inputId = useId();
  const [teamName, setTeamName] = useState("FC");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  // TODO(storage-phase): replace local object URL preview + server-side data URL persistence
  // with direct signed upload to object storage and persist only the final public file URL.
  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName("");
      setLogoPreviewUrl(logoUrl || null);
      return;
    }

    setSelectedFileName(file.name);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  function onLogoUrlChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setLogoUrl(value);

    if (!selectedFileName) {
      setLogoPreviewUrl(value || null);
    }
  }

  return (
    <form action={createTeamAction} className="mt-8 grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Tên đội
          <input
            required
            name="name"
            placeholder="Ví dụ: FC Warriors"
            onChange={(event) => setTeamName(event.target.value || "FC")}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Slug tùy chọn
          <input
            name="slug"
            placeholder="fc-warriors"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>
      </div>

      <div className="rounded-[1.75rem] border border-black/8 bg-[var(--card-muted)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Logo đội</p>
        <div className="mt-4 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] bg-white p-4">
            <TeamAvatar name={teamName} logoUrl={logoPreviewUrl} size="lg" />
            <p className="mt-3 text-sm font-semibold text-[var(--brand-strong)]">Preview logo đội</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
              Bạn có thể tải ảnh trực tiếp từ máy hoặc dán URL ảnh. Bản hiện tại sẽ ưu tiên file nếu cả hai cùng có.
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
              TODO: khi có storage thật, preview này sẽ giữ nguyên nhưng phần submit sẽ đổi sang upload trước rồi lưu URL/CDN.
            </p>
            {selectedFileName ? (
              <p className="mt-3 rounded-2xl bg-[var(--card-muted)] px-3 py-2 text-xs font-medium text-[var(--brand-strong)]">
                Đã chọn: {selectedFileName}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              <span>Tải logo từ máy</span>
              <label
                htmlFor={inputId}
                className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[var(--brand)] bg-white px-4 py-6 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--card-muted)]"
              >
                Chọn ảnh logo
              </label>
              <input
                id={inputId}
                name="logo_file"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <span className="text-xs leading-5 text-[var(--ink-soft)]">
                Chấp nhận file ảnh, giới hạn 2MB trong bản hiện tại.
              </span>
            </div>

            <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
              Hoặc dùng Logo URL
              <input
                name="logo_url"
                value={logoUrl}
                onChange={onLogoUrlChange}
                placeholder="https://example.com/team-logo.png"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
              />
              <span className="text-xs leading-5 text-[var(--ink-soft)]">
                Hữu ích nếu logo đã nằm trên CDN hoặc một nguồn ảnh công khai.
              </span>
            </label>
          </div>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
        Mô tả đội
        <textarea
          name="description"
          rows={4}
          placeholder="Mô tả ngắn về khu vực hoạt động, phong cách đá, giờ thường ra sân..."
          className="rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Thành phố
          <input
            name="home_city_code"
            defaultValue="HN"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Quận / khu vực
          <input
            name="home_district_code"
            placeholder="dong-da"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Trình độ đội
          <select
            name="skill_level_code"
            defaultValue="L3_INTERMEDIATE"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
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
            name="play_style_code"
            placeholder="balanced / pressing / technical"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Màu chính
          <input
            name="primary_color"
            defaultValue="#0b6b3a"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--brand-strong)]">
          Màu phụ
          <input
            name="secondary_color"
            defaultValue="#ffffff"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>
      </div>

      <input type="hidden" name="default_locale" value="vi-VN" />
      <input type="hidden" name="home_country_code" value="VN" />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px]"
        >
          Tạo đội và vào dashboard
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
        >
          Quay lại foundation
        </Link>
      </div>
    </form>
  );
}
