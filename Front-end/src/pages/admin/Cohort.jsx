import { useState, useEffect, useCallback, useRef } from "react";
import instance from "../../utils/axios.customize";
import "../../styles/cohort.css";

const api = {
  getCohorts: () => instance.get("/cohorts"),
  createCohort: (data) => instance.post("/cohorts", data),
  updateCohort: (id, data) => instance.put(`/cohorts/${id}`, data),
  deleteCohort: (id) => instance.delete(`/cohorts/${id}`),
  getCohortStudents: (id) => instance.get(`/cohorts/${id}/students`),

  // STUDENT
  getAllStudents: () => instance.get("/students"),
  assignStudents: (cohortId, ids) =>
    instance.post(`/cohorts/${cohortId}/students`, { student_ids: ids }),
  removeStudent: (cohortId, sid) =>
    instance.delete(`/cohorts/${cohortId}/students/${sid}`),
};

const COLORS = 8;
const cohortColor = (id) => (id - 1) % COLORS;

const initials = (name = "") =>
  name
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

// MOCK
const MOCK_COHORTS = [
  { id: 1, name: "23AI", created_at: "2023-09-01", students: [] },
  { id: 2, name: "23GIT", created_at: "2023-09-01", students: [] },
  { id: 3, name: "22SE", created_at: "2022-09-01", students: [] },
  { id: 4, name: "22IT", created_at: "2022-09-01", students: [] },
];
const MOCK_STUDENTS = [
  {
    id: 1,
    student_code: "23AI001",
    user: { name: "Lê Minh Khoa" },
    cohort_id: 1,
  },
  {
    id: 2,
    student_code: "23AI002",
    user: { name: "Nguyễn Thị Hoa" },
    cohort_id: 1,
  },
  {
    id: 3,
    student_code: "23AI003",
    user: { name: "Phạm Văn Đức" },
    cohort_id: null,
  },
  {
    id: 4,
    student_code: "23GIT01",
    user: { name: "Võ Thị Mai" },
    cohort_id: 2,
  },
  {
    id: 5,
    student_code: "23GIT02",
    user: { name: "Đỗ Quang Hưng" },
    cohort_id: null,
  },
  {
    id: 6,
    student_code: "22SE001",
    user: { name: "Trần Minh Tuấn" },
    cohort_id: 3,
  },
  {
    id: 7,
    student_code: "22IT001",
    user: { name: "Hoàng Văn An" },
    cohort_id: 4,
  },
  {
    id: 8,
    student_code: "N/A",
    user: { name: "Bùi Thị Lan" },
    cohort_id: null,
  },
];

const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div className={`cm-toast cm-toast--${type}`}>
      <span className="cm-toast__icon">{icons[type] ?? "ℹ️"}</span>
      {msg}
    </div>
  );
};

const Modal = ({ open, onClose, title, subtitle, size, children, footer }) => {
  if (!open) return null;
  return (
    <div className="cm-modal-backdrop" onClick={onClose}>
      <div
        className={`cm-modal${size === "lg" ? " cm-modal--lg" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cm-modal__header">
          <div>
            <div className="cm-modal__title">{title}</div>
            {subtitle && <div className="cm-modal__subtitle">{subtitle}</div>}
          </div>
          <button className="cm-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cm-modal__body">{children}</div>
        {footer && <div className="cm-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

const StatRow = ({ cohorts, students }) => {
  const unassigned = students.filter((s) => !s.cohort_id).length;
  const stats = [
    {
      icon: "🎓",
      label: "Tổng lớp khóa",
      value: cohorts.length,
      bg: "#eff6ff",
      color: "#1e40af",
    },
    {
      icon: "👥",
      label: "Tổng sinh viên",
      value: students.length,
      bg: "#f0fdf4",
      color: "#15803d",
    },
    {
      icon: "✅",
      label: "Đã phân lớp",
      value: students.filter((s) => s.cohort_id).length,
      bg: "#ecfeff",
      color: "#0e7490",
    },
    {
      icon: "⏳",
      label: "Chưa phân lớp",
      value: unassigned,
      bg: "#fff7ed",
      color: "#c2410c",
    },
  ];
  return (
    <div className="cohort-stats">
      {stats.map((s) => (
        <div className="cstat" key={s.label}>
          <div className="cstat__icon" style={{ background: s.bg }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
          </div>
          <div>
            <div className="cstat__label">{s.label}</div>
            <div className="cstat__value" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CohortCard = ({
  cohort,
  allStudents,
  onEdit,
  onDelete,
  onDetail,
  onAssign,
}) => {
  const members = allStudents.filter((s) => s.cohort_id === cohort.id);
  const preview = members.slice(0, 4);
  const more = members.length - preview.length;
  const colorIdx = cohortColor(cohort.id);

  return (
    <div className="cohort-card">
      <div className={`cohort-card__banner color-${colorIdx}`} />

      <div className="cohort-card__top">
        <div className="cohort-card__name-wrap">
          <div className={`cohort-card__badge color-${colorIdx}`}>
            {cohort.name.slice(-2)}
          </div>
          <div>
            <div className="cohort-card__name">{cohort.name}</div>
            <div className="cohort-card__sub">
              Tạo: {formatDate(cohort.created_at)}
            </div>
          </div>
        </div>
        <div className="cohort-card__actions">
          <button
            className="cohort-card__action-btn"
            title="Chỉnh sửa"
            onClick={() => onEdit(cohort)}
          >
            ✏️
          </button>
          <button
            className="cohort-card__action-btn cohort-card__action-btn--danger"
            title="Xoá"
            onClick={() => onDelete(cohort)}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="cohort-card__meta">
        <div className="cohort-card__meta-item">
          <div className="cohort-card__meta-label">Sinh viên</div>
          <div className="cohort-card__meta-val">{members.length}</div>
        </div>
        <div className="cohort-card__meta-item">
          <div className="cohort-card__meta-label">Tên khóa</div>
          <div className="cohort-card__meta-val">{cohort.name}</div>
        </div>
      </div>

      <div className="cohort-card__divider" />

      <div className="cohort-card__students">
        <div className="cohort-card__students-label">Thành viên</div>
        {members.length === 0 ? (
          <div className="cohort-card__no-student">Chưa có sinh viên nào</div>
        ) : (
          <div className="cohort-card__avatar-row">
            {preview.map((s) => (
              <div
                key={s.id}
                className="cohort-card__student-avatar"
                title={s.user?.name}
                style={{ background: `hsl(${(s.id * 47) % 360},65%,55%)` }}
              >
                {initials(s.user?.name)}
              </div>
            ))}
            {more > 0 && (
              <div className="cohort-card__avatar-more">+{more}</div>
            )}
          </div>
        )}
      </div>

      <div className="cohort-card__footer">
        <button
          className="cohort-card__btn cohort-card__btn--primary"
          onClick={() => onAssign(cohort)}
        >
          ➕ Thêm sinh viên
        </button>
        <button
          className="cohort-card__btn cohort-card__btn--ghost"
          onClick={() => onDetail(cohort)}
        >
          👁 Chi tiết
        </button>
      </div>
    </div>
  );
};

const CohortManagement = () => {
  const [cohorts, setCohorts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null); // { msg, type }

  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // cohort being edited
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  const [formName, setFormName] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [assignSearch, setAssignSearch] = useState("");
  const [assignTab, setAssignTab] = useState("all"); // 'all' | 'unassigned'
  const [selected, setSelected] = useState([]); // student ids to add

  //ajax
  const [nameError, setNameError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (editTarget && formName === editTarget.name) {
      setNameError('');
      return;
    }
  
    if (formName.trim().length < 2) {
      setNameError('');
      return;
    }
  
    const delayDebounceFn = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await api.getCohorts(); 
        const isExist = res.data.some(c => c.name === formName.trim());
        
        if (isExist) {
          setNameError('⚠️ Tên Cohort này đã tồn tại!');
        } else {
          setNameError('');
        }
      } catch (err) {
        console.error("Lỗi check tên:", err);
      } finally {
        setIsChecking(false);
      }
    }, 500); // Đợi 500ms sau khi ngừng gõ mới gọi API
  
    return () => clearTimeout(delayDebounceFn);
  }, [formName]);


  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.getCohorts(),
        api.getAllStudents(),
      ]);
      setCohorts(cRes?.data?.length ? cRes.data : MOCK_COHORTS);
      setStudents(sRes?.data?.length ? sRes.data : MOCK_STUDENTS);
    } catch (err) {
      console.error(err);
      setCohorts(MOCK_COHORTS);
      setStudents(MOCK_STUDENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const filteredCohorts = cohorts.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setFormName("");
    setFormModal(true);
  };

  const openEdit = (cohort) => {
    setEditTarget(cohort);
    setFormName(cohort.name);
    setFormModal(true);
  };

  const handleFormSubmit = async () => {
    if (!formName.trim()) return showToast("Vui lòng nhập tên Cohort", "error");
    setFormLoading(true);
    try {
      if (editTarget) {
        const res = await api.updateCohort(editTarget.id, {
          name: formName.trim(),
        });
        const updated = { 
          ...editTarget, 
          name: res?.data?.name || formName.trim() 
        };
        setCohorts((prev) =>
          prev.map((c) => (c.id === editTarget.id ? updated : c))
        );
        showToast(`Đã cập nhật Cohort "${updated.name}"`);
      } else {
        const res = await api.createCohort({ name: formName.trim() });
        const created = res?.data || {
          id: Date.now(),
          name: formName.trim(),
          created_at: new Date().toISOString(),
        };
        setCohorts((prev) => [...prev, created]);
        showToast(`Đã tạo Cohort "${created.name}"`);
      }
      setFormModal(false);
    } catch (err) {
      console.error("FULL ERROR:", err);

      let message = "Có lỗi xảy ra, vui lòng thử lại";

      if (err.response) {
        const data = err.response.data;

        if (typeof data === "string") {
          message = data;
        } else if (data && data.message) {
          message = data.message;
        }
      } else if (err.message) {
        message = err.message;
      }

      showToast(message || "Có lỗi xảy ra", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const openDelete = (cohort) => {
    setDeleteTarget(cohort);
    setDeleteModal(true);
  };
  const handleDelete = async () => {
    try {
      await api.deleteCohort(deleteTarget.id);
      setCohorts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      // unassign students that belonged to this cohort
      setStudents((prev) =>
        prev.map((s) =>
          s.cohort_id === deleteTarget.id ? { ...s, cohort_id: null } : s
        )
      );
      showToast(`Đã xoá Cohort "${deleteTarget.name}"`);
    } catch {
      showToast("Xoá thất bại", "error");
    } finally {
      setDeleteModal(false);
    }
  };

  const openAssign = (cohort) => {
    setAssignTarget(cohort);
    setAssignSearch("");
    setAssignTab("all");
    setSelected([]);
    setAssignModal(true);
  };

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAssign = async () => {
    if (selected.length === 0)
      return showToast("Chưa chọn sinh viên nào", "error");
    setFormLoading(true);
    try {
      await api.assignStudents(assignTarget.id, selected);
      setStudents((prev) =>
        prev.map((s) =>
          selected.includes(s.id) ? { ...s, cohort_id: assignTarget.id } : s
        )
      );
      showToast(
        `Đã thêm ${selected.length} sinh viên vào ${assignTarget.name}`
      );
      setAssignModal(false);
    } catch {
      showToast("Thêm sinh viên thất bại", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveStudent = async (cohort, student) => {
    try {
      await api.removeStudent(cohort.id, student.id);
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, cohort_id: null } : s))
      );
      showToast(`Đã xoá ${student.user?.name} khỏi ${cohort.name}`);
    } catch {
      showToast("Xoá thất bại", "error");
    }
  };

  const openDetail = (cohort) => {
    setDetailTarget(cohort);
    setDetailModal(true);
  };

  const assignListBase =
    assignTab === "unassigned"
      ? students.filter((s) => !s.cohort_id)
      : students.filter((s) => s.cohort_id !== assignTarget?.id);

  // const assignListFiltered = assignListBase.filter(
  //   (s) =>
  //     (s.user?.name || "").toLowerCase().includes(assignSearch.toLowerCase()) ||
  //     (s.student_code || "").toLowerCase().includes(assignSearch.toLowerCase())
  // );


  const assignListFiltered = assignListBase.filter((s) => {
    const name = s.user?.name || "";
    const code = s.student_code || "";
    const searchKey = assignSearch.toLowerCase();
    
    return name.toLowerCase().includes(searchKey) || 
           code.toLowerCase().includes(searchKey);
  });

  return (
    <div className="cohort-page">
      <StatRow cohorts={cohorts} students={students} />

      <div className="cohort-toolbar">
        <div className="cohort-toolbar__search">
          <span className="cohort-toolbar__search-icon">🔍</span>
          <input
            placeholder="Tìm kiếm cohort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cohort-toolbar__right">
          <button
            className="cohort-card__btn cohort-card__btn--ghost"
            style={{ padding: "9px 18px", borderRadius: 10 }}
            onClick={fetchAll}
          >
            🔄 Tải lại
          </button>
          <button
            className="cohort-card__btn cohort-card__btn--primary"
            style={{ padding: "9px 20px", borderRadius: 10 }}
            onClick={openCreate}
          >
            ＋ Tạo Cohort mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="cohort-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : filteredCohorts.length === 0 ? (
        <div className="cohort-grid">
          <div className="cohort-empty">
            <div className="cohort-empty__icon">🎓</div>
            <div className="cohort-empty__text">Không tìm thấy Cohort nào</div>
            <div className="cohort-empty__sub">
              Hãy tạo Cohort đầu tiên hoặc thay đổi từ khoá tìm kiếm
            </div>
          </div>
        </div>
      ) : (
        <div className="cohort-grid">
          {filteredCohorts.map((cohort) => (
            <CohortCard
              key={cohort.id}
              cohort={cohort}
              allStudents={students}
              onEdit={openEdit}
              onDelete={openDelete}
              onDetail={openDetail}
              onAssign={openAssign}
            />
          ))}
        </div>
      )}

      <Modal
        open={formModal}
        onClose={() => setFormModal(false)}
        title={editTarget ? "✏️ Chỉnh sửa Cohort" : "✨ Tạo Cohort mới"}
        subtitle="Cohort là nhóm sinh viên theo khoá học (VD: 23AI, 23GIT)"
        footer={
          <>
            <button
              className="cohort-card__btn cohort-card__btn--ghost"
              style={{ padding: "10px 22px", borderRadius: 10 }}
              onClick={() => setFormModal(false)}
            >
              Huỷ
            </button>
            <button
              className="cohort-card__btn cohort-card__btn--primary"
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                opacity: formLoading ? 0.7 : 1,
              }}
              onClick={handleFormSubmit}
              disabled={formLoading || !!nameError || isChecking}
            >
              {formLoading
                ? "⏳ Đang lưu..."
                : editTarget
                ? "💾 Cập nhật"
                : "✅ Tạo ngay"}
            </button>
          </>
        }
      >
        <div className="cm-form-group">
          <label className="cm-form-label">
            Tên Cohort <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            className={`cm-form-input ${nameError ? 'input--error' : ''}`}
            placeholder="VD: 23AI, 23GIT, 22SE..."
            value={formName}
            onChange={(e) => setFormName(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
            autoFocus
          />
          {isChecking && <div style={{ fontSize: 12, color: 'var(--primary)' }}>🔄 Đang kiểm tra tên...</div>}
          {nameError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{nameError}</div>}
          <div className="cm-hint">
            Tên cohort thường gồm năm nhập học + chuyên ngành (23AI = Khóa 2023,
            AI)
          </div>
        </div>

        {formName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: "var(--bg)",
              borderRadius: 12,
              marginTop: 4,
            }}
          >
            <div
              className="cohort-card__badge color-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              {formName.slice(-2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{formName}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                Preview Cohort badge
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title=""
        footer={
          <>
            <button
              className="cohort-card__btn cohort-card__btn--ghost"
              style={{ padding: "10px 22px", borderRadius: 10 }}
              onClick={() => setDeleteModal(false)}
            >
              Huỷ
            </button>
            <button
              className="cohort-card__btn"
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                background: "var(--danger)",
                color: "#fff",
              }}
              onClick={handleDelete}
            >
              🗑️ Xác nhận xoá
            </button>
          </>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div className="delete-modal__icon">🗑️</div>
          <div className="delete-modal__text">Bạn có chắc muốn xoá Cohort</div>
          <div className="delete-modal__name">{deleteTarget?.name}</div>
          <div
            className="delete-modal__text"
            style={{ color: "var(--danger)", fontWeight: 600 }}
          >
            ⚠️ Tất cả sinh viên trong lớp Khóa này sẽ bị bỏ gán. Thao tác không
            thể hoàn tác!
          </div>
        </div>
      </Modal>

      <Modal
        open={assignModal}
        onClose={() => setAssignModal(false)}
        title={`➕ Thêm sinh viên vào "${assignTarget?.name}"`}
        subtitle="Chọn sinh viên bên dưới để thêm vào cohort này"
        size="lg"
        footer={
          <>
            <div className="assign-count-bar" style={{ flex: 1 }}>
              Đã chọn <strong>{selected.length}</strong> sinh viên
            </div>
            <button
              className="cohort-card__btn cohort-card__btn--ghost"
              style={{ padding: "10px 22px", borderRadius: 10 }}
              onClick={() => setAssignModal(false)}
            >
              Huỷ
            </button>
            <button
              className="cohort-card__btn cohort-card__btn--primary"
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                opacity: formLoading ? 0.7 : 1,
              }}
              onClick={handleAssign}
              disabled={formLoading || selected.length === 0}
            >
              {formLoading ? "⏳..." : `✅ Thêm ${selected.length} sinh viên`}
            </button>
          </>
        }
      >
        <div className="assign-search">
          <span className="assign-search__icon">🔍</span>
          <input
            placeholder="Tìm theo tên hoặc mã sinh viên..."
            value={assignSearch}
            onChange={(e) => setAssignSearch(e.target.value)}
          />
        </div>

        <div className="assign-tabs">
          <button
            className={`assign-tab ${assignTab === "all" ? "active" : ""}`}
            onClick={() => setAssignTab("all")}
          >
            👥 Tất cả (
            {students.filter((s) => s.cohort_id !== assignTarget?.id).length})
          </button>
          <button
            className={`assign-tab ${
              assignTab === "unassigned" ? "active" : ""
            }`}
            onClick={() => setAssignTab("unassigned")}
          >
            ⏳ Chưa phân lớp ({students.filter((s) => !s.cohort_id).length})
          </button>
        </div>

        <div className="assign-student-list">
          {assignListFiltered.length === 0 ? (
            <div className="assign-empty">Không có sinh viên phù hợp</div>
          ) : (
            assignListFiltered.map((s) => {
              const isSelected = selected.includes(s.id);
              const alreadyIn = s.cohort_id === assignTarget?.id;
              return (
                <div
                  key={s.id}
                  className={`assign-student-row ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => !alreadyIn && toggleSelect(s.id)}
                  style={{
                    cursor: alreadyIn ? "default" : "pointer",
                    opacity: alreadyIn ? 0.5 : 1,
                  }}
                >
                  <div className="assign-student-row__checkbox">
                    {isSelected && (
                      <span style={{ fontSize: 11, color: "#fff" }}>✓</span>
                    )}
                  </div>

                  <div
                    className="assign-student-row__avatar"
                    style={{ background: `hsl(${(s.id * 47) % 360},60%,55%)` }}
                  >
                    {initials(s.user?.name)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="assign-student-row__name">
                      {s.user?.name || "N/A"}
                    </div>
                    <div className="assign-student-row__id">
                      {s.student_code}
                    </div>
                  </div>

                  {alreadyIn ? (
                    <span
                      className="assign-student-row__tag"
                      style={{ background: "#dcfce7", color: "#16a34a" }}
                    >
                      ✓ Đã trong cohort
                    </span>
                  ) : s.cohort_id ? (
                    <span
                      className="assign-student-row__tag"
                      style={{ background: "#fef9c3", color: "#ca8a04" }}
                    >
                      {cohorts.find((c) => c.id === s.cohort_id)?.name ||
                        "Cohort khác"}
                    </span>
                  ) : (
                    <span
                      className="assign-student-row__tag"
                      style={{ background: "#f1f5f9", color: "#64748b" }}
                    >
                      Chưa phân
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Modal>

      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title={`📋 Chi tiết Cohort "${detailTarget?.name}"`}
        subtitle={`${
          students.filter((s) => s.cohort_id === detailTarget?.id).length
        } sinh viên`}
        size="lg"
        footer={
          <button
            className="cohort-card__btn cohort-card__btn--primary"
            style={{ padding: "10px 28px", borderRadius: 10 }}
            onClick={() => {
              setDetailModal(false);
              openAssign(detailTarget);
            }}
          >
            ➕ Thêm sinh viên
          </button>
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 16px",
            background: "var(--bg)",
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <div
            className={`cohort-card__badge color-${cohortColor(
              detailTarget?.id ?? 0
            )}`}
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            {detailTarget?.name?.slice(-2)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {detailTarget?.name}
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}
            >
              Tạo ngày: {formatDate(detailTarget?.created_at)}
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              textAlign: "center",
              background: "#eff6ff",
              padding: "10px 20px",
              borderRadius: 10,
            }}
          >
            <div
              style={{ fontWeight: 800, fontSize: 22, color: "var(--primary)" }}
            >
              {students.filter((s) => s.cohort_id === detailTarget?.id).length}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>Sinh viên</div>
          </div>
        </div>

        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
          Danh sách sinh viên
        </div>
        {students.filter((s) => s.cohort_id === detailTarget?.id).length ===
        0 ? (
          <div className="assign-empty">Cohort này chưa có sinh viên nào</div>
        ) : (
          students
            .filter((s) => s.cohort_id === detailTarget?.id)
            .map((s, i) => (
              <div key={s.id} className="detail-student-row">
                <div
                  style={{
                    width: 28,
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--text3)",
                  }}
                >
                  {i + 1}
                </div>
                <div
                  className="assign-student-row__avatar"
                  style={{ background: `hsl(${(s.id * 47) % 360},60%,55%)` }}
                >
                  {initials(s.user?.name)}
                </div>
                <div className="detail-student-row__info">
                  <div className="detail-student-row__name">{s.user?.name}</div>
                  <div className="detail-student-row__sub">
                    {s.student_code}
                  </div>
                </div>
                <button
                  className="detail-remove-btn"
                  title="Xoá khỏi cohort"
                  onClick={() => handleRemoveStudent(detailTarget, s)}
                >
                  ✕
                </button>
              </div>
            ))
        )}
      </Modal>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CohortManagement;
