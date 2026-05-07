import { useEffect, useMemo, useState } from "react";
import instance from "../../utils/axios.customize";
import { Button, Modal } from "../../helper/helper";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); 
  const [form, setForm] = useState({ code: "", name: "", credits: 3 });
  
  const [errors, setErrors] = useState({ code: "", name: "" });
  const [isChecking, setIsChecking] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/subjects");
      if (res?.data) setSubjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  // --- CHECK TRÙNG ---
  useEffect(() => {
    if (!form.code && !form.name) return;

    const timeoutId = setTimeout(async () => {
      const isCodeChanged = editTarget ? form.code !== editTarget.code : true;
      const isNameChanged = editTarget ? form.name !== editTarget.name : true;

      if (!isCodeChanged && !isNameChanged) return;

      setIsChecking(true);
      try {
        const isCodeExist = subjects.some(s => s.code === form.code.trim().toUpperCase() && s.id !== editTarget?.id);
        const isNameExist = subjects.some(s => s.name.toLowerCase() === form.name.trim().toLowerCase() && s.id !== editTarget?.id);

        setErrors({
          code: isCodeExist ? "Mã môn học này đã tồn tại!" : "",
          name: isNameExist ? "Tên môn học này đã tồn tại!" : ""
        });
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.code, form.name, subjects, editTarget]);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (errors.code || errors.name) return;

    if(Number(form.credits)<1||Number(form.credits)>8){
      alert("Số tín chỉ không hợp lệ!");
      return;
    }

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        credits: Math.max(1, Number(form.credits)),
      };

      if (editTarget) {
        await instance.put(`/subjects/${editTarget.id}`, payload);
        alert("Cập nhật môn học thành công!");
      } else {
        await instance.post("/subjects", payload);
        alert("Tạo môn học thành công!");
      }

      handleCloseModal();
      fetchSubjects();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi hệ thống!");
    }
  };

  const handleEdit = (subject) => {
    setEditTarget(subject);
    setForm({
      code: subject.code,
      name: subject.name,
      credits: subject.credits
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm({ code: "", name: "", credits: 3 });
    setErrors({ code: "", name: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa? Toàn bộ lớp học phần liên quan sẽ mất!")) return;
    try {
      await instance.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) { alert("Lỗi khi xóa!"); }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => 
      (s.name || "").toLowerCase().includes(keyword.toLowerCase()) || 
      (s.code || "").toLowerCase().includes(keyword.toLowerCase())
    );
  }, [subjects, keyword]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>📚 Môn học</h1>
          <p style={{ color: "var(--text3)", margin: "5px 0 0" }}>Hệ thống quản lý đào tạo & tín chỉ VKU</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Thêm môn mới</Button>
      </div>

      {/* Stats Section */}
      <div className="grid-3" style={{ marginBottom: 30, gap: 20 }}>
        {[
          { label: "Tổng môn học", value: subjects.length, color: "#4F46E5" },
          { label: "Tổng tín chỉ", value: subjects.reduce((sum, s) => sum + (s.credits || 0), 0), color: "#10B981" },
          { label: "Lớp học phần", value: subjects.reduce((sum, s) => sum + (s.sections?.length || 0), 0), color: "#F59E0B" }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: 20, borderLeft: `5px solid ${stat.color}` }}>
            <div style={{ color: "var(--text3)", fontSize: 13 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 5 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: 12, marginBottom: 25, display: "flex", alignItems: "center", gap: 10 }}>
        <input 
          className="form-input" 
          placeholder="🔍 Tìm theo tên hoặc mã môn học..." 
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ border: "none", fontSize: 16 }}
        />
      </div>

      {loading ? <div className="text-center">Đang tải dữ liệu...</div> : (
        <div className="grid-2" style={{ gap: 20 }}>
          {filteredSubjects.map(s => (
            <div key={s.id} className="card shadow-sm subject-card" style={{ overflow: "hidden", position: "relative" }}>
               <div style={{ position: "absolute", top: 15, right: 15, background: "rgba(79, 70, 229, 0.1)", color: "#4F46E5", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                {s.credits} Tín chỉ
               </div>

               <div style={{ padding: 25 }}>
                  <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, letterSpacing: 1 }}>{s.code}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: "5px 0 15px" }}>{s.name}</h3>
                  
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <Button size="sm" variant="primary" onClick={() => handleEdit(s)}>Chỉnh sửa</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>Xóa</Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      <Modal 
        open={showModal} 
        onClose={handleCloseModal} 
        title={editTarget ? "✏️ Chỉnh sửa môn học" : "✨ Thêm môn học mới"}
      >
        <div className="cm-form-group" style={{ marginBottom: 15 }}>
          <label className="cm-form-label">Mã môn học <span style={{color:'red'}}>*</span></label>
          <input 
            className={`form-input ${errors.code ? 'border-danger' : ''}`}
            value={form.code}
            placeholder="VD: INT1306"
            onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
          />
          {errors.code && <small style={{color: 'red', marginTop: 4, display:'block'}}>{errors.code}</small>}
        </div>

        <div className="cm-form-group" style={{ marginBottom: 15 }}>
          <label className="cm-form-label">Tên môn học <span style={{color:'red'}}>*</span></label>
          <input 
            className={`form-input ${errors.name ? 'border-danger' : ''}`}
            value={form.name}
            placeholder="VD: Lập trình Web chuyên nghiệp"
            onChange={e => setForm({...form, name: e.target.value})}
          />
          {errors.name && <small style={{color: 'red', marginTop: 4, display:'block'}}>{errors.name}</small>}
        </div>

        <div className="cm-form-group" style={{ marginBottom: 20 }}>
          <label className="cm-form-label">Số tín chỉ (1-8)</label>
          <input 
            type="number" className="form-input" min="1" max="8"
            value={form.credits}
            onChange={e => setForm({...form, credits: e.target.value})}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost" className="w-full" onClick={handleCloseModal}>Hủy</Button>
          <Button 
            className="w-full" 
            onClick={handleSave} 
            disabled={isChecking || !!errors.code || !!errors.name}
          >
            {isChecking ? "⏳ Đang kiểm tra..." : (editTarget ? "Lưu thay đổi" : "Tạo ngay")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectsPage;