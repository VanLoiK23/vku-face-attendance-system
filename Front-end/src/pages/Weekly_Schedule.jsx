import React, { useEffect, useState } from "react";
import instance from "./../utils/axios.customize";

const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const mapDayLabel = {
  T2: "HAI",
  T3: "BA",
  T4: "TƯ",
  T5: "NĂM",
  T6: "SÁU",
  T7: "BẢY",
  CN: "CN",
};

const periods = Array.from({ length: 10 }, (_, i) => i + 1);

// ==========================================
// COLORS
// ==========================================
const colors = [
  "#355E3B",
  "#5A3E36",
  "#2E4A62",
  "#5B5F2F",
  "#3F4E4F",
  "#4E3B63",
];

const getSubjectColor = (subjectName = "") => {
  let hash = 0;

  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// ==========================================
// GET CURRENT WEEK
// ==========================================
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

// ==========================================
// GET WEEK DATES
// ==========================================
const getWeekDates = (semesterStartDate, currentWeek) => {
  if (!semesterStartDate) {
    return {};
  }

  const start = new Date(`${semesterStartDate}T00:00:00`);

  start.setHours(0, 0, 0, 0);

  // move to current week
  start.setDate(start.getDate() + (currentWeek - 1) * 7);

  const result = {};

  days.forEach((day, index) => {
    const d = new Date(start);

    d.setDate(start.getDate() + index);

    result[day] = d;
  });

  return result;
};

// ==========================================
// FORMAT DATE
// ==========================================
const formatDate = (date) => {
  if (!date) return "";

  const dd = String(date.getDate()).padStart(2, "0");

  const mm = String(date.getMonth() + 1).padStart(2, "0");

  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

// ==========================================
// CHECK TODAY
// ==========================================
const isToday = (date) => {
  if (!date) return false;

  const today = new Date();

  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
};

// ==========================================
// UI SIZE
// ==========================================
const CELL_HEIGHT = 74;
const HEADER_HEIGHT = 78;
const LEFT_WIDTH = 90;
const DAY_WIDTH = 185;

// ==========================================
// COMPONENT
// ==========================================
const WeekSchedule = () => {
  const [weekData, setWeekData] = useState({
    T2: [],
    T3: [],
    T4: [],
    T5: [],
    T6: [],
    T7: [],
    CN: [],
  });

  const [loading, setLoading] = useState(true);

  // 🔥 mặc định chưa biết tuần => null
  const [currentWeek, setCurrentWeek] = useState(null);

  const [semesterStartDate, setSemesterStartDate] = useState(null);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const weekDatesMap = getWeekDates(semesterStartDate, currentWeek || 1);

  // ==========================================
  // FETCH
  // ==========================================
  const fetchWeekSchedule = async () => {
    try {
      setLoading(true);

      const weekQuery = currentWeek ? `?week=${currentWeek}` : "";

      const res = await instance.get(`/schedule/week${weekQuery}`);

      const data = res.data?.data;

      setSemesterStartDate(data?.semesterStartDate);

      const year = new Date(data?.semesterStartDate).getFullYear();

      setCurrentYear(year);

      // 🔥 lần đầu refresh sẽ tự nhảy tuần hiện tại
      if (currentWeek === null && data?.semesterStartDate) {
        const realWeek = getCurrentWeek(data.semesterStartDate);

        setCurrentWeek(realWeek);

        return;
      }

      setWeekData(
        data?.schedule || {
          T2: [],
          T3: [],
          T4: [],
          T5: [],
          T6: [],
          T7: [],
          CN: [],
        },
      );
    } catch (error) {
      console.error(error);

      setWeekData({
        T2: [],
        T3: [],
        T4: [],
        T5: [],
        T6: [],
        T7: [],
        CN: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // AUTO FETCH
  // ==========================================
  useEffect(() => {
    fetchWeekSchedule();
  }, [currentWeek]);

  // ==========================================
  // CHANGE WEEK
  // ==========================================
  const handlePrevWeek = () => {
    if (currentWeek <= 1) return;

    setCurrentWeek((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    if (currentWeek >= 60) return;

    setCurrentWeek((prev) => prev + 1);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading || currentWeek === null) {
    return (
      <div
        style={{
          padding: 20,
          textAlign: "center",
        }}
      >
        Đang tải thời khóa biểu...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        background: "#fff",
      }}
    >
      {/* NAV */}
      <div
        style={{
          background: "#eef6ea",
          borderRadius: 6,
          padding: 16,
          marginBottom: 18,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          fontWeight: 600,
        }}
      >
        <span
          onClick={handlePrevWeek}
          style={{
            cursor: "pointer",
            color: "#718096",
          }}
        >
          « Tuần {currentWeek - 1}
        </span>

        <span
          style={{
            color: "#2f855a",
            fontWeight: 800,
            fontSize: 28,
          }}
        >
          TUẦN THỨ {currentWeek} ({currentYear})
        </span>

        <span
          onClick={handleNextWeek}
          style={{
            cursor: "pointer",
            color: "#718096",
          }}
        >
          Tuần {currentWeek + 1} »
        </span>
      </div>

      {/* TABLE */}
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `${LEFT_WIDTH}px repeat(7, ${DAY_WIDTH}px)`,
          }}
        >
          {/* HEADER LEFT */}
          <div
            style={{
              height: HEADER_HEIGHT,
              borderBottom: "1px solid #ddd",
            }}
          />

          {/* HEADER DAYS */}
          {days.map((day) => {
            const date = weekDatesMap[day];

            const today = isToday(date);

            return (
              <div
                key={day}
                style={{
                  height: HEADER_HEIGHT,
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  background: today ? "#fff8d6" : "#fff",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: today ? "#c27803" : "#64748b",
                  }}
                >
                  {mapDayLabel[day]}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontWeight: 700,
                    color: today ? "#c27803" : "#64748b",
                  }}
                >
                  {formatDate(date)}
                </div>
              </div>
            );
          })}

          {/* BODY */}
          {periods.map((period) => (
            <React.Fragment key={period}>
              {/* PERIOD */}
              <div
                style={{
                  height: CELL_HEIGHT,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontWeight: 700,
                  background: "#fff",
                }}
              >
                TIẾT {period}
              </div>

              {/* CELLS */}
              {days.map((day) => {
                const today = isToday(weekDatesMap[day]);

                return (
                  <div
                    key={`${day}-${period}`}
                    style={{
                      height: CELL_HEIGHT,
                      borderBottom: "1px solid #e5e7eb",
                      borderRight: "1px solid #f1f5f9",
                      background: today ? "#fffef2" : "#fff",
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}

          {/* SUBJECTS */}
          {days.map((day, dayIndex) =>
            weekData[day]?.map((subject) => {
              const top =
                HEADER_HEIGHT + (subject.startPeriod - 1) * CELL_HEIGHT;

              const left = LEFT_WIDTH + dayIndex * DAY_WIDTH;

              const height =
                (subject.endPeriod - subject.startPeriod + 1) * CELL_HEIGHT;

              return (
                <div
                  key={`${day}-${subject.id}`}
                  style={{
                    position: "absolute",
                    top: top + 2,
                    left: left + 2,
                    width: DAY_WIDTH - 4,
                    height: height - 4,
                    background: getSubjectColor(subject.subject),
                    color: "#fff",
                    borderRadius: 4,
                    padding: 14,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      lineHeight: 1.4,
                      marginBottom: 12,
                    }}
                  >
                    {subject.subject}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {subject.room}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.95,
                    }}
                  >
                    Tiết {subject.startPeriod} - {subject.endPeriod}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekSchedule;
