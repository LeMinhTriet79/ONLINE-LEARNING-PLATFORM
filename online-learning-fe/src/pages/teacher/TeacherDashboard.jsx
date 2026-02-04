import React, { useEffect, useState, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, InputGroup, ProgressBar, Badge } from 'react-bootstrap';
// Thêm icon CheckCircle
import { PlusCircle, JournalBookmarkFill, BoxArrowRight, PencilSquare, Trash, CloudArrowUp, Key, CheckCircle, PersonCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', enrollmentKey: '' });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchCourses = async () => {
        try {
            const res = await axiosClient.get('/teacher/my-courses');
            if (res.data.status) setCourses(res.data.data);
        } catch (error) { toast.error("Lỗi tải danh sách"); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const data = new FormData();
        data.append("file", file);
        setUploading(true); 
        try {
            const res = await axiosClient.post('/upload', data, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
            });
            if (res.data.status) {
                setFormData(prev => ({ ...prev, imageUrl: res.data.data }));
                toast.success("Upload ảnh thành công!");
            }
        } catch (error) { toast.error("Lỗi upload ảnh"); } 
        finally { setUploading(false); }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setIsEditing(true);
            setCurrentId(course.courseId);
            setFormData({ 
                title: course.title, 
                description: course.description || '', 
                imageUrl: course.imageUrl || '',
                enrollmentKey: course.enrollmentKey || ''
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            const randomKey = "COURSE_" + Math.floor(1000 + Math.random() * 9000);
            setFormData({ title: '', description: '', imageUrl: '', enrollmentKey: randomKey });
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.enrollmentKey) { 
            toast.warning("Vui lòng nhập tên và mã tham gia!"); return; 
        }
        try {
            if (isEditing) {
                await axiosClient.put(`/teacher/courses/${currentId}`, formData);
                toast.success("Cập nhật thành công!");
            } else {
                await axiosClient.post('/teacher/courses', formData);
                toast.success("Tạo khóa học thành công!");
            }
            setShowModal(false);
            fetchCourses();
        } catch (error) { toast.error(error.response?.data?.message || "Có lỗi xảy ra!"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa khóa học sẽ mất hết dữ liệu! Bạn chắc chứ?")) {
            try {
                await axiosClient.delete(`/teacher/courses/${id}`);
                toast.success("Đã xóa khóa học!");
                fetchCourses();
            } catch (error) { toast.error("Lỗi xóa!"); }
        }
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h2 className="text-primary"><JournalBookmarkFill className="me-2" /> Quản Lý Khóa Học</h2>
                <div>
                    
                    <Button variant="outline-primary" className="me-2" onClick={() => navigate('/profile')}>
                        <PersonCircle className="me-1"/> Hồ Sơ
                    </Button>

                    <Button variant="success" className="me-2" onClick={() => handleOpenModal()}>
                        <PlusCircle className="me-1" /> Tạo Khóa Học Mới
                    </Button>
                    <Button variant="outline-danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>
                        <BoxArrowRight /> Đăng xuất
                    </Button>
                </div>
            </div>

            {loading && <div className="text-center"><Spinner animation="border" variant="primary"/></div>}

            {!loading && courses.length === 0 ? (
                <div className="text-center mt-5 text-muted p-5 border border-dashed rounded bg-light">
                    <h4>Chưa có khóa học nào.</h4>
                    <Button className="mt-2" onClick={() => handleOpenModal()}>Tạo ngay</Button>
                </div>
            ) : (
                <Row>
                    {courses.map((course) => (
                        <Col md={4} key={course.courseId} className="mb-4">
                            <Card className="h-100 shadow-sm border-0 hover-card overflow-hidden">
                                <div style={{ height: '160px', backgroundColor: '#e9ecef' }}>
                                    <Card.Img variant="top" src={course.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fw-bold text-dark text-truncate">{course.title}</Card.Title>
                                    <div className="mb-2">
                                        <Badge bg="info" className="p-2" style={{cursor: 'pointer'}} 
                                            onClick={() => {navigator.clipboard.writeText(course.enrollmentKey); toast.success("Đã copy mã!");}}
                                            title="Click để copy mã">
                                            <Key className="me-1"/> Mã: {course.enrollmentKey}
                                        </Badge>
                                    </div>
                                    <Card.Text className="text-muted flex-grow-1 small text-truncate-2">
                                        {course.description || "Chưa có mô tả."}
                                    </Card.Text>
                                    <div className="mt-3 pt-3 border-top">
                                        <Button variant="primary" className="w-100 mb-2 fw-bold" onClick={() => navigate(`/teacher/courses/${course.courseId}`)}>
                                            Vào Soạn Bài
                                        </Button>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary" className="flex-grow-1" size="sm" onClick={() => handleOpenModal(course)}><PencilSquare className="me-1"/> Sửa</Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(course.courseId)}><Trash /></Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className={isEditing ? "bg-warning" : "bg-success text-white"}>
                    <Modal.Title>{isEditing ? "Cập Nhật Khóa Học" : "Tạo Khóa Học Mới"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Tên khóa học</Form.Label>
                            <Form.Control value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Lập trình Java..." />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mã tham gia (Key)</Form.Label>
                            <Form.Control 
                                value={formData.enrollmentKey} 
                                onChange={e => setFormData({...formData, enrollmentKey: e.target.value.toUpperCase()})}
                                placeholder="VD: JAVA_K18" 
                                className="fw-bold text-primary"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Ảnh bìa</Form.Label>
                            <InputGroup className="mb-2">
                                <Form.Control value={formData.imageUrl || ''} readOnly placeholder="Link ảnh..." />
                                <label className="btn btn-primary"><CloudArrowUp/> Upload <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading}/></label>
                            </InputGroup>
                            {uploading && <ProgressBar animated now={uploadProgress} className="mt-2" variant="success" label={`${uploadProgress}%`} />}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mô tả</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={uploading}>Hủy</Button>
                    <Button variant={isEditing ? "warning" : "success"} onClick={handleSubmit} disabled={uploading}>Lưu</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TeacherDashboard;