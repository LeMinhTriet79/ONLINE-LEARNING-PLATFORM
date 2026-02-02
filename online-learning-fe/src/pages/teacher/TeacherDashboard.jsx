import React, { useEffect, useState, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, InputGroup, ProgressBar } from 'react-bootstrap';
import { PlusCircle, JournalBookmarkFill, BoxArrowRight, PencilSquare, Trash, CloudArrowUp, Image as ImageIcon } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Modal
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    // Form Data
    const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '' });

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const abortControllerRef = useRef(null);

    // 1. Fetch Courses
    const fetchCourses = async () => {
        try {
            const res = await axiosClient.get('/teacher/my-courses');
            if (res.data.status) setCourses(res.data.data);
        } catch (error) { toast.error("Lỗi tải danh sách"); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, []);

    // 2. Handle Upload Image (Tương tự LessonManager)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate ảnh
        if (!file.type.includes('image')) {
            toast.warning("Vui lòng chọn file hình ảnh!");
            return;
        }

        const data = new FormData();
        data.append("file", file);
        
        setUploading(true); 
        setUploadProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            const res = await axiosClient.post('/upload', data, {
                headers: { "Content-Type": "multipart/form-data" },
                signal: abortControllerRef.current.signal,
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
            });
            if (res.data.status) {
                setFormData(prev => ({ ...prev, imageUrl: res.data.data }));
                toast.success("Upload ảnh thành công!");
            }
        } catch (error) { 
            if(!axiosClient.isCancel(error)) toast.error("Lỗi upload ảnh"); 
        } finally { setUploading(false); }
    };

    // 3. Open Modal
    const handleOpenModal = (course = null) => {
        if (course) {
            setIsEditing(true);
            setCurrentId(course.courseId);
            setFormData({ 
                title: course.title, 
                description: course.description || '', 
                imageUrl: course.imageUrl || '' 
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({ title: '', description: '', imageUrl: '' });
        }
        setShowModal(true);
    };

    // 4. Submit
    const handleSubmit = async () => {
        if (!formData.title) { toast.warning("Nhập tên khóa học!"); return; }
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
        } catch (error) { toast.error("Có lỗi xảy ra!"); }
    };

    // 5. Delete
    const handleDelete = async (id) => {
        if (window.confirm("Xóa khóa học sẽ mất hết bài giảng bên trong!\nBạn chắc chắn chứ?")) {
            try {
                await axiosClient.delete(`/teacher/courses/${id}`);
                toast.success("Đã xóa khóa học!");
                fetchCourses();
            } catch (error) { toast.error("Lỗi xóa!"); }
        }
    };

    // 6. Navigation
    const handleGoToDetail = (courseId) => {
        if(courseId) navigate(`/teacher/courses/${courseId}`);
        else toast.error("Lỗi ID khóa học!");
    }

    return (
        <Container className="py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h2 className="text-primary"><JournalBookmarkFill className="me-2" /> Quản Lý Khóa Học</h2>
                <div>
                    <Button variant="success" className="me-2" onClick={() => handleOpenModal()}>
                        <PlusCircle className="me-1" /> Tạo Khóa Học Mới
                    </Button>
                    <Button variant="outline-danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>
                        <BoxArrowRight /> Đăng xuất
                    </Button>
                </div>
            </div>

            {/* Loading */}
            {loading && <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>}

            {/* Course Grid */}
            {!loading && courses.length === 0 ? (
                <div className="text-center mt-5 text-muted p-5 border border-dashed rounded bg-light">
                    <h4>Bạn chưa có khóa học nào.</h4>
                    <Button className="mt-2" onClick={() => handleOpenModal()}>Tạo ngay</Button>
                </div>
            ) : (
                <Row>
                    {courses.map((course) => (
                        <Col md={4} key={course.courseId} className="mb-4">
                            <Card className="h-100 shadow-sm border-0 hover-card overflow-hidden">
                                {/* HÌNH ẢNH KHÓA HỌC */}
                                <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#e9ecef' }} className="position-relative">
                                    <Card.Img 
                                        variant="top" 
                                        src={course.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="fw-bold text-dark text-truncate" title={course.title}>
                                        {course.title}
                                    </Card.Title>
                                    
                                    {/* ĐÃ BỎ BADGE ID Ở ĐÂY NHƯ YÊU CẦU */}
                                    
                                    <Card.Text className="text-muted flex-grow-1 small" style={{minHeight: '40px'}}>
                                        {course.description 
                                            ? (course.description.length > 80 ? course.description.substring(0, 80) + "..." : course.description) 
                                            : "Chưa có mô tả."}
                                    </Card.Text>
                                    
                                    <div className="mt-3 pt-3 border-top">
                                        <Button variant="primary" className="w-100 mb-2 fw-bold" onClick={() => handleGoToDetail(course.courseId)}>
                                            Vào Soạn Bài
                                        </Button>
                                        
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary" className="flex-grow-1" size="sm" onClick={() => handleOpenModal(course)}>
                                                <PencilSquare className="me-1"/> Sửa
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(course.courseId)}>
                                                <Trash />
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal Form */}
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
                        
                        {/* UPLOAD ẢNH */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Ảnh bìa khóa học</Form.Label>
                            <InputGroup className="mb-2">
                                <Form.Control value={formData.imageUrl || ''} readOnly placeholder="Link ảnh..." />
                                <label className="btn btn-primary">
                                    <CloudArrowUp/> Upload <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading}/>
                                </label>
                            </InputGroup>
                            {/* Preview Ảnh */}
                            {formData.imageUrl && (
                                <div className="mt-2 border rounded overflow-hidden" style={{height: '150px'}}>
                                    <img src={formData.imageUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                </div>
                            )}
                            {/* Thanh tiến trình */}
                            {uploading && <ProgressBar animated now={uploadProgress} className="mt-2" variant="success" label={`${uploadProgress}%`} />}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mô tả</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Giới thiệu ngắn về khóa học..." />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={uploading}>Hủy</Button>
                    <Button variant={isEditing ? "warning" : "success"} onClick={handleSubmit} disabled={uploading}>
                        {uploading ? 'Đang xử lý...' : 'Lưu Khóa Học'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TeacherDashboard;