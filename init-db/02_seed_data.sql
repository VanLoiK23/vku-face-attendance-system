-- =========================
-- USERS (Tài khoản hệ thống)
-- =========================
-- Lưu ý: Tôi đã đồng bộ lại cột 'email' theo định nghĩa TABLE của bạn
INSERT INTO users (email, password, role) VALUES
('loihv.23ite@vku.udn.vn', 'hashed_pass_123', 'admin'),   -- Admin (Huỳnh Văn Lợi)
('binhnt@vku.udn.vn', 'hashed_pass_456', 'teacher'),    -- Giảng viên
('phucnd.k23@vku.udn.vn', 'hashed_pass_789', 'student'), -- Sinh viên 1
('hahp.k23@vku.udn.vn', 'hashed_pass_101', 'student'),  -- Sinh viên 2
('huylvg.k23@vku.udn.vn', 'hashed_pass_202', 'student'),-- Sinh viên 3
('tuantm.k23@vku.udn.vn', 'hashed_pass_303', 'student'),-- Sinh viên 4
('lannt.k23@vku.udn.vn', 'hashed_pass_404', 'student'), -- Sinh viên 5
('namvh.k23@vku.udn.vn', 'hashed_pass_505', 'student'); -- Sinh viên 6

-- =========================
-- TEACHER
-- =========================
INSERT INTO teachers (user_id, name)
VALUES (2, 'TS. Nguyễn Thanh Bình');

-- =========================
-- STUDENTS (Thông tin sinh viên)
-- =========================
INSERT INTO students (user_id, student_code, name) VALUES
(3, '23IT001', 'Nguyễn Đức Phúc'),
(4, '23IT002', 'Hoàng Phan Hà'),
(5, '23IT003', 'Lê Văn Gia Huy'),
(6, '23IT004', 'Trần Minh Tuấn'),
(7, '23IT005', 'Nguyễn Thị Lan'),
(8, '23IT006', 'Võ Hoàng Nam');

-- =========================
-- CLASS (Lớp học phần)
-- =========================
INSERT INTO classes (name, teacher_id, room)
VALUES ('Thị giác máy tính & Học sâu', 1, 'V.A212');

-- =========================
-- ENROLLMENTS (Danh sách lớp)
-- =========================
INSERT INTO enrollments (student_id, class_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1);

-- =========================
-- SCHEDULE (Lịch học chi tiết)
-- =========================
INSERT INTO schedules (
    class_id, day_of_week, start_period, end_period, week_start, week_end, room
) VALUES
(1, 2, 1, 4, 1, 15, 'V.A212'),  -- Thứ 2 (Tiết 1-4)
(1, 4, 1, 3, 1, 15, 'V.B305');  -- Thứ 4 (Tiết 1-3)

-- =========================
-- ATTENDANCE SESSION (Buổi học hôm nay)
-- =========================
INSERT INTO attendance_sessions (schedule_id, session_date)
VALUES (1, CURRENT_DATE);

-- =========================
-- ATTENDANCE RECORD (Dữ liệu điểm danh mẫu)
-- =========================
INSERT INTO attendance_records (
    session_id, student_id, status, checkin_time, similarity
) VALUES
(1, 1, 'present', NOW() - INTERVAL '10 minutes', 0.92), -- Khớp cao
(1, 2, 'present', NOW() - INTERVAL '5 minutes', 0.88),
(1, 3, 'present', NOW(), 0.95),
(1, 4, 'absent', NULL, NULL),
(1, 5, 'present', NOW() - INTERVAL '2 minutes', 0.81),
(1, 6, 'absent', NULL, NULL);

-- =========================
-- FACE EMBEDDINGS (Dữ liệu vector mẫu)
-- =========================
-- Ví dụ cho sinh viên đầu tiên (Nguyễn Đức Phúc)
-- INSERT INTO face_embeddings (student_id, embedding) VALUES
-- (1, '[0.01,-0.02,0.05, ...]'); -- Thay bằng vector 128 chiều thực tế của bạn