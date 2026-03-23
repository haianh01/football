import Link from 'next/link';
import { fields, urgentPosts } from '../lib/mock-data';

const features = [
  {
    title: 'Đăng kèo thiếu người',
    description: 'Tạo bài tìm người nhanh khi đội bạn thiếu 1-3 người trước giờ bóng lăn.',
  },
  {
    title: 'Danh sách sân bóng',
    description: 'Gom sân quanh khu vực vào một chỗ rõ ràng thay vì lục lại link rải rác trong chat.',
  },
  {
    title: 'Nhịp vận hành hàng tuần của đội',
    description: 'Lịch đá, quân số và việc tổ chức đội nằm trong một nơi thay vì trôi mất trong nhóm chat.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-panel">
          <span className="kicker">MVP sân 7</span>
          <h1>Quản lý đội trước, mở chợ kèo sau.</h1>
          <p>
            FootballWeb tập trung vào một nỗi đau lặp lại hàng tuần: đội trưởng cần quản lý
            lịch đá và lấp chỗ trống phút chót mà không phải xoay sở trong nhóm chat rối rắm.
          </p>
          <div className="hero-actions">
            <Link href="/urgent-posts" className="button">
              Xem kèo gấp
            </Link>
            <Link href="/dashboard" className="button-secondary">
              Mở bảng điều khiển
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="panel">
            <h2>Vì sao đi theo hướng này</h2>
            <p>
              Nếu chỉ làm marketplace, sản phẩm rất dễ chết khi cung và cầu đều mỏng. Quản lý
              đội tạo ra giá trị ngay cả khi mới có một đội dùng, rồi mới chồng thêm lớp kèo gấp
              để tạo hiệu ứng mạng sau đó.
            </p>
          </div>
          <div className="metrics">
            <div className="metric">
              <strong>{urgentPosts.length}</strong>
              <span>bài kèo gấp mẫu</span>
            </div>
            <div className="metric">
              <strong>{fields.length}</strong>
              <span>sân đã seed sẵn</span>
            </div>
            <div className="metric">
              <strong>1</strong>
              <span>khu vực nên launch đầu tiên</span>
            </div>
            <div className="metric">
              <strong>0</strong>
              <span>dịch vụ hạ tầng phụ trong MVP</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Ba trụ chính của sản phẩm</h2>
            <p className="muted">Toàn bộ scaffold hiện tại đều bám vào ba luồng này.</p>
          </div>
        </div>
        <div className="grid">
          {features.map((feature) => (
            <article key={feature.title} className="card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Những gì đã có sẵn</h2>
            <p className="muted">Các trang public đang bám đúng domain MVP, không phải placeholder chung chung.</p>
          </div>
        </div>
        <div className="grid">
          <article className="card">
            <h3>Danh sách kèo gấp public</h3>
            <p>Trang danh sách có thể lọc cho người muốn vào đá bù chỗ trống trong các trận gần giờ.</p>
            <div className="pill-row">
              <span className="pill">quận</span>
              <span className="pill">trình độ</span>
              <span className="pill">giờ đá</span>
            </div>
          </article>
          <article className="card">
            <h3>Danh sách sân bóng</h3>
            <p>Dữ liệu sân có cấu trúc để hỗ trợ lên lịch đá và làm landing page SEO về sau.</p>
            <div className="pill-row">
              <span className="pill">địa chỉ</span>
              <span className="pill">loại sân</span>
              <span className="pill">mức giá</span>
            </div>
          </article>
          <article className="card">
            <h3>Bảng điều khiển đội trưởng</h3>
            <p>Một trang để làm rõ workflow lặp lại hàng tuần trước khi đẻ thêm tính năng phức tạp.</p>
            <div className="pill-row">
              <span className="pill">trạng thái đội</span>
              <span className="pill">trận kế tiếp</span>
              <span className="pill">vị trí còn thiếu</span>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
