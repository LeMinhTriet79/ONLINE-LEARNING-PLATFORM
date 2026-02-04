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
        <Container className="py-5">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/teacher/courses')}>&larr; Danh sách khóa học</Button>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><JournalBookmarkFill className="me-2"/>{course.title}</h2>
                <Badge bg="info" className="fs-6">Mã: {course.enrollmentKey}</Badge>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                
                {/* --- TAB 1: NỘI DUNG KHÓA HỌC (GIAO DIỆN CŨ) --- */}
                <Tab eventKey="content" title={<span className="fw-bold">📚 Nội Dung & Soạn Bài</span>}>
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="primary" onClick={() => handleOpenChapterModal()}>
                            <Plus className="me-1"/> Thêm Chương
                        </Button>
                    </div>

                    <Accordion defaultActiveKey="0">
                        {chapters.map((chapter, index) => (
                            <Accordion.Item eventKey={index.toString()} key={chapter.chapterId}>
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                                        <span className="fw-bold">Chương {index + 1}: {chapter.title}</span>
                                        <div onClick={(e) => e.stopPropagation()} className="d-flex gap-2">
                                            <Button variant="light" size="sm" onClick={() => handleOpenChapterModal(chapter)}><PencilSquare className="text-primary"/></Button>
                                            <Button variant="light" size="sm" onClick={() => handleDeleteChapter(chapter.chapterId)}><Trash className="text-danger"/></Button>
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body className="bg-light">
                                    <ListGroup variant="flush" className="mb-3 shadow-sm rounded">
                                        {chapter.lessons?.length === 0 && <div className="text-muted text-center py-3 small">Chưa có bài học nào.</div>}
                                        {chapter.lessons?.map((lesson) => (
                                            <ListGroup.Item key={lesson.lessonId} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold mb-1">{lesson.title}</div>
                                                    <div className="d-flex gap-1">
                                                        {lesson.videoUrl && <Badge bg="danger" className="p-1"><PlayBtn/> Video</Badge>}
                                                        {lesson.attachmentUrl && <Badge bg="primary" className="p-1"><FileEarmarkPdfFill/> PDF</Badge>}
                                                        {lesson.contentText && <Badge bg="secondary" className="p-1"><FileText/> Text</Badge>}
                                                        {((lesson.quizzes && lesson.quizzes.length > 0) || (lesson.assignments && lesson.assignments.length > 0)) && (
                                                            <Badge bg="success" className="p-1">+ Bài tập</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="outline-primary" size="sm" onClick={() => navigate(`/teacher/lessons/${lesson.lessonId}`)}>
                                                    <PencilSquare className="me-1"/> Soạn bài
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    <div className="text-center">
                                        <Button variant="outline-success" size="sm" className="dashed-border w-50" onClick={() => handleCreateLessonPlaceholder(chapter.chapterId)}>
                                            <Plus /> Thêm Bài Học Mới
                                        </Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Tab>

                {/* --- TAB 2: QUẢN LÝ LỚP HỌC (MỚI) --- */}
                <Tab eventKey="students" title={<span className="fw-bold">🎓 Học Viên & Chấm Bài</span>}>
                    
                    {/* SECTION 1: DANH SÁCH CẦN CHẤM */}
                    <Card className="border-warning mb-4 shadow-sm">
                        <Card.Header className="bg-warning text-dark fw-bold"><Pen className="me-2"/> Bài Tập Cần Chấm ({pendingSubmissions.length})</Card.Header>
                        <Card.Body className="p-0">
                            {pendingSubmissions.length === 0 ? (
                                <div className="p-4 text-center text-muted">Không có bài tập nào cần chấm.</div>
                            ) : (
                                <Table hover className="m-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-3">Học Sinh</th>
                                            <th>Bài Tập</th>
                                            <th>File</th>
                                            <th className="text-center">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingSubmissions.map(sub => (
                                            <tr key={sub.submissionId}>
                                                <td className="ps-3 fw-bold">{sub.enrollment?.student?.fullName}</td>
                                                <td>{sub.assignment?.title}</td>
                                                <td>
                                                    {sub.attachmentUrl ? (
                                                        <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                                                            <FileEarmarkText/> Xem
                                                        </a>
                                                    ) : <span className="text-muted small">Không file</span>}
                                                </td>
                                                <td className="text-center">
                                                    <Button variant="success" size="sm" onClick={() => openGradeModal(sub)}>Chấm Ngay</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    {/* SECTION 2: DANH SÁCH HỌC VIÊN */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white fw-bold text-primary"><People className="me-2"/> Danh Sách Học Viên ({students.length})</Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="m-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3">STT</th>
                                        <th>Họ và Tên</th>
                                        <th>Username/Email</th>
                                        <th>Tiến Độ Học Tập</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4">Chưa có học sinh nào tham gia.</td></tr>
                                    ) : (
                                        students.map((enroll, idx) => (
                                            <tr key={enroll.enrollmentId}>
                                                <td className="ps-3">{idx + 1}</td>
                                                <td className="fw-bold">{enroll.student?.fullName}</td>
                                                <td className="text-muted small">
                                                    <div>{enroll.student?.username}</div>
                                                    <div>{enroll.student?.email}</div>
                                                </td>
                                                <td style={{width: '30%'}}>
                                                    <div className="d-flex align-items-center">
                                                        <ProgressBar now={enroll.progressPercent} variant="success" className="flex-grow-1 me-2" style={{height: '8px'}} />
                                                        <span className="fw-bold text-success">{Math.round(enroll.progressPercent)}%</span>
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
                <Modal.Header closeButton className={isEditingChapter ? "bg-warning" : "bg-primary text-white"}>
                    <Modal.Title>{isEditingChapter ? "Sửa Tên Chương" : "Thêm Chương Mới"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="fw-bold">Tên chương</Form.Label>
                        <Form.Control value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} placeholder="Ví dụ: Chương 1..." autoFocus />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowChapterModal(false)}>Hủy</Button>
                    <Button variant={isEditingChapter ? "warning" : "primary"} onClick={handleSaveChapter}>
                        {isEditingChapter ? "Lưu Thay Đổi" : "Thêm Mới"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL CHẤM BÀI */}
            <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} centered>
                <Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chấm Bài: {currentSub?.enrollment?.student?.fullName}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Điểm số (Thang 10)</Form.Label>
                        <Form.Control type="number" min="0" max="10" value={score} onChange={e => setScore(e.target.value)} autoFocus />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Nhận xét</Form.Label>
                        <Form.Control as="textarea" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGradeModal(false)}>Hủy</Button>
                    <Button variant="success" onClick={handleGradeSubmit}>Xác Nhận</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CourseDetail;