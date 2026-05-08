import { useEffect, useState, useMemo } from "react";
import instance from "../../utils/axios.customize";
import { Avatar, Button, Modal } from "../../helper/helper";
import { toast } from "react-toastify";

const ClassesPage = () => {
  const [classSections, setClassSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]); 

  const [selected, setSelected] = useState(null); 
  const [assignTarget, setAssignTarget] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [editTarget, setEditTarget] = useState(null);
  
  const [keyword, setKeyword] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [form, setForm] = useState({ name: "", subject_id: "", teacher_id: "", room: "" });

  const fetchData = async () => {
    try {
      const [resClasses, resTeachers, resSubjects, resStudents] = await Promise.all([
        instance.get("/class-sections"),
        instance.get("/teachers"),
        instance.get("/subjects"),
        instance.get("/students"),
      ]);
      if (resClasses?.data) setClassSections(resClasses.data);
      if (resTeachers?.data) setTeachers(resTeachers.data);
      if (resSubjects?.data) setSubjects(resSubjects.data);
      if (resStudents?.data) setAllStudents(resStudents.data);
    } catch (error) { console.error("Lỗi fetch data:", error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveClass = async () => {
    if (!form.name || !form.subject_id) return alert("Vui lòng nhập tên lớp và chọn môn học!");
    try {
      const payload = {
        ...form,
        subject_id: Number(form.subject_id),
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      };

      if (editTarget) {
        await instance.put(`/class-sections/${editTarget.id}`, payload);
      } else {
        await instance.post("/class-sections", payload);
      }
      
      setShowModal(false);
      setEditTarget(null);
      setForm({ name: "", subject_id: "", teacher_id: "", room: "" });
      fetchData();
    } catch (error) { alert("Lỗi khi lưu lớp học phần"); }
  };

  const handleEdit = (c, e) => {
    e.stopPropagation();
    setEditTarget(c);
    setForm({
      name: c.name,
      subject_id: c.subject?.id || "",
      teacher_id: c.teacher?.id || "",
      room: c.room || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Xóa lớp học phần này sẽ mất sạch dữ liệu điểm danh liên quan. Bạn chắc chứ?")) return;
    try {
      await instance.delete(`/class-sections/${id}`);

      toast.success("Xóa lớp học phần thành công!");

      fetchData();
    } catch (err) { alert("Không thể xóa lớp!"); }
  };

  const handleEnroll = async (studentId, isRemoving = false) => {
    try {
      if (isRemoving) {
        // xóa SV khỏi lớp (Bảng enrollments)
        await instance.delete(`/enrollments`, { 
          data: { student_id: studentId, class_section_id: assignTarget.id } 
        });
      } else {
        // thêm SV vào lớp
        await instance.post(`/enrollments`, { 
          student_id: studentId, 
          class_section_id: assignTarget.id 
        });
      }
      fetchData(); 
      const updatedClasses = await instance.get("/class-sections");
      const current = updatedClasses.data.find(c => c.id === assignTarget.id);
      setAssignTarget(current);
    } catch (err) { alert("Thao tác thất bại!"); }
  };

  const filteredClasses = useMemo(() => {
    return classSections.filter(c => c.name.toLowerCase().includes(keyword.toLowerCase()));
  }, [classSections, keyword]);

  const studentsNotInClass = useMemo(() => {
    if (!assignTarget) return [];
    const enrolledIds = assignTarget.students?.map(s => s.id) || [];
    return allStudents.filter(s => 
      !enrolledIds.includes(s.id) && 
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentCode.includes(studentSearch))
    );
  }, [assignTarget, allStudents, studentSearch]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>🏫 Lớp học phần</h1>
          <p style={{ color: "var(--text3)", marginTop: 5 }}>Quản lý danh sách lớp và sinh viên tham gia</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setForm({name:"", subject_id:"", teacher_id:"", room:""}); setShowModal(true); }}>
          + Tạo lớp mới
        </Button>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 20 }}>
        <input className="form-input" placeholder="🔍 Tìm kiếm tên lớp..." value={keyword} onChange={e => setKeyword(e.target.value)} />
      </div>

      <div className="grid-2">
        {filteredClasses.map((c) => (
          <div key={c.id} className="card shadow-hover" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => setSelected(c)}>
            <div style={{ background: "linear-gradient(135deg, #4f46e5, #818cf8)", padding: 20, color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>{c.subject?.code}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{c.name}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px 15px", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{c.students?.length || 0}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>SINH VIÊN</div>
                </div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div className="grid-2" style={{ gap: 10, marginBottom: 15 }}>
                <div><label style={{ fontSize: 11, color: "var(--text3)" }}>GIẢNG VIÊN</label><div style={{ fontWeight: 700 }}>{c.teacher?.name || "Chưa gán"}</div></div>
                <div><label style={{ fontSize: 11, color: "var(--text3)" }}>PHÒNG</label><div style={{ fontWeight: 700 }}>{c.room || "TBA"}</div></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); setAssignTarget(c); }}>Gán SV</Button>
                <Button size="sm" variant="ghost" onClick={(e) => handleEdit(c, e)}>Sửa</Button>
                <Button size="sm" variant="ghost" style={{ color: "var(--danger)" }} onClick={(e) => handleDelete(c.id, e)}>Xóa</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTarget ? "✏️ Chỉnh sửa lớp" : "✨ Tạo lớp mới"}>
        <div className="form-group"><label className="form-label">Tên lớp học phần</label>
          <input className="form-input" placeholder="VD: Web-01" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="form-group"><label className="form-label">Môn học</label>
          <select className="form-input" value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})}>
            <option value="">Chọn môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Giảng viên</label>
          <select className="form-input" value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})}>
            <option value="">Chọn giảng viên</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Phòng học</label>
          <input className="form-input" placeholder="P201" value={form.room} onChange={e => setForm({...form, room: e.target.value})} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Button variant="ghost" className="w-full" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button className="w-full" onClick={handleSaveClass}>{editTarget ? "Lưu thay đổi" : "Tạo ngay"}</Button>
        </div>
      </Modal>

      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title={`👥 Quản lý SV lớp ${assignTarget?.name}`}>
        <div style={{ marginBottom: 15 }}>
          <input className="form-input" placeholder="🔍 Tìm SV để thêm..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, color: "var(--text3)", borderBottom: "1px solid #eee", paddingBottom: 5 }}>SINH VIÊN TRONG LỚP ({assignTarget?.students?.length})</h4>
            {assignTarget?.students?.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar initials={s.name.slice(0, 2)} size="sm" />
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 11 }}>{s.studentCode}</div></div>
                </div>
                <button style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: 12 }} onClick={() => handleEnroll(s.id, true)}>Gỡ</button>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, color: "var(--text3)", borderBottom: "1px solid #eee", paddingBottom: 5 }}>KHO SINH VIÊN HỆ THỐNG</h4>
            {studentsNotInClass.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar initials={s.name.slice(0, 2)} size="sm" />
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 11 }}>{s.studentCode}</div></div>
                </div>
                <button style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => handleEnroll(s.id)}>Thêm</button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Chi tiết lớp ${selected?.name}`}>
        {selected && (
          <div style={{ background: "var(--bg)", borderRadius: 12, padding: 20 }}>
             <h3 style={{ margin: 0 }}>{selected.subject?.name}</h3>
             <p style={{ color: "var(--text3)" }}>Giảng viên: <b>{selected.teacher?.name}</b> | Phòng: <b>{selected.room}</b></p>
             <div style={{ marginTop: 20 }}>
               <label style={{ fontWeight: 800, fontSize: 12, color: "var(--text3)" }}>DANH SÁCH SINH VIÊN ({selected.students?.length})</label>
               {selected.students?.map(s => (
                 <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
                    <Avatar initials={s.name.slice(0, 2)} size="sm" />
                    <div><div style={{ fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 12, color: "var(--text3)" }}>{s.studentCode}</div></div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClassesPage;