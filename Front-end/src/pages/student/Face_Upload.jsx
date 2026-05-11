import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import instance from "../../utils/axios.customize";

const FaceUpload = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // old video
  const [oldVideo, setOldVideo] = useState(null);

  // =========================
  // FETCH OLD VIDEO
  // =========================
  const fetchOldVideo = async () => {
    try {
      const res = await instance.get("/student/face-video");

      setOldVideo(res?.data?.data || null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOldVideo();
  }, []);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    let interval = null;

    if (capturing) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 14) {
            handleStopCaptureClick();
            return 15;
          }

          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [capturing]);

  // =========================
  // HANDLE DATA
  // =========================
  const handleDataAvailable = useCallback(({ data }) => {
    if (data && data.size > 0) {
      setRecordedChunks((prev) => [...prev, data]);
    }
  }, []);

  // =========================
  // START RECORD
  // =========================
  const handleStartCaptureClick = useCallback(() => {
    try {
      setRecordedChunks([]);
      setSeconds(0);
      setVideoUrl(null);
      setVideoFile(null);

      const stream = webcamRef.current?.stream;

      if (!stream) {
        toast.error("Không thể truy cập camera");
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", handleDataAvailable);

      mediaRecorder.start(1000);

      setCapturing(true);
    } catch (error) {
      console.error(error);
      toast.error("Không thể bắt đầu quay video");
    }
  }, [handleDataAvailable]);

  // =========================
  // STOP RECORD
  // =========================
  const handleStopCaptureClick = useCallback(() => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      setCapturing(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi dừng quay video");
    }
  }, []);

  // =========================
  // CREATE VIDEO FILE
  // =========================
  useEffect(() => {
    if (!capturing && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      const file = new File([blob], `face-video-${Date.now()}.webm`, {
        type: "video/webm",
      });

      // validate size
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video phải nhỏ hơn 100MB");
        return;
      }

      // validate duration
      if (seconds > 15) {
        toast.error("Video không được vượt quá 15 giây");
        return;
      }

      const localUrl = URL.createObjectURL(blob);

      setVideoUrl(localUrl);
      setVideoFile(file);
    }
  }, [capturing, recordedChunks, seconds]);

  // =========================
  // RETAKE
  // =========================
  const handleRetake = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    setVideoUrl(null);
    setVideoFile(null);
    setRecordedChunks([]);
    setSeconds(0);
  };

  // =========================
  // SUBMIT VIDEO
  // =========================
  const handleSubmit = async () => {
    try {
      if (!videoFile) {
        toast.error("Vui lòng quay video trước");
        return;
      }

      setIsUploading(true);

      const formData = new FormData();

      formData.append("video", videoFile);

      const res = await instance.post("/upload-video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.data?.message || "Upload video thành công");

      handleRetake();

      // reload old video
      fetchOldVideo();
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Upload video thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");

    const s = (sec % 60).toString().padStart(2, "0");

    return `${m}:${s}`;
  };

  return (
    <>
      <style>{`
        .modern-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: none;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .webcam-container {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          aspect-ratio: 16/9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .webcam-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recording-border {
          position: absolute;
          inset: 0;
          border: 4px solid #ef4444;
          border-radius: 16px;
          pointer-events: none;
          animation: pulse-border 1.5s infinite;
        }

        @keyframes pulse-border {
          0% {
            box-shadow:
              0 0 0 0 rgba(239, 68, 68, 0.4) inset,
              0 0 0 0 rgba(239, 68, 68, 0.4);
          }

          70% {
            box-shadow:
              0 0 0 10px rgba(239, 68, 68, 0) inset,
              0 0 0 15px rgba(239, 68, 68, 0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(239, 68, 68, 0) inset,
              0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        .status-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
        }

        .timer-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          color: white;
          z-index: 10;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
          color: white;
        }

        .btn-danger-custom {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-danger-custom:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .btn-outline-custom {
          border: 2px solid #e5e7eb;
          color: #4b5563;
          background: transparent;
          border-radius: 12px;
          padding: 10px 24px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-outline-custom:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{ maxWidth: 650, margin: "0 auto" }}>
        {/* Upload Card */}
        <div className="card modern-card mb-4 fade-in">
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              🎥 Quay video khuôn mặt
            </h5>
          </div>

          <div className="card-body p-4">
            <div
              className="alert border-0 mb-4"
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                fontSize: 14,
                color: "#475569",
              }}
            >
              <strong style={{ color: "#6366f1" }}>📌 Yêu cầu:</strong>
              <br />
              • Quay rõ khuôn mặt, ánh sáng tốt.
              <br />
              • Video tối đa 15 giây.
              <br />• Dung lượng dưới 20MB.
            </div>

            <div className="webcam-container mb-4 shadow-sm">
              <div className="status-badge">
                <span style={{ fontSize: 10 }}>{capturing ? "🟢" : "🔴"}</span>

                {capturing ? "Đang quay" : "Chưa quay"}
              </div>

              <div className="timer-badge">⏱ {formatTime(seconds)} / 00:15</div>

              {!videoUrl ? (
                <>
                  <Webcam
                    audio={true}
                    ref={webcamRef}
                    mirrored={true}
                    className="webcam-preview"
                    videoConstraints={{
                      facingMode: "user",
                    }}
                  />

                  {capturing && <div className="recording-border"></div>}
                </>
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="webcam-preview fade-in"
                />
              )}
            </div>

            <div className="d-flex justify-content-center gap-3">
              {!videoUrl ? (
                capturing ? (
                  <button
                    className="btn btn-danger-custom w-100"
                    onClick={handleStopCaptureClick}
                    disabled={isUploading}
                  >
                    ⏹ Dừng quay
                  </button>
                ) : (
                  <button
                    className="btn btn-gradient w-100"
                    onClick={handleStartCaptureClick}
                    disabled={isUploading}
                  >
                    ▶️ Bắt đầu quay
                  </button>
                )
              ) : (
                <>
                  <button
                    className="btn btn-outline-custom w-50"
                    onClick={handleRetake}
                    disabled={isUploading}
                  >
                    🔄 Quay lại
                  </button>

                  <button
                    className="btn btn-gradient w-50 d-flex justify-content-center align-items-center gap-2"
                    onClick={handleSubmit}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Đang gửi...
                      </>
                    ) : (
                      "🚀 Gửi Video"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Old Video */}
        <div className="card modern-card fade-in">
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold mb-0">📁 Video đã upload</h5>
          </div>

          <div className="card-body p-4">
            {!oldVideo?.faceVideoUrl ? (
              <div className="alert alert-light border text-center mb-0">
                Chưa có video nào được upload
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>Ngày upload</th>
                      <th>Trạng thái</th>
                      <th>Video</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="fw-semibold">{oldVideo?.name}</td>

                      <td>
                        {oldVideo?.uploadedAt
                          ? new Date(oldVideo.uploadedAt).toLocaleString(
                              "vi-VN",
                            )
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            oldVideo?.faceStatus === "confirm"
                              ? "bg-success"
                              : oldVideo?.faceStatus === "reject"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {oldVideo?.faceStatus}
                        </span>
                      </td>

                      <td>
                        <a
                          href={oldVideo?.faceVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          ▶ Xem video
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FaceUpload;
