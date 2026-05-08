import { NavLink } from "react-router-dom";

const navConfig = {
  admin: [
    { section: "Tổng quan", items: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
      { id: "reports", icon: "📈", label: "Báo cáo" },
    ]},
    { section: "Quản lý", items: [
      { id: "users", icon: "👥", label: "Người dùng" },
      { id: "cohorts", icon: "📋", label: "Danh mục Lớp khóa" },
      { id: "subjects", icon: "📖", label: "Quản lý Môn học" },
      { id: "classes", icon: "🥞", label: "Lớp học phần" },
      { id: "semester", icon: "🎓", label: "Học kỳ đào tạo" },
      { id: "schedule", icon: "📅", label: "Lịch học" },
      { id: "face-approval", icon: "🤖", label: "Duyệt ảnh AI", badge: 2 },
    ]},
    { section: "Hệ thống", items: [
      { id: "profile", icon: "👤", label: "Hồ sơ" },
    ]},
  ],
  teacher: [
    { section: "Tổng quan", items: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
    ]},
    { section: "Giảng dạy", items: [
      { id: "today-schedule", icon: "📋", label: "Lịch dạy hôm nay" },
      { id: "week-schedule", icon: "📅", label: "Lịch tuần" },
      { id: "attendance", icon: "📷", label: "Điểm danh CNN" },
      { id: "history", icon: "📜", label: "Lịch sử điểm danh" },
      { id: "session-detail", icon: "🔍", label: "Chi tiết buổi học" },
    ]},
    { section: "Khác", items: [
      { id: "profile", icon: "👤", label: "Hồ sơ" },
    ]},
  ],
  student: [
    { section: "Tổng quan", items: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
    ]},
    { section: "Học tập", items: [
      { id: "today-schedule", icon: "📋", label: "Lịch học hôm nay" },
      { id: "week-schedule", icon: "📅", label: "Lịch tuần" },
      { id: "my-attendance", icon: "📊", label: "Điểm danh của tôi" },
      { id: "face-upload", icon: "🤳", label: "Upload ảnh khuôn mặt" },
    ]},
    { section: "Khác", items: [
      { id: "profile", icon: "👤", label: "Hồ sơ" },
    ]},
  ],
};


// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = ({ role, user, onLogout }) => {
  const nav = navConfig[role] || [];
  const roleLabel = { admin: "Quản trị viên", teacher: "Giảng viên", student: "Sinh viên" }[role];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div className="logo-text">
          <h2>VKU AttendAI</h2>
          <p>Hệ thống điểm danh CNN</p>
        </div>
      </div>
      <div className="sidebar-role">
        <div className="role-avatar">{user.avatar}</div>
        <div className="role-info">
          <p>{user?.name ? user.name.split(" ").slice(-2).join(" ") : "User"}</p>
          <span>{roleLabel}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map(item => (
              <NavLink 
                key={item.id} 
                to={`/${role}/${item.id}`}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
};



export default Sidebar;


