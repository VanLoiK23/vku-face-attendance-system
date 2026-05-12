import React, { useEffect, useState, useMemo } from "react";
import instance from "./../utils/axios.customize";

const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const mapDayLabel = { T2: "HAI", T3: "BA", T4: "TƯ", T5: "NĂM", T6: "SÁU", T7: "BẢY", CN: "CN" };
const periods = Array.from({ length: 10 }, (_, i) => i + 1);

const colors = ["#355E3B", "#5A3E36", "#2E4A62", "#5B5F2F", "#3F4E4F", "#4E3B63"];

const getSubjectColor = (subjectName = "") => {
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getCurrentWeek = (semesterStartDate) => {
  if (!semesterStartDate) return 1;
  const start = new Date(`${semesterStartDate}T00:00:00`);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
};

const getWeekDates = (semesterStartDate, currentWeek) => {
  if (!semesterStartDate) return {};
  const start = new Date(`${semesterStartDate}T00:00:00`);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + (currentWeek - 1) * 7);
  const result = {};
  days.forEach((day, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    result[day] = d;
  });
  return result;
};

const formatDate = (date) => {
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
};

const CELL_HEIGHT = 74;
const HEADER_HEIGHT = 78;
const LEFT_WIDTH = 90;
const DAY_WIDTH = 185;

const WeekSchedule = () => {
  const [weekData, setWeekData] = useState({ T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CN: [] });
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [semesterStartDate, setSemesterStartDate] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const weekDatesMap = getWeekDates(semesterStartDate, currentWeek || 1);

  const fetchWeekSchedule = async () => {
    try {
      setLoading(true);
      const weekQuery = currentWeek ? `?week=${currentWeek}` : "";
      const res = await instance.get(`/schedule/week${weekQuery}`);
      const data = res.data?.data;
      setSemesterStartDate(data?.semesterStartDate);
      setCurrentYear(new Date(data?.semesterStartDate).getFullYear());

      if (currentWeek === null && data?.semesterStartDate) {
        setCurrentWeek(getCurrentWeek(data.semesterStartDate));
        return;
      }

      setWeekData(data?.schedule || { T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CN: [] });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeekSchedule(); }, [currentWeek]);

  // 🔥 LOGIC TÌM MÔN TRÙNG LỊCH (CHỈ LẤY TRÙNG THÔI)
  const conflicts = useMemo(() => {
    const list = [];
    days.forEach((day) => {
      const dailySchedules = weekData[day] || [];
      for (let i = 0; i < dailySchedules.length; i++) {
        for (let j = i + 1; j < dailySchedules.length; j++) {
          const s1 = dailySchedules[i];
          const s2 = dailySchedules[j];
          // Giao thoa tiết học
          const isOverlap = s1.startPeriod <= s2.endPeriod && s2.startPeriod <= s1.endPeriod;
          if (isOverlap) {
            if (!list.find(x => x.id === s1.id)) list.push({ ...s1, dayLabel: mapDayLabel[day] });
            if (!list.find(x => x.id === s2.id)) list.push({ ...s2, dayLabel: mapDayLabel[day] });
          }
        }
      }
    });
    return list;
  }, [weekData]);

  if (loading || currentWeek === null) return <div style={{ padding: 20, textAlign: "center" }}>Đang tải...</div>;

  return (
    <div style={{ padding: 20, background: "#fff" }}>
      {/* 1. KHU VỰC BÁO MÔN HỌC BỊ TRÙNG LỊCH (THEO ẢNH CỦA LỢI) */}
      {conflicts.length > 0 && (
        <div style={{ marginBottom: 30, paddingLeft: 10 }}>
          <h2 style={{ 
            fontSize: 26, 
            color: "#53799d", 
            fontWeight: 400, 
            marginBottom: 15,
            fontFamily: "sans-serif"
          }}>
            Môn học bị trùng lịch
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {conflicts.map((c, idx) => (
              <li key={idx} style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 10, 
                marginBottom: 12,
                fontSize: 16,
                color: "#4a5568"
              }}>
                <span style={{ fontSize: 20, color: "#718096" }}>•</span>
                <div>
                   <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* ICON NGÔI SAO NHẤP NHÁY MÀU ĐỎ */}
                      <span style={{ 
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "url('https://upload.wikimedia.org/wikipedia/commons/4/40/M_star.png') no-repeat center",
                        backgroundSize: "contain",
                        width: 45,
                        height: 25,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        paddingTop: 2
                      }}>
                        mới
                      </span>
                      <span style={{ color: "#3182ce", fontWeight: 500 }}>TRÙNG LỊCH</span>
                   </div>
                   <div style={{ marginTop: 2, fontSize: 16 }}>
                      {c.subject} - tiết {c.startPeriod}→{c.endPeriod} Thứ {c.dayLabel} - {c.room}
                   </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NAV (Giữ nguyên) */}
      <div style={{ background: "#eef6ea", borderRadius: 6, padding: 16, marginBottom: 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, fontWeight: 600 }}>
        <span onClick={() => currentWeek > 1 && setCurrentWeek(c => c - 1)} style={{ cursor: "pointer", color: "#718096" }}>« Tuần {currentWeek - 1}</span>
        <span style={{ color: "#2f855a", fontWeight: 800, fontSize: 28 }}>TUẦN THỨ {currentWeek} ({currentYear})</span>
        <span onClick={() => setCurrentWeek(c => c + 1)} style={{ cursor: "pointer", color: "#718096" }}>Tuần {currentWeek + 1} »</span>
      </div>

      {/* TABLE (Giữ nguyên) */}
      <div style={{ overflowX: "auto", background: "#fff" }}>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: `${LEFT_WIDTH}px repeat(7, ${DAY_WIDTH}px)` }}>
          {/* HEADER LEFT */}
          <div style={{ height: HEADER_HEIGHT, borderBottom: "1px solid #ddd" }} />

          {/* HEADER DAYS */}
          {days.map((day) => {
            const date = weekDatesMap[day];
            const today = isToday(date);
            return (
              <div key={day} style={{ height: HEADER_HEIGHT, borderBottom: "1px solid #ddd", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: today ? "#fff8d6" : "#fff" }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: today ? "#c27803" : "#64748b" }}>{mapDayLabel[day]}</div>
                <div style={{ marginTop: 6, fontWeight: 700, color: today ? "#c27803" : "#64748b" }}>{formatDate(date)}</div>
              </div>
            );
          })}

          {/* BODY */}
          {periods.map((period) => (
            <React.Fragment key={period}>
              <div style={{ height: CELL_HEIGHT, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 700, background: "#fff" }}>TIẾT {period}</div>
              {days.map((day) => (
                <div key={`${day}-${period}`} style={{ height: CELL_HEIGHT, borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f1f5f9", background: isToday(weekDatesMap[day]) ? "#fffef2" : "#fff" }} />
              ))}
            </React.Fragment>
          ))}

          {/* SUBJECT BLOCKS */}
          {days.map((day, dIdx) => 
            weekData[day]?.map((subject) => {
              const top = HEADER_HEIGHT + (subject.startPeriod - 1) * CELL_HEIGHT;
              const left = LEFT_WIDTH + dIdx * DAY_WIDTH;
              const height = (subject.endPeriod - subject.startPeriod + 1) * CELL_HEIGHT;
              
              // 🔥 Kiểm tra xem môn này có nằm trong danh sách trùng không
              const isOverlap = conflicts.some(c => c.id === subject.id);

              return (
                <div key={subject.id} style={{
                  position: "absolute", top: top + 2, left: left + 2, width: DAY_WIDTH - 4, height: height - 4,
                  background: isOverlap ? "#b91c1c" : getSubjectColor(subject.subject), // Nếu trùng thì hiện màu đỏ đô
                  color: "#fff", borderRadius: 4, padding: 14, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: isOverlap ? 10 : 1
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.4, marginBottom: 12 }}>{subject.subject}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{subject.room}</div>
                  <div style={{ fontSize: 12, opacity: 0.95 }}>Tiết {subject.startPeriod} - {subject.endPeriod}</div>
                  {isOverlap && <div style={{ fontSize: 10, fontWeight: 900, marginTop: 5, background: "yellow", color: "red", padding: "2px 4px", borderRadius: 2 }}>TRÙNG LỊCH</div>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekSchedule;