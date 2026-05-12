import { useState, useEffect } from "react";
import instance from "../../utils/axios.customize.js";
import {
  Avatar,
  Badge,
  Button,
  ProgressBar,
  StatCard,
  StatusBadge,
  AttendanceChart,
} from "../../helper/helper.jsx";

const AdminDashboard = () => {
  const [showAll, setShowAll] = useState(false);

  // ================= STYLE =================
  const styles = {
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginTop: 16,
    },
    card: {
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #eee",
    },
    cardHeader: {
      padding: "14px 18px",
      borderBottom: "1px solid #eee",
      fontWeight: 600,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardBody: {
      padding: 16,
    },
    tableWrap: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    thtd: {
      padding: 12,
      fontSize: 14,
      borderBottom: "1px solid #eee",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    modal: {
      background: "#fff",
      padding: 20,
      borderRadius: 10,
      width: 400,
      maxWidth: "90%",
    },
    history: {
      maxHeight: 200,
      overflowY: "auto",
      border: "1px solid #eee",
      padding: 8,
      borderRadius: 6,
      fontSize: 13,
    },
  };

  // ================= STATE =================
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [scheduleToday, setScheduleToday] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await instance.get("/admin/dashboard");

        if (res.data.success) {
          setStats(res.data.stats || {});
          setStudents(res.data.students || []);
          setScheduleToday(res.data.scheduleToday || []);
          setChartData(res.data.chartData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ================= DETAIL =================
  const handleViewDetail = async (id) => {
    try {
      const res = await instance.get(`/admin/students/${id}`);
      if (res.data.success) {
        setSelectedStudent(res.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= VIEW ALL =================
  const handleViewAll = async () => {
    try {
      const res = await instance.get("/admin/students");

      if (res.data.success) {
        setStudents(res.data.data);
        setShowAll(true); // 🔥 bật xem full
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  // 🔥 FIX QUAN TRỌNG
  const sortedStudents = [...students].sort(
    (a, b) => a.attendanceRate - b.attendanceRate,
  );

  const displayStudents = showAll ? sortedStudents : sortedStudents.slice(0, 5);

  return (
    <div>
      {/* ================= STATS ================= */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="🎓"
          label="Tổng sinh viên"
          value={stats.totalStudents}
          color="#3b82f6"
        />
        <StatCard
          icon="🏫"
          label="Tổng lớp học"
          value={stats.totalClasses}
          color="#06b6d4"
        />
        <StatCard
          icon="📅"
          label="Buổi học hôm nay"
          value={stats.todaySessions}
          color="#10b981"
        />
        <StatCard
          icon="📊"
          label="Chuyên cần TB"
          value={`${stats.avgAttendance}%`}
          color="#f59e0b"
        />
      </div>

      {/* ================= CHART + SCHEDULE ================= */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>📈 Tỷ lệ chuyên cần tuần này</div>
          <div style={styles.cardBody}>
            <AttendanceChart data={chartData} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              {chartData.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <b>{d.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>🏫 Lớp đang học</div>
          <div>
            {scheduleToday.map((s) => (
              <div key={s.id} style={styles.thtd}>
                <div style={{ fontWeight: 600 }}>{s.subject}</div>
                <div style={{ fontSize: 12 }}>
                  {s.class} · {s.room} · {s.time}
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <div style={styles.cardHeader}>
          <span>⚠️ Sinh viên nghỉ nhiều nhất</span>
          <Button size="sm" onClick={handleViewAll}>
            {showAll ? "Đã hiển thị tất cả" : "Xem tất cả"}
          </Button>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thtd}>#</th>
                <th style={styles.thtd}>Sinh viên</th>
                <th style={styles.thtd}>Lớp</th>
                <th style={styles.thtd}>Vắng</th>
                <th style={styles.thtd}>%</th>
                <th style={styles.thtd}></th>
              </tr>
            </thead>

            <tbody>
              {displayStudents.map((s, i) => (
                <tr key={s.id}>
                  <td style={styles.thtd}>{i + 1}</td>

                  <td style={styles.thtd}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar
                        initials={s.avatar || s.name?.slice(0, 2)}
                        size="sm"
                      />
                      <div>
                        <div>{s.name}</div>
                        <div style={{ fontSize: 12 }}>{s.studentId}</div>
                      </div>
                    </div>
                  </td>

                  <td style={styles.thtd}>
                    <Badge type="blue">{s.class}</Badge>
                  </td>

                  <td style={{ ...styles.thtd, color: "red", fontWeight: 700 }}>
                    {s.absentSessions} buổi
                  </td>

                  <td style={styles.thtd}>
                    <ProgressBar value={s.attendanceRate} />
                    {s.attendanceRate}%
                  </td>

                  <td style={styles.thtd}>
                    <Button size="sm" onClick={() => handleViewDetail(s.id)}>
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && selectedStudent && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedStudent.name}</h3>

            <p>MSSV: {selectedStudent.studentId}</p>
            <p>Lớp: {selectedStudent.class}</p>
            <p>Chuyên cần: {selectedStudent.attendanceRate}%</p>

            <h4>Lịch sử điểm danh</h4>

            <div style={styles.history}>
              {selectedStudent.history.map((h, i) => (
                <div key={i}>
                  {h.date} - {h.status === "present" ? "✅" : "❌"}
                </div>
              ))}
            </div>

            <Button onClick={() => setShowModal(false)}>Đóng</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
