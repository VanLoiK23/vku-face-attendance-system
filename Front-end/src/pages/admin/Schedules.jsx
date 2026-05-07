import { useEffect, useState, useMemo } from "react";
import instance from "../../utils/axios.customize";
import { Button, Modal } from "../../helper/helper";
import { toast } from "react-toastify";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [classSections, setClassSections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    class_section_id: "",
    day_of_week: 2,
    start_period: 1,
    end_period: 3,
    room: ""
  });

  const [filterDay, setFilterDay] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSchedules, resClasses] = await Promise.all([
        instance.get("/schedules"),
        instance.get("/class-sections")
      ]);
      setSchedules(resSchedules.data || []);
      setClassSections(resClasses.data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const checkConflict = (newSchedule) => {
    const { day_of_week, start_period, end_period, room, class_section_id } = newSchedule;
    
    // Tìm lớp học phần hiện tại để lấy ID giảng viên
    const currentClass = classSections.find(c => c.id === Number(class_section_id));
    const teacherId = currentClass?.teacher_id;

    for (const s of schedules) {
      // Bỏ qua chính nó nếu đang edit
      if (editTarget && s.id === editTarget.id) continue;

      // Kiểm tra có bị giao thoa tiết học không
      const isTimeOverlap = 
        Number(day_of_week) === Number(s.day_of_week) &&
        ((start_period >= s.start_period && start_period <= s.end_period) ||
         (end_period >= s.start_period && end_period <= s.end_period) ||
         (s.start_period >= start_period && s.start_period <= end_period));

      if (isTimeOverlap) {
        if (s.room === room) return `⚠️ TRÙNG PHÒNG: Phòng ${room} đã có lớp "${s.class_section?.name}"`;
        if (s.class_section?.teacher_id === teacherId) return `⚠️ TRÙNG GIẢNG VIÊN: Giảng viên đã có lịch dạy lớp khác vào giờ này!`;
        if (Number(class_section_id) === Number(s.class_section_id)) return `⚠️ TRÙNG LỚP: Lớp này đã được xếp lịch vào giờ này rồi!`;
      }
    }
    return null;
  };

  const handleSave = async () => {

    if(form.start_period<0||form.start_period>10){
      toast.error("Tiết bắt đầu không hợp lệ");
      return;
    }
    if(form.end_period<0||form.end_period>10){
      toast.error("Tiết kết thúc không hợp lệ");
      return;
    }

    if(form.start_period>form.end_period){
      toast.error("Tiết bắt đầu không được lớn hơn tiết kết thúc");
      return;
    }

    const conflictMsg = checkConflict(form);
    if (conflictMsg) return toast.warning(conflictMsg);

    try {
      if (editTarget) {
        await instance.put(`/schedules/${editTarget.id}`, form);
        toast.success("Cập nhật lịch thành công");
      } else {
        await instance.post("/schedules", form);
        toast.success("Tạo lịch mới thành công");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi API: " + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa lịch học này?")) return;
    try {
      await instance.delete(`/schedules/${id}`);
      fetchData();
      toast.success("Đã xóa");
    } catch (err) { toast.error("Xóa thất bại"); }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => 
      (!filterDay || Number(s.day_of_week) === Number(filterDay)) &&
      (!filterRoom || s.room.toLowerCase().includes(filterRoom.toLowerCase()))
    );
  }, [schedules, filterDay, filterRoom]);

  return (
    <div style={{ padding: 25 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 25 }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 900 }}>📅 Quản lý Lịch đào tạo</h1>
          <p style={{ color: "#666" }}>Xếp lịch, quản lý phòng học và tránh trùng lặp</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setForm({day_of_week:2, start_period:1, end_period:3, room:""}); setShowModal(true); }}>
          + Xếp lịch mới
        </Button>
      </div>

      <div className="card" style={{ display: "flex", gap: 15, padding: 15, marginBottom: 20 }}>
        <select className="form-input" style={{ width: 150 }} value={filterDay} onChange={e => setFilterDay(e.target.value)}>
          <option value="">Tất cả Thứ</option>
          {[2,3,4,5,6,7,8].map(d => <option key={d} value={d}>{d === 8 ? "Chủ Nhật" : `Thứ ${d}`}</option>)}
        </select>
        <input className="form-input" placeholder="🔍 Tìm theo phòng..." value={filterRoom} onChange={e => setFilterRoom(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
            <tr>
              <th style={{ padding: 15, textAlign: "left" }}>Lớp học phần</th>
              <th style={{ padding: 15, textAlign: "left" }}>Thời gian</th>
              <th style={{ padding: 15, textAlign: "left" }}>Phòng</th>
              <th style={{ padding: 15, textAlign: "left" }}>Giảng viên</th>
              <th style={{ padding: 15, textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 15 }}>
                  <div style={{ fontWeight: 700 }}>{s.class_section?.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{s.class_section?.subject?.name}</div>
                </td>
                <td style={{ padding: 15 }}>
                  <span style={{ background: "#eef2ff", color: "#4f46e5", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
                    Thứ {s.day_of_week === 8 ? "CN" : s.day_of_week} | Tiết {s.start_period}-{s.end_period}
                  </span>
                </td>
                <td style={{ padding: 15, fontWeight: 700 }}>{s.room}</td>
                <td style={{ padding: 15 }}>{s.class_section?.teacher?.name}</td>
                <td style={{ padding: 15, textAlign: "center" }}>
                  <button onClick={() => { setEditTarget(s); setForm(s); setShowModal(true); }} style={{ marginRight: 10, border: "none", background: "none", color: "blue", cursor: "pointer" }}>Sửa</button>
                  <button onClick={() => handleDelete(s.id)} style={{ border: "none", background: "none", color: "red", cursor: "pointer" }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTarget ? "Sửa lịch học" : "Xếp lịch mới"}>
        <div className="form-group">
          <label className="form-label">Lớp học phần</label>
          <select className="form-input" value={form.class_section_id} onChange={e => setForm({...form, class_section_id: e.target.value})}>
            <option value="">Chọn lớp học phần</option>
            {classSections.map(c => <option key={c.id} value={c.id}>{c.name} ({c.teacher?.name})</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Thứ</label>
            <select className="form-input" value={form.day_of_week} onChange={e => setForm({...form, day_of_week: Number(e.target.value)})}>
              {[2,3,4,5,6,7,8].map(d => <option key={d} value={d}>{d === 8 ? "CN" : d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Từ Tiết</label>
            <input type="number" className="form-input" value={form.start_period} min="1" max="10" onChange={e => setForm({...form, start_period: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Đến Tiết</label>
            <input type="number" className="form-input" value={form.end_period} min="1" max="10" onChange={e => setForm({...form, end_period: Number(e.target.value)})} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Phòng học</label>
          <input className="form-input" placeholder="VD: C.106" value={form.room} onChange={e => setForm({...form, room: e.target.value.toUpperCase()})} />
        </div>
        <Button className="w-full mt-4" onClick={handleSave}>Xác nhận xếp lịch</Button>
      </Modal>
    </div>
  );
};

export default SchedulePage;