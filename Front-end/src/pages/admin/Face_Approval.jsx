import { Button, StatusBadge } from "../../helper/helper";
import { useState, useEffect } from "react";
import instance from "../../utils/axios.customize";
import { toast } from "react-toastify";
import axios from "axios";

const FaceApprovalPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    pending: 0,
    confirm: 0,
    reject: 0,
  });

  const fetchList = async (page = 1) => {
    try {
      setLoading(true);
      const res = await instance.get(
        `/face-approval?page=${page}&limit=${pagination.limit}`
      );

      if (res.data) {
        setStudents(res.data.data);
        setPagination((prev) => ({
          ...prev,
          page: res.data.meta.page,
          totalPages: res.data.meta.totalPages,
          totalItems: res.data.meta.totalItems,
        }));
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error("Không thể tải danh sách duyệt video");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(pagination.page);
  }, [pagination.page]);

  const handleAction = async (id, status, reason = "") => {
    try {
      const student = students.find((s) => s.id === id);

      await instance.patch(`/face-approval/${id}`, {
        faceStatus: status,
        rejectReason: reason,
      });

      if (status === "confirm" && student) {
        try {
          toast.info("Đang trích xuất khuôn mặt, vui lòng đợi...");

          await axios.post("http://localhost:8000/api/process-admin-video", {
            student_id: id,
            video_url: student.faceVideoUrl,
          });

          toast.success("Hệ thống AI đã học xong khuôn mặt!");
        } catch (pythonErr) {
          console.error("Lỗi gọi Python từ FE:", pythonErr);
          toast.error(
            "AI không thể xử lý video, nhưng đã lưu trạng thái duyệt."
          );
        }
      } else {
        toast.success("Đã từ chối video");
      }

      // 4. Load lại danh sách
      fetchList(pagination.page);
    } catch (err) {
      toast.error("Thao tác thất bại, vui lòng thử lại");
    }
  };

  const onReject = (id) => {
    const reason = prompt("Nhập lý do từ chối video này:");
    if (reason) {
      handleAction(id, "reject", reason);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div
          className="stat-card"
          style={{ flex: 1, borderLeft: "4px solid #f59e0b" }}
        >
          <div className="stat-label">⏳ Chờ duyệt</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div
          className="stat-card"
          style={{ flex: 1, borderLeft: "4px solid #10b981" }}
        >
          <div className="stat-label">✓ Đã xác nhận</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {stats.confirm}
          </div>
        </div>
        <div
          className="stat-card"
          style={{ flex: 1, borderLeft: "4px solid #ef4444" }}
        >
          <div className="stat-label">✗ Đã từ chối</div>
          <div className="stat-value" style={{ color: "#ef4444" }}>
            {stats.reject}
          </div>
        </div>
      </div>

      <div className="card">
        <div
          className="card-header"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span className="card-title">
            📹 Danh sách Video xác thực khuôn mặt
          </span>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            Trang {pagination.page} / {pagination.totalPages}
          </span>
        </div>

        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Video xác thực</th>
                <th>Ngày tải lên</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 40 }}>
                    Đang nạp dữ liệu...
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      <code
                        style={{
                          background: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {s.studentCode}
                      </code>
                    </td>
                    <td>
                      {s.faceVideoUrl ? (
                        <video
                          src={s.faceVideoUrl}
                          style={{
                            width: 120,
                            height: 80,
                            borderRadius: 8,
                            background: "#000",
                            objectFit: "cover",
                          }}
                          controls
                        />
                      ) : (
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          Chưa có video
                        </div>
                      )}
                    </td>
                    <td style={{ color: "var(--text2)", fontSize: 13 }}>
                      {s.uploadedAt
                        ? new Date(s.uploadedAt).toLocaleString("vi-VN")
                        : "---"}
                    </td>
                    <td>
                      <StatusBadge status={s.faceStatus} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {s.faceStatus === "pending" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAction(s.id, "confirm")}
                            >
                              ✓ Duyệt
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onReject(s.id)}
                            >
                              ✗ Từ chối
                            </Button>
                          </>
                        )}
                        {s.faceStatus !== "pending" && (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            Đã xử lý
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            gap: 10,
          }}
        >
          <Button
            variant="ghost"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Quay lại
          </Button>
          <div
            style={{ display: "flex", alignItems: "center", fontWeight: 700 }}
          >
            {pagination.page}
          </div>
          <Button
            variant="ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Tiếp theo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FaceApprovalPage;
