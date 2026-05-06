import {Button,StatusBadge} from '../../helper/helper'
import { useState, useEffect, useRef } from "react";


const FaceApprovalPage = () => {

  const mockPendingFaces = [
    { id: 1, studentName: "Phạm Văn Đức", studentId: "21IT003", uploadDate: "03/05/2026", status: "pending" },
    { id: 2, studentName: "Lý Thị Bình", studentId: "21IT010", uploadDate: "04/05/2026", status: "pending" },
  ];

    const [list, setList] = useState(mockPendingFaces);
    return (
      <div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div className="stat-card" style={{ flex: 1 }}><div className="stat-label">⏳ Chờ duyệt</div><div className="stat-value">{list.filter(f => f.status === "pending").length}</div></div>
          <div className="stat-card" style={{ flex: 1 }}><div className="stat-label">✓ Đã duyệt</div><div className="stat-value" style={{ color: "var(--success)" }}>12</div></div>
          <div className="stat-card" style={{ flex: 1 }}><div className="stat-label">✗ Từ chối</div><div className="stat-value" style={{ color: "var(--danger)" }}>3</div></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">🤖 Danh sách ảnh chờ duyệt</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sinh viên</th><th>Mã SV</th><th>Ngày upload</th><th>Ảnh mô phỏng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {list.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.studentName}</td>
                    <td><code style={{ background: "var(--bg)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{f.studentId}</code></td>
                    <td style={{ color: "var(--text2)" }}>{f.uploadDate}</td>
                    <td>
                      <div style={{ width: 60, height: 60, background: "var(--bg2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🧑</div>
                    </td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button variant="success" size="sm" onClick={() => setList(l => l.map(x => x.id === f.id ? {...x, status: "approved"} : x))}>✓ Duyệt</Button>
                        <Button variant="danger" size="sm" onClick={() => setList(l => l.map(x => x.id === f.id ? {...x, status: "rejected"} : x))}>✗ Từ chối</Button>
                      </div>
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

  export default FaceApprovalPage;