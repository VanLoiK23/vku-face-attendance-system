import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from "../../utils/axios.customize";
import { toast } from 'react-toastify';
import '../../styles/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const res = await instance.post("/auth/forgot-password", { email });
            if (res && res.data) {
                toast.success("Yêu cầu đã gửi! Vui lòng kiểm tra email.");
                navigate("/auth"); 
            }
        } catch (err) {
            console.log(err)
            toast.error("Email không tồn tại trong hệ thống VKU!");
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                
                <div className="forgot-form-section">
                    <div className="form-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '45px' }}>
                        <h1>Quên mật khẩu?</h1>
                        <span>Nhập email để nhận mã khôi phục</span>
        
                        <form onSubmit={handleReset}>
                        <input 
                            type="email" 
                            placeholder="Nhập email @vku.udn.vn" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                            <button type="submit">Gửi yêu cầu</button>
                        </form>
                    </div>
                    
                </div>

                {/* BÊN PHẢI: OVERLAY MINH HỌA */}
                <div className="forgot-overlay-section">
                    <h1>Bảo mật tài khoản</h1>
                    <img src="https://i.pinimg.com/1200x/8d/a7/6b/8da76b175067c8f8f0a77bbb4f52d940.jpg" alt="Security" className="forgot-img" />
                    <p>Hệ thống đảm bảo thông tin cá nhân của sinh viên luôn được bảo vệ an toàn 24/7.</p>
                    <button className="btn-ghost" onClick={() => navigate("/auth")}>← Quay lại</button>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;