-- =========================
-- EXTENSION (AI EMBEDDING)
-- =========================
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================
-- USERS (LOGIN + ROLE)
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    reset_token VARCHAR(255)  NULL,
    reset_token_expiry TIMESTAMP  NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TEACHERS
-- =========================
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- =========================
-- COHORTS
-- =========================
CREATE TABLE cohorts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
    -- 23AI, 23IT, 23GIT
);

-- =========================
-- STUDENTS
-- =========================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(50) UNIQUE,
    face_status VARCHAR(20) CHECK (face_status IN ('confirm', 'pending', 'reject')) NULL,
    face_video_url TEXT NULL, -- Lưu link từ Cloudinary
    reject_reason VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP NULL,
    face_video_public_id VARCHAR(255),
    cohort_id INT REFERENCES cohorts(id) ON DELETE SET NULL
);
-- =========================
-- SUBJECTS (MÔN HỌC)
-- =========================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    credits INT NOT NULL
);

-- =========================
-- CLASS_SECTION  (LỚP HỌC PHẦN)
-- =========================
CREATE TABLE class_sections (
    id SERIAL PRIMARY KEY,

    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES teachers(id),

    name VARCHAR(255) NOT NULL,
    room VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- STUDENT - CLASS (ENROLLMENT)
-- =========================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,

    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    class_section_id INT REFERENCES class_sections(id) ON DELETE CASCADE,

    UNIQUE(student_id, class_section_id)
);

-- =========================
-- SEMESTERS (HỌC KÌ)
-- =========================
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100), -- Ví dụ: Học kỳ 2 - 2025-2026
    start_date DATE NOT NULL, -- Ngày Thứ 2 của Tuần 1
    end_date DATE,
    is_active BOOLEAN DEFAULT false -- Học kỳ hiện tại đang diễn ra
);

-- =========================
-- SCHEDULES (LỊCH HỌC)
-- =========================
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    class_section_id INT REFERENCES class_sections(id) ON DELETE CASCADE,
    semester_id INT REFERENCES semesters(id),

    day_of_week INT CHECK (day_of_week BETWEEN 2 AND 8), -- 2=Mon
    start_period INT,
    end_period INT,

    week_start INT,
    week_end INT,

    room VARCHAR(50)
);

-- =========================
-- ATTENDANCE SESSION (BUỔI HỌC)
-- =========================
CREATE TABLE attendance_sessions (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES schedules(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ATTENDANCE (KẾT QUẢ)
-- =========================
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,

    status VARCHAR(20) CHECK (status IN ('present', 'absent')) DEFAULT 'present',
    checkin_time TIMESTAMP,
    similarity FLOAT,

    UNIQUE(session_id, student_id)
);

-- =========================
-- FACE EMBEDDINGS (AI)
-- =========================
CREATE TABLE face_embeddings (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,

    mean_embedding VECTOR(256), 
    
    all_embeddings JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE enrollments 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- =========================
-- INDEX (TỐI ƯU)
-- =========================
CREATE INDEX idx_schedule_week ON schedules(week_start, week_end);
CREATE INDEX idx_schedule_day ON schedules(day_of_week);

-- VECTOR INDEX (AI)
CREATE INDEX idx_embedding_vector 
ON face_embeddings 
USING ivfflat (embedding vector_cosine_ops);
