import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function GuestLanding() {
    const t = await getTranslations("Home");

    return (
        <div className="flex w-full flex-col min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Decorative Blob Backgrounds */}
            <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-orange-400/20 blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="surface-card flex items-center justify-between rounded-full px-6 py-4 shadow-sm border border-black/5 bg-white/70 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-2 shadow-sm text-white flex items-center justify-center font-black italic text-lg leading-none h-10 w-10">
                            FW
                        </div>
                        <span className="font-[var(--font-headline)] text-xl font-extrabold tracking-tight text-slate-800 hidden sm:block">
                            FootballWeb
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold text-slate-600">
                            <Link href="#features" className="hover:text-emerald-600 transition tracking-wide">Tính năng</Link>
                            <Link href="/match/posts" className="hover:text-emerald-600 transition tracking-wide">Tìm kèo</Link>
                        </div>
                        <Link
                            href="/login"
                            className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                        >
                            Đăng nhập / Bắt đầu
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[60vh]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-semibold text-xs uppercase tracking-widest mb-6 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Nền tảng Quản Lý Bóng Đá Số 1
                </div>

                <h1 className="font-[var(--font-headline)] text-5xl sm:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] animate-fade-in-up animation-delay-100">
                    Chơi Bóng Nhàn Tênh <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">
                        Quản Đội Chuyên Nghiệp
                    </span>
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-200">
                    Tạm biệt những file Excel lộn xộn, group chat rối rắm. Tất cả tính năng tìm đối, quản lý nợ quỹ, điểm danh trận đấu nay được quy tụ vào một nền tảng duy nhất, thiết kế mượt mà.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300 w-full sm:w-auto">
                    <Link
                        href="/team/create"
                        className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                        Tạo Hội / Đội Bóng Của Bạn
                    </Link>
                    <Link
                        href="/match/posts"
                        className="rounded-2xl bg-white border border-slate-200 px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
                    >
                        Tìm Trận Đấu Hôm Nay
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-[var(--font-headline)] text-3xl sm:text-4xl font-extrabold text-slate-900">Tính năng vượt trội</h2>
                    <p className="mt-4 text-slate-600 text-lg">Mọi công cụ bạn cần để tập trung cho đam mê trên sân cỏ.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="surface-card group p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.438 4.438 0 002.946 2.946 4.493 4.493 0 004.306-1.758q.16-.211.32-.422V11.516l-.043-.02a1.209 1.209 0 00-1.52 0l-.043.02v.044c-.035.161-.067.323-.095.485z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Matchmaking Cực Nhanh</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">Bộ lọc thông minh giúp bạn tìm đối thủ vừa trình độ, phù hợp khu vực và thể thức thi đấu. Quẳng gánh lo "bị chăn gà".</p>
                    </div>

                    {/* Card 2 */}
                    <div className="surface-card group p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Minh Bạch Quỹ Đội</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">Gắn tiền sân, tiền nước thẳng vào từng trận đấu. Xem công nợ chi tiết của mỗi cá nhân minh bạch, rõ ràng, không cãi vã.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="surface-card group p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Feedback Uy Tín</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">Điểm số uy tín cá nhân và đội bóng được cập nhật sau mỗi trận. Cho phép tìm lính đánh thuê đáng tin cậy 100%.</p>
                    </div>
                </div>
            </section>

            {/* CTA Footer Section */}
            <section className="relative z-10 w-full mt-10 mb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-slate-900 overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-30 pointer-events-none" />

                    <div className="relative z-10 p-12 sm:p-20 flex flex-col items-center text-center">
                        <h2 className="text-3xl sm:text-5xl font-[var(--font-headline)] font-extrabold text-white tracking-tight leading-tight">
                            Sẵn sàng ra sân cùng đồng đội?
                        </h2>
                        <p className="mt-4 text-slate-300 text-lg max-w-xl">
                            Nâng tầm trải nghiệm bóng đá của bạn ngay hôm nay. Miễn phí sử dụng tất cả tính năng cơ bản.
                        </p>
                        <div className="mt-10">
                            <Link
                                href="/login"
                                className="rounded-full bg-white px-10 py-5 text-base font-bold text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                            >
                                Trải Nghiệm FootballWeb Ngay
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
