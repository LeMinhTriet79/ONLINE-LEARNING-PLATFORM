import React, { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { JournalBookmarkFill, BoxArrowRight, UnlockFill, PlayCircle, CheckCircleFill, Search, PersonCircle, GridFill, BookmarkCheckFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]);
    const [myProgressMap, setMyProgressMap] = useState({});
    const [myEnrolledIds, setMyEnrolledIds] = useState([]);
    const [activeTab, setActiveTab] = useState('mine');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollmentKey, setEnrollmentKey] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resAll, resMy] = await Promise.all([
                axiosClient.get('/student/all-courses'),
                axiosClient.get('/student/my-courses')
            ]);

            if (resAll.data.status) setAllCourses(resAll.data.data);

            if (resMy.data.status) {
                const enrollments = resMy.data.data;
                const ids = enrollments.map(e => e.classRoom?.course?.courseId).filter(id => id != null);
                setMyEnrolledIds(ids);

                const progress = {};
                enrollments.forEach(e => {
                    if (e.classRoom && e.classRoom.course) {
                        progress[e.classRoom.course.courseId] = e.progressPercent;
                    }
                });
                setMyProgressMap(progress);
            }
        } catch (error) {
            toast.error('Không thể tải dữ liệu môn học.');
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentProfile = async () => {
        try {
            const res = await axiosClient.get('/user/profile');
            if (res.data.status) setStudent(res.data.data);
        } catch (error) {
            console.error('Lỗi tải profile:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchStudentProfile();
    }, []);

    const handleOpenJoinModal = (course) => {
        setSelectedCourse(course);
        setEnrollmentKey('');
        setShowJoinModal(true);
    };

    const handleJoinSubmit = async () => {
        if (!selectedCourse) return;
        if (!enrollmentKey) {
            toast.warning('Vui lòng nhập mã lớp học!');
            return;
        }

        try {
            const res = await axiosClient.post(`/student/courses/${selectedCourse.courseId}/enroll?key=${enrollmentKey}`);
            if (res.data.status) {
                toast.success(`Chào mừng bạn đến với môn ${selectedCourse.title}!`);
                setShowJoinModal(false);
                fetchData();
                setActiveTab('mine');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã tham gia không đúng hoặc lớp không tồn tại!');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const myCourses = useMemo(
        () => allCourses.filter(course => myEnrolledIds.includes(course.courseId)),
        [allCourses, myEnrolledIds]
    );

    const displayedCourses = useMemo(() => {
        const source = activeTab === 'mine' ? myCourses : allCourses;
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return source;

        return source.filter(course => {
            const title = (course.title || '').toLowerCase();
            const teacher = (course.instructor?.fullName || '').toLowerCase();
            return title.includes(keyword) || teacher.includes(keyword);
        });
    }, [activeTab, myCourses, allCourses, searchTerm]);

    const averageProgress = useMemo(() => {
        if (!myCourses.length) return 0;
        const total = myCourses.reduce((sum, course) => sum + (myProgressMap[course.courseId] || 0), 0);
        return Math.round(total / myCourses.length);
    }, [myCourses, myProgressMap]);

    const renderProgressBlock = (progress) => (
        <div className="mb-3 p-3" style={{ background: '#ecfeff', borderRadius: '12px' }}>
            <div className="d-flex justify-content-between mb-2">
                <span className="small fw-semibold" style={{ color: '#0f766e' }}>Tiến độ hoàn thành</span>
                <span className="small fw-bold" style={{ color: '#0d9488' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: '#a5f3fc', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #14b8a6 0%, #0f766e 100%)',
                        borderRadius: '10px',
                        transition: 'width 0.4s ease'
                    }}
                />
            </div>
        </div>
    );

    const renderCourseCard = (course) => {
        const isEnrolled = myEnrolledIds.includes(course.courseId);
        const progress = myProgressMap[course.courseId] || 0;

        return (
            <Col lg={4} md={6} key={course.courseId} className="mb-4">
                <Card
                    className="h-100 border-0"
                    style={{
                        borderRadius: '18px',
                        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)',
                        overflow: 'hidden',
                        border: isEnrolled ? '2px solid #14b8a6' : '2px solid transparent',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 14px 32px rgba(15, 23, 42, 0.14)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 28px rgba(15, 23, 42, 0.08)';
                    }}
                >
                    <div style={{ height: '180px', position: 'relative' }}>
                        <Card.Img
                            variant="top"
                            src={course.imageUrl || 'https://via.placeholder.com/600x300?text=Course'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {isEnrolled && (
                            <Badge
                                className="position-absolute top-0 end-0 m-3"
                                style={{
                                    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    fontWeight: 600
                                }}
                            >
                                <CheckCircleFill className="me-1" /> Đã tham gia
                            </Badge>
                        )}
                    </div>

                    <Card.Body className="d-flex flex-column p-4">
                        <Card.Title className="fw-bold text-truncate mb-2" title={course.title} style={{ color: '#0f172a' }}>
                            {course.title}
                        </Card.Title>
                        <Card.Text className="text-muted mb-3" style={{ minHeight: '48px' }}>
                            {course.description || 'Chưa có mô tả môn học.'}
                        </Card.Text>

                        {isEnrolled && renderProgressBlock(progress)}

                        <div className="mt-auto">
                            {isEnrolled ? (
                                <Button
                                    className="w-100 fw-semibold border-0"
                                    onClick={() => navigate(`/student/courses/${course.courseId}`)}
                                    style={{
                                        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                                        borderRadius: '12px',
                                        padding: '11px'
                                    }}
                                >
                                    <PlayCircle className="me-2" size={18} /> Tiếp tục học
                                </Button>
                            ) : (
                                <Button
                                    className="w-100 fw-semibold"
                                    onClick={() => handleOpenJoinModal(course)}
                                    style={{
                                        background: 'transparent',
                                        color: '#0f766e',
                                        border: '2px solid #0f766e',
                                        borderRadius: '12px',
                                        padding: '11px'
                                    }}
                                >
                                    <UnlockFill className="me-2" size={18} /> Tham gia môn học
                                </Button>
                            )}
                        </div>
                    </Card.Body>

                    <Card.Footer className="bg-white border-0 px-4 pb-4 pt-0">
                        <small className="text-muted">
                            Giáo viên: <strong style={{ color: '#0f172a' }}>{course.instructor?.fullName || 'Chưa cập nhật'}</strong>
                        </small>
                    </Card.Footer>
                </Card>
            </Col>
        );
    };

    return (
        <Container fluid className="py-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Container>
                <div
                    className="d-flex justify-content-between align-items-center mb-4 p-4 flex-wrap gap-3"
                    style={{
                        background: 'linear-gradient(120deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%)',
                        borderRadius: '20px',
                        boxShadow: '0 12px 34px rgba(2, 6, 23, 0.35)'
                    }}
                >
                    <h2 className="text-white fw-bold m-0" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                        <JournalBookmarkFill className="me-2" size={28} />
                        Student Learning Hub
                    </h2>

                    <div className="d-flex align-items-center gap-3">
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
                                    e.currentTarget.style.transform = 'translateY(-1px)';
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
                                    <div className="text-white fw-bold" style={{ fontSize: '1rem', lineHeight: '1.2' }}>
                                        {student.fullName}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                        @{student.username}
                                    </div>
                                </div>
                            </div>
                        )}

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
                            <BoxArrowRight className="me-2" size={18} /> Đăng xuất
                        </Button>
                    </div>
                </div>

                <Row className="mb-4 g-3">
                    <Col md={4}>
                        <Card className="h-100 border-0" style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
                            <Card.Body>
                                <div className="text-muted small">Môn đã tham gia</div>
                                <div className="fw-bold fs-3" style={{ color: '#0f172a' }}>{myCourses.length}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0" style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
                            <Card.Body>
                                <div className="text-muted small">Tất cả môn học</div>
                                <div className="fw-bold fs-3" style={{ color: '#0f172a' }}>{allCourses.length}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0" style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
                            <Card.Body>
                                <div className="text-muted small">Tiến độ trung bình</div>
                                <div className="fw-bold fs-3" style={{ color: '#0d9488' }}>{averageProgress}%</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="mb-4 border-0" style={{ borderRadius: '16px', boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)' }}>
                    <Card.Body>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div className="d-flex gap-2">
                                <Button
                                    onClick={() => setActiveTab('mine')}
                                    className="fw-semibold border-0"
                                    style={{
                                        borderRadius: '10px',
                                        background: activeTab === 'mine'
                                            ? 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
                                            : '#e2e8f0',
                                        color: activeTab === 'mine' ? 'white' : '#0f172a',
                                        padding: '10px 16px'
                                    }}
                                >
                                    <BookmarkCheckFill className="me-2" /> Môn của tôi
                                </Button>
                                <Button
                                    onClick={() => setActiveTab('all')}
                                    className="fw-semibold border-0"
                                    style={{
                                        borderRadius: '10px',
                                        background: activeTab === 'all'
                                            ? 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
                                            : '#e2e8f0',
                                        color: activeTab === 'all' ? 'white' : '#0f172a',
                                        padding: '10px 16px'
                                    }}
                                >
                                    <GridFill className="me-2" /> Tất cả môn học
                                </Button>
                            </div>

                            <InputGroup style={{ maxWidth: '380px' }}>
                                <InputGroup.Text className="bg-white border-end-0">
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={activeTab === 'mine' ? 'Tìm trong môn của tôi...' : 'Tìm trong toàn bộ môn học...'}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </div>
                    </Card.Body>
                </Card>

                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: '#2563eb' }} />
                        <p className="mt-3 text-muted fw-semibold">Đang tải danh sách môn học...</p>
                    </div>
                )}

                {!loading && (
                    <>
                        {activeTab === 'mine' && myCourses.length === 0 && (
                            <Card className="border-0 mb-4" style={{ borderRadius: '16px', boxShadow: '0 8px 26px rgba(15, 23, 42, 0.08)' }}>
                                <Card.Body className="text-center py-5">
                                    <h4 className="fw-bold" style={{ color: '#0f172a' }}>Bạn chưa tham gia môn học nào</h4>
                                    <p className="text-muted mb-4">Mở tab Tất cả môn học để xem danh sách và nhập mã lớp để tham gia.</p>
                                    <Button
                                        onClick={() => setActiveTab('all')}
                                        className="fw-semibold border-0"
                                        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', borderRadius: '10px', padding: '10px 18px' }}
                                    >
                                        Đi đến Tất cả môn học
                                    </Button>
                                </Card.Body>
                            </Card>
                        )}

                        {displayedCourses.length === 0 ? (
                            <div className="text-center text-muted mt-5">
                                <Search size={60} style={{ opacity: 0.3 }} />
                                <h4 className="mt-3">Không tìm thấy môn học phù hợp</h4>
                                <p>Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        ) : (
                            <Row>
                                {displayedCourses.map(renderCourseCard)}
                            </Row>
                        )}
                    </>
                )}

                <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered>
                <Modal.Header closeButton className="border-0 text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', padding: '24px' }}>
                    <Modal.Title className="fw-bold" style={{ fontSize: '1.3rem' }}>
                        Tham gia: {selectedCourse?.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '32px', background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)' }}>
                    <Form>
                        <Form.Group>
                            <Form.Label className="fw-bold mb-2" style={{ color: '#1d4ed8', fontSize: '1rem' }}>
                                Nhập mã lớp học (Enrollment Key)
                            </Form.Label>
                            <Form.Text className="d-block mb-3" style={{ color: '#6b7280' }}>
                                Liên hệ giáo viên <strong style={{ color: '#1d4ed8' }}>{selectedCourse?.instructor?.fullName}</strong> để lấy mã lớp.
                            </Form.Text>
                            <Form.Control
                                size="lg"
                                type="text"
                                placeholder="Ví dụ: TOAN10_A1"
                                value={enrollmentKey}
                                onChange={(e) => setEnrollmentKey(e.target.value.toUpperCase())}
                                autoFocus
                                className="text-center fw-bold"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #1d4ed8',
                                    padding: '16px',
                                    fontSize: '1.2rem',
                                    color: '#1d4ed8',
                                    letterSpacing: '2px'
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ background: '#f8fafc', borderTop: '2px solid #dbeafe', padding: '20px 32px' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowJoinModal(false)}
                        style={{ borderRadius: '10px', padding: '10px 28px', fontWeight: '600' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleJoinSubmit}
                        className="text-white border-0"
                        style={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                            borderRadius: '10px',
                            padding: '10px 32px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                        }}
                    >
                        Xác nhận tham gia
                    </Button>
                </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
};

export default StudentDashboard;