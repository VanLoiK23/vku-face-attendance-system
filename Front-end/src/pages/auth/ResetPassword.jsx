import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axios.customize";
import { toast } from "react-toastify";

import '../../styles/ResetPassword.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (password.length < 6) {
      toast.error("Mật khẩu phải >= 6 ký tự");
      return;
    }

    if (password !== confirm) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post("/auth/reset-password", {
        token,
        password
      });
      if(result.data.isSuccess){
        toast.success("Đổi mật khẩu thành công!");
        navigate("/auth");
      }else{
        toast.error("Đổi mật khẩu không thành công!");
      }

    } catch (err) {
      console.log(err)
      toast.error("Token không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">

        <h1>🔐 Đặt lại mật khẩu</h1>
        <p>Nhập mật khẩu mới của bạn</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>

      </div>
    </div>
  );
}