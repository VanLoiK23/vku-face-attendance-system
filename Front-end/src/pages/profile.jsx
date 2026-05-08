import { useContext, useEffect, useState } from "react";
import { Avatar, Badge, Button } from "../helper/helper";
import instance from "../utils/axios.customize";
import { toast } from "react-toastify";
import { AuthContext } from "../components/context/auth.context";

const ProfilePage = () => {
  const { auth, setAuth } = useContext(AuthContext);
  // const {auth} = useOutletContext();
  const user = auth?.user;

  console.log(user);

  const [name, setName] = useState(user?.name || "");
  // const [department, setDepartment] = useState(user?.department || "");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setName("Quản trị viên");
      } else {
        setName(user.name || "");
      }
    }
  }, [user, auth]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const payload = { name };

      // Nếu là giảng viên thì gửi thêm khoa
      // if (user.role === "teacher") {
      //     payload.department = department;
      // }

      const res = await instance.put("/users/profile", payload);

      if (res && res.data && res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);

        setAuth({
          ...auth,
          user: {
            ...auth.user,
            name: name,
          },
        });

        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.warning("Vui lòng nhập đầy đủ các trường mật khẩu");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu mới và xác nhận không khớp!");
    }
    if (newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải từ 6 ký tự trở lên");
    }

    try {
      setLoading(true);
      await instance.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      // Reset form sau khi đổi xong
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Mật khẩu hiện tại không chính xác"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="profile-header">
        <Avatar
          initials={
            user.avatar ||
            // "https://i.pinimg.com/736x/70/98/91/709891f06ecfe7260fbcc88787cf59ce.jpg" ||
            user.name?.charAt(0)
          }
          size="xl"
        />
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{user.name}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>{user.email}</div>
          <div style={{ marginTop: 10 }}>
            <Badge type="blue">
              {user.role === "admin"
                ? "👑 Admin"
                : user.role === "teacher"
                ? "👨‍🏫 Giảng viên"
                : "🎓 Sinh viên"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">👤 Thông tin cá nhân</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={user.role === "admin"}
                style={
                  user.role === "admin"
                    ? { opacity: 0.7, cursor: "not-allowed" }
                    : {}
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={user.email}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            {user.role === "student" && (
              <div className="form-group">
                <label className="form-label">Mã sinh viên</label>
                <input
                  className="form-input"
                  value={user.studentId}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            )}

            {/* Role Teacher: Hiện Khoa (Có thể cho sửa) */}
            {/* {user.role === "teacher" && (
              <div className="form-group">
                <label className="form-label">Khoa</label>
                <input
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            )} */}

            {user.role === "admin" ? (
              <p
                style={{ color: "#888", fontSize: "13px", fontStyle: "italic" }}
              >
                * Thông tin Admin được quản lý mặc định, không thể thay đổi *
              </p>
            ) : (
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </Button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🔐 Đổi mật khẩu</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? "Đang xử lý..." : "🔒 Đổi mật khẩu"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
