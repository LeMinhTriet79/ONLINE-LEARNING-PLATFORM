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
    const [teacher, setTeacher] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    // ĐÃ XÓA enrollmentKey khỏi state mặc định
    const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '' });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchCourses = async () => {
        try {
            const res = await axiosClient.get('/teacher/my-courses');
            if (res.data.status) setCourses(res.data.data);
        } catch (error) { toast.error("Lỗi tải danh sách"); } 
        finally { setLoading(false); }
    };

    const fetchTeacherProfile = async () => {
        try {
            const res = await axiosClient.get('/user/profile');
            if (res.data.status) setTeacher(res.data.data);
        } catch (error) { console.error("Lỗi tải profile"); }
    };

    useEffect(() => { 
        fetchCourses();
        fetchTeacherProfile();
    }, []);

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

    const handleRemoveCoverImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setUploadProgress(0);
        toast.info("Đã xóa ảnh bìa đã chọn.");
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setIsEditing(true);
            setCurrentId(course.courseId);
            setFormData({ 
                title: course.title, 
                description: course.description || '', 
                imageUrl: course.imageUrl || ''
                // Đã xóa lấy enrollmentKey từ course
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            // Đã xóa tạo enrollmentKey ngẫu nhiên
            setFormData({ title: '', description: '', imageUrl: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        // Đã xóa điều kiện check enrollmentKey
        if (!formData.title) { 
            toast.warning("Vui lòng nhập tên môn học!"); return; 
        }
        try {
            if (isEditing) {
                await axiosClient.put(`/teacher/courses/${currentId}`, formData);
                toast.success("Cập nhật thành công!");
            } else {
                await axiosClient.post('/teacher/courses', formData);
                toast.success("Tạo môn học thành công!");
            }
            setShowModal(false);
            fetchCourses();
        } catch (error) { toast.error(error.response?.data?.message || "Có lỗi xảy ra!"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa môn học sẽ mất hết dữ liệu! Bạn chắc chứ?")) {
            try {
                await axiosClient.delete(`/teacher/courses/${id}`);
                toast.success("Đã xóa môn học!");
                fetchCourses();
            } catch (error) { toast.error("Lỗi xóa!"); }
        }
    };

    return (
        <Container fluid style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '32px'}}>
            <Container>
                {/* Header - Gradient design */}
                <div className="mb-4 p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'}}>
                    <div className="d-flex justify-content-between align-items-center">
                        {/* Left: Title */}
                        <h2 className="text-white fw-bold m-0" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                            <JournalBookmarkFill className="me-2" size={28}/> 🏛️ Quản Lý Môn Học
                        </h2>
                        
                        {/* Right: Teacher Info + Logout */}
                        <div className="d-flex align-items-center gap-3">
                            {/* Teacher Avatar + Name */}
                            {teacher && (
                                <div 
                                    className="d-flex align-items-center gap-3 px-3 py-2"
                                    onClick={() => navigate('/profile')}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        border: '2px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <div className="position-relative">
                                        {teacher.avatarUrl ? (
                                            <img 
                                                src={teacher.avatarUrl} 
                                                alt="Teacher Avatar"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '12px',
                                                    objectFit: 'cover',
                                                    border: '3px solid white',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '3px solid white',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                            }}>
                                                <PersonCircle size={32} style={{color: '#667eea'}} />
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            background: '#10b981',
                                            border: '3px solid white'
                                        }}></div>
                                    </div>
                                    <div>
                                        <div className="text-white fw-bold" style={{fontSize: '1rem', lineHeight: '1.2'}}>
                                            {teacher.fullName}
                                        </div>
                                        <div style={{fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)'}}>
                                            @{teacher.username}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Logout Button */}
                            <Button 
                                className="fw-semibold"
                                onClick={() => { localStorage.clear(); navigate('/login'); }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    padding: '10px 20px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.border = '2px solid #dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                                }}>
                                <BoxArrowRight className="me-2" size={18}/> Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Action Bar - Tạo Môn Học */}
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-bold mb-1" style={{color: '#1f2937'}}>
                            📚 Danh Sách Môn Học
                        </h5>
                        <p className="text-muted mb-0" style={{fontSize: '0.9rem'}}>
                            Quản lý và tổ chức các môn học của bạn
                        </p>
                    </div>
                    <Button 
                        className="fw-semibold text-white border-0"
                        onClick={() => handleOpenModal()}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '12px',
                            padding: '12px 28px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}>
                        <PlusCircle className="me-2" size={18}/> Tạo Môn Học Mới
                    </Button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{width: '3rem', height: '3rem', color: '#667eea'}}/>
                        <p className="mt-3 text-muted fw-semibold">Đang tải danh sách môn học...</p>
                    </div>
                )}

                {!loading && courses.length === 0 ? (
                    <div className="text-center p-5 bg-white" style={{borderRadius: '20px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'}}>
                        <div style={{fontSize: '4rem', marginBottom: '16px'}}>📚</div>
                        <h4 style={{color: '#6b7280', marginBottom: '16px'}}>Chưa có môn học nào</h4>
                        <Button 
                            className="fw-semibold text-white border-0"
                            onClick={() => handleOpenModal()}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '12px',
                                padding: '12px 32px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}>
                            <PlusCircle className="me-2" size={18}/> Tạo môn học đầu tiên
                        </Button>
                    </div>
                ) : (
                    <Row>
                        {courses.map((course) => (
                            <Col md={4} key={course.courseId} className="mb-4">
                                <Card 
                                    className="h-100 border-0"
                                    style={{
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                        transition: 'all 0.3s',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                                    }}>
                                    <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                                        <Card.Img 
                                            variant="top" 
                                            src={course.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                    <Card.Body className="d-flex flex-column p-4">
                                        <Card.Title className="fw-bold text-truncate mb-3" style={{color: '#1f2937', fontSize: '1.2rem'}}>
                                            {course.title}
                                        </Card.Title>
                                        
                                        {/* Đã xóa Badge hiển thị EnrollmentKey ở đây, vì Key giờ nằm ở lớp học (CourseDetail) */}
                                        
                                        <Card.Text className="text-muted flex-grow-1 mb-3" style={{fontSize: '0.9rem', lineHeight: '1.5'}}>
                                            {course.description || "Chưa có mô tả."}
                                        </Card.Text>
                                        <div className="mt-auto">
                                            <Button 
                                                className="w-100 mb-2 fw-semibold text-white border-0"
                                                onClick={() => navigate(`/teacher/courses/${course.courseId}`)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                }}>
                                                📝 Vào Soạn Bài / Quản lý lớp
                                            </Button>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="outline-secondary" 
                                                    className="flex-grow-1 fw-semibold" 
                                                    size="sm" 
                                                    onClick={() => handleOpenModal(course)}
                                                    style={{borderRadius: '10px', borderWidth: '2px', padding: '8px'}}>
                                                    <PencilSquare className="me-1" size={14}/> Sửa
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(course.courseId)}
                                                    style={{borderRadius: '10px', borderWidth: '2px', padding: '8px 12px'}}>
                                                    <Trash size={14}/>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Modal Tạo/Sửa Môn Học */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header 
                        closeButton 
                        className="border-0 text-white"
                        style={{
                            background: isEditing 
                                ? 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            padding: '24px'
                        }}>
                        <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                            {isEditing ? "✏️ Cập Nhật Môn Học" : "➕ Tạo Môn Học Mới"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                        <Form>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold mb-2" style={{color: '#667eea'}}>📝 Tên môn học</Form.Label>
                                <Form.Control 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    placeholder="VD: Lập trình Java..."
                                    size="lg"
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        padding: '12px 16px'
                                    }}
                                />
                            </Form.Group>
                            
                            {/* ĐÃ XÓA Ô NHẬP MÃ THAM GIA Ở ĐÂY VÌ NÓ THUỘC VỀ LỚP HỌC */}

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold mb-2" style={{color: '#667eea'}}>🖼️ Ảnh bìa</Form.Label>
                                <InputGroup size="lg" className="mb-2">
                                    <Form.Control 
                                        value={formData.imageUrl || ''} 
                                        readOnly 
                                        placeholder="Link ảnh..."
                                        style={{
                                            borderRadius: '12px 0 0 12px',
                                            border: '2px solid #e5e7eb',
                                            background: '#f9fafb'
                                        }}
                                    />
                                    <label 
                                        className="btn"
                                        style={{
                                            background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0 12px 12px 0',
                                            padding: '12px 24px',
                                            fontWeight: '600',
                                            cursor: uploading ? 'not-allowed' : 'pointer'
                                        }}>
                                        <CloudArrowUp className="me-2" size={18}/> Upload
                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading}/>
                                    </label>
                                </InputGroup>

                                {formData.imageUrl && (
                                    <div className="mb-2">
                                        <div style={{borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb', background: '#fff'}}>
                                            <img
                                                src={formData.imageUrl}
                                                alt="Ảnh bìa xem trước"
                                                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end mt-2">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={handleRemoveCoverImage}
                                                disabled={uploading}
                                                style={{borderRadius: '10px', borderWidth: '2px', fontWeight: '600'}}
                                            >
                                                <Trash className="me-1" size={14}/> Xóa ảnh đã chọn
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="mt-2">
                                        <div className="d-flex justify-content-between mb-2">
                                            <small className="fw-semibold" style={{color: '#667eea'}}>Đang tải lên...</small>
                                            <small className="fw-bold" style={{color: '#667eea'}}>{uploadProgress}%</small>
                                        </div>
                                        <div style={{background: '#e0e7ff', borderRadius: '10px', height: '10px', overflow: 'hidden'}}>
                                            <div style={{
                                                width: `${uploadProgress}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                transition: 'width 0.3s',
                                                borderRadius: '10px'
                                            }}></div>
                                        </div>
                                    </div>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold mb-2" style={{color: '#667eea'}}>📖 Mô tả</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={4} 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Nhập mô tả ngắn gọn về môn học..."
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        padding: '12px 16px',
                                        lineHeight: '1.6'
                                    }}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer style={{background: '#f9fafb', borderTop: '2px solid #e5e7eb', padding: '20px 32px'}}>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowModal(false)} 
                            disabled={uploading}
                            style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}>
                            Hủy
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={uploading}
                            className="text-white border-0 fw-semibold"
                            style={{
                                background: uploading ? '#9ca3af' : (isEditing 
                                    ? 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)'
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'),
                                borderRadius: '10px',
                                padding: '10px 32px',
                                boxShadow: isEditing ? '0 4px 12px rgba(251, 146, 60, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                                cursor: uploading ? 'not-allowed' : 'pointer'
                            }}>
                            {isEditing ? "✔️ Cập Nhật" : "💾 Lưu"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
};

export default TeacherDashboard;