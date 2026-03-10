import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Modal,
    Form,
    Spinner,
    Badge,
    Table,
    Tabs,
    Tab,
    Alert,
    ProgressBar,
    Accordion
} from 'react-bootstrap';
import {
    PersonFillGear,
    PersonWorkspace,
    PeopleFill,
    BookFill,
    HouseDoorFill,
    PlusCircle,
    PencilSquare,
    Trash3Fill,
    BoxArrowRight,
    EyeFill,
    KeyFill,
    GraphUpArrow,
    PersonBadgeFill,
    ClipboardCheckFill,
    PersonFill,
    JournalBookmarkFill,
    Funnel
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ==========================================
// DỮ LIỆU GIẢ (MOCK DATA) CHO DEMO KHỐI 11, 12
// ==========================================
const FAKE_COURSES = [
    { courseId: 'fake_c1', title: 'Toán học 11', imageUrl: 'https://bizweb.dktcdn.net/100/567/082/products/sgv-cd-toan-11-kntt-a45dc87300804a0e9d15ecc2a895ff86-master-50d12757-443e-4f05-991e-490f22756412.jpg?v=1747323955380', instructorName: 'Nguyễn Văn Toán', totalClasses: 2 },
    { courseId: 'fake_c2', title: 'Ngữ văn 11', imageUrl: 'https://vietjack.com/sach-moi/images/sach-ngu-van-lop-11-ket-noi-tri-thuc-sua2024-1.PNG', instructorName: 'Trần Thị Văn', totalClasses: 2 },
    { courseId: 'fake_c3', title: 'Tin học 11', imageUrl: 'https://sachhoc.com/image/cache/catalog/LuyenThi/Lop10-12/Tin-hoc-11-500x554.jpg', instructorName: 'Lê Coder', totalClasses: 1 },
    { courseId: 'fake_c4', title: 'Vật lý 12', imageUrl: 'https://thuvienkiengiang.vn/wp-content/uploads/2025/12/vat-li-12.jpg', instructorName: 'Phạm Lý Thuyết', totalClasses: 3 },
    { courseId: 'fake_c5', title: 'Hóa học 12', imageUrl: 'https://thuvienkiengiang.vn/wp-content/uploads/2025/12/hoa-hoc-12.jpg', instructorName: 'Hoàng Phản Ứng', totalClasses: 2 },
];

const FAKE_CLASSES = [
    { classId: 'fake_cl1', className: '11A1', courseName: 'Toán học 11', instructorName: 'Nguyễn Văn Toán', enrollmentKey: 'TOAN11_A1', totalStudents: 35 },
    { classId: 'fake_cl2', className: '11A2', courseName: 'Toán học 11', instructorName: 'Nguyễn Văn Toán', enrollmentKey: 'TOAN11_A2', totalStudents: 32 },
    { classId: 'fake_cl3', className: '11A1', courseName: 'Ngữ văn 11', instructorName: 'Trần Thị Văn', enrollmentKey: 'VAN11_A1', totalStudents: 35 },
    { classId: 'fake_cl4', className: '11B3', courseName: 'Ngữ văn 11', instructorName: 'Trần Thị Văn', enrollmentKey: 'VAN11_B3', totalStudents: 30 },
    { classId: 'fake_cl5', className: '11A5', courseName: 'Tin học 11', instructorName: 'Lê Coder', enrollmentKey: 'TIN11_A5', totalStudents: 42 },
    { classId: 'fake_cl6', className: '12A1', courseName: 'Vật lý 12', instructorName: 'Phạm Lý Thuyết', enrollmentKey: 'LY12_A1', totalStudents: 40 },
    { classId: 'fake_cl7', className: '12A2', courseName: 'Vật lý 12', instructorName: 'Phạm Lý Thuyết', enrollmentKey: 'LY12_A2', totalStudents: 38 },
    { classId: 'fake_cl8', className: '12A3', courseName: 'Vật lý 12', instructorName: 'Phạm Lý Thuyết', enrollmentKey: 'LY12_A3', totalStudents: 39 },
    { classId: 'fake_cl9', className: '12A1', courseName: 'Hóa học 12', instructorName: 'Hoàng Phản Ứng', enrollmentKey: 'HOA12_A1', totalStudents: 40 },
    { classId: 'fake_cl10', className: '12B1', courseName: 'Hóa học 12', instructorName: 'Hoàng Phản Ứng', enrollmentKey: 'HOA12_B1', totalStudents: 37 },
];

const FAKE_STUDENTS_DETAIL = [
    { studentId: 'fs1', fullName: 'Nguyễn Văn A', email: 'nva@gmail.com', progressPercent: 85 },
    { studentId: 'fs2', fullName: 'Trần Thị B', email: 'ttb@gmail.com', progressPercent: 40 },
    { studentId: 'fs3', fullName: 'Lê Hoàng C', email: 'lhc@gmail.com', progressPercent: 100 },
    { studentId: 'fs4', fullName: 'Phạm Minh D', email: 'pmd@gmail.com', progressPercent: 15 },
];
// ==========================================


const AdminDashboard = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalTeachers: 0, totalStudents: 0, totalCourses: 0, totalClasses: 0 });
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // --- STATE QUẢN LÝ TAB KHỐI LỚP ---
    const [activeGradeTab, setActiveGradeTab] = useState('10'); 
    const [activeCourseGradeTab, setActiveCourseGradeTab] = useState('10'); 

    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState('TEACHER');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    const [showClassDetailModal, setShowClassDetailModal] = useState(false);
    const [classDetailData, setClassDetailData] = useState(null);
    const [loadingClassDetail, setLoadingClassDetail] = useState(false);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [resStats, resTeachers, resStudents, resCourses, resClasses] = await Promise.all([
                axiosClient.get('/admin/stats'),
                axiosClient.get(`/admin/users?role=TEACHER`),
                axiosClient.get(`/admin/users?role=STUDENT`),
                axiosClient.get('/admin/courses'),
                axiosClient.get('/admin/classes')
            ]);
            
            // Lấy dữ liệu thật từ Backend
            let fetchedCourses = resCourses.data.status ? resCourses.data.data : [];
            let fetchedClasses = resClasses.data.status ? resClasses.data.data : [];

            // BƠM DỮ LIỆU GIẢ VÀO ĐỂ DEMO
            fetchedCourses = [...fetchedCourses, ...FAKE_COURSES];
            fetchedClasses = [...fetchedClasses, ...FAKE_CLASSES];

            setCourses(fetchedCourses);
            setClasses(fetchedClasses);

            if (resStats.data.status) {
                const realStats = resStats.data.data;
                // Cộng dồn thống kê giả vào thống kê thật
                setStats({
                    ...realStats,
                    totalCourses: realStats.totalCourses + FAKE_COURSES.length,
                    totalClasses: realStats.totalClasses + FAKE_CLASSES.length
                });
            }
            if (resTeachers.data.status) setTeachers(resTeachers.data.data);
            if (resStudents.data.status) setStudents(resStudents.data.data);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tải dữ liệu dashboard!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const resetUserForm = () => {
        setUsername(''); setPassword(''); setFullName(''); setEmail('');
    };

    const handleOpenCreateUser = (role) => {
        setIsEditing(false); setCurrentUserRole(role); setCurrentUserId(null); resetUserForm(); setShowUserModal(true);
    };

    const handleOpenEditUser = (user, role) => {
        setIsEditing(true); setCurrentUserRole(role); setCurrentUserId(user.userId);
        setUsername(user.username || ''); setPassword(''); setFullName(user.fullName || ''); setEmail(user.email || '');
        setShowUserModal(true);
    };

    const handleSubmitUser = async () => {
        if (!username.trim() || !fullName.trim()) return toast.warning('Vui lòng nhập đầy đủ Username và Họ và tên.');
        if (!isEditing && !password.trim()) return toast.warning('Vui lòng nhập mật khẩu cho tài khoản mới.');

        const payload = { username: username.trim(), password: password, fullName: fullName.trim(), email: email.trim(), roleName: currentUserRole };

        try {
            if (isEditing) {
                await axiosClient.put(`/admin/users/${currentUserId}`, payload);
                toast.success('Cập nhật người dùng thành công!');
            } else {
                await axiosClient.post('/admin/users', payload);
                toast.success('Tạo người dùng thành công!');
            }
            setShowUserModal(false); resetUserForm(); loadDashboardData();
        } catch (error) { toast.error(error.response?.data?.message || 'Xử lý thất bại!'); }
    };

    const handleDeleteUser = async (id, role, displayName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${displayName}" không?`)) return;
        try {
            await axiosClient.delete(`/admin/users/${id}`);
            toast.success('Đã xóa tài khoản thành công!'); loadDashboardData();
        } catch (error) { toast.error(error.response?.data?.message || 'Xóa thất bại!'); }
    };

    const handleOpenClassDetail = async (classId) => {
        setLoadingClassDetail(true);
        setShowClassDetailModal(true);
        
        const basicClassInfo = classes.find(c => c.classId === classId);
        
        // KIỂM TRA NẾU LÀ CLASS GIẢ (MOCK DATA) -> TRẢ VỀ DATA GIẢ KHÔNG GỌI API
        if (String(classId).startsWith('fake_')) {
            setTimeout(() => { // Giả lập độ trễ mạng
                setClassDetailData({
                    ...basicClassInfo,
                    students: FAKE_STUDENTS_DETAIL
                });
                setLoadingClassDetail(false);
            }, 500);
            return;
        }

        try {
            const res = await axiosClient.get(`/admin/classes/${classId}`);
            if (res.data.status) {
                setClassDetailData({
                    ...res.data.data,
                    courseName: res.data.data.courseName || basicClassInfo?.courseName,
                    instructorName: res.data.data.instructorName || basicClassInfo?.instructorName,
                    className: res.data.data.className || basicClassInfo?.className,
                    enrollmentKey: res.data.data.enrollmentKey || basicClassInfo?.enrollmentKey
                });
            }
        } catch (error) {
            if(basicClassInfo) { setClassDetailData({ ...basicClassInfo, students: [] }); } 
            else { setClassDetailData(null); }
            toast.error(error.response?.data?.message || 'Không thể tải danh sách học sinh!');
        } finally {
            setLoadingClassDetail(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getCourseTitle = (course) => course?.title || 'Chưa cập nhật';
    const getCourseTeacher = (course) => course?.instructorName || 'Chưa cập nhật';

    // --- LOGIC BÓC TÁCH KHỐI LỚP TỰ ĐỘNG ---
    const getGradeFromClassName = (className) => {
        if (!className) return 'other';
        if (className.startsWith('10')) return '10';
        if (className.startsWith('11')) return '11';
        if (className.startsWith('12')) return '12';
        return 'other'; 
    };

    const getGradeFromCourseTitle = (title) => {
        if (!title) return 'other';
        const t = title.toLowerCase();
        if (t.includes('10')) return '10';
        if (t.includes('11')) return '11';
        if (t.includes('12')) return '12';
        return 'other';
    };

    // Filter & Group Lớp học
    const classesInActiveGrade = classes.filter(cls => getGradeFromClassName(cls.className) === activeGradeTab);
    const groupedClasses = classesInActiveGrade.reduce((acc, cls) => {
        const courseName = cls.courseName || 'Khóa học khác';
        if (!acc[courseName]) acc[courseName] = { courseName: courseName, instructorName: cls.instructorName, classes: [] };
        acc[courseName].classes.push(cls);
        return acc;
    }, {});
    const groupedClassesArray = Object.values(groupedClasses);
    const countClassesInGrade = (grade) => classes.filter(c => getGradeFromClassName(c.className) === grade).length;

    // Filter Môn học
    const coursesInActiveGrade = courses.filter(c => getGradeFromCourseTitle(c.title) === activeCourseGradeTab);
    const countCoursesInGrade = (grade) => courses.filter(c => getGradeFromCourseTitle(c.title) === grade).length;


    if (loading) {
        return (
            <Container className="text-center py-5" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: '#2563eb' }} />
                <p className="mt-3 fw-semibold text-muted">Đang tải bảng điều khiển quản trị...</p>
            </Container>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0ecff 0%, #dbeafe 40%, #ecfeff 100%)', padding: '24px 0' }}>
            <Container>
                <div
                    className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 p-4"
                    style={{
                        borderRadius: '22px',
                        background: 'linear-gradient(120deg, #312e81 0%, #2563eb 50%, #0f766e 100%)',
                        boxShadow: '0 14px 38px rgba(30, 41, 59, 0.25)'
                    }}
                >
                    <div className="d-flex align-items-center">
                        <PersonFillGear size={34} className="text-white me-3" />
                        <div>
                            <h3 className="m-0 fw-bold text-white">Quản Trị Hệ Thống</h3>
                            <div style={{ color: 'rgba(255,255,255,0.85)' }}>Learning Management System</div>
                        </div>
                    </div>

                    <Button
                        className="fw-semibold border-0"
                        onClick={handleLogout}
                        style={{ borderRadius: '12px', padding: '10px 18px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff' }}
                    >
                        <BoxArrowRight className="me-2" /> Đăng xuất
                    </Button>
                </div>

                <Card className="border-0" style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
                    <Card.Body className="p-4">
                        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                            <Tab eventKey="overview" title={<span><GraphUpArrow className="me-2" />Tổng quan</span>}>
                                <Row className="g-3">
                                    <Col md={6} lg={3}>
                                        <Card className="border-0 h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}>
                                            <Card.Body className="text-white">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-semibold">Tổng Giáo Viên</span>
                                                    <PersonWorkspace size={26} />
                                                </div>
                                                <h2 className="fw-bold mb-0">{stats?.totalTeachers || 0}</h2>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6} lg={3}>
                                        <Card className="border-0 h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #db2777 0%, #fb7185 100%)' }}>
                                            <Card.Body className="text-white">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-semibold">Tổng Học Sinh</span>
                                                    <PeopleFill size={26} />
                                                </div>
                                                <h2 className="fw-bold mb-0">{stats?.totalStudents || 0}</h2>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6} lg={3}>
                                        <Card className="border-0 h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' }}>
                                            <Card.Body className="text-white">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-semibold">Tổng Môn Học</span>
                                                    <BookFill size={26} />
                                                </div>
                                                <h2 className="fw-bold mb-0">{stats?.totalCourses || 0}</h2>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6} lg={3}>
                                        <Card className="border-0 h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' }}>
                                            <Card.Body className="text-white">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="fw-semibold">Tổng Lớp Học</span>
                                                    <HouseDoorFill size={26} />
                                                </div>
                                                <h2 className="fw-bold mb-0">{stats?.totalClasses || 0}</h2>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="teachers" title={<span><PersonWorkspace className="me-2" />Giáo viên</span>}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="m-0 fw-bold" style={{ color: '#0f172a' }}>Danh Sách Giáo Viên</h5>
                                    <Button
                                        className="border-0 fw-semibold"
                                        onClick={() => handleOpenCreateUser('TEACHER')}
                                        style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                                    >
                                        <PlusCircle className="me-2" /> Thêm Giáo Viên
                                    </Button>
                                </div>

                                <div className="table-responsive">
                                    <Table hover className="align-middle">
                                        <thead style={{ background: '#eff6ff' }}>
                                            <tr>
                                                <th>STT</th><th>Họ và tên</th><th>Username</th><th>Email</th><th className="text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teachers.map((teacher, index) => (
                                                <tr key={teacher.userId}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">{teacher.fullName}</td>
                                                    <td>@{teacher.username}</td>
                                                    <td>{teacher.email || <span className="text-muted">Chưa cập nhật</span>}</td>
                                                    <td className="text-center">
                                                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleOpenEditUser(teacher, 'TEACHER')}><PencilSquare /></Button>
                                                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(teacher.userId, 'TEACHER', teacher.fullName || teacher.username)}><Trash3Fill /></Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    {teachers.length === 0 && <Alert variant="info" className="mb-0">Chưa có giáo viên nào.</Alert>}
                                </div>
                            </Tab>

                            <Tab eventKey="students" title={<span><PeopleFill className="me-2" />Học sinh</span>}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="m-0 fw-bold" style={{ color: '#0f172a' }}>Danh Sách Học Sinh</h5>
                                    <Button
                                        className="border-0 fw-semibold"
                                        onClick={() => handleOpenCreateUser('STUDENT')}
                                        style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' }}
                                    >
                                        <PlusCircle className="me-2" /> Thêm Học Sinh
                                    </Button>
                                </div>

                                <div className="table-responsive">
                                    <Table hover className="align-middle">
                                        <thead style={{ background: '#ecfeff' }}>
                                            <tr>
                                                <th>STT</th><th>Họ và tên</th><th>Username</th><th>Email</th><th className="text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student, index) => (
                                                <tr key={student.userId}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">{student.fullName}</td>
                                                    <td>@{student.username}</td>
                                                    <td>{student.email || <span className="text-muted">Chưa cập nhật</span>}</td>
                                                    <td className="text-center">
                                                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleOpenEditUser(student, 'STUDENT')}><PencilSquare /></Button>
                                                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(student.userId, 'STUDENT', student.fullName || student.username)}><Trash3Fill /></Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    {students.length === 0 && <Alert variant="info" className="mb-0">Chưa có học sinh nào.</Alert>}
                                </div>
                            </Tab>

                            {/* --- TAB MÔN HỌC --- */}
                            <Tab eventKey="courses" title={<span><BookFill className="me-2" />Môn học</span>}>
                                {/* BỘ LỌC CHO MÔN HỌC */}
                                <div className="bg-light p-3 rounded-4 shadow-sm border mb-4 d-flex align-items-center flex-wrap gap-3">
                                    <span className="fw-bold text-muted d-flex align-items-center">
                                        <Funnel className="me-2" size={18}/> Chọn khối:
                                    </span>
                                    {['10', '11', '12', 'other'].map(grade => {
                                        const count = grade === 'other' 
                                            ? courses.filter(c => getGradeFromCourseTitle(c.title) === 'other').length
                                            : countCoursesInGrade(grade);
                                            
                                        if (grade === 'other' && count === 0) return null;

                                        return (
                                            <div key={grade} className="px-4 py-2"
                                                style={{
                                                    borderRadius: '20px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s',
                                                    background: activeCourseGradeTab === grade ? '#0ea5e9' : '#fff',
                                                    color: activeCourseGradeTab === grade ? 'white' : '#475569',
                                                    boxShadow: activeCourseGradeTab === grade ? '0 4px 12px rgba(14, 165, 233, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                                                    border: activeCourseGradeTab === grade ? 'none' : '1px solid #cbd5e1'
                                                }}
                                                onClick={() => setActiveCourseGradeTab(grade)}
                                            >
                                                {grade === 'other' ? 'Khác' : `Khối ${grade}`} 
                                                <Badge bg={activeCourseGradeTab === grade ? 'light' : 'secondary'} text={activeCourseGradeTab === grade ? 'dark' : 'light'} className="ms-2">
                                                    {count}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>

                                {coursesInActiveGrade.length === 0 ? (
                                    <Alert variant="info" className="mb-0 border-0 shadow-sm">
                                        Chưa có môn học nào thuộc Khối {activeCourseGradeTab} trong hệ thống.
                                    </Alert>
                                ) : (
                                    <Row className="g-3">
                                        {coursesInActiveGrade.map((course) => (
                                            <Col md={4} key={course.courseId}>
                                                <Card className="h-100 border-0" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }}>
                                                    <Card.Img variant="top" src={course.imageUrl || 'https://via.placeholder.com/600x300?text=Subject'} style={{ height: '180px', objectFit: 'cover' }} />
                                                    <Card.Body>
                                                        <Card.Title className="fw-bold" style={{ color: '#0f172a' }}>{getCourseTitle(course)}</Card.Title>
                                                        <div className="text-muted mb-3"><PersonBadgeFill className="me-2" /> {getCourseTeacher(course)}</div>
                                                        <Badge bg="secondary" pill>Tổng số lớp: {course.totalClasses ?? 0}</Badge>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </Tab>

                            {/* --- TAB LỚP HỌC --- */}
                            <Tab eventKey="classes" title={<span><HouseDoorFill className="me-2" />Lớp học</span>}>
                                {/* BỘ LỌC THEO KHỐI */}
                                <div className="bg-light p-3 rounded-4 shadow-sm border mb-4 d-flex align-items-center flex-wrap gap-3">
                                    <span className="fw-bold text-muted d-flex align-items-center">
                                        <Funnel className="me-2" size={18}/> Chọn khối:
                                    </span>
                                    {['10', '11', '12', 'other'].map(grade => {
                                        const count = grade === 'other' 
                                            ? classes.filter(c => getGradeFromClassName(c.className) === 'other').length
                                            : countClassesInGrade(grade);
                                            
                                        if (grade === 'other' && count === 0) return null;

                                        return (
                                            <div key={grade} className="px-4 py-2"
                                                style={{
                                                    borderRadius: '20px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s',
                                                    background: activeGradeTab === grade ? '#4f46e5' : '#fff',
                                                    color: activeGradeTab === grade ? 'white' : '#475569',
                                                    boxShadow: activeGradeTab === grade ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                                                    border: activeGradeTab === grade ? 'none' : '1px solid #cbd5e1'
                                                }}
                                                onClick={() => setActiveGradeTab(grade)}
                                            >
                                                {grade === 'other' ? 'Lớp Khác' : `Khối ${grade}`} 
                                                <Badge bg={activeGradeTab === grade ? 'light' : 'secondary'} text={activeGradeTab === grade ? 'dark' : 'light'} className="ms-2">
                                                    {count}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>

                                {groupedClassesArray.length === 0 ? (
                                    <Alert variant="info" className="mb-0 border-0 shadow-sm">
                                        <div className="d-flex align-items-center">
                                            <div style={{fontSize: '2rem'}} className="me-3">🏫</div>
                                            <div>
                                                <h5 className="mb-1 fw-bold">Trống!</h5>
                                                <span>Chưa có lớp học nào thuộc Khối {activeGradeTab} trong hệ thống.</span>
                                            </div>
                                        </div>
                                    </Alert>
                                ) : (
                                    <Accordion defaultActiveKey="0">
                                        {groupedClassesArray.map((group, index) => (
                                            <Accordion.Item eventKey={index.toString()} key={index} className="mb-3 border-0" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)' }}>
                                                <Accordion.Header style={{ padding: '0' }}>
                                                    <div className="d-flex justify-content-between align-items-center w-100 pe-3" style={{ padding: '8px 12px' }}>
                                                        <div>
                                                            <div className="fw-bold text-primary mb-1" style={{ fontSize: '1.1rem' }}>
                                                                <JournalBookmarkFill className="me-2" />
                                                                {group.courseName}
                                                            </div>
                                                            <div className="text-muted small">
                                                                <PersonWorkspace className="me-1" /> Phụ trách: {group.instructorName}
                                                            </div>
                                                        </div>
                                                        <Badge bg="info" className="px-3 py-2 rounded-pill shadow-sm">
                                                            {group.classes.length} Lớp học
                                                        </Badge>
                                                    </div>
                                                </Accordion.Header>
                                                <Accordion.Body style={{ background: '#f8fafc', padding: '20px' }}>
                                                    <div className="table-responsive bg-white rounded-3 shadow-sm border">
                                                        <Table hover className="m-0 align-middle">
                                                            <thead style={{ background: '#ecfdf5' }}>
                                                                <tr>
                                                                    <th className="ps-4">Tên Lớp</th>
                                                                    <th>Mã tham gia</th>
                                                                    <th>Sĩ số</th>
                                                                    <th className="text-center">Thao tác</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {group.classes.map((cls) => (
                                                                    <tr key={cls.classId}>
                                                                        <td className="ps-4 fw-bold text-dark">{cls.className}</td>
                                                                        <td>
                                                                            <Badge bg="dark" className="px-2 py-1">
                                                                                <KeyFill className="me-1" /> {cls.enrollmentKey}
                                                                            </Badge>
                                                                        </td>
                                                                        <td>
                                                                            <span className="fw-semibold text-success">
                                                                                <PersonFill className="me-1" /> {cls.totalStudents ?? 0}
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <Button
                                                                                size="sm"
                                                                                className="border-0 fw-semibold px-3 py-1"
                                                                                onClick={() => handleOpenClassDetail(cls.classId)}
                                                                                style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #0891b2 0%, #155e75 100%)' }}
                                                                            >
                                                                                <EyeFill className="me-1" /> Chi tiết
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                )}
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>

            {/* Modal Quản lý User */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
                <Modal.Header closeButton className="border-0 text-white" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}>
                    <Modal.Title className="fw-bold">
                        {isEditing ? 'Chỉnh Sửa Người Dùng' : `Thêm ${currentUserRole === 'TEACHER' ? 'Giáo Viên' : 'Học Sinh'}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)' }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập username" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEditing ? 'Bỏ trống nếu không muốn đổi mật khẩu' : 'Nhập mật khẩu'} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Họ và tên</Form.Label>
                            <Form.Control value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nhập họ và tên" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fw-semibold">Email (không bắt buộc)</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>Hủy</Button>
                    <Button className="border-0" onClick={handleSubmitUser} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}>
                        {isEditing ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Chi tiết Lớp học */}
            <Modal show={showClassDetailModal} onHide={() => setShowClassDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 text-white" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)' }}>
                    <Modal.Title className="fw-bold">
                        <ClipboardCheckFill className="me-2" /> Chi Tiết Lớp Học
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#f8fafc' }}>
                    {loadingClassDetail && (
                        <div className="text-center py-4"><Spinner animation="border" /></div>
                    )}
                    {!loadingClassDetail && classDetailData && (
                        <>
                            <Card className="mb-3 border-0" style={{ background: '#eef2ff' }}>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <p className="mb-2"><strong>Tên lớp:</strong> <span className="fw-bold text-primary">{classDetailData.className}</span></p>
                                            <p className="mb-2"><strong>Môn học:</strong> {classDetailData.courseName}</p>
                                            <p className="mb-0"><strong>Giáo viên:</strong> {classDetailData.instructorName}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p className="mb-2"><strong>Mã tham gia:</strong> <Badge bg="dark">{classDetailData.enrollmentKey}</Badge></p>
                                            <p className="mb-0"><strong>Tổng số học sinh:</strong> <Badge bg="info">{classDetailData.totalStudents ?? 0}</Badge></p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <div className="table-responsive border rounded bg-white">
                                <Table hover className="align-middle m-0">
                                    <thead style={{ background: '#ecfeff' }}>
                                        <tr><th className="ps-3">STT</th><th>Học sinh</th><th>Email</th><th className="pe-3">Tiến độ</th></tr>
                                    </thead>
                                    <tbody>
                                        {(classDetailData.students || []).map((student, index) => {
                                            const studentName = student.fullName || 'Chưa cập nhật';
                                            const studentEmail = student.email || 'N/A';
                                            const progress = Number(student.progressPercent ?? 0);

                                            return (
                                                <tr key={student.studentId || index}>
                                                    <td className="ps-3 text-muted">{index + 1}</td>
                                                    <td className="fw-semibold">{studentName}</td>
                                                    <td>{studentEmail}</td>
                                                    <td className="pe-3" style={{ minWidth: '220px' }}>
                                                        <ProgressBar animated now={progress} label={`${Math.round(progress)}%`} variant="success" style={{ height: '1.2rem' }} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                                {(classDetailData.students || []).length === 0 && (
                                    <div className="p-4 text-center">
                                        <Alert variant="info" className="mb-0">Lớp này chưa có học sinh nào tham gia.</Alert>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ background: '#f8fafc', borderTop: 'none' }}>
                    <Button variant="secondary" onClick={() => setShowClassDetailModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;