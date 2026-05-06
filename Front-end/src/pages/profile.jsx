import { useState, useEffect, useRef } from "react";
import {Avatar,Badge,Button} from '../helper/helper'

const ProfilePage = ({ user }) => {
    const [editPass, setEditPass] = useState(false);
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="profile-header">
          <Avatar initials={user.avatar} size="xl" />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{user.name}</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>{user.email}</div>
            <div style={{ marginTop: 10 }}>
              <Badge type="blue">{user.role === "admin" ? "👑 Admin" : user.role === "teacher" ? "👨‍🏫 Giảng viên" : "🎓 Sinh viên"}</Badge>
            </div>
          </div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">👤 Thông tin cá nhân</span></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Họ và tên</label><input className="form-input" defaultValue={user.name} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue={user.email} disabled style={{ opacity: 0.7 }} /></div>
              {user.role === "student" && <div className="form-group"><label className="form-label">Mã sinh viên</label><input className="form-input" defaultValue={user.studentId} disabled style={{ opacity: 0.7 }} /></div>}
              {user.role === "teacher" && <div className="form-group"><label className="form-label">Khoa</label><input className="form-input" defaultValue={user.department} /></div>}
              <Button>💾 Lưu thay đổi</Button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">🔐 Đổi mật khẩu</span></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Mật khẩu hiện tại</label><input className="form-input" type="password" placeholder="••••••••" /></div>
              <div className="form-group"><label className="form-label">Mật khẩu mới</label><input className="form-input" type="password" placeholder="••••••••" /></div>
              <div className="form-group"><label className="form-label">Xác nhận mật khẩu mới</label><input className="form-input" type="password" placeholder="••••••••" /></div>
              <Button>🔒 Đổi mật khẩu</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ProfilePage;