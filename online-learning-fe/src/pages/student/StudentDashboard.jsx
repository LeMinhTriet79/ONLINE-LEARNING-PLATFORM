import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Badge, InputGroup, ProgressBar } from 'react-bootstrap';
import { JournalBookmarkFill, BoxArrowRight, UnlockFill, PlayCircle, CheckCircleFill, Search, PersonCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]); // Danh sách tất cả môn (Catalog)
    const [myProgressMap, setMyProgressMap] = useState({}); // Lưu tiến độ: { courseId: 50.5 }
    const [myEnrolledIds, setMyEnrolledIds] = useState([]); // Lưu ID các môn đã học
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State Modal nhập Key
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollmentKey, setEnrollmentKey] = useState('');

    // 1. Load dữ liệu
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resAll, resMy] = await Promise.all([
                axiosClient.get('/student/all-courses'), // Lấy tất cả môn
                axiosClient.get('/student/my-courses')   // Lấy danh sách Enrollment (chứa %)
            ]);

            if (resAll.data.status) setAllCourses(resAll.data.data);
            
            if (resMy.data.status) {
                // Xử lý dữ liệu Enrollment trả về
                const enrollments = resMy.data.data;
                
                // 1. Lấy danh sách ID đã học
                const ids = enrollments.map(e => e.course.courseId);
                setMyEnrolledIds(ids);

                // 2. Map tiến độ vào object để dễ tra cứu { 101: 45.5, 102: 80.0 }
                const progress = {};
                enrollments.forEach(e => {
                    progress[e.course.courseId] = e.progressPercent;
                });
                setMyProgressMap(progress);
            }
        } catch (error) { 
            console.error("Lỗi tải dữ liệu");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. Mở Modal tham gia
    const handleOpenJoinModal = (course) => {
        setSelectedCourse(course);
        setEnrollmentKey('');
        setShowJoinModal(true);
    };

    // 3. Xử lý Enroll
    const handleJoinSubmit = async () => {
        if (!enrollmentKey) { toast.warning("Vui lòng nhập mã môn học!"); return; }
        try {
            const res = await axiosClient.post(`/student/courses/${selectedCourse.courseId}/enroll?key=${enrollmentKey}`);
            if (res.data.status) {
                toast.success(`Chào mừng bạn đến với môn ${selectedCourse.title}!`);
                setShowJoinModal(false);
                fetchData(); // Load lại để cập nhật trạng thái
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Mã môn học không đúng!");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Filter tìm kiếm
    const filteredCourses = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h2 className="text-primary"><JournalBookmarkFill className="me-2" /> Góc Học Tập</h2>

                <Button variant="outline-primary" className="me-2" onClick={() => navigate('/profile')}>
                        <PersonCircle className="me-1"/> Hồ Sơ
                    </Button>

                <Button variant="outline-danger" onClick={handleLogout}>
                    <BoxArrowRight /> Đăng xuất
                </Button>
            </div>

            <Row className="mb-4 justify-content-center">
                <Col md={8}>
                    <InputGroup size="lg">
                        <InputGroup.Text className="bg-white text-primary border-end-0"><Search /></InputGroup.Text>
                        <Form.Control 
                            placeholder="Tìm kiếm môn học..." 
                            className="border-start-0 ps-0 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            {loading && <div className="text-center"><Spinner animation="border" variant="primary"/></div>}

            {!loading && (
                <Row>
                    {filteredCourses.length === 0 ? (
                        <div className="text-center text-muted mt-5"><h4>Không tìm thấy môn học nào.</h4></div>
                    ) : (
                        filteredCourses.map((course) => {
                            const isEnrolled = myEnrolledIds.includes(course.courseId);
                            const progress = myProgressMap[course.courseId] || 0; // Lấy % tiến độ

                            return (
                                <Col md={4} key={course.courseId} className="mb-4">
                                    <Card className={`h-100 shadow-sm border-0 hover-card ${isEnrolled ? 'border-success' : ''}`}>
                                        <div style={{ height: '180px', position: 'relative' }}>
                                            <Card.Img 
                                                variant="top" 
                                                src={course.imageUrl || "https://via.placeholder.com/400x200?text=Subject"} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                            {isEnrolled && (
                                                <Badge bg="success" className="position-absolute top-0 end-0 m-2 p-2 shadow">
                                                    <CheckCircleFill className="me-1"/> Đã Tham Gia
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="fw-bold text-dark text-truncate" title={course.title}>
                                                {course.title}
                                            </Card.Title>
                                            
                                            {/* HIỂN THỊ TIẾN ĐỘ NẾU ĐÃ HỌC */}
                                            {isEnrolled && (
                                                <div className="mb-2">
                                                    <div className="d-flex justify-content-between small mb-1 text-muted">
                                                        <span>Tiến độ hoàn thành</span>
                                                        <span className="fw-bold text-success">{Math.round(progress)}%</span>
                                                    </div>
                                                    <ProgressBar now={progress} variant="success" size="sm" style={{height: '6px'}} />
                                                </div>
                                            )}

                                            <Card.Text className="text-muted flex-grow-1 small text-truncate-2">
                                                {course.description || "Chưa có mô tả môn học."}
                                            </Card.Text>
                                            
                                            <div className="mt-3 pt-3 border-top">
                                                {isEnrolled ? (
                                                    <Button variant="success" className="w-100 fw-bold" onClick={() => navigate(`/student/courses/${course.courseId}`)}>
                                                        <PlayCircle className="me-2"/> Vào Học Ngay
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline-primary" className="w-100 fw-bold" onClick={() => handleOpenJoinModal(course)}>
                                                        <UnlockFill className="me-2"/> Tham Gia Môn Học
                                                    </Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="bg-white text-muted small">
                                            Giảng viên: <strong>{course.instructor?.fullName || "Teacher"}</strong>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
            )}

            <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Tham Gia: {selectedCourse?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label className="fw-bold">Nhập Mã Môn Học (Enrollment Key)</Form.Label>
                            <Form.Text className="text-muted d-block mb-2">
                                Liên hệ giáo viên <strong>{selectedCourse?.instructor?.fullName}</strong> để lấy mã.
                            </Form.Text>
                            <Form.Control 
                                size="lg" type="text" placeholder="Ví dụ: JAVA_K18..." 
                                value={enrollmentKey}
                                onChange={(e) => setEnrollmentKey(e.target.value.toUpperCase())}
                                autoFocus className="text-center fw-bold text-primary letter-spacing-2"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowJoinModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleJoinSubmit}>Xác Nhận Tham Gia</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default StudentDashboard;