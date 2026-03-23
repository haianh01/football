export default function DashboardPage() {
  return (
    <section className="section">
      <div className="page-head">
        <div>
          <span className="kicker">Góc đội trưởng</span>
          <h1 className="page-title">Bảng điều hành đội theo tuần</h1>
          <p className="muted">
            Đây là bề mặt giữ chân user. Nên làm chắc phần này trước khi nghĩ tới tính năng social.
          </p>
        </div>
      </div>
      <div className="dashboard-grid">
        <article className="panel">
          <h2>Trận kế tiếp</h2>
          <p>Thứ Năm, 20:00 tại Cau Giay Football Hub</p>
          <div className="pill-row">
            <span className="pill">11 người đã chốt</span>
            <span className="pill">Thiếu 2 người</span>
            <span className="pill">Đang mở kèo gấp</span>
          </div>
        </article>
        <article className="panel">
          <h2>Checklist của đội</h2>
          <p>Dashboard đầu tiên nên có định hướng rõ để đội trưởng biết bước tiếp theo là gì.</p>
          <div className="pill-row">
            <span className="pill">Cập nhật quân số</span>
            <span className="pill">Chia tiền sân</span>
            <span className="pill">Chốt kết quả trận</span>
          </div>
        </article>
      </div>
    </section>
  );
}
