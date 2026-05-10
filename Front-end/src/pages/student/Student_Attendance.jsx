import { useState, useEffect } from "react";
import instance from "../../utils/axios.customize";
import { StatusBadge } from "../../helper/helper";
import { toast } from "react-toastify";

const MyAttendance = () => {
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await instance.get("/student/attendance");

      // ✅ FIX: Bọc an toàn, tránh lỗi khi Axios cấu hình interceptors trả thẳng về data
      const responsePayload = res.data !== undefined ? res.data : res;
      const data = responsePayload?.data;

      if (data) {
        setStats(data?.stats);
        setAttendance(data?.attendanceHistory || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Load attendance failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData =
    filter === "all"
      ? attendance
      : attendance.filter((a) => a.subject === filter);

  const subjects = [...new Set(attendance.map((a) => a.subject))];

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div>
      {/* STATS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {stats?.present || 0}
          </div>
          <div>Buổi có mặt</div>
        </div>

        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {stats?.absent || 0}
          </div>
          <div>Buổi vắng</div>
        </div>

        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {stats?.late || 0}
          </div>
          <div>Buổi trễ</div>
        </div>

        <div className="card" style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {stats?.attendanceRate || 0}%
          </div>
          <div>Chuyên cần</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📜 Lịch sử điểm danh</span>

          <select
            className="form-input form-select"
            style={{ width: 180 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả môn</option>
            {subjects.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Môn học</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.date || "-"}</td>
                  <td>{a.subject}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 600 }}>
                    {a.time}
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
