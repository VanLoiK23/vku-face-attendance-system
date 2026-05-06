import { useState, useEffect, useRef } from "react";
import {Badge,Button,StatusBadge} from '../../helper/helper'

const FaceUpload = () => {
    const [uploaded, setUploaded] = useState(false);
    return (
      <div style={{ maxWidth: 600 }}>
        <div className="card mb-5">
          <div className="card-header"><span className="card-title">🤳 Upload ảnh khuôn mặt</span></div>
          <div className="card-body">
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--primary)" }}>📌 Lưu ý:</strong><br/>
              • Ảnh phải rõ mặt, không đeo kính, không che mặt<br/>
              • Ảnh chụp nơi đủ sáng, không bị mờ<br/>
              • Định dạng: JPG, PNG · Tối đa 5MB<br/>
              • Ảnh sẽ được admin duyệt trước khi sử dụng
            </div>
            {!uploaded ? (
              <div className="upload-zone" onClick={() => setUploaded(true)}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📸</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Kéo thả ảnh vào đây</div>
                <div style={{ color: "var(--text3)", fontSize: 13.5, marginBottom: 16 }}>hoặc nhấn để chọn ảnh từ máy tính</div>
                <Button variant="outline">Chọn ảnh</Button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ width: 120, height: 120, background: "var(--bg2)", borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, border: "3px solid var(--success)" }}>🧑</div>
                <div style={{ fontWeight: 700, color: "var(--success)", marginBottom: 8 }}>✅ Đã upload thành công!</div>
                <Badge type="yellow">⏳ Đang chờ admin duyệt</Badge>
                <div style={{ marginTop: 16 }}><Button variant="ghost" size="sm" onClick={() => setUploaded(false)}>Upload lại</Button></div>
              </div>
            )}
          </div>
        </div>
  
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Lịch sử upload</span></div>
          <div style={{ padding: 0 }}>
            {[{ date: "03/05/2026", status: "approved" }, { date: "01/03/2026", status: "rejected" }].map((u, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: "var(--bg2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🧑</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Ảnh khuôn mặt</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{u.date}</div>
                  </div>
                </div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  export default FaceUpload;