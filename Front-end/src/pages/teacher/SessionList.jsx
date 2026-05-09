import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../utils/axios.customize";
import { toast } from "react-toastify";
import { Badge, Button, StatusBadge } from "../../helper/helper";

const SessionList = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [sectionDetail, setSectionDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const mockSessionData = {
        id: 1,
        name: "CV-HocSau-N01",
        subject: { code: "INT1411", name: "Thị giác máy tính & Học sâu" },
        sessions: [
            { id: 10, sessionDate: "2026-05-05", room: "V.A212", period: "1-4", present: 42, total: 45, status: "completed" },
            { id: 11, sessionDate: "2026-05-07", room: "V.B305", period: "1-3", present: 40, total: 45, status: "completed" },
            { id: 12, sessionDate: "2026-05-12", room: "V.A212", period: "1-4", present: 0, total: 45, status: "scheduled" },
        ]
    };

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const res = await instance.get(`/teacher/class-sections/${classId}/sessions`);
                if (res && res.data) {
                    setSectionDetail(res.data);
                } else {
                    setSectionDetail(mockSessionData);
                }
            } catch (error) {
                console.error("Lỗi fetch sessions:", error);
                toast.error("Không thể tải danh sách buổi học");
                setSectionDetail(mockSessionData);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [classId]);

    if (loading) return <div style={{ padding: 30 }}>Đang tải dữ liệu...</div>;
    if (!sectionDetail) return <div style={{ padding: 30 }}>Không tìm thấy dữ liệu lớp học phần.</div>;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div 
                    onClick={() => navigate(-1)} 
                    style={{ cursor: "pointer", color: "var(--primary)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                >
                    ← Quay lại danh sách lớp
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                            {sectionDetail.subject?.name}
                        </h2>
                        <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                            <Badge type="blue">{sectionDetail.subject?.code}</Badge>
                            <Badge type="gray">Lớp: {sectionDetail.name}</Badge>
                        </div>
                    </div>
                    {/* <Button variant="outline">📥 Xuất báo cáo (CSV)</Button> */}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">📅 Nhật ký điểm danh (Sessions)</span>
                </div>
                <div className="table-wrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--bg)" }}>
                                <th style={{ padding: "15px" }}>STT</th>
                                <th style={{ padding: "15px" }}>Ngày dạy</th>
                                <th style={{ padding: "15px" }}>Thông tin ca học</th>
                                <th style={{ padding: "15px" }}>Thống kê</th>
                                <th style={{ padding: "15px" }}>Trạng thái</th>
                                <th style={{ padding: "15px", textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectionDetail.sessions?.map((session, index) => (
                                <tr 
                                    key={session.id} 
                                    style={{ borderBottom: "1px solid var(--bg)", transition: "0.2s" }}
                                    className="table-row-hover"
                                >
                                    <td style={{ padding: "15px", fontWeight: 600, color: "var(--text3)" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "15px", fontWeight: 700 }}>
                                        {new Date(session.sessionDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ padding: "15px" }}>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>Phòng: {session.room}</div>
                                        <div style={{ fontSize: 12, color: "var(--text2)" }}>Tiết: {session.period}</div>
                                    </td>
                                    <td style={{ padding: "15px" }}>
                                        <div style={{ fontSize: 13 }}>
                                            {session.status === "completed" ? (
                                                <>
                                                    <b style={{ color: "var(--success)" }}>{session.present}</b>
                                                    <span style={{ color: "var(--text3)" }}> / {session.total} SV</span>
                                                </>
                                            ) : (
                                                <span style={{ color: "var(--text3)" }}>Chưa diễn ra</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "15px" }}>
                                        <StatusBadge 
                                            status={session.status === "completed" ? "present" : "upcoming"} 
                                        />
                                    </td>
                                    <td style={{ padding: "15px", textAlign: "right" }}>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => navigate(`/teacher/history/session-detail/${session.id}`)}
                                        >
                                            Chi tiết 🔍
                                        </Button>
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

export default SessionList;