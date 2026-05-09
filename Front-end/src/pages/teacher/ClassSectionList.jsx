import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../utils/axios.customize";
import { toast } from "react-toastify";
import { Badge, ProgressBar } from "../../helper/helper";

const ClassSectionList = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const mockData = [
    {
      id: 101,
      name: "L01",
      room: "P201",
      subject: { code: "IT4442", name: "Lập trình Web", credits: 3 },
      semester: { name: "Học kỳ 2 - 2025-2026" },
      studentCount: 45,
      progress: { total: 15, current: 8 },
      avgAttendance: 92,
    },
    {
      id: 102,
      name: "L02",
      room: "P305",
      subject: { code: "IT4442", name: "Lập trình Web", credits: 3 },
      semester: { name: "Học kỳ 2 - 2025-2026" },
      studentCount: 42,
      progress: { total: 15, current: 7 },
      avgAttendance: 85,
    },
    {
      id: 205,
      name: "L01",
      room: "P102",
      subject: { code: "IT3011", name: "Cấu trúc dữ liệu", credits: 4 },
      semester: { name: "Học kỳ 1 - 2025-2026" },
      studentCount: 50,
      progress: { total: 15, current: 15 },
      avgAttendance: 88,
    },
  ];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const res = await instance.get("/teacher/class-sections");

        console.log(res.data);

        if (res && res.data) {
          setSections(res.data.length > 0 ? res.data : mockData);
        } else {
          setSections(mockData);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách lớp:", error);
        toast.error("Không thể tải danh sách lớp học");
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  const filteredSections = sections.filter((item) => {
    const matchSearch =
      item.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSemester =
      semesterFilter === "all" || item.semester?.name === semesterFilter;
    return matchSearch && matchSemester;
  });

  const semesters = ["all", ...new Set(sections.map((s) => s.semester?.name))];

  return (
    <div style={{ paddingBottom: 40 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 5px 0" }}>
            📜 Quản lý Lớp học phần
          </h2>
          <p style={{ color: "var(--text2)", margin: 0 }}>
            Xem lại lịch sử điểm danh và thống kê từng lớp
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm môn, mã môn, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 15px 10px 35px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                width: 280,
                outline: "none",
                backgroundColor: "var(--surface)",
              }}
            />
          </div>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả học kỳ" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 25,
          }}
        >
          {filteredSections.map((item) => (
            <div
              key={item.id}
              className="card"
              onClick={() => navigate(`/teacher/history/section/${item.id}`)}
              style={{
                cursor: "pointer",
                border: "1px solid var(--border)",
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(0,0,0,0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div
                style={{
                  padding: "20px 20px 15px 20px",
                  background:
                    item.progress.current === item.progress.total
                      ? "var(--bg2)"
                      : "white",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <Badge type="blue">{item.subject.code}</Badge>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text3)",
                      fontWeight: 700,
                    }}
                  >
                    {item.semester?.name
                      ? item.semester.name.split(" (")[0]
                      : "Chưa có HK"}{" "}
                  </span>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--primary-dark)",
                  }}
                >
                  {item.subject.name}
                </h3>
              </div>

              <div style={{ padding: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 15,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text2)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Lớp HP
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text2)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Phòng
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {item.room}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: "var(--text2)" }}>
                      Tiến độ giảng dạy
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {item.progress.current}/{item.progress.total} buổi
                    </span>
                  </div>
                  <ProgressBar
                    value={(item.progress.current / item.progress.total) * 100}
                    color="var(--accent)"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                    borderTop: "1px dashed var(--border)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span style={{ fontSize: 18 }}>👥</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {item.studentCount} SV
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "var(--text2)" }}>
                      Chuyên cần TB
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color:
                          item.avgAttendance < 80
                            ? "var(--danger)"
                            : "var(--success)",
                      }}
                    >
                      {item.avgAttendance}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassSectionList;
