import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// PAGES
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CourseDetail from './pages/teacher/CourseDetail';
import LessonManager from './pages/teacher/LessonManager';
import GradingDashboard from './pages/teacher/GradingDashboard';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import UserProfile from './pages/UserProfile';

// ADMIN
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route path="/profile" element={<UserProfile />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* TEACHER ROUTES */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<Navigate to="/teacher/dashboard" />} />
        <Route path="/teacher/courses/:courseId" element={<CourseDetail />} />
        <Route path="/teacher/lessons/:lessonId" element={<LessonManager />} />
        <Route path="/teacher/grading" element={<GradingDashboard />} />

        {/* STUDENT ROUTES */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/my-courses" element={<Navigate to="/student/dashboard" />} />
        <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;