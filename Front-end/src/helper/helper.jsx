// ============================================================
// HELPER COMPONENTS
// ============================================================
const Avatar = ({ initials, size = "md" }) => (
    <div className={`avatar avatar-${size}`}>{initials}</div>
  );
  
  const Badge = ({ type, children }) => (
    <span className={`badge badge-${type}`}>{children}</span>
  );
  
  const StatusBadge = ({ status }) => {
    const map = {
      present: ["green", "✓ Có mặt"],
      absent: ["red", "✗ Vắng"],
      late: ["yellow", "⏰ Trễ"],
      confirm: ["green", "✓ Đã duyệt"],
      pending: ["yellow", "⏳ Chờ duyệt"],
      reject: ["red", "✗ Từ chối"],
      upcoming: ["blue", "Sắp tới"],
      ongoing: ["green", "Đang học"],
      done: ["gray", "Đã xong"],
    };
    const [type, label] = map[status] || ["gray", status];
    return <Badge type={type}>{label}</Badge>;
  };
  
  const Button = ({ children, variant = "primary", size = "", onClick, className = "" }) => (
    <button className={`btn btn-${variant} ${size ? `btn-${size}` : ""} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
  
  const StatCard = ({ icon, label, value, change, changeUp, color }) => (
    <div className="stat-card">
      <div className="stat-card-inner">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {change && <div className={`stat-change ${changeUp ? "up" : "down"}`}>{changeUp ? "▲" : "▼"} {change}</div>}
        </div>
        <div className="stat-icon" style={{ background: `${color}22` }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
        </div>
      </div>
      <div className="stat-bg" style={{ background: color }} />
    </div>
  );
  
  const ProgressBar = ({ value, color }) => (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${value}%`, background: color || "var(--primary-light)" }} />
    </div>
  );
  
  const AttendanceChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
      <div className="chart-bars">
        {data.map((d, i) => (
          <div className="chart-bar-wrap" key={i}>
            <div className="chart-bar" style={{ height: `${(d.value / max) * 100}px` }} title={`${d.label}: ${d.value}`} />
            <div className="chart-label">{d.label}</div>
          </div>
        ))}
      </div>
    );
  };
  
  const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          {children}
        </div>
      </div>
    );
  };


  export {Avatar,Badge,Button,Modal,ProgressBar,StatCard,StatusBadge,AttendanceChart};