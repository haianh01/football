import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { db } from "@/lib/db";
import { User } from "@prisma/client";

export async function UserDashboard({ currentUser }: { currentUser: User }) {
    const t = await getTranslations("Home");

    // Fetch 3 things: User's Teams, Upcoming Matches, Open Match Posts feed

    // 1. User's Teams
    const userTeamMemberships = await db.teamMember.findMany({
        where: { user_id: currentUser.id, status: "active" },
        include: { team: true }
    });
    const myTeams = userTeamMemberships.map(m => m.team);

    // 2. Upcoming matches where the user is going
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingParticipations = await db.matchParticipant.findMany({
        where: {
            user_id: currentUser.id,
            attendance_status: { in: ["confirmed", "checked_in"] },
            match: {
                status: { in: ["scheduled", "confirmed"] },
                date: { gte: today }
            }
        },
        include: {
            match: {
                include: { home_team: true, away_team: true }
            }
        },
        orderBy: { match: { date: "asc" } },
        take: 5
    });
    const upcomingMatches = upcomingParticipations.map(p => p.match);

    // 3. Match posts feed
    const matchPosts = await db.matchPost.findMany({
        where: { status: "open", date: { gte: today } },
        orderBy: { created_at: "desc" },
        take: 5,
        include: { team: true }
    });

    return (
        <div className="flex w-full flex-col min-h-screen bg-slate-50 pb-20">
            {/* Personalized Header Section */}
            <header className="bg-gradient-to-br from-emerald-800 to-emerald-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay"></div>
                <div className="relative z-10 max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-200 border-4 border-white/20 overflow-hidden shadow-xl flex items-center justify-center flex-shrink-0 relative">
                            {currentUser.avatar_url ? (
                                <img src={currentUser.avatar_url} alt={currentUser.display_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-slate-400">
                                    {currentUser.display_name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-[var(--font-headline)] font-bold text-white tracking-tight">
                                Chào mừng, {currentUser.display_name}!
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-emerald-200/80 font-medium tracking-wide">Lịch trình sân cỏ hôm nay như thế nào?</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/team/create" className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95 shadow-sm">
                            Tạo Đội
                        </Link>
                        <Link href="/match/posts/create" className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95">
                            Đăng Kèo
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Teams + Upcoming Matches */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* My Teams Section */}
                        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800 font-[var(--font-headline)] flex items-center gap-2">
                                    <span>🛡️</span> Đội bóng của bạn
                                </h2>
                                <Link href="/team/create" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">Tất cả</Link>
                            </div>

                            {myTeams.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myTeams.map(team => (
                                        <Link key={team.id} href={`/team/${team.id}`} className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:border-emerald-200 hover:shadow-md">
                                            <div className="h-14 w-14 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : <span className="font-bold text-slate-400 text-lg uppercase">{team.name.charAt(0)}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{team.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Mã: <strong className="uppercase">{team.short_code}</strong></p>
                                            </div>
                                            <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <p className="text-sm text-slate-500 mb-4">Bạn chưa tham gia đội bóng nào.</p>
                                    <Link href="/team/create" className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition">
                                        Tạo ngay đội mới
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Upcoming Matches */}
                        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800 font-[var(--font-headline)] flex items-center gap-2">
                                    <span>⚽</span> Lịch thi đấu sắp tới
                                </h2>
                            </div>

                            {upcomingMatches.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingMatches.map(match => (
                                        <Link key={match.id} href={`/matches/${match.id}` as Route} className="group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-md">
                                            <div className="bg-slate-50 rounded-xl p-3 flex flex-row sm:flex-col items-center justify-center min-w-[5rem] text-center gap-2 sm:gap-0 border border-slate-100">
                                                <span className="text-xs uppercase font-bold text-slate-500">{format(match.date, "E", { locale: vi })}</span>
                                                <span className="text-lg sm:text-2xl font-black text-slate-800 leading-none">{format(match.date, "dd/MM")}</span>
                                                <span className="text-xs font-semibold text-emerald-600 mt-1">{format(match.start_time, "HH:mm")}</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md w-fit mb-2">
                                                    <span>Sân {match.field_type === 'five' ? '5' : match.field_type === 'seven' ? '7' : '11'}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span>{match.venue_name || "Sân chưa rõ"}</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="font-bold text-slate-800">{match.home_team?.name || "Chủ nhà"}</span>
                                                    <span className="text-xs font-bold text-slate-400 mx-3 uppercase tracking-wider">vs</span>
                                                    <span className="font-bold text-slate-800">{match.away_team?.name || "Đội khách"}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-slate-50 p-8 text-center border border-slate-100">
                                    <p className="text-sm text-slate-500">Bạn chưa có lịch thi đấu sắp tới.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Feed */}
                    <div className="lg:col-span-1">
                        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-24">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800 font-[var(--font-headline)] flex items-center gap-2">
                                    <span>🔥</span> Kèo mới nhất
                                </h2>
                                <Link href="/match/posts" className="text-xs font-semibold text-emerald-600 hover:underline">Xem thêm</Link>
                            </div>

                            {matchPosts.length > 0 ? (
                                <div className="space-y-4">
                                    {matchPosts.map(post => (
                                        <Link key={post.id} href={`/match/posts/${post.id}`} className="block border-b border-slate-100 last:border-0 pb-4 last:pb-0 group">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                                    {post.title || `Giao lưu bóng đá sân ${post.field_type === 'seven' ? '7' : post.field_type === 'five' ? '5' : '11'}`}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1">📅 {format(post.date, "dd/MM")} • {format(post.start_time, "HH:mm")}</span>
                                                <span className="flex items-center gap-1">📍 {post.venue_name || "Bất kỳ"}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 max-w-full truncate">
                                                    Đội: {post.team.name}
                                                </span>
                                                {post.district_code && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{post.district_code}</span>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-slate-500">
                                    Hiện chưa có kèo nào mới. Đăng kèo ngay để tìm đối!
                                </div>
                            )}

                            <Link href="/match/posts/create" className="w-full mt-6 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                                <span>➕</span> Đăng kèo tìm đối
                            </Link>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
