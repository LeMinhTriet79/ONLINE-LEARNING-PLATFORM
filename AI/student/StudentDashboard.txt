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
    const [student, setStudent] = useState(null);
    
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

    const fetchStudentProfile = async () => {
        try {
            const res = await axiosClient.get('/user/profile');
            if (res.data.status) setStudent(res.data.data);
        } catch (error) { console.error("Lỗi tải profile"); }
    };

    useEffect(() => { 
        fetchData();
        fetchStudentProfile();
    }, []);

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
        <Container fluid className="py-4" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
            <Container>
                {/* Header - Gradient design */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-4"
                     style={{
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                         borderRadius: '20px',
                         boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                     }}>
                    <h2 className="text-white fw-bold m-0" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                        <JournalBookmarkFill className="me-2" size={28}/> 
                        📚 Góc Học Tập
                    </h2>

                    <div className="d-flex align-items-center gap-3">
                        {/* Student Avatar + Name */}
                        {student && (
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
                                    {student.avatarUrl ? (
                                        <img 
                                            src={student.avatarUrl} 
                                            alt="Student Avatar"
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
                                        {student.fullName}
                                    </div>
                                    <div style={{fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)'}}>
                                        @{student.username}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Logout Button */}
                        <Button 
                            className="fw-semibold"
                            onClick={handleLogout}
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

                {/* Search Bar - Modern design */}
                <Row className="mb-5 justify-content-center">
                    <Col md={8}>
                        <InputGroup size="lg" style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                            <InputGroup.Text 
                                className="bg-white border-0 ps-4"
                                style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                            >
                                <Search size={22} style={{color: '#667eea'}}/>
                            </InputGroup.Text>
                            <Form.Control 
                                placeholder="🔍 Tìm kiếm môn học..." 
                                className="border-0 ps-3 pe-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    fontSize: '1.05rem',
                                    padding: '14px'
                                }}
                            />
                        </InputGroup>
                    </Col>
                </Row>

                {/* Loading spinner */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{width: '3rem', height: '3rem', color: '#667eea'}}/>
                        <p className="mt-3 text-muted fw-semibold">Đang tải danh sách môn học...</p>
                    </div>
                )}

                {!loading && (
                    <Row>
                        {filteredCourses.length === 0 ? (
                            <div className="text-center text-muted mt-5">
                                <Search size={60} style={{opacity: 0.3}}/>
                                <h4 className="mt-3">Không tìm thấy môn học nào</h4>
                                <p>Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        ) : (
                            filteredCourses.map((course) => {
                                const isEnrolled = myEnrolledIds.includes(course.courseId);
                                const progress = myProgressMap[course.courseId] || 0;

                                return (
                                    <Col md={4} key={course.courseId} className="mb-4">
                                        <Card 
                                            className="h-100 border-0"
                                            style={{
                                                borderRadius: '20px',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                                transition: 'all 0.3s',
                                                overflow: 'hidden',
                                                border: isEnrolled ? '3px solid #10b981' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                                            }}
                                        >
                                            <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                                                <Card.Img 
                                                    variant="top" 
                                                    src={course.imageUrl || "https://via.placeholder.com/400x200?text=Subject"} 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover',
                                                        transition: 'transform 0.3s'
                                                    }} 
                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)' }
                                                />
                                                {isEnrolled && (
                                                    <Badge 
                                                        className="position-absolute top-0 end-0 m-3"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            padding: '8px 14px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                                                        }}>
                                                        <CheckCircleFill className="me-1"/> Đã Tham Gia
                                                    </Badge>
                                                )}
                                            </div>
                                        
                                            <Card.Body className="d-flex flex-column p-4">
                                                <Card.Title 
                                                    className="fw-bold text-truncate mb-3" 
                                                    title={course.title}
                                                    style={{color: '#1f2937', fontSize: '1.2rem'}}
                                                >
                                                    {course.title}
                                                </Card.Title>
                                                
                                                {/* Progress Bar - Hiện đại hơn */}
                                                {isEnrolled && (
                                                    <div className="mb-3 p-3" style={{background: '#f0fdf4', borderRadius: '12px'}}>
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span className="small fw-semibold" style={{color: '#059669'}}>Tiến độ hoàn thành</span>
                                                            <span className="small fw-bold" style={{color: '#10b981'}}>{Math.round(progress)}%</span>
                                                        </div>
                                                        <div style={{
                                                            background: '#d1fae5',
                                                            borderRadius: '10px',
                                                            height: '8px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${progress}%`,
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                                                transition: 'width 0.5s',
                                                                borderRadius: '10px'
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                )}

                                                <Card.Text className="text-muted flex-grow-1 mb-3" style={{fontSize: '0.9rem', lineHeight: '1.5'}}>
                                                    {course.description || "Chưa có mô tả môn học."}
                                                </Card.Text>
                                                
                                                <div className="mt-auto">
                                                    {isEnrolled ? (
                                                        <Button 
                                                            className="w-100 fw-semibold border-0 text-white" 
                                                            onClick={() => navigate(`/student/courses/${course.courseId}`)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                borderRadius: '12px',
                                                                padding: '12px',
                                                                fontSize: '1rem',
                                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                            }}
                                                        >
                                                            <PlayCircle className="me-2" size={18}/> Vào Học Ngay
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            className="w-100 fw-semibold" 
                                                            onClick={() => handleOpenJoinModal(course)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: '2px solid #667eea',
                                                                color: '#667eea',
                                                                borderRadius: '12px',
                                                                padding: '12px',
                                                                fontSize: '1rem',
                                                                transition: 'all 0.3s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = '#667eea';
                                                                e.target.style.color = 'white';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'transparent';
                                                                e.target.style.color = '#667eea';
                                                            }}
                                                        >
                                                            <UnlockFill className="me-2" size={18}/> Tham Gia Môn Học
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card.Body>
                                            <Card.Footer className="bg-white border-0 py-3 px-4" style={{borderTop: '1px solid #f3f4f6'}}>
                                                <small className="text-muted">
                                                    👨‍🏫 Giáo viên: <strong style={{color: '#667eea'}}>{course.instructor?.fullName || "Teacher"}</strong>
                                                </small>
                                            </Card.Footer>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
            )}

            {/* Modal Tham Gia - Redesign */}
            <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered>
                <Modal.Header closeButton className="border-0 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px'}}>
                    <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                        🔓 Tham Gia: {selectedCourse?.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)'}}>
                    <Form>
                        <Form.Group>
                            <Form.Label className="fw-bold mb-2" style={{color: '#667eea', fontSize: '1rem'}}>
                                🔑 Nhập Mã Môn Học (Enrollment Key)
                            </Form.Label>
                            <Form.Text className="d-block mb-3" style={{color: '#6b7280'}}>
                                Liên hệ giáo viên <strong style={{color: '#667eea'}}>{selectedCourse?.instructor?.fullName}</strong> để lấy mã tham gia.
                            </Form.Text>
                            <Form.Control 
                                size="lg" 
                                type="text" 
                                placeholder="Ví dụ: JAVA_K18..." 
                                value={enrollmentKey}
                                onChange={(e) => setEnrollmentKey(e.target.value.toUpperCase())}
                                autoFocus 
                                className="text-center fw-bold"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #667eea',
                                    padding: '16px',
                                    fontSize: '1.2rem',
                                    color: '#667eea',
                                    letterSpacing: '2px'
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{background: '#f5f7fa', borderTop: '2px solid #e0e7ff', padding: '20px 32px'}}>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowJoinModal(false)}
                        style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleJoinSubmit}
                        className="text-white border-0"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '10px',
                            padding: '10px 32px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        ✅ Xác Nhận Tham Gia
                    </Button>
                </Modal.Footer>
            </Modal>
            </Container>
        </Container>
    );
};

export default StudentDashboard;