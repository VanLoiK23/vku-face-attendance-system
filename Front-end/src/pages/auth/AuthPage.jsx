import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from "../../utils/axios.customize"; 
import { toast } from 'react-toastify'; 
import '../../styles/AuthPage.css';
import { AuthContext } from '../../components/context/auth.context';


const generateEmailFromName = (name) => {
    if (!name) return "";

    const removeVietnameseTones = (str) => {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    let clean = removeVietnameseTones(name)
        .toLowerCase()
        .trim()
        .split(" ");

    if (clean.length < 2) return "";

    const lastName = clean[clean.length - 1]; 
    const initials = clean.slice(0, clean.length - 1)
        .map(w => w[0])
        .join(""); 

    return `${lastName}${initials}.k23@vku.udn.vn`;
};

const AuthPage = () => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const {setAuth} = useContext(AuthContext)
    const navigate = useNavigate();

    // State cho Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // State cho Register
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const handleRegisterClick = () => setIsRightPanelActive(true);
    const handleLoginClick = () => setIsRightPanelActive(false);

    const handleNameChange = (e) => {
        const name = e.target.value;
        setRegName(name);
    
        const email = generateEmailFromName(name);
        setRegEmail(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@vku\.udn\.vn$/;
    
        if (!emailRegex.test(loginEmail)) {
            toast.error("Email phải đúng định dạng @vku.udn.vn");
            return;
        }
    
        if (!loginPassword) {
            toast.error("Vui lòng nhập mật khẩu");
            return;
        }

        try {
            const res = await instance.post("/auth/login", {
                email: loginEmail,
                password: loginPassword
            });

            if (res && res.data && res.data.access_token) {

                localStorage.setItem("access_token", res.data.access_token);
                toast.success("Đăng nhập thành công!");

                //save to auth context (similar session)
                setAuth({
                    isAuthenticated: true,
                    user: res.data.user
                });
                if (res.data.user.role === "admin") navigate("/admin/dashboard");
                if (res.data.user.role === "teacher") navigate("/teacher/dashboard");
                if (res.data.user.role === "student") navigate("/student/dashboard");
            } else {
                toast.error(res.data.message || "Đăng nhập thất bại");
            }
        } catch (err) {
            console.error("Lỗi Login:", err);
            toast.error("Sai tài khoản hoặc mật khẩu!");
        }
    };

    //  ĐĂNG KÝ
    const handleRegister = async (e) => {
        e.preventDefault();

        if (!regName.trim()) {
            toast.error("Vui lòng nhập họ tên");
            return;
        }

        if (!regEmail.trim()) {
            toast.error("Vui lòng nhập email");
            return;
        }
    
        const vkuEmailRegex = /^[a-zA-Z0-9._%+-]+@vku\.udn\.vn$/;
    
        if (!vkuEmailRegex.test(regEmail)) {
            toast.error("Chỉ chấp nhận email sinh viên VKU (@vku.udn.vn)");
            return;
        }
    
        if (!regPassword.trim()) {
            toast.error("Vui lòng nhập password");
            return;
        }

        if (regPassword.length < 6) {
            toast.error("Mật khẩu phải >= 6 ký tự");
            return;
        }
    
        try {
            const res = await instance.post("/auth/register", {
                name: regName,
                email: regEmail,
                password: regPassword,
                role: "student"
            });
    
            toast.success(res.data.message || "Đăng ký thành công!");
            setIsRightPanelActive(false);
    
        } catch (err) {
            console.error("FULL ERROR:", err);
        
            let message = "Lỗi server, vui lòng thử lại";
        
            if (err.response) {
                const data = err.response.data;
        
                if (typeof data === "string") {
                    message = data;
                } else if (data && data.message) {
                    message = data.message;
                }
            } else if (err.message) {
                message = err.message;
            }
        
            toast.error(message);
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-card ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                
                {/* FORM ĐĂNG KÝ */}
                <div className="form-container register-container">
                    <form onSubmit={handleRegister}>
                        <h1>Tạo tài khoản</h1>
                        <span>Dùng email @vku.udn.vn để đăng ký</span>
                        <input 
                            type="text" placeholder="Họ và Tên" 
                            value={regName} onChange={handleNameChange}
                            required
                        />
                        <input 
                            type="email" placeholder="Email sinh viên" 
                            value={regEmail} 
                            disabled
                            // onChange={(e) => setRegEmail(e.target.value)}
                            required
                        />
                        <input 
                            type="password" placeholder="Mật khẩu" 
                            value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Đăng ký</button>
                    </form>
                </div>

                {/* FORM ĐĂNG NHẬP */}
                <div className="form-container login-container">
                    <form onSubmit={handleLogin}>
                        <h1>Đăng nhập</h1>
                        <span>Hệ thống điểm danh AI</span>
                        <input 
                            type="email" placeholder="Email" 
                            value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                        <input 
                            type="password" placeholder="Mật khẩu" 
                            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                        <a href="/forgot-password">Quên mật khẩu?</a>
                        <button type="submit">Đăng nhập</button>
                    </form>
                </div>

                {/* OVERLAY DỊCH CHUYỂN */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Chào bạn!</h1>
                            <img src="https://i.pinimg.com/736x/fa/0c/48/fa0c48fc0fc774a7912b8fa200bbf523.jpg" width={240} height={240} alt="Education" className="auth-img" />
                            <p>Đăng nhập để tham gia buổi học hôm nay</p>
                            <button className="ghost" onClick={handleLoginClick}>Quay lại Đăng nhập</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Tân sinh viên?</h1>
                            <img src="https://i.pinimg.com/736x/e6/57/98/e6579832fa7b2b7b1645233ee7d81052.jpg"  width={240} height={240}  alt="Education" className="auth-img" />
                            <p>Đăng ký tài khoản để quản lý lịch học và điểm danh</p>
                            <button className="ghost" onClick={handleRegisterClick}>Đăng ký ngay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;