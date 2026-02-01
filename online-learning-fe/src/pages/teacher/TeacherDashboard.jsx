import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { PlusCircle, JournalBookmarkFill, BoxArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // State cho form tạo khóa học
    const [newCourse, setNewCourse] = useState({ title: '', description: '' });
    
    const navigate = useNavigate();

    // 1. Hàm lấy danh sách khóa học từ Backend
    const fetchCourses = async () => {
        try {
            const res = await axiosClient.get('/teacher/my-courses');
            if (res.data.status) {
                setCourses(res.data.data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách khóa học");
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi vừa vào trang
    useEffect(() => {
        fetchCourses();
    }, []);

    // 2. Hàm xử lý Đăng xuất
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // 3. Hàm tạo khóa học mới
    const handleCreateCourse = async () => {
        if (!newCourse.title || !newCourse.description) {
            toast.warning("Vui lòng nhập đủ thông tin!");
            return;
        }
        try {
            const res = await axiosClient.post('/teacher/courses', newCourse);
            if (res.data.status) {
                toast.success("Tạo khóa học thành công!");
                setShowModal(false); // Đóng modal
                setNewCourse({ title: '', description: '' }); // Reset form
                fetchCourses(); // Load lại danh sách ngay lập tức
            }
        } catch (error) {
            toast.error("Lỗi khi tạo khóa học");
        }
    };

    return (
        <Container className="py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h2><JournalBookmarkFill className="me-2" /> Quản Lý Khóa Học</h2>
                <div>
                    <Button variant="success" className="me-2" onClick={() => setShowModal(true)}>
                        <PlusCircle className="me-1" /> Tạo Khóa Học Mới
                    </Button>
                    <Button variant="outline-danger" onClick={handleLogout}>
                        <BoxArrowRight /> Đăng xuất
                    </Button>
                </div>
            </div>

            {/* Danh sách khóa học (Grid View) */}
            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Row>
                    {courses.length === 0 ? (
                        <p className="text-center text-muted">Bạn chưa có khóa học nào. Hãy tạo mới!</p>
                    ) : (
                        courses.map((course) => (
                            <Col md={4} key={course.courseId} className="mb-4">
                                <Card className="h-100 shadow-sm hover-effect">
                                    <Card.Body>
                                        <Card.Title>{course.title}</Card.Title>
                                        <Card.Text className="text-muted text-truncate">
                                            {course.description}
                                        </Card.Text>
                                        <Button 
                                            variant="primary" 
                                            className="w-100 mt-2"
                                            onClick={() => navigate(`/teacher/courses/${course.courseId}`)}
                                        >
                                            Vào Soạn Bài
                                        </Button>
                                    </Card.Body>
                                    <Card.Footer className="text-muted small">
                                        Giảng viên: {course.instructor?.fullName}
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            )}

            {/* Modal Tạo Khóa Học (Popup) */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo Khóa Học Mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên khóa học</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ví dụ: Toán 10 - Đại số" 
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả ngắn</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="Mô tả nội dung khóa học..." 
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleCreateCourse}>Lưu Khóa Học</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TeacherDashboard;