import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'FootballWeb',
  description: 'Nền tảng quản lý đội bóng phong trào và tìm người đá gấp.',
};

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/urgent-posts', label: 'Kèo gấp' },
  { href: '/fields', label: 'Sân bóng' },
  { href: '/dashboard', label: 'Bảng điều khiển' },
  { href: '/test-doi-truong', label: 'Test đội trưởng' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="page-shell">
          <header className="topbar">
            <Link href="/" className="brand">
              FootballWeb
            </Link>
            <nav className="topnav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
