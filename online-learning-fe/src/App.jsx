import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LessonManager from './pages/teacher/LessonManager';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx'; // Trang chúng ta sắp tạo
import CourseDetail from './pages/teacher/CourseDetail'; // Trang chi tiết (tạo file rỗng trước)
import { ToastContainer } from 'react-toastify';

// Trang học sinh tạm thời
const StudentDashboard = () => <h1 className="text-center mt-5">Trang Học Sinh (Đang xây dựng)</h1>;

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* --- ROUTE CỦA GIÁO VIÊN --- */}
        <Route path="/teacher/courses" element={<TeacherDashboard />} />
        <Route path="/teacher/courses/:courseId" element={<CourseDetail />} /> 

        {/* ROUTE MỚI: QUẢN LÝ CHI TIẾT 1 BÀI HỌC */}
        <Route path="/teacher/lessons/:lessonId" element={<LessonManager />} />
        
        {/* --- ROUTE CỦA HỌC SINH --- */}
        <Route path="/student/my-courses" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;