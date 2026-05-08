import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import { AuthContext, AuthWrapper } from './components/context/auth.context.jsx';
import AuthPage from "./pages/auth/AuthPage"
import ForgotPassword from "./pages/auth/ForgotPassword"

import AdminDashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/Users";
import ClassesPage from "./pages/admin/Classes";
import SchedulePage from "./pages/admin/Schedules";
import FaceApprovalPage from "./pages/admin/Face_Approval";
import ReportsPage from "./pages/admin/Reports";

import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TodaySchedule from './pages/Schedule_Today.jsx'
import WeekSchedule from './pages/Weekly_Schedule.jsx'
import SessionDetail from './pages/teacher/Session_Detail.jsx'

import StudentDashboard from './pages/student/StudentDashboard.jsx'
import FaceUpload from './pages/student/Face_Upload.jsx'
import MyAttendance from './pages/student/Student_Attendance.jsx'


import ProfilePage from "./pages/profile";
import ResetPassword from './pages/auth/ResetPassword.jsx';

import NotFound from "./pages/error/NotFound";
import Forbidden from "./pages/error/Forbidden";

import ProtectedRoute from './route/ProtectedRoute.jsx';
import RoleRoute from './route/RoleRoute.jsx';
import CohortManagement from './pages/admin/Cohort.jsx';
import SubjectsPage from './pages/admin/Subject.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App/>
      </ProtectedRoute>
    ),
    children: [

      // ADMIN
      {
        path: "admin",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <UsersPage /> },
          { path: "cohorts", element: <CohortManagement /> },
          { path: "subjects", element: <SubjectsPage /> },
          { path: "classes", element: <ClassesPage /> },
          { path: "schedule", element: <SchedulePage /> },
          { path: "face-approval", element: <FaceApprovalPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "dashboard", element: <AdminDashboard/>},
          { path: "profile", element: <ProfilePage />}
        ]
      },

      // TEACHER
      {
        path: "teacher",
        element: (
          <RoleRoute allowedRoles={["teacher"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <TeacherDashboard /> },
          { path: "today-schedule", element: <TodaySchedule role="teacher" /> },
          { path: "week-schedule", element: <WeekSchedule /> },
          // { path: "attendance", element: <AttendancePage /> },
          // { path: "history", element: <AttendanceHistory /> }
          { path: "session-detail", element: <SessionDetail /> },
          { path: "dashboard", element: <TeacherDashboard/>},
          { path: "profile", element: <ProfilePage />}
        ]
      },

      // STUDENT
      {
        path: "student",
        element: (
          <RoleRoute allowedRoles={["student"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "today-schedule", element: <TodaySchedule role="student" /> },
          { path: "week-schedule", element: <WeekSchedule /> },
          { path: "my-attendance", element: <MyAttendance /> },
          { path: "face-upload", element: <FaceUpload /> },
          { path: "dashboard", element: <StudentDashboard/>},
          { path: "profile", element: <ProfilePage />}
        ]
      }
    ]
  },

  { path: "/auth", element: <AuthPage /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/403", element: <Forbidden /> },
  { path: "*", element: <NotFound /> } 
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <ToastContainer position="top-right" autoClose={3000} />
      <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>
)