import { useEffect, useState, useMemo } from "react";
import instance from "../../utils/axios.customize";
import { Button, Modal } from "../../helper/helper";
import { toast } from "react-toastify";

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [classSections, setClassSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [form, setForm] = useState({
    class_section_id: "",
    semester_id: "",
    day_of_week: 2,
    start_period: 1,
    end_period: 3,
    room: "",
    week_start: "",
    week_end: "",
  });

  const [filterDay, setFilterDay] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterSemester, setFilterSemester] = useState("");


  const getWeekDateDisplay = (
    semesterStartDate,
    weekNumber,
    isEndOfWeek = false
  ) => {
    if (!semesterStartDate || !weekNumber) return "---";

    const date = new Date(semesterStartDate);
    // Tính số ngày cần cộng thêm: (Tuần - 1) * 7 ngày
    // Nếu là cuối tuần (week_end) thì cộng thêm 6 ngày nữa để ra Chủ Nhật
    const daysToAdd = (weekNumber - 1) * 7 + (isEndOfWeek ? 6 : 0);

    date.setDate(date.getDate() + daysToAdd);

    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSchedules, resClasses, resSemesters] = await Promise.all([
        instance.get("/schedules"),
        instance.get("/class-sections"),
        instance.get("/semesters"),
      ]);

      setSchedules(resSchedules.data || []);
      setClassSections(resClasses.data || []);
      setSemesters(resSemesters.data || []);

      const activeSem = resSemesters.data?.find((s) => s.is_active);
      if (activeSem) setFilterSemester(activeSem.id);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const checkConflict = (newSchedule) => {
    const {
      day_of_week,
      start_period,
      end_period,
      week_start,
      week_end,
      room,
      class_section_id,
      semester_id,
    } = newSchedule;

    const currentClass = classSections.find(
      (c) => c.id === Number(class_section_id)
    );
    const teacherId = currentClass?.teacher_id;

    for (const s of schedules) {
      if (editTarget && s.id === editTarget.id) continue;

      // Chỉ check nếu cùng Học kỳ và cùng Thứ
      if (Number(s.semester_id) !== Number(semester_id)) continue;
      if (Number(s.day_of_week) !== Number(day_of_week)) continue;

      // KIỂM TRA GIAO THOA TIẾT HỌC (Overlap Period)
      const isPeriodOverlap =
        start_period <= s.end_period && end_period >= s.start_period;

      // IỂM TRA GIAO THOA TUẦN HỌC (Overlap Week) - CỰC KỲ QUAN TRỌNG
      const isWeekOverlap =
        week_start <= s.week_end && week_end >= s.week_start;

      // Nếu TRÙNG CẢ TIẾT VÀ TRÙNG CẢ TUẦN thì mới tính là xung đột
      if (isPeriodOverlap && isWeekOverlap) {
        if (s.room === room)
          return `⚠️ TRÙNG PHÒNG: Phòng ${room} đã có lớp "${s.class_section?.name}" vào tuần ${s.week_start}-${s.week_end}`;

        if (s.class_section?.teacher_id === teacherId)
          return `⚠️ TRÙNG GIẢNG VIÊN: Giảng viên đã có lịch dạy lớp khác vào giờ này!`;

        if (Number(class_section_id) === Number(s.class_section_id))
          return `⚠️ TRÙNG LỚP: Lớp này đã được xếp lịch vào khung giờ và tuần này rồi!`;
      }
    }
    return null;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!form.semester_id) return toast.error("Vui lòng chọn học kỳ");
    if (!form.class_section_id)
      return toast.error("Lớp học phần không được để trống");
    if (!form.room) return toast.error("Vui lòng điền phòng học");

    // --- CHECK TUẦN ---
    const ws = Number(form.week_start);
    const we = Number(form.week_end);
    if (!ws || !we) return toast.error("Vui lòng nhập số tuần");
    if (ws < 1 || we > 20)
      return toast.error("Số tuần phải nằm trong khoảng 1-20");
    if (ws > we)
      return toast.error("Tuần bắt đầu không được lớn hơn tuần kết thúc");

    // --- CHECK TIẾT ---
    const ps = Number(form.start_period);
    const pe = Number(form.end_period);
    if (!ps || !pe) return toast.error("Vui lòng nhập tiết học");
    if (ps < 1 || pe > 10)
      return toast.error("Tiết học phải nằm trong khoảng 1-10");
    if (ps > pe)
      return toast.error("Tiết bắt đầu không được lớn hơn tiết kết thúc");

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
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter(
      (s) =>
        (!filterSemester || Number(s.semester_id) === Number(filterSemester)) && // Filter theo Semester
        (!filterDay || Number(s.day_of_week) === Number(filterDay)) &&
        (!filterRoom || s.room.toLowerCase().includes(filterRoom.toLowerCase()))
    );
  }, [schedules, filterDay, filterRoom, filterSemester]);

  return (
    <div style={{ padding: 25 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 25,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontWeight: 900 }}>
            📅 Quản lý Lịch đào tạo
          </h1>
          <p style={{ color: "#666" }}>
            Xếp lịch cho từng học kỳ và tránh trùng lặp
          </p>
        </div>
        <Button
          onClick={() => {
            const activeSem = semesters.find((s) => s.is_active);
            setEditTarget(null);
            setForm({
              day_of_week: 2,
              start_period: 1,
              end_period: 3,
              room: "",
              week_start: "",
              week_end: "",
              semester_id: activeSem?.id || "", // Tự động chọn HK đang active
            });
            setShowModal(true);
          }}
        >
          + Xếp lịch mới
        </Button>
      </div>

      <div
        className="card"
        style={{ display: "flex", gap: 15, padding: 15, marginBottom: 20 }}
      >
        {/* Bộ lọc Học kỳ */}
        <select
          className="form-input"
          style={{ width: 220 }}
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
        >
          <option value="">Tất cả Học kỳ</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.name} {sem.is_active ? "(Hiện tại)" : ""}
            </option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ width: 150 }}
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
        >
          <option value="">Tất cả Thứ</option>
          {[2, 3, 4, 5, 6, 7, 8].map((d) => (
            <option key={d} value={d}>
              {d === 8 ? "Chủ Nhật" : `Thứ ${d}`}
            </option>
          ))}
        </select>
        <input
          className="form-input"
          placeholder="🔍 Tìm theo phòng..."
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead
            style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}
          >
            <tr>
              <th style={{ padding: 15, textAlign: "left" }}>Lớp học phần</th>
              <th style={{ padding: 15, textAlign: "left" }}>Học kỳ</th>
              <th style={{ padding: 15, textAlign: "left" }}>Tuần học</th>
              <th style={{ padding: 15, textAlign: "left" }}>Thời gian</th>
              <th style={{ padding: 15, textAlign: "left" }}>Phòng</th>
              <th style={{ padding: 15, textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 15 }}>
                  <div style={{ fontWeight: 700 }}>{s.class_section?.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {s.class_section?.subject?.name}
                  </div>
                </td>
                <td style={{ padding: 15, fontSize: 13 }}>
                  {s.semester?.name}
                </td>
                <td style={{ padding: 15 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {getWeekDateDisplay(s.semester?.start_date, s.week_start)}
                    {" - "}
                    {getWeekDateDisplay(
                      s.semester?.start_date,
                      s.week_end,
                      true
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#999" }}>
                    (Tuần {s.week_start} - {s.week_end})
                  </div>
                </td>
                <td style={{ padding: 15 }}>
                  <span
                    style={{
                      background: "#eef2ff",
                      color: "#4f46e5",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    Thứ {s.day_of_week === 8 ? "CN" : s.day_of_week} | Tiết{" "}
                    {s.start_period}-{s.end_period}
                  </span>
                </td>
                <td style={{ padding: 15, fontWeight: 700 }}>{s.room}</td>
                <td style={{ padding: 15, textAlign: "center" }}>
                  <button
                    onClick={() => {
                      setEditTarget(s);
                      setForm(s);
                      setShowModal(true);
                    }}
                    style={{
                      marginRight: 10,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "var(--primary)",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--surface2)",
                      transition: "0.2s",
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#d32f2f",
                      border: "1px solid #ffcdd2",
                      backgroundColor: "#ffebee",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? "Sửa lịch học" : "Xếp lịch mới"}
      >
        <div className="form-group">
          <label className="form-label">Học kỳ áp dụng</label>
          <select
            className="form-input"
            value={form.semester_id}
            onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
          >
            <option value="">Chọn học kỳ</option>
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name} {sem.is_active ? "(Hiện tại)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Lớp học phần</label>
          <select
            className="form-input"
            value={form.class_section_id}
            onChange={(e) =>
              setForm({ ...form, class_section_id: e.target.value })
            }
          >
            <option value="">Chọn lớp học phần</option>
            {classSections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.teacher?.name})
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 15,
          }}
        >
          <div className="form-group">
            <label className="form-label">Tuần bắt đầu</label>
            <input
              type="number"
              className="form-input"
              placeholder="VD: 1"
              min="1"
              max="20"
              value={form.week_start}
              onChange={(e) =>
                setForm({ ...form, week_start: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tuần kết thúc</label>
            <input
              type="number"
              className="form-input"
              placeholder="VD: 15"
              min="1"
              max="20"
              value={form.week_end}
              onChange={(e) =>
                setForm({ ...form, week_end: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <div className="form-group">
            <label className="form-label">Thứ</label>
            <select
              className="form-input"
              value={form.day_of_week}
              onChange={(e) =>
                setForm({ ...form, day_of_week: Number(e.target.value) })
              }
            >
              {[2, 3, 4, 5, 6, 7, 8].map((d) => (
                <option key={d} value={d}>
                  {d === 8 ? "CN" : d}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Từ Tiết</label>
            <input
              type="number"
              className="form-input"
              value={form.start_period}
              min="1"
              max="10"
              onChange={(e) =>
                setForm({ ...form, start_period: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Đến Tiết</label>
            <input
              type="number"
              className="form-input"
              value={form.end_period}
              min="1"
              max="10"
              onChange={(e) =>
                setForm({ ...form, end_period: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phòng học</label>
          <input
            className="form-input"
            placeholder="VD: C.106"
            value={form.room}
            onChange={(e) =>
              setForm({ ...form, room: e.target.value.toUpperCase() })
            }
          />
        </div>

        <Button className="w-full mt-4" onClick={handleSave}>
          Xác nhận xếp lịch
        </Button>
      </Modal>
    </div>
  );
};

export default SchedulePage;
