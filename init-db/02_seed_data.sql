-- =========================
-- COHORTS (Lớp hành chính)
-- =========================
INSERT INTO cohorts (name) VALUES 
('23AI'), 
('23ITe2'), 
('23GIT');

-- =========================
-- SUBJECTS (Danh mục Môn học)
-- =========================
INSERT INTO subjects (name, code, credits) VALUES 
('Thị giác máy tính & Học sâu', 'INT1411', 3),
('Lập trình Web chuyên nghiệp', 'INT1306', 3),
('Cấu trúc dữ liệu và Giải thuật', 'INT1202', 4);

-- =========================
-- USERS (Tài khoản)
-- =========================
INSERT INTO users (email, password, role) VALUES
('loihv.23ite@vku.udn.vn', 'hash_admin_123', 'admin'),
('binhnt@vku.udn.vn', 'hash_teacher_456', 'teacher'),
('phucnd.k23@vku.udn.vn', 'hash_stud_1', 'student'),
('hahp.k23@vku.udn.vn', 'hash_stud_2', 'student'),
('huylvg.k23@vku.udn.vn', 'hash_stud_3', 'student'),
('tuantm.k23@vku.udn.vn', 'hash_stud_4', 'student'),
('lannt.k23@vku.udn.vn', 'hash_stud_5', 'student'),
('namvh.k23@vku.udn.vn', 'hash_stud_6', 'student');

-- =========================
-- TEACHERS (Giảng viên)
-- =========================
INSERT INTO teachers (user_id, name) VALUES 
(2, 'TS. Nguyễn Thanh Bình');

-- =========================
-- STUDENTS (Gán vào Cohort 23AI)
-- =========================
INSERT INTO students (user_id, student_code, name, face_status, cohort_id) VALUES 
(3, '23IT001', 'Nguyễn Đức Phúc', 'confirm', 1),
(4, '23IT002', 'Hoàng Phan Hà', 'confirm', 1),
(5, '23IT003', 'Lê Văn Gia Huy', 'pending', 1),
(6, '23IT004', 'Trần Minh Tuấn', 'confirm', 1),
(7, '23IT005', 'Nguyễn Thị Lan', 'reject', 1),
(8, '23IT006', 'Võ Hoàng Nam', 'pending', 1);

-- =========================
-- CLASS_SECTIONS (Lớp học phần)
-- =========================
INSERT INTO class_sections (subject_id, teacher_id, name, room) VALUES 
(1, 1, 'CV-HocSau-N01', 'V.A212'),
(2, 1, 'Web-N02', 'V.B305');

-- =========================
-- ENROLLMENTS (Đăng ký môn học)
-- =========================
INSERT INTO enrollments (student_id, class_section_id) VALUES 
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1);

-- =========================
-- SCHEDULES (Lịch học)
-- =========================
INSERT INTO schedules (class_section_id, day_of_week, start_period, end_period, week_start, week_end, room) VALUES 
(1, 2, 1, 4, 1, 15, 'V.A212'),  -- Thứ 2 tiết 1-4
(1, 4, 1, 3, 1, 15, 'V.B305');  -- Thứ 4 tiết 1-3

-- =========================
-- ATTENDANCE SESSIONS (Buổi điểm danh)
-- =========================
INSERT INTO attendance_sessions (schedule_id, session_date) VALUES 
(1, CURRENT_DATE);

-- =========================
-- ATTENDANCE RECORDS (Kết quả điểm danh)
-- =========================
INSERT INTO attendance_records (session_id, student_id, status, checkin_time, similarity) VALUES 
(1, 1, 'present', CURRENT_TIMESTAMP - INTERVAL '10 minutes', 0.92),
(1, 2, 'present', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 0.88),
(1, 3, 'absent', NULL, NULL);

-- =========================
-- FACE EMBEDDINGS (Mẫu vector giả cho AI)
-- =========================
-- Lưu ý: Phải cài extension vector mới chạy được dòng này
INSERT INTO face_embeddings (student_id, embedding) VALUES 
(1, array_fill(0.1, ARRAY[512])::vector),
(2, array_fill(0.2, ARRAY[512])::vector);