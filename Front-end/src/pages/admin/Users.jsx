import { useState, useEffect } from "react";
import instance from "../../utils/axios.customize";
import {
  Avatar,
  Badge,
  Button,
  ProgressBar,
  Modal,
  StatusBadge,
} from "../../helper/helper";
import { toast } from "react-toastify";

const UsersPage = () => {
  const [tab, setTab] = useState("students");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setEdit] = useState(false);

  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    studentCode: "",
    cohortId: "",
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    department: "CNTT",
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await instance.get("/students");

      if (res && res.data) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetch students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);

      const res = await instance.get("/teachers");

      if (res && res.data) {
        setTeachers(res.data);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error("Error fetch teachers:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      setLoading(true);

      const res = await instance.get("/cohorts");

      if (res && res.data) {
        setCohorts(res.data);
      } else {
        setCohorts([]);
      }
    } catch (err) {
      console.error("Error fetch Cohorts:", err);
      setCohorts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
    if (tab === "students") fetchStudents();
    if (tab === "teachers") fetchTeachers();
  }, [tab]);

  const handleCreate = async (e) => {
    try {
      e.preventDefault();
  
      const emailRegex = /^[a-zA-Z0-9._%+-]+@vku\.udn\.vn$/;
      const currentEmail = tab === "students" ? studentForm.email : teacherForm.email;
  
      if (!emailRegex.test(currentEmail)) {
        toast.error("Email phải đúng định dạng @vku.udn.vn");
        return;
      }
  
      let formData = {};
      if (tab === "students") {
        formData = {
          name: studentForm.name,
          email: studentForm.email,
          studentCode: studentForm.studentCode,
          cohortId: studentForm.cohortId,
          role: "student",
        };
      } else {
        formData = {
          name: teacherForm.name,
          email: teacherForm.email,
          role: "teacher",
        };
      }
  
      let res;
      const baseEndpoint = "/" + tab;
  
      if (isEdit) {
        const targetId = tab === "students" ? studentForm.id : teacherForm.id;
        const userId = tab === "students" ? studentForm.user_id : teacherForm.user_id;
  
        const updateData = { ...formData, userId }; 
  
        res = await instance.put(`${baseEndpoint}/${targetId}`, updateData);
      } else {
        res = await instance.post(baseEndpoint, formData);
      }
  
      if (res && res.data) {
        setShowModal(false);
  
        const resetStudent = { name: "", email: "", studentCode: "", cohortId: "" };
        const resetTeacher = { name: "", email: "", department: "CNTT" };
        setStudentForm(resetStudent);
        setTeacherForm(resetTeacher);
  
        toast.success(res.data.message || (isEdit ? "Cập nhật thành công!" : "Tạo mới thành công!"));
  
        tab === "students" ? fetchStudents() : fetchTeachers();
      }
    } catch (err) {
      console.error("FULL ERROR:", err);
      const message = err.response?.data?.message || err.message || "Lỗi server, vui lòng thử lại";
      toast.error(message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={`btn ${tab === "students" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("students")}
        >
          🎓 Sinh viên ({students.length})
        </button>

        <button
          className={`btn ${tab === "teachers" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("teachers")}
        >
          👨‍🏫 Giảng viên ({teachers.length})
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input
            className="form-input"
            style={{ width: 220 }}
            placeholder="🔍 Tìm kiếm..."
          />
          <Button
            onClick={() => {
              setShowModal(true);
              setEdit(false);
            }}
          >
            + Thêm mới
          </Button>
        </div>
      </div>

      {/* LOADING */}
      {loading && <div style={{ padding: 20 }}>⏳ Đang tải dữ liệu...</div>}

      {/* STUDENTS */}
      {tab === "students" && !loading && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Mã SV</th>
                  <th>Lớp</th>
                  <th>Email</th>
                  <th>Ảnh khuôn mặt</th>
                  <th>Chuyên cần</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Avatar initials={s.avatar} size="sm" />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>

                    <td>
                      <code
                        style={{
                          background: "var(--bg)",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {s.student_code}
                      </code>
                    </td>

                    <td>
                      <Badge type="blue">{s.class_name}</Badge>
                    </td>

                    <td>{s.email}</td>

                    <td>
                      <StatusBadge status={s.faceStatus} />
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <ProgressBar
                          value={s.attendanceRate}
                          color={s.attendanceRate < 70 ? "red" : "green"}
                        />
                        <span>{s.attendanceRate}%</span>
                      </div>
                    </td>

                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowModal(true);
                          setEdit(true);

                          setStudentForm({
                            name: s.name,
                            email: s.email,
                            studentCode: s.studentCode,
                            cohortId: s.cohort_id,
                            id: s.id,
                            user_id: s.user_id,
                          });
                        }}
                      >
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm">
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHERS */}
      {tab === "teachers" && !loading && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Giảng viên</th>
                  <th>Email</th>
                  <th>Khoa</th>
                  <th>Số lớp</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Avatar initials={t.avatar} size="sm" />
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div>
                    </td>

                    <td>{t.email}</td>

                    <td>
                      <Badge type="cyan">CNTT</Badge>
                    </td>

                    <td>{t.courseCount} lớp</td>

                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowModal(true);
                          setEdit(true);

                          setTeacherForm({
                            name: t.name,
                            email: t.email,
                            department: "CNTT",
                            id: t.id,
                            user_id: t.user.id,
                          });
                        }}
                      >
                        ✏️
                      </Button>
                      <Button variant="ghost" size="sm">
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);

          setStudentForm({
            name: "",
            email: "",
            studentCode: "",
            cohortId: "",
          });

          setTeacherForm({
            name: "",
            email: "",
            department: "CNTT",
          });
        }}
        title={`${isEdit ? "Cập nhật " : "Thêm "} ${
          tab === "students" ? "Sinh viên" : "Giảng viên"
        }`}
      >
        {tab === "students" && (
          <>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                className="form-input"
                placeholder="Nhập họ tên..."
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email (@vku.udn.vn)</label>
              <input
                className="form-input"
                placeholder="email@vku.udn.vn"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mã sinh viên</label>
              <input
                className="form-input"
                placeholder="23ITxxx"
                value={studentForm.studentCode}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    studentCode: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lớp</label>
              <select
                className="form-input form-select"
                value={studentForm.cohortId}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, cohortId: e.target.value })
                }
              >
                <option value="">-- Chọn Lớp Hành Chính --</option>
                {cohorts.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {tab === "teachers" && (
          <>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                className="form-input"
                placeholder="Nhập họ tên..."
                value={teacherForm.name}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email (@vku.udn.vn)</label>
              <input
                className="form-input"
                placeholder="email@vku.udn.vn"
                value={teacherForm.email}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Khoa</label>
              <select className="form-input form-select" disabled>
                <option>CNTT</option>
              </select>
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Button
            variant="ghost"
            onClick={() => {
              setShowModal(false);

              setStudentForm({
                name: "",
                email: "",
                studentCode: "",
                cohortId: "",
              });

              setTeacherForm({
                name: "",
                email: "",
                department: "CNTT",
              });
            }}
            className="w-full"
          >
            Hủy
          </Button>
          <Button className="w-full" onClick={handleCreate}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
