import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../utils/axios.customize";
import { toast } from "react-toastify";
import { Avatar, Button, ProgressBar, StatusBadge } from "../../helper/helper";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/teacher/sessions/${sessionId}`);
        console.log(res.data);// ???
        if (res && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Lỗi fetch chi tiết buổi học:", error);
        toast.error("Không thể tải danh sách điểm danh");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [sessionId]);

  const handleExportExcel = async () => {
    if (!data || !data.students) return;

    // Tạo Workbook và Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DiemDanh");

    // Định nghĩa Cột (Header)
    worksheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Mã Sinh Viên", key: "studentCode", width: 20 },
      { header: "Họ và Tên", key: "name", width: 30 },
      { header: "Trạng thái", key: "status", width: 15 },
      { header: "Giờ điểm danh", key: "time", width: 15 },
      { header: "Độ tin cậy (%)", key: "confidence", width: 15 },
    ];

    // Style cho Header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    data.students.forEach((s, index) => {
      worksheet.addRow({
        stt: index + 1,
        studentCode: s.studentCode,
        name: s.name,
        status: s.status === "present" ? "Có mặt" : "Vắng",
        time: s.checkinTime
          ? new Date(s.checkinTime).toLocaleTimeString("vi-VN")
          : "—",
        confidence: s.similarity ? (s.similarity * 100).toFixed(1) + "%" : "—",
      });
    });

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `DiemDanh_${data.classSectionName}.xlsx`;
    saveAs(new Blob([buffer]), fileName);

    toast.success("Đã xuất file Excel thành công!");
  };

  if (loading) return <div style={{ padding: 20 }}>Đang tải dữ liệu...</div>;
  if (!data)
    return <div style={{ padding: 20 }}>Không tìm thấy dữ liệu buổi học.</div>;

  const total = data.students?.length || 0;
  const present =
    data.students?.filter((s) => s.status === "present").length || 0;
  const absent = total - present;

  return (
    <div>
      <div className="card mb-5" style={{ overflow: "hidden" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--primary-dark), var(--accent))",
            padding: "24px 28px",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                {data.subject?.name}
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  ["🏫", "Lớp", data.classSectionName],
                  ["🚪", "Phòng", data.room],
                  ["⏰", "Ca học", data.period],
                  [
                    "📅",
                    "Ngày",
                    new Date(data.sessionDate).toLocaleDateString("vi-VN"),
                  ],
                ].map(([icon, label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>
                      {icon} {label}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              style={{ color: "white", borderColor: "white" }}
            >
              Quay lại
            </Button>
          </div>
        </div>

        <div
          style={{
            padding: "14px 28px",
            display: "flex",
            gap: 24,
            background: "var(--surface2)",
          }}
        >
          {[
            { label: "Tổng sinh viên", value: total, color: "var(--primary)" },
            { label: "Có mặt", value: present, color: "var(--success)" },
            { label: "Vắng", value: absent, color: "var(--danger)" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Danh sách điểm danh</span>
          <Button variant="ghost" size="sm" onClick={handleExportExcel}>
            📥 Xuất Excel
          </Button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Trạng thái</th>
                <th>Giờ điểm danh</th>
                <th>Độ tin cậy AI</th>
              </tr>
            </thead>
            <tbody>
              {data.students?.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar
                        initials={s.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(-2)}
                        size="sm"
                      />
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <code
                      style={{
                        background: "var(--bg)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      {s.studentCode}
                    </code>
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                    }}
                  >
                    {s.checkinTime
                      ? new Date(s.checkinTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td>
                    {s.similarity ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <ProgressBar
                          value={s.similarity * 100}
                          color={
                            s.similarity > 0.8
                              ? "var(--success)"
                              : "var(--warning)"
                          }
                        />
                        <span style={{ fontSize: 12, fontWeight: 700 }}>
                          {(s.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text3)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
