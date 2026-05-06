import {Button} from '../../helper/helper'


const SchedulePage = () => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7"];
    const periods = [{ id: "1-3", label: "Tiết 1-3\n07:00-09:30" }, { id: "4-6", label: "Tiết 4-6\n09:45-12:15" }, { id: "7-9", label: "Tiết 7-9\n13:00-15:30" }];
    const colors = ["", "accent", "", "accent", "", "accent"];

    const mockClasses = [
      { id: 1, name: "21SE1", course: "Lập trình Web", teacher: "TS. Trần Thị Lan", students: 32, room: "P201", schedule: "T2,T4 - Tiết 1-3" },
      { id: 2, name: "21SE2", course: "Cơ sở dữ liệu", teacher: "ThS. Nguyễn Văn Bình", students: 28, room: "P301", schedule: "T3,T5 - Tiết 4-6" },
      { id: 3, name: "22IT1", course: "Lập trình Python", teacher: "TS. Trần Thị Lan", students: 35, room: "P202", schedule: "T2,T6 - Tiết 4-6" },
      { id: 4, name: "22IT2", course: "Mạng máy tính", teacher: "PGS. Lê Thị Cúc", students: 30, room: "P401", schedule: "T4,T6 - Tiết 1-3" },
    ];

    const mockWeekSchedule = {
      "T2": [
        { period: "1-3", subject: "Lập trình Web", class: "21SE1", room: "P201" },
        { period: "4-6", subject: "Lập trình Python", class: "22IT1", room: "P202" },
      ],
      "T3": [
        { period: "4-6", subject: "Cơ sở dữ liệu", class: "21SE2", room: "P301" },
      ],
      "T4": [
        { period: "1-3", subject: "Lập trình Web", class: "21SE1", room: "P201" },
      ],
      "T5": [
        { period: "4-6", subject: "Cơ sở dữ liệu", class: "21SE2", room: "P301" },
      ],
      "T6": [
        { period: "4-6", subject: "Lập trình Python", class: "22IT1", room: "P202" },
      ],
      "T7": [],
    };

    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <select className="form-input form-select" style={{ width: 180 }}><option>Tuần 18 (01/05 - 07/05)</option><option>Tuần 19</option></select>
          <select className="form-input form-select" style={{ width: 160 }}><option>Tất cả lớp</option>{mockClasses.map(c => <option key={c.id}>{c.name}</option>)}</select>
          <Button>+ Thêm lịch học</Button>
        </div>
        <div className="card">
          <div className="week-grid">
            <div className="week-header" style={{ background: "var(--primary-dark)" }}>Tiết</div>
            {days.map(d => <div key={d} className="week-header">{d}</div>)}
            {periods.map((p, pi) => (
              <>
                <div key={`p-${pi}`} className="week-period-label">{p.label.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
                {days.map((d, di) => {
                  const lessons = (mockWeekSchedule[d] || []).filter(l => l.period === p.id);
                  return (
                    <div key={`${d}-${pi}`} className="week-cell">
                      {lessons.map((l, i) => (
                        <div key={i} className={`week-lesson ${colors[di]}`} style={{ marginBottom: 4 }}>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{l.subject}</div>
                          <div style={{ fontSize: 11, opacity: 0.85 }}>{l.class} · {l.room}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default SchedulePage;