import { Link } from "react-router-dom";
import "../../styles/error.css";

export default function NotFound() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <h2>Trang không tồn tại</h2>
      <p>Link bạn truy cập không hợp lệ.</p>
      <Link to="/">Quay về trang chủ</Link>
    </div>
  );
}