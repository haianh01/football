import { skillLevelLabels, urgentPostStatusLabels, urgentPosts } from '../../lib/mock-data';

export default function UrgentPostsPage() {
  return (
    <section className="section">
      <div className="page-head">
        <div>
          <span className="kicker">Danh sách public</span>
          <h1 className="page-title">Kèo gấp cần người</h1>
          <p className="muted">
            Đây là bề mặt marketplace đầu tiên trong MVP. Cứ giữ nó hẹp, local và dễ share là đủ.
          </p>
        </div>
      </div>
      <div className="list">
        {urgentPosts.map((post) => (
          <article key={post.id} className="list-item">
            <div className="stack">
              <span className="eyebrow">{post.teamName}</span>
              <strong>{post.title}</strong>
              <span className="muted">
                {post.district} • {new Date(post.startsAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="stack">
              <span>Cần {post.neededPlayers} người</span>
              <span className="muted">Trình độ: {skillLevelLabels[post.skillLevel]}</span>
            </div>
            <div className="stack">
              <span>{post.feeShare}</span>
              <span className="pill">{urgentPostStatusLabels[post.status]}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
