import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
import instance from "../../utils/axios.customize";
import { Button, Avatar, Badge } from "../../helper/helper";
import { toast } from "react-toastify";

const AttendancePage = () => {
  const { scheduleId } = useParams();

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // chống request chồng nhau
  const isDetecting = useRef(false);

  // smoothing label
  const predictionHistory = useRef([]);

  // smoothing bounding box
  const stableDetections = useRef([]);

  // xác nhận nhiều frame mới checkin
  const confirmCounter = useRef({});

  const [sessionInfo, setSessionInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [detectedList, setDetectedList] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await instance.get(
          `/teacher/schedules/${scheduleId}/details`
        );

        if (res.data) {
          setSessionInfo(res.data.session);
          setStudents(res.data.students);
          setCurrentSession(res.data.session.sessionId);

          if (res.data.alreadyCheckedIn) {
            setDetectedList(res.data.alreadyCheckedIn);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSession();
  }, [scheduleId]);

  // DRAW BOXES
  const drawBoundingBoxes = (detections) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video; // Lấy thẻ video thật
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");

    // Tính toán tỉ lệ Scale để khung khớp với video thực tế
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const scaleX = displayWidth / 640;
    const scaleY = displayHeight / 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      // Nhân tỉ lệ scale vào tọa độ
      const [rawX, rawY, rawW, rawH] = det.box;
      const x = rawX * scaleX;
      const y = rawY * scaleY;
      const w = rawW * scaleX;
      const h = rawH * scaleY;

      const student = students.find((s) => String(s.id) === String(det.label));

      let displayName = "Không xác định";
      let boxColor = "#ef4444";

      if (det.label === "UNKNOWN") {
        displayName = "Người lạ";
      } else if (det.label === "UNCERTAIN") {
        displayName = "Không rõ nét";
        boxColor = "#f59e0b";
      } else if (student) {
        displayName = student.name;
        boxColor = "#10b981";
      }

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.font = "bold 14px Inter";
      const text = `${displayName} ${(det.score * 100).toFixed(1)}%`;
      const textWidth = ctx.measureText(text).width;

      ctx.fillStyle = boxColor;
      ctx.fillRect(x, y - 28, textWidth + 12, 28);

      ctx.fillStyle = "#fff";
      ctx.fillText(text, x + 6, y - 9);
    });
  };

  // CHECKIN
  const handleAttendanceUpdate = async (detections) => {
    // Lấy danh sách ID xuất hiện trong frame này
    const presentInFrame = detections.map((d) => String(d.label));

    // Reset những ID không xuất hiện (để tránh cộng dồn sai)
    Object.keys(confirmCounter.current).forEach((id) => {
      if (!presentInFrame.includes(id)) {
        confirmCounter.current[id] = 0;
      }
    });

    for (const det of detections) {
      if (det.label === "UNKNOWN" || det.label === "UNCERTAIN") continue;
      if (det.score < 0.62) continue;

      confirmCounter.current[det.label] =
        (confirmCounter.current[det.label] || 0) + 1;

      // 3 frame liên tiếp"
      if (confirmCounter.current[det.label] < 3) continue;

      const isAlreadyInList = detectedList.some(
        (s) => String(s.id) === String(det.label)
      );
      if (isAlreadyInList) continue;

      try {
        if (!currentSession) return;

        await instance.post(`/teacher/attendance/checkin`, {
          scheduleId,
          sessionId: currentSession,
          studentId: det.label,
          similarity: det.score,
        });

        const student = students.find(
          (s) => String(s.id) === String(det.label)
        );
        if (student) {
          setDetectedList((prev) => {
            const exists = prev.find(
              (item) => String(item.id) === String(student.id)
            );
            if (exists) return prev; // Nếu đã có trong list thì không thêm nữa
            return [...prev, { ...student, conf: det.score * 100 }];
          });
          toast.success(`✅ Điểm danh: ${student.name}`);
        }
      } catch (err) {
        console.error("Checkin Error", err);
      }
    }
  };

  // MANUAL ATTENDANCE
  const handleManualAttendance = async (student) => {
    // Kiểm tra xem đã có trong list chưa trước khi bấm
    if (detectedList.some((s) => String(s.id) === String(student.id))) return;

    try {
      await instance.post(`/teacher/attendance/checkin`, {
        scheduleId,
        sessionId: currentSession,
        studentId: student.id,
        similarity: 1.0,
      });

      setDetectedList((prev) => [...prev, { ...student, conf: 100 }]);
      toast.success(`Đã xác nhận tay: ${student.name}`);
    } catch (err) {
      toast.error("Lỗi điểm danh tay!");
    }
  };

  // DETECT
  const captureAndDetect = async () => {
    // chống request overlap
    if (isDetecting.current) return;

    if (!isActive || !webcamRef.current) return;

    isDetecting.current = true;

    try {
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        isDetecting.current = false;
        return;
      }

      const response = await fetch(
        "http://localhost:8000/api/detect-realtime",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageSrc,
            schedule_id: scheduleId,
          }),
        }
      );

      const result = await response.json();

      // NO DETECTION
      // if (!result.detections || result.detections.length === 0) {
      //   drawBoundingBoxes([]);
      //   return;
      // }
      if (!result.detections || result.detections.length === 0) {
        predictionHistory.current = []; // Xóa lịch sử tên
        stableDetections.current = [];  // Xóa lịch sử khung hình
        confirmCounter.current = {};    // Reset bộ đếm xác nhận
        drawBoundingBoxes([]);
        return;
      }

      // lấy detection đầu tiên
      const det = result.detections[0];

      // REJECT FACE TOO SMALL

      const [x, y, w, h] = det.box;

      if (w < 50 || h < 50) {
        return;
      }

      // KIỂM TRA ĐỘ LỆCH VỊ TRÍ (Spatial Consistency)
      // Nếu mặt mới xuất hiện cách mặt cũ hơn 100px -> Coi như người mới hoàn toàn
      if (stableDetections.current.length > 0) {
        const lastDet = stableDetections.current[stableDetections.current.length - 1];
        const dist = Math.sqrt(Math.pow(x - lastDet.box[0], 2) + Math.pow(y - lastDet.box[1], 2));
        
        if (dist > 100) { 
          predictionHistory.current = []; // Reset để người mới không bị dính tên người cũ
          stableDetections.current = [];
        }
      }

      // LABEL SMOOTHING

      predictionHistory.current.push(det.label);

      if (predictionHistory.current.length > 10) {
        predictionHistory.current.shift();
      }

      const counts = {};

      predictionHistory.current.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });

      const stableLabel = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );

      det.label = stableLabel;

      // BOUNDING BOX SMOOTHING

      stableDetections.current.push(det);

      if (stableDetections.current.length > 5) {
        stableDetections.current.shift();
      }

      let avgX = 0;
      let avgY = 0;
      let avgW = 0;
      let avgH = 0;

      stableDetections.current.forEach((d) => {
        avgX += d.box[0];
        avgY += d.box[1];
        avgW += d.box[2];
        avgH += d.box[3];
      });

      const len = stableDetections.current.length;

      det.box = [avgX / len, avgY / len, avgW / len, avgH / len];

      // DRAW
      drawBoundingBoxes([det]);

      // CHECKIN
      handleAttendanceUpdate([det]);
    } catch (err) {
      console.error("AI Detect Error", err);
    } finally {
      isDetecting.current = false;
    }
  };

  // LOOP DETECT
  useEffect(() => {
    let interval;

    if (isActive) {
      interval = setInterval(captureAndDetect, 1200);
    } else {
      // Clean box
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    return () => clearInterval(interval);
  }, [isActive, students]);

  return (
    <div className="attendance-container">
      <div
        className="card mb-4"
        style={{
          padding: "14px 20px",
          display: "flex",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>BUỔI HỌC</div>

          <div style={{ fontWeight: 700 }}>
            {sessionInfo?.subjectName} - {sessionInfo?.className}
          </div>
        </div>

        <div style={{ width: 1, background: "var(--border)" }} />

        <div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>PHÒNG</div>

          <div style={{ fontWeight: 700 }}>{sessionInfo?.room}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* CAMERA */}
        <div className="camera-section">
          <div
            className="camera-box"
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#000",
            }}
          >
            {/* UPDATED WEBCAM */}
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
                frameRate: 15,
              }}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />

            {/* CANVAS */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />

            {/* SCAN EFFECT */}
            {isActive && <div className="scan-line" />}
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 12,
            }}
          >
            <Button
              variant={isActive ? "danger" : "accent"}
              className="w-full"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "⏹ Dừng nhận dạng" : "▶ Bắt đầu điểm danh AI"}
            </Button>
          </div>
        </div>

        {/* STATUS */}
        <div
          className="status-section"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            height: "550px",
          }}
        >
          {/* ĐÃ CÓ MẶT */}
          <div
            className="card"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                padding: "16px",
                background: "#f0fdf4",
                borderBottom: "1px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 800, color: "#166534" }}>
                ✅ ĐÃ CÓ MẶT
              </span>
              <Badge type="green">
                {detectedList.length} / {students.length}
              </Badge>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {detectedList.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px",
                    borderRadius: 12,
                    background: "#fff",
                    border: "1px solid #f3f4f6",
                    marginBottom: 8,
                  }}
                >
                  <Avatar initials={s.name.split(" ").slice(-1)[0]} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {s.studentCode}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}
                  >
                    {s.conf?.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHƯA THẤY MẶT */}
          <div
            className="card"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                padding: "16px",
                background: "#fef2f2",
                borderBottom: "1px solid #fecaca",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 800, color: "#991b1b" }}>
                ❌ CHƯA THẤY MẶT
              </span>
              <Badge type="red">{students.length - detectedList.length}</Badge>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {students
                .filter(
                  (s) =>
                    !detectedList.some((d) => String(d.id) === String(s.id))
                )
                .map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px",
                      borderRadius: 12,
                      border: "1px solid #f3f4f6",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {s.studentCode}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={() => handleManualAttendance(s)}
                    >
                      Điểm danh tay
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
