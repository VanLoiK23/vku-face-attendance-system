import { useEffect, useState, useMemo } from "react";
import instance from "../../utils/axios.customize";
import { Button, Modal } from "../../helper/helper";
import { toast } from "react-toastify";

const SemesterPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    is_active: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/semesters");
      setSemesters(res.data || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách học kỳ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    const filtered = semesters.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  }, [semesters, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.start_date) {
      return toast.warning("Vui lòng điền đủ tên và ngày bắt đầu");
    }

    try {
      if (editTarget) {
        await instance.put(`/semesters/${editTarget.id}`, form);
        toast.success("Cập nhật học kỳ thành công");
      } else {
        await instance.post("/semesters", form);
        toast.success("Tạo học kỳ mới thành công");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa học kỳ này? Dữ liệu lịch học liên quan sẽ bị ảnh hưởng.")) return;
    try {
      await instance.delete(`/semesters/${id}`);
      toast.success("Đã xóa học kỳ");
      fetchData();
    } catch (err) {
      toast.error("Không thể xóa học kỳ đã có dữ liệu lịch học");
    }
  };

  const handleToggleStatus = async (sem) => {
    try {
      await instance.put(`/semesters/${sem.id}`, { ...sem, is_active: !sem.is_active });
      toast.info(`Đã ${!sem.is_active ? "kích hoạt" : "tắt"} học kỳ`);
      fetchData();
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <div style={{ padding: "25px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 900, color: "#1a1a1a" }}>🏫 Quản lý Học kỳ</h1>
          <p style={{ color: "#666", marginTop: "5px" }}>Thiết lập mốc thời gian đào tạo cho toàn hệ thống</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setForm({ name: "", start_date: "", is_active: false }); setShowModal(true); }}>
          + Thêm học kỳ mới
        </Button>
      </div>

      <div className="card" style={{ padding: "15px", marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          className="form-input"
          placeholder="🔍 Tìm kiếm tên học kỳ... (VD: Học kỳ 2)"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ maxWidth: "400px" }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left" }}>Tên học kỳ</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Ngày bắt đầu</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Trạng thái</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>Đang tải dữ liệu...</td></tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0", transition: "0.3s" }}>
                  <td style={{ padding: "15px", fontWeight: "600" }}>{s.name}</td>
                  <td style={{ padding: "15px" }}>{new Date(s.start_date).toLocaleDateString("vi-VN")}</td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <span 
                      onClick={() => handleToggleStatus(s)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        background: s.is_active ? "#e6fffa" : "#fff5f5",
                        color: s.is_active ? "#38a169" : "#e53e3e",
                        border: `1px solid ${s.is_active ? "#38a169" : "#e53e3e"}`
                      }}
                    >
                      {s.is_active ? "● Đang hoạt động" : "○ Tạm ngưng"}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <button 
                      onClick={() => { setEditTarget(s); setForm(s); setShowModal(true); }}
                      style={{ marginRight: "10px", padding: "6px 15px", borderRadius: "8px", border: "1px solid #4f46e5", color: "#4f46e5", background: "none", cursor: "pointer" }}
                    > Sửa </button>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      style={{ padding: "6px 15px", borderRadius: "8px", border: "1px solid #e53e3e", color: "#e53e3e", background: "none", cursor: "pointer" }}
                    > Xóa </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>Không tìm thấy dữ liệu</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "center", padding: "15px", gap: "10px", background: "#fdfdfd" }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)} className="btn-pagination"> Trước </button>
          <span style={{ alignSelf: "center", fontWeight: "bold" }}>Trang {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(v => v + 1)} className="btn-pagination"> Sau </button>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTarget ? "Cập nhật học kỳ" : "Tạo học kỳ mới"}>
        <div className="form-group">
          <label className="form-label">Tên học kỳ</label>
          <input 
            className="form-input" 
            placeholder="VD: Học kỳ 2 (2025-2026)" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Ngày bắt đầu học kỳ</label>
          <input 
            type="date" 
            className="form-input" 
            value={form.start_date} 
            onChange={(e) => setForm({ ...form, start_date: e.target.value })} 
          />
          <small style={{ color: "#888" }}>* Ngày này dùng làm mốc tính Tuần 1 cho lịch học</small>
        </div>
        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input 
            type="checkbox" 
            checked={form.is_active} 
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })} 
          />
          <label className="form-label" style={{ marginBottom: 0 }}>Đặt làm học kỳ hiện tại</label>
        </div>
        <Button className="w-full mt-4" onClick={handleSave}>Lưu thông tin</Button>
      </Modal>

      <style>{`
        .btn-pagination {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-pagination:not(:disabled):hover { background: #f0f0f0; border-color: #999; }
      `}</style>
    </div>
  );
};

export default SemesterPage;