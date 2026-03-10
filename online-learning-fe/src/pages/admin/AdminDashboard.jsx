import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Badge, Table, Tabs, Tab, Alert, ListGroup, InputGroup } from 'react-bootstrap';
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
    PersonCircle,
    EyeFill,
    InfoCircleFill,
    KeyFill,
    GraphUpArrow,
    Search,
    PersonBadgeFill,
    ClipboardCheckFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    
    // User Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userFormData, setUserFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        roleName: 'TEACHER'
    });

    // Class Detail Modal States
    const [showClassDetailModal, setShowClassDetailModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classEnrollments, setClassEnrollments] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);

    // ========== FETCH DATA FUNCTIONS ==========
    
    // Fetch Dashboard Stats
    const fetchStats = async () => {
        try {
            const res = await axiosClient.get('/admin/stats');
            if (res.data.status) {
                setStats(res.data.data);
            }
        } catch (error) {
            toast.error("Không thể tải thống kê!");
            console.error(error);
        }
    };

    // Fetch Users by Role
    const fetchUsersByRole = async (role) => {
        try {
            const res = await axiosClient.get(`/admin/users?role=${role}`);
            if (res.data.status) {
                if (role === 'TEACHER') {
                    setTeachers(res.data.data);
                } else if (role === 'STUDENT') {
                    setStudents(res.data.data);
                }
            }
        } catch (error) {
            toast.error(`Không thể tải danh sách ${role}!`);
        }
    };

    // Fetch All Courses (Admin view)
    const fetchAllCourses = async () => {
        try {
            // Giả sử backend có endpoint này, hoặc có thể dùng teacher endpoint
            // Nếu không có, bạn cần thêm endpoint mới ở backend
            const res = await axiosClient.get('/teacher/my-courses'); // Tạm thời dùng teacher endpoint
            if (res.data.status) {
                setCourses(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải courses:", error);
            // Giả lập dữ liệu nếu API chưa có
            simulateCoursesData();
        }
    };

    // Simulate courses data if API not available
    const simulateCoursesData = () => {
        const mockCourses = [
            { courseId: 1, title: 'Vật lý 10', instructor: { fullName: 'Trương Thị Kim Khoa' }, imageUrl: 'https://thuvienvatly.com/home/images/download_thumb/1PAWkMteydy2rR7UEJFmuLL4KXwwj1Wer.jpg', totalClasses: 2 },
            { courseId: 2, title: 'Hóa học 10', instructor: { fullName: 'Trương Thị Kim Khoa' }, imageUrl: 'https://hieusach24h.com/wp-content/uploads/2021/09/Hoa-hoc-10-1.jpg', totalClasses: 2 },
            { courseId: 3, title: 'Lập trình Pascal lớp 11', instructor: { fullName: 'Thầy Tin Học' }, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Free_Pascal_logo.png', totalClasses: 2 },
        ];
        setCourses(mockCourses);
    };

    // Fetch All Classes
    const fetchAllClasses = async () => {
        try {
            // Giả lập dữ liệu classes với enrollment count
            // Backend cần endpoint: GET /api/admin/classes với thông tin enrollment
            const mockClasses = [
                { 
                    classId: 1, 
                    className: '10A1', 
                    enrollmentKey: 'VATLY10_A1',
                    course: { title: 'Vật lý 10', instructor: { fullName: 'Trương Thị Kim Khoa' } },
                    enrollmentCount: 25
                },
                { 
                    classId: 2, 
                    className: '10A2', 
                    enrollmentKey: 'VATLY10_A2',
                    course: { title: 'Vật lý 10', instructor: { fullName: 'Trương Thị Kim Khoa' } },
                    enrollmentCount: 28
                },
                { 
                    classId: 3, 
                    className: '10A1', 
                    enrollmentKey: 'HOA10_A1',
                    course: { title: 'Hóa học 10', instructor: { fullName: 'Trương Thị Kim Khoa' } },
                    enrollmentCount: 22
                },
                { 
                    classId: 4, 
                    className: '10A2', 
                    enrollmentKey: 'HOA10_A2',
                    course: { title: 'Hóa học 10', instructor: { fullName: 'Trương Thị Kim Khoa' } },
                    enrollmentCount: 30
                },
                { 
                    classId: 5, 
                    className: '10A1', 
                    enrollmentKey: 'PASCAL_10A1',
                    course: { title: 'Lập trình Pascal lớp 11', instructor: { fullName: 'Thầy Tin Học' } },
                    enrollmentCount: 18
                },
                { 
                    classId: 6, 
                    className: '10A2', 
                    enrollmentKey: 'PASCAL_10A2',
                    course: { title: 'Lập trình Pascal lớp 11', instructor: { fullName: 'Thầy Tin Học' } },
                    enrollmentCount: 20
                },
            ];
            setClasses(mockClasses);
        } catch (error) {
            console.error("Lỗi tải classes:", error);
        }
    };

    // Fetch Class Enrollments (students in a class)
    const fetchClassEnrollments = async (classId) => {
        setLoadingEnrollments(true);
        try {
            // Backend cần endpoint: GET /api/admin/classes/{classId}/enrollments
            // Giả lập dữ liệu
            const mockEnrollments = [
                { enrollmentId: 1, student: { fullName: 'Phạm Võ Khải Anh', username: 'student', email: 'student@gmail.com' }, progressPercent: 75.5 },
                { enrollmentId: 2, student: { fullName: 'Nguyễn Văn A', username: 'nguyenvana', email: 'nguyenvana@gmail.com' }, progressPercent: 60.0 },
                { enrollmentId: 3, student: { fullName: 'Trần Thị B', username: 'tranthib', email: 'tranthib@gmail.com' }, progressPercent: 85.3 },
                { enrollmentId: 4, student: { fullName: 'Lê Văn C', username: 'levanc', email: 'levanc@gmail.com' }, progressPercent: 45.8 },
                { enrollmentId: 5, student: { fullName: 'Hoàng Thị D', username: 'hoangthid', email: 'hoangthid@gmail.com' }, progressPercent: 92.1 },
            ];
            setClassEnrollments(mockEnrollments);
        } catch (error) {
            toast.error("Không thể tải danh sách học sinh!");
        } finally {
            setLoadingEnrollments(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchStats();
            await fetchUsersByRole('TEACHER');
            await fetchUsersByRole('STUDENT');
            await fetchAllCourses();
            await fetchAllClasses();
            setLoading(false);
        };
        loadData();
    }, []);

    // ========== USER MANAGEMENT FUNCTIONS ==========
    
    const handleOpenUserModal = (user = null, role = 'TEACHER') => {
        if (user) {
            setIsEditingUser(true);
            setCurrentUserId(user.userId);
            setUserFormData({
                username: user.username,
                password: '',
                fullName: user.fullName,
                email: user.email || '',
                roleName: user.roleName
            });
        } else {
            setIsEditingUser(false);
            setCurrentUserId(null);
            setUserFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
                roleName: role
            });
        }
        setShowUserModal(true);
    };

    const handleSubmitUser = async () => {
        if (!userFormData.username || !userFormData.fullName) {
            toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        if (!isEditingUser && !userFormData.password) {
            toast.warning("Vui lòng nhập mật khẩu!");
            return;
        }

        try {
            if (isEditingUser) {
                await axiosClient.put(`/admin/users/${currentUserId}`, userFormData);
                toast.success("Cập nhật người dùng thành công!");
            } else {
                await axiosClient.post('/admin/users', userFormData);
                toast.success("Tạo người dùng thành công!");
            }
            setShowUserModal(false);
            await fetchUsersByRole('TEACHER');
            await fetchUsersByRole('STUDENT');
            await fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${username}"?`)) {
            try {
                await axiosClient.delete(`/admin/users/${userId}`);
                toast.success("Đã xóa tài khoản!");
                await fetchUsersByRole('TEACHER');
                await fetchUsersByRole('STUDENT');
                await fetchStats();
            } catch (error) {
                toast.error(error.response?.data?.message || "Không thể xóa tài khoản!");
            }
        }
    };

    // ========== CLASS DETAIL FUNCTIONS ==========
    
    const handleViewClassDetail = async (classData) => {
        setSelectedClass(classData);
        setShowClassDetailModal(true);
        await fetchClassEnrollments(classData.classId);
    };

    // ========== UTILITY FUNCTIONS ==========
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Filter functions
    const filterUsers = (userList) => {
        if (!searchTerm) return userList;
        return userList.filter(user => 
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filterCourses = () => {
        if (!searchTerm) return courses;
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructor && course.instructor.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filterClasses = () => {
        if (!searchTerm) return classes;
        return classes.filter(cls =>
            cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.enrollmentKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {/* Header */}
            <div style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <Container>
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center">
                            <PersonFillGear size={32} className="text-primary me-2" />
                            <div>
                                <h4 className="mb-0 fw-bold text-primary">Admin Control Panel</h4>
                                <small className="text-muted">Quản lý toàn bộ hệ thống</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/profile')}>
                                <PersonCircle className="me-2" />
                                Hồ sơ
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                                <BoxArrowRight className="me-2" />
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {/* Statistics Cards */}
                <Row className="mb-4 g-3">
                    <Col md={3}>
                        <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Card.Body className="text-white text-center">
                                <PersonWorkspace size={40} className="mb-2" />
                                <h2 className="fw-bold mb-1">{stats?.totalTeachers || 0}</h2>
                                <p className="mb-0 opacity-75">Giáo viên</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <Card.Body className="text-white text-center">
                                <PeopleFill size={40} className="mb-2" />
                                <h2 className="fw-bold mb-1">{stats?.totalStudents || 0}</h2>
                                <p className="mb-0 opacity-75">Học sinh</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <Card.Body className="text-white text-center">
                                <BookFill size={40} className="mb-2" />
                                <h2 className="fw-bold mb-1">{stats?.totalCourses || 0}</h2>
                                <p className="mb-0 opacity-75">Môn học</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                            <Card.Body className="text-white text-center">
                                <HouseDoorFill size={40} className="mb-2" />
                                <h2 className="fw-bold mb-1">{stats?.totalClasses || 0}</h2>
                                <p className="mb-0 opacity-75">Lớp học</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Main Content Tabs */}
                <Card className="shadow border-0">
                    <Card.Body>
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => {
                                setActiveTab(k);
                                setSearchTerm(''); // Reset search when changing tabs
                            }}
                            className="mb-3"
                        >
                            {/* Overview Tab */}
                            <Tab eventKey="overview" title={<span><GraphUpArrow className="me-2" />Tổng quan</span>}>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Card className="h-100 border-0 shadow-sm">
                                            <Card.Header className="bg-primary text-white">
                                                <PersonWorkspace className="me-2" />
                                                <strong>Giáo viên gần đây</strong>
                                            </Card.Header>
                                            <Card.Body>
                                                <ListGroup variant="flush">
                                                    {teachers.slice(0, 5).map(teacher => (
                                                        <ListGroup.Item key={teacher.userId} className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <strong>{teacher.fullName}</strong>
                                                                <br />
                                                                <small className="text-muted">@{teacher.username}</small>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                                {teachers.length === 0 && (
                                                    <Alert variant="info" className="mb-0">Chưa có giáo viên nào</Alert>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="h-100 border-0 shadow-sm">
                                            <Card.Header className="bg-info text-white">
                                                <BookFill className="me-2" />
                                                <strong>Môn học phổ biến</strong>
                                            </Card.Header>
                                            <Card.Body>
                                                <ListGroup variant="flush">
                                                    {courses.slice(0, 5).map(course => (
                                                        <ListGroup.Item key={course.courseId} className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <strong>{course.title}</strong>
                                                                <br />
                                                                <small className="text-muted">{course.instructor?.fullName}</small>
                                                            </div>
                                                            <Badge bg="secondary">{course.totalClasses || 0} lớp</Badge>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                                {courses.length === 0 && (
                                                    <Alert variant="info" className="mb-0">Chưa có môn học nào</Alert>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab>

                            {/* Teachers Tab */}
                            <Tab eventKey="teachers" title={<span><PersonWorkspace className="me-2" />Giáo viên ({teachers.length})</span>}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <InputGroup style={{ maxWidth: '400px' }}>
                                        <InputGroup.Text><Search /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Tìm kiếm giáo viên..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                    <Button variant="primary" onClick={() => handleOpenUserModal(null, 'TEACHER')}>
                                        <PlusCircle className="me-2" />
                                        Thêm Giáo viên
                                    </Button>
                                </div>
                                {filterUsers(teachers).length === 0 ? (
                                    <Alert variant="info">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có giáo viên nào trong hệ thống.'}
                                    </Alert>
                                ) : (
                                    <div className="table-responsive">
                                        <Table striped hover>
                                            <thead className="table-primary">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tên đăng nhập</th>
                                                    <th>Họ và tên</th>
                                                    <th>Email</th>
                                                    <th className="text-center">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterUsers(teachers).map(teacher => (
                                                    <tr key={teacher.userId}>
                                                        <td>{teacher.userId}</td>
                                                        <td><strong>{teacher.username}</strong></td>
                                                        <td>{teacher.fullName}</td>
                                                        <td>{teacher.email || <span className="text-muted fst-italic">Chưa cập nhật</span>}</td>
                                                        <td className="text-center">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handleOpenUserModal(teacher)}
                                                            >
                                                                <PencilSquare />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteUser(teacher.userId, teacher.username)}
                                                            >
                                                                <Trash3Fill />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Tab>

                            {/* Students Tab */}
                            <Tab eventKey="students" title={<span><PeopleFill className="me-2" />Học sinh ({students.length})</span>}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <InputGroup style={{ maxWidth: '400px' }}>
                                        <InputGroup.Text><Search /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Tìm kiếm học sinh..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                    <Button variant="primary" onClick={() => handleOpenUserModal(null, 'STUDENT')}>
                                        <PlusCircle className="me-2" />
                                        Thêm Học sinh
                                    </Button>
                                </div>
                                {filterUsers(students).length === 0 ? (
                                    <Alert variant="info">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có học sinh nào trong hệ thống.'}
                                    </Alert>
                                ) : (
                                    <div className="table-responsive">
                                        <Table striped hover>
                                            <thead className="table-info">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tên đăng nhập</th>
                                                    <th>Họ và tên</th>
                                                    <th>Email</th>
                                                    <th className="text-center">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterUsers(students).map(student => (
                                                    <tr key={student.userId}>
                                                        <td>{student.userId}</td>
                                                        <td><strong>{student.username}</strong></td>
                                                        <td>{student.fullName}</td>
                                                        <td>{student.email || <span className="text-muted fst-italic">Chưa cập nhật</span>}</td>
                                                        <td className="text-center">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handleOpenUserModal(student)}
                                                            >
                                                                <PencilSquare />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteUser(student.userId, student.username)}
                                                            >
                                                                <Trash3Fill />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Tab>

                            {/* Courses Tab */}
                            <Tab eventKey="courses" title={<span><BookFill className="me-2" />Môn học ({courses.length})</span>}>
                                <div className="mb-3">
                                    <InputGroup style={{ maxWidth: '400px' }}>
                                        <InputGroup.Text><Search /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Tìm kiếm môn học..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                {filterCourses().length === 0 ? (
                                    <Alert variant="info">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có môn học nào trong hệ thống.'}
                                    </Alert>
                                ) : (
                                    <Row className="g-3">
                                        {filterCourses().map(course => (
                                            <Col md={6} lg={4} key={course.courseId}>
                                                <Card className="h-100 shadow-sm border-0" style={{ transition: 'transform 0.2s' }}>
                                                    <Card.Img 
                                                        variant="top" 
                                                        src={course.imageUrl} 
                                                        style={{ height: '180px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image' }}
                                                    />
                                                    <Card.Body>
                                                        <Card.Title className="fw-bold text-primary">{course.title}</Card.Title>
                                                        <Card.Text>
                                                            <small className="text-muted">
                                                                <PersonBadgeFill className="me-1" />
                                                                {course.instructor?.fullName || 'Chưa có giáo viên'}
                                                            </small>
                                                        </Card.Text>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <Badge bg="secondary">{course.totalClasses || course.classes?.length || 0} lớp học</Badge>
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                onClick={() => toast.info('Chức năng xem chi tiết môn học')}
                                                            >
                                                                <InfoCircleFill className="me-1" />
                                                                Chi tiết
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </Tab>

                            {/* Classes Tab */}
                            <Tab eventKey="classes" title={<span><HouseDoorFill className="me-2" />Lớp học ({classes.length})</span>}>
                                <div className="mb-3">
                                    <InputGroup style={{ maxWidth: '400px' }}>
                                        <InputGroup.Text><Search /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Tìm kiếm lớp học..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                {filterClasses().length === 0 ? (
                                    <Alert variant="info">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có lớp học nào trong hệ thống.'}
                                    </Alert>
                                ) : (
                                    <div className="table-responsive">
                                        <Table striped hover>
                                            <thead className="table-success">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Tên lớp</th>
                                                    <th>Môn học</th>
                                                    <th>Giáo viên</th>
                                                    <th>Mã tham gia</th>
                                                    <th className="text-center">Số học sinh</th>
                                                    <th className="text-center">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterClasses().map(cls => (
                                                    <tr key={cls.classId}>
                                                        <td>{cls.classId}</td>
                                                        <td><strong>{cls.className}</strong></td>
                                                        <td>{cls.course.title}</td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {cls.course.instructor?.fullName}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <Badge bg="dark">
                                                                <KeyFill className="me-1" />
                                                                {cls.enrollmentKey}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge bg="info" style={{ fontSize: '1rem' }}>
                                                                {cls.enrollmentCount || 0}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleViewClassDetail(cls)}
                                                            >
                                                                <EyeFill className="me-1" />
                                                                Xem chi tiết
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>

            {/* User Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditingUser ? 'Chỉnh sửa người dùng' : `Tạo ${userFormData.roleName === 'TEACHER' ? 'Giáo viên' : 'Học sinh'} mới`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={userFormData.username}
                                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                                disabled={isEditingUser}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Mật khẩu {!isEditingUser && <span className="text-danger">*</span>}
                            </Form.Label>
                            <Form.Control
                                type="password"
                                placeholder={isEditingUser ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu"}
                                value={userFormData.password}
                                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                            />
                            {isEditingUser && <Form.Text className="text-muted">Chỉ nhập nếu muốn thay đổi mật khẩu</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập họ và tên"
                                value={userFormData.fullName}
                                onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email (tùy chọn)"
                                value={userFormData.email}
                                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                            />
                            <Form.Text className="text-muted">Có thể để trống</Form.Text>
                        </Form.Group>

                        {!isEditingUser && (
                            <Form.Group className="mb-3">
                                <Form.Label>Vai trò</Form.Label>
                                <Form.Select
                                    value={userFormData.roleName}
                                    onChange={(e) => setUserFormData({ ...userFormData, roleName: e.target.value })}
                                >
                                    <option value="TEACHER">Giáo viên</option>
                                    <option value="STUDENT">Học sinh</option>
                                </Form.Select>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSubmitUser}>
                        {isEditingUser ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Class Detail Modal */}
            <Modal show={showClassDetailModal} onHide={() => setShowClassDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <HouseDoorFill className="me-2" />
                        Chi tiết lớp: {selectedClass?.className} - {selectedClass?.course.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedClass && (
                        <>
                            <Card className="mb-3 border-0 bg-light">
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <p className="mb-2">
                                                <strong>Môn học:</strong> {selectedClass.course.title}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Giáo viên:</strong> {selectedClass.course.instructor?.fullName}
                                            </p>
                                        </Col>
                                        <Col md={6}>
                                            <p className="mb-2">
                                                <strong>Mã tham gia:</strong>{' '}
                                                <Badge bg="dark">{selectedClass.enrollmentKey}</Badge>
                                            </p>
                                            <p className="mb-2">
                                                <strong>Tổng học sinh:</strong>{' '}
                                                <Badge bg="info">{selectedClass.enrollmentCount || 0}</Badge>
                                            </p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <h6 className="mb-3">
                                <ClipboardCheckFill className="me-2" />
                                Danh sách học sinh
                            </h6>

                            {loadingEnrollments ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" />
                                    <p className="mt-2 text-muted">Đang tải...</p>
                                </div>
                            ) : classEnrollments.length === 0 ? (
                                <Alert variant="info">Chưa có học sinh nào trong lớp này.</Alert>
                            ) : (
                                <div className="table-responsive">
                                    <Table striped hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Học sinh</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Tiến độ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classEnrollments.map(enrollment => (
                                                <tr key={enrollment.enrollmentId}>
                                                    <td>{enrollment.enrollmentId}</td>
                                                    <td><strong>{enrollment.student.fullName}</strong></td>
                                                    <td>@{enrollment.student.username}</td>
                                                    <td>{enrollment.student.email || <span className="text-muted">N/A</span>}</td>
                                                    <td>
                                                        <Badge bg={enrollment.progressPercent >= 70 ? 'success' : enrollment.progressPercent >= 40 ? 'warning' : 'danger'}>
                                                            {enrollment.progressPercent.toFixed(1)}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClassDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
