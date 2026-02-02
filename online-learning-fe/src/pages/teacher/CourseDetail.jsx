import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Container, Accordion, Button, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { Plus, PencilSquare, JournalBookmarkFill, PlayBtn, FileEarmarkPdfFill, FileText, Trash, GearFill } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    
    // --- STATE QUẢN LÝ MODAL CHƯƠNG ---
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [isEditingChapter, setIsEditingChapter] = useState(false);
    const [currentChapterId, setCurrentChapterId] = useState(null);
    const [chapterTitle, setChapterTitle] = useState('');

    // --- 1. LOAD DỮ LIỆU ---
    const fetchCourseData = async () => {
        try {
            // Gọi API lấy chi tiết (hoặc lấy từ list courses)
            const res = await axiosClient.get('/teacher/my-courses');
            if (res.data.status) {
                const foundCourse = res.data.data.find(c => c.courseId == courseId);
                if (foundCourse) {
                    setCourse(foundCourse);
                    // Sắp xếp chương theo thứ tự
                    setChapters(foundCourse.chapters?.sort((a, b) => a.orderIndex - b.orderIndex) || []);
                }
            }
        } catch (error) { toast.error("Lỗi tải dữ liệu!"); }
    };

    useEffect(() => { fetchCourseData(); }, [courseId]);

    // --- 2. XỬ LÝ MỞ MODAL (TẠO MỚI / SỬA) ---
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

    // --- 3. LƯU CHƯƠNG (TẠO / SỬA) ---
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

    // --- 4. XÓA CHƯƠNG ---
    const handleDeleteChapter = async (id) => {
        if (window.confirm("CẢNH BÁO: Xóa chương sẽ xóa toàn bộ bài học bên trong!\nBạn có chắc chắn không?")) {
            try {
                await axiosClient.delete(`/teacher/chapters/${id}`);
                toast.success("Đã xóa chương!");
                fetchCourseData();
            } catch (error) { toast.error("Lỗi xóa chương!"); }
        }
    };

    // --- 5. TẠO BÀI HỌC NHANH (PLACEHOLDER) ---
    const handleCreateLessonPlaceholder = async (chapterId) => {
        try {
            const res = await axiosClient.post(`/teacher/chapters/${chapterId}/lessons`, { 
                title: "Bài học mới (Chưa đặt tên)", contentText: "", videoUrl: "", attachmentUrl: "", orderIndex: 0 
            });
            if(res.data.status) {
                toast.success("Đang chuyển trang soạn bài...");
                navigate(`/teacher/lessons/${res.data.data.lessonId}`);
            }
        } catch (error) { toast.error("Lỗi tạo bài học"); }
    };

    if (!course) return <div className="text-center mt-5">Đang tải...</div>;

    return (
        <Container className="py-5">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/teacher/courses')}>&larr; Danh sách khóa học</Button>
            
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h2 className="text-primary"><JournalBookmarkFill className="me-2"/>{course.title}</h2>
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
                                
                                {/* KHU VỰC NÚT SỬA/XÓA CHƯƠNG */}
                                <div 
                                    onClick={(e) => e.stopPropagation()} // Chặn sự kiện click để không bị đóng/mở accordion
                                    className="d-flex gap-2"
                                >
                                    <Badge 
                                        bg="light" text="dark" 
                                        className="border cursor-pointer hover-bg-gray"
                                        style={{cursor: 'pointer'}}
                                        onClick={() => handleOpenChapterModal(chapter)}
                                        title="Sửa tên chương"
                                    >
                                        <PencilSquare className="text-primary"/>
                                    </Badge>
                                    
                                    <Badge 
                                        bg="light" text="dark" 
                                        className="border cursor-pointer hover-bg-gray"
                                        style={{cursor: 'pointer'}}
                                        onClick={() => handleDeleteChapter(chapter.chapterId)}
                                        title="Xóa chương này"
                                    >
                                        <Trash className="text-danger"/>
                                    </Badge>
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
                                            {/* ICONS TRẠNG THÁI BÀI HỌC */}
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
                                            <PencilSquare className="me-1"/> Quản lý & Soạn bài
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

            {/* MODAL TẠO/SỬA CHƯƠNG */}
            <Modal show={showChapterModal} onHide={() => setShowChapterModal(false)} centered>
                <Modal.Header closeButton className={isEditingChapter ? "bg-warning" : "bg-primary text-white"}>
                    <Modal.Title>{isEditingChapter ? "Sửa Tên Chương" : "Thêm Chương Mới"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="fw-bold">Tên chương</Form.Label>
                        <Form.Control 
                            value={chapterTitle} 
                            onChange={e => setChapterTitle(e.target.value)} 
                            placeholder="Ví dụ: Chương 1 - Giới thiệu..." 
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowChapterModal(false)}>Hủy</Button>
                    <Button variant={isEditingChapter ? "warning" : "primary"} onClick={handleSaveChapter}>
                        {isEditingChapter ? "Lưu Thay Đổi" : "Thêm Mới"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CourseDetail;