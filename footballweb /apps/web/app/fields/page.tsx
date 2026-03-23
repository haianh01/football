import { fields, verifiedLabels } from '../../lib/mock-data';

export default function FieldsPage() {
  return (
    <section className="section">
      <div className="page-head">
        <div>
          <span className="kicker">Danh mục sân</span>
          <h1 className="page-title">Sân bóng sân 7 quanh bạn</h1>
          <p className="muted">
            Nên seed tay dữ liệu cho một quận trước. Dữ liệu sân có cấu trúc vẫn có giá trị ngay
            cả khi marketplace chưa đủ đông.
          </p>
        </div>
      </div>
      <div className="grid">
        {fields.map((field) => (
          <article key={field.id} className="card">
            <span className="eyebrow">{field.district}</span>
            <h3>{field.name}</h3>
            <p>{field.address}</p>
            <div className="pill-row">
              <span className="pill">Sân {field.pitchType}</span>
              <span className="pill">{field.priceRange}</span>
              <span className="pill">{verifiedLabels[String(field.verified) as 'true' | 'false']}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
