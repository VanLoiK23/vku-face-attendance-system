import { Link } from "react-router-dom";
import "../../styles/error.css";

export default function Forbidden() {
  return (
    <div className="error-page">
      <h1>403</h1>
      <h2>Không có quyền truy cập</h2>
      <p>Bạn không có quyền vào trang này.</p>
      <Link to="/">Quay về trang chủ</Link>
    </div>
  );
}