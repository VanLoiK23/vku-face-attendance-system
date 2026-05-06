import { useState,useContext } from "react";
import { Outlet, useLocation, Navigate,useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import pageTitle from "./components/Page_Title";
import { Avatar } from "./helper/helper";
import { AuthContext } from "./components/context/auth.context"; 


export default function App() {
  const { auth, setAuth, isAppLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname?.split("/")[2] || "/student/dashboard";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setAuth({
        isAuthenticated: false,
        user: { email: "", name: "", role: "", avatar: "" }
    });
    navigate("/auth"); 
  };

  if (isAppLoading) {
    return <div>Đang tải dữ liệu hệ thống...</div>;
  }

  if (!auth.user || !auth.user.email) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="app">
      {/* Sidebar: Truyền role và user từ Context xuống */}
      <Sidebar 
        role={auth.user.role} 
        active={currentPath} 
        user={auth.user} 
        onLogout={handleLogout} 
      />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{pageTitle[currentPath] || "Dashboard"}</h1>
            <p>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          
          <div className="topbar-right">
            <div className="topbar-date">📅 Tuần 18 / HK2 2025-2026</div>
            <div className="notif-btn">🔔<div className="notif-dot" /></div>
            <Avatar initials={auth.user.avatar || "U"} size="sm" />
          </div>
        </header>

        <main className="page-content">
          {/* Outlet truyền context để các trang con (Dashboard, Users...) có thể dùng data user nếu cần */}
          <Outlet context={{ auth }} />
        </main>
      </div>
    </div>
  );
}