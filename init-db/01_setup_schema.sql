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
-- STUDENTS
-- =========================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL
);

-- =========================
-- CLASSES (LỚP HỌC PHẦN)
-- =========================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT REFERENCES teachers(id),
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- STUDENT - CLASS (ENROLLMENT)
-- =========================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE(student_id, class_id)
);

-- =========================
-- SCHEDULES (LỊCH HỌC)
-- =========================
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE,

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
    embedding VECTOR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEX (TỐI ƯU)
-- =========================
CREATE INDEX idx_schedule_week ON schedules(week_start, week_end);
CREATE INDEX idx_schedule_day ON schedules(day_of_week);

-- VECTOR INDEX (AI)
CREATE INDEX idx_embedding_vector 
ON face_embeddings 
USING ivfflat (embedding vector_cosine_ops);
