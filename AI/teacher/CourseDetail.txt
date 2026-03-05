import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Container, Accordion, Button, Modal, Form, ListGroup, Badge, Tabs, Tab, Table, ProgressBar, Card } from 'react-bootstrap';
import { Plus, PencilSquare, JournalBookmarkFill, PlayBtn, FileEarmarkPdfFill, FileText, Trash, People, CheckCircle, FileEarmarkText, Pen, BoxArrowUpRight } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    
    // --- STATE QUẢN LÝ LỚP HỌC (TAB 2) ---
    const [students, setStudents] = useState([]);
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('content'); // 'content' or 'students'

    // --- STATE MODAL CHƯƠNG ---
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [isEditingChapter, setIsEditingChapter] = useState(false);
    const [currentChapterId, setCurrentChapterId] = useState(null);
    const [chapterTitle, setChapterTitle] = useState('');

    // --- STATE MODAL CHẤM BÀI ---
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [currentSub, setCurrentSub] = useState(null);
    const [score, setScore] = useState(8);
    const [feedback, setFeedback] = useState('Đã xem.');

    // --- 1. LOAD DỮ LIỆU ---
    const fetchCourseData = async () => {
        try {
            const res = await axiosClient.get('/teacher/my-courses');
            if (res.data.status) {
                const foundCourse = res.data.data.find(c => c.courseId == courseId);
                if (foundCourse) {
                    setCourse(foundCourse);
                    setChapters(foundCourse.chapters?.sort((a, b) => a.orderIndex - b.orderIndex) || []);
                }
            }
        } catch (error) { toast.error("Lỗi tải dữ liệu khóa học!"); }
    };

    const fetchClassData = async () => {
        try {
            const [resStudents, resPending] = await Promise.all([
                axiosClient.get(`/teacher/courses/${courseId}/students`),
                axiosClient.get(`/teacher/courses/${courseId}/submissions/pending`)
            ]);
            if (resStudents.data.status) setStudents(resStudents.data.data);
            if (resPending.data.status) setPendingSubmissions(resPending.data.data);
        } catch (error) { console.error("Lỗi tải dữ liệu lớp học"); }
    };

    useEffect(() => { 
        fetchCourseData(); 
        // Nếu đang ở tab quản lý lớp thì load dữ liệu lớp luôn
        if(activeTab === 'students') fetchClassData();
    }, [courseId, activeTab]);

    // --- LOGIC CHƯƠNG (GIỮ NGUYÊN) ---
    const handleOpenChapterModal = (chapter = null) => {
        if (chapter) {
            setIsEditingChapter(true);
            setCurrentChapterId(chapter.chapterId);
            setChapterTitle(chapter.title);
        } else {
            setIsEditingChapter(false);
            setCurrentChapterId(null);
            setChapterTitle('');
        }
        setShowChapterModal(true);
    };

    const handleSaveChapter = async () => {
        if (!chapterTitle) { toast.warning("Nhập tên chương!"); return; }
        try {
            if (isEditingChapter) {
                await axiosClient.put(`/teacher/chapters/${currentChapterId}`, { title: chapterTitle, orderIndex: 0 });
                toast.success("Cập nhật chương thành công!");
            } else {
                await axiosClient.post(`/teacher/courses/${courseId}/chapters`, { title: chapterTitle, orderIndex: chapters.length + 1 });
                toast.success("Thêm chương thành công!");
            }
            setShowChapterModal(false);
            fetchCourseData();
        } catch (error) { toast.error("Lỗi lưu chương!"); }
    };

    const handleDeleteChapter = async (id) => {
        if (window.confirm("CẢNH BÁO: Xóa chương sẽ xóa toàn bộ bài học bên trong!\nBạn có chắc chắn không?")) {
            try {
                await axiosClient.delete(`/teacher/chapters/${id}`);
                toast.success("Đã xóa chương!");
                fetchCourseData();
            } catch (error) { toast.error("Lỗi xóa chương!"); }
        }
    };

    const handleCreateLessonPlaceholder = async (chapterId) => {
        try {
            const res = await axiosClient.post(`/teacher/chapters/${chapterId}/lessons`, { 
                title: "Bài học mới (Chưa đặt tên)", contentText: "", videoUrl: "", attachmentUrl: "", orderIndex: 0 
            });
            if(res.data.status) {
                navigate(`/teacher/lessons/${res.data.data.lessonId}`);
            }
        } catch (error) { toast.error("Lỗi tạo bài học"); }
    };

    // --- LOGIC CHẤM BÀI (MỚI) ---
    const openGradeModal = (sub) => {
        setCurrentSub(sub);
        setScore(8);
        setFeedback('Bài làm tốt.');
        setShowGradeModal(true);
    };

    const handleGradeSubmit = async () => {
        try {
            await axiosClient.post(`/teacher/submissions/${currentSub.submissionId}/grade`, {
                score: parseFloat(score),
                feedback: feedback
            });
            toast.success("Đã chấm điểm thành công!");
            setShowGradeModal(false);
            fetchClassData(); // Reload lại list chờ chấm
        } catch (error) { toast.error("Lỗi chấm điểm!"); }
    };

    if (!course) return <div className="text-center mt-5">Đang tải...</div>;

    return (
        <Container fluid style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '32px'}}>
            <Container>
                {/* Back button */}
                <Button 
                    className="mb-4 fw-semibold"
                    onClick={() => navigate('/teacher/courses')}
                    style={{
                        background: 'white',
                        border: '2px solid #667eea',
                        color: '#667eea',
                        borderRadius: '12px',
                        padding: '10px 24px',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
                    }}>
                    &larr; Danh sách khóa học
                </Button>
                
                {/* Header gradient */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                    <h2 className="text-white fw-bold m-0" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                        <JournalBookmarkFill className="me-2" size={28}/>{course.title}
                    </h2>
                    <Badge 
                        className="fs-6 p-3"
                        style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            fontWeight: '700',
                            letterSpacing: '1px'
                        }}>
                        Mã: {course.enrollmentKey}
                    </Badge>
                </div>

                <Tabs 
                    activeKey={activeTab} 
                    onSelect={(k) => setActiveTab(k)} 
                    className="mb-4"
                    style={{
                        borderBottom: '3px solid #e5e7eb',
                        '& .nav-link': {
                            borderRadius: '12px 12px 0 0'
                        }
                    }}>
                
                {/* --- TAB 1: NỘI DUNG KHÓA HỌC --- */}
                <Tab eventKey="content" title={<span className="fw-bold">📚 Nội Dung & Soạn Bài</span>}>
                    <div className="d-flex justify-content-end mb-3">
                        <Button 
                            className="fw-semibold text-white border-0"
                            onClick={() => handleOpenChapterModal()}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '12px',
                                padding: '12px 28px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}>
                            <Plus className="me-1" size={18}/> Thêm Chương
                        </Button>
                    </div>

                    <Accordion defaultActiveKey="0">
                        {chapters.map((chapter, index) => (
                            <Accordion.Item 
                                eventKey={index.toString()} 
                                key={chapter.chapterId}
                                className="mb-3"
                                style={{
                                    border: 'none',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                                }}>
                                <Accordion.Header style={{padding: '0'}}>
                                    <div 
                                        className="d-flex justify-content-between align-items-center w-100 pe-3"
                                        style={{padding: '16px 20px'}}>
                                        <span className="fw-bold" style={{color: '#1f2937', fontSize: '1.1rem'}}>
                                            Chương {index + 1}: {chapter.title}
                                        </span>
                                        <div onClick={(e) => e.stopPropagation()} className="d-flex gap-2">
                                            <Button 
                                                variant="light" 
                                                size="sm" 
                                                onClick={() => handleOpenChapterModal(chapter)}
                                                style={{borderRadius: '8px', border: '2px solid #667eea'}}>
                                                <PencilSquare className="text-primary"/>
                                            </Button>
                                            <Button 
                                                variant="light" 
                                                size="sm" 
                                                onClick={() => handleDeleteChapter(chapter.chapterId)}
                                                style={{borderRadius: '8px', border: '2px solid #dc3545'}}>
                                                <Trash className="text-danger"/>
                                            </Button>
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body style={{background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', padding: '24px'}}>
                                    <ListGroup variant="flush" className="mb-3 rounded" style={{overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
                                        {chapter.lessons?.length === 0 && (
                                            <div className="text-muted text-center py-4" style={{background: 'white'}}>
                                                <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>📖</div>
                                                Chưa có bài học nào.
                                            </div>
                                        )}
                                        {chapter.lessons?.map((lesson) => (
                                            <ListGroup.Item 
                                                key={lesson.lessonId} 
                                                className="d-flex justify-content-between align-items-center"
                                                style={{
                                                    border: 'none',
                                                    borderBottom: '1px solid #e5e7eb',
                                                    padding: '16px 20px',
                                                    background: 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                                <div>
                                                    <div className="fw-bold mb-2" style={{color: '#1f2937', fontSize: '1.05rem'}}>{lesson.title}</div>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        {lesson.videoUrl && (
                                                            <Badge className="p-2" style={{background: '#dc2626', borderRadius: '8px', fontSize: '0.8rem'}}>
                                                                <PlayBtn className="me-1" size={12}/> Video
                                                            </Badge>
                                                        )}
                                                        {lesson.attachmentUrl && (
                                                            <Badge className="p-2" style={{background: '#2563eb', borderRadius: '8px', fontSize: '0.8rem'}}>
                                                                <FileEarmarkPdfFill className="me-1" size={12}/> PDF
                                                            </Badge>
                                                        )}
                                                        {lesson.contentText && (
                                                            <Badge className="p-2" style={{background: '#6b7280', borderRadius: '8px', fontSize: '0.8rem'}}>
                                                                <FileText className="me-1" size={12}/> Text
                                                            </Badge>
                                                        )}
                                                        {((lesson.quizzes && lesson.quizzes.length > 0) || (lesson.assignments && lesson.assignments.length > 0)) && (
                                                            <Badge className="p-2" style={{background: '#10b981', borderRadius: '8px', fontSize: '0.8rem'}}>
                                                                + Bài tập
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    className="fw-semibold"
                                                    onClick={() => navigate(`/teacher/lessons/${lesson.lessonId}`)}
                                                    style={{
                                                        background: 'white',
                                                        border: '2px solid #667eea',
                                                        color: '#667eea',
                                                        borderRadius: '10px',
                                                        padding: '8px 16px'
                                                    }}>
                                                    <PencilSquare className="me-1" size={14}/> Soạn bài
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    <div className="text-center">
                                        <Button 
                                            size="sm" 
                                            className="fw-semibold"
                                            onClick={() => handleCreateLessonPlaceholder(chapter.chapterId)}
                                            style={{
                                                background: 'white',
                                                border: '2px dashed #10b981',
                                                color: '#10b981',
                                                borderRadius: '12px',
                                                padding: '12px 28px',
                                                width: '50%'
                                            }}>
                                            <Plus className="me-1" size={16}/> Thêm Bài Học Mới
                                        </Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Tab>

                {/* --- TAB 2: QUẢN LÝ LỚP HỌC --- */}
                <Tab eventKey="students" title={<span className="fw-bold">🎓 Học Viên & Chấm Bài</span>}>
                    
                    {/* SECTION 1: DANH SÁCH CẦN CHẤM */}
                    <Card 
                        className="mb-4"
                        style={{
                            border: 'none',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(251, 146, 60, 0.15)'
                        }}>
                        <Card.Header 
                            className="fw-bold text-white"
                            style={{
                                background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                                padding: '20px 24px',
                                fontSize: '1.1rem'
                            }}>
                            <Pen className="me-2" size={20}/> Bài Tập Cần Chấm ({pendingSubmissions.length})
                        </Card.Header>
                        <Card.Body className="p-0">
                            {pendingSubmissions.length === 0 ? (
                                <div className="p-5 text-center">
                                    <div style={{fontSize: '3rem', marginBottom: '12px'}}>✅</div>
                                    <h5 className="text-muted">Không có bài tập nào cần chấm.</h5>
                                </div>
                            ) : (
                                <Table hover className="m-0 align-middle" style={{fontSize: '0.95rem'}}>
                                    <thead style={{background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                                        <tr>
                                            <th className="ps-4 py-3 fw-bold" style={{color: '#4b5563'}}>Học Sinh</th>
                                            <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Bài Tập</th>
                                            <th className="py-3 fw-bold" style={{color: '#4b5563'}}>File</th>
                                            <th className="text-center py-3 fw-bold" style={{color: '#4b5563'}}>Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingSubmissions.map(sub => (
                                            <tr key={sub.submissionId} style={{transition: 'background 0.2s'}}>
                                                <td className="ps-4 py-3 fw-bold" style={{color: '#1f2937'}}>{sub.enrollment?.student?.fullName}</td>
                                                <td className="py-3">{sub.assignment?.title}</td>
                                                <td className="py-3">
                                                    {sub.attachmentUrl ? (
                                                        <a 
                                                            href={sub.attachmentUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: 'white',
                                                                border: '2px solid #6b7280',
                                                                color: '#6b7280',
                                                                borderRadius: '8px',
                                                                padding: '6px 14px'
                                                            }}>
                                                            <FileEarmarkText className="me-1" size={14}/> Xem
                                                        </a>
                                                    ) : <span className="text-muted small">Không file</span>}
                                                </td>
                                                <td className="text-center py-3">
                                                    <Button 
                                                        size="sm" 
                                                        className="fw-semibold text-white border-0"
                                                        onClick={() => openGradeModal(sub)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            borderRadius: '10px',
                                                            padding: '8px 20px',
                                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                        }}>
                                                        Chấm Ngay
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    {/* SECTION 2: DANH SÁCH HỌC VIÊN */}
                    <Card 
                        style={{
                            border: 'none',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                        <Card.Header 
                            className="fw-bold"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '20px 24px',
                                fontSize: '1.1rem'
                            }}>
                            <People className="me-2" size={20}/> Danh Sách Học Viên ({students.length})
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="m-0 align-middle" style={{fontSize: '0.95rem'}}>
                                <thead style={{background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                                    <tr>
                                        <th className="ps-4 py-3 fw-bold" style={{color: '#4b5563'}}>STT</th>
                                        <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Họ và Tên</th>
                                        <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Username/Email</th>
                                        <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Tiến Độ Học Tập</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-5">
                                            <div style={{fontSize: '3rem', marginBottom: '12px'}}>👨‍🎓</div>
                                            <h5 className="text-muted">Chưa có học sinh nào tham gia.</h5>
                                        </td></tr>
                                    ) : (
                                        students.map((enroll, idx) => (
                                            <tr key={enroll.enrollmentId} style={{transition: 'background 0.2s'}}>
                                                <td className="ps-4 py-3 text-muted">{idx + 1}</td>
                                                <td className="py-3 fw-bold" style={{color: '#1f2937'}}>{enroll.student?.fullName}</td>
                                                <td className="py-3">
                                                    <div className="text-muted" style={{fontSize: '0.9rem', lineHeight: '1.6'}}>
                                                        <div>{enroll.student?.username}</div>
                                                        <div>{enroll.student?.email}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3" style={{width: '30%'}}>
                                                    <div className="d-flex align-items-center">
                                                        <div 
                                                            className="flex-grow-1 me-3"
                                                            style={{
                                                                background: '#e0f2fe',
                                                                borderRadius: '10px',
                                                                height: '12px',
                                                                overflow: 'hidden'
                                                            }}>
                                                            <div style={{
                                                                width: `${enroll.progressPercent}%`,
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                                                transition: 'width 0.5s',
                                                                borderRadius: '10px'
                                                            }}></div>
                                                        </div>
                                                        <span className="fw-bold" style={{color: '#10b981', fontSize: '1rem'}}>
                                                            {Math.round(enroll.progressPercent)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* MODAL TẠO/SỬA CHƯƠNG */}
            <Modal show={showChapterModal} onHide={() => setShowChapterModal(false)} centered>
                <Modal.Header 
                    closeButton 
                    className="border-0 text-white"
                    style={{
                        background: isEditingChapter 
                            ? 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '24px'
                    }}>
                    <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                        {isEditingChapter ? "✏️ Sửa Tên Chương" : "➕ Thêm Chương Mới"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                    <Form.Group>
                        <Form.Label className="fw-bold mb-2" style={{color: '#667eea'}}>📚 Tên chương</Form.Label>
                        <Form.Control 
                            value={chapterTitle} 
                            onChange={e => setChapterTitle(e.target.value)} 
                            placeholder="Ví dụ: Chương 1..." 
                            autoFocus
                            size="lg"
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                padding: '12px 16px'
                            }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{background: '#f9fafb', borderTop: '2px solid #e5e7eb', padding: '20px 32px'}}>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowChapterModal(false)}
                        style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleSaveChapter}
                        className="text-white border-0 fw-semibold"
                        style={{
                            background: isEditingChapter
                                ? 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '10px',
                            padding: '10px 32px',
                            boxShadow: isEditingChapter
                                ? '0 4px 12px rgba(251, 146, 60, 0.3)'
                                : '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}>
                        {isEditingChapter ? "✔️ Lưu Thay Đổi" : "💾 Thêm Mới"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL CHẤM BÀI */}
            <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} centered>
                <Modal.Header 
                    closeButton 
                    className="border-0 text-white"
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        padding: '24px'
                    }}>
                    <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                        ✅ Chấm Bài: {currentSub?.enrollment?.student?.fullName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold mb-2" style={{color: '#10b981'}}>🎯 Điểm số (Thang 10)</Form.Label>
                        <Form.Control 
                            type="number" 
                            min="0" 
                            max="10" 
                            value={score} 
                            onChange={e => setScore(e.target.value)} 
                            autoFocus
                            size="lg"
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #10b981',
                                padding: '12px 16px',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#10b981',
                                textAlign: 'center'
                            }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold mb-2" style={{color: '#10b981'}}>💬 Nhận xét</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            value={feedback} 
                            onChange={e => setFeedback(e.target.value)}
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                padding: '12px 16px',
                                lineHeight: '1.6'
                            }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{background: '#f9fafb', borderTop: '2px solid #e5e7eb', padding: '20px 32px'}}>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowGradeModal(false)}
                        style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleGradeSubmit}
                        className="text-white border-0 fw-semibold"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '10px',
                            padding: '10px 32px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                        ✔️ Xác Nhận
                    </Button>
                </Modal.Footer>
            </Modal>
            </Container>
        </Container>
    );
};

export default CourseDetail;