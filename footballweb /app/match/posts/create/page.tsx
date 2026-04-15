import Link from "next/link";

import { createMatchPostAction } from "@/features/matchmaking";
import { listTeamsForUser } from "@/features/team-management";
import { requirePageUser } from "@/lib/auth/current-user";

export default async function CreateMatchPostPage() {
  const currentUser = await requirePageUser("/login?redirectTo=/match/posts/create");
  const teams = await listTeamsForUser(currentUser.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Create Match Post</p>
        <h1 className="mt-3 font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[var(--brand-strong)] sm:text-4xl">
          Đăng kèo tìm đối
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          Form này tập trung vào các field lõi đã chốt trong docs: đội đăng, lịch đá, khu vực, loại sân, trình độ mong muốn và rule chia
          sân.
        </p>
      </header>

      <form action={createMatchPostAction} className="mt-6 surface-card rounded-[2rem] p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Đội đăng</span>
            <select
              name="team_id"
              required
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="">Chọn đội</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.role_of_current_user})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Tiêu đề</span>
            <input
              type="text"
              name="title"
              placeholder="Ví dụ: Cần đối sân 7 tối thứ 7"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Ngày đá</span>
            <input
              type="date"
              name="date"
              required
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Giờ bắt đầu</span>
            <input
              type="time"
              name="start_time"
              required
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Giờ kết thúc</span>
            <input
              type="time"
              name="end_time"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Loại trận</span>
            <select
              name="match_type"
              defaultValue="friendly"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="friendly">Friendly</option>
              <option value="tactical">Tactical</option>
              <option value="mini_tournament">Mini Tournament</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Thành phố</span>
            <input
              type="text"
              name="city_code"
              placeholder="Ví dụ: HCM"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Quận/Huyện</span>
            <input
              type="text"
              name="district_code"
              placeholder="Ví dụ: Q7"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Sân cụ thể</span>
            <input
              type="text"
              name="venue_name"
              placeholder="Ví dụ: Sân Đại Nam"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Loại sân</span>
            <select
              name="field_type"
              defaultValue="seven"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="five">Sân 5</option>
              <option value="seven">Sân 7</option>
              <option value="eleven">Sân 11</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Mức gấp</span>
            <select
              name="urgency"
              defaultValue="normal"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Trình độ tối thiểu</span>
            <select
              name="team_skill_min"
              defaultValue="L2_RECREATIONAL"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="L1_CASUAL">L1 Casual</option>
              <option value="L2_RECREATIONAL">L2 Recreational</option>
              <option value="L3_INTERMEDIATE">L3 Intermediate</option>
              <option value="L4_ADVANCED">L4 Advanced</option>
              <option value="L5_COMPETITIVE">L5 Competitive</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Trình độ tối đa</span>
            <select
              name="team_skill_max"
              defaultValue="L4_ADVANCED"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="L1_CASUAL">L1 Casual</option>
              <option value="L2_RECREATIONAL">L2 Recreational</option>
              <option value="L3_INTERMEDIATE">L3 Intermediate</option>
              <option value="L4_ADVANCED">L4 Advanced</option>
              <option value="L5_COMPETITIVE">L5 Competitive</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Rule phí sân</span>
            <select
              name="pitch_fee_rule"
              defaultValue="share"
              className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
            >
              <option value="share">Chia sân</option>
              <option value="home_team_pays">Đội nhà trả</option>
              <option value="away_team_pays">Đội khách trả</option>
              <option value="sponsor_supported">Có hỗ trợ</option>
            </select>
          </label>
        </div>

        <label className="mt-5 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Hỗ trợ thêm</span>
          <input
            type="text"
            name="support_note"
            placeholder="Ví dụ: mời nước hoặc hỗ trợ 100k"
            className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <label className="mt-5 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Ghi chú</span>
          <textarea
            name="note"
            rows={5}
            placeholder="Mô tả phong cách đá, yêu cầu đặc biệt hoặc điều kiện chốt kèo..."
            className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-[var(--brand-strong)] outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
          >
            Đăng kèo ngay
          </button>
          <Link
            href="/match/posts"
            className="rounded-2xl border border-black/10 px-5 py-3 text-center text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-white/70"
          >
            Quay lại danh sách
          </Link>
        </div>
      </form>
    </main>
  );
}
