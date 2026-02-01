import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Container, Accordion, Button, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { Plus, PencilSquare, JournalBookmarkFill, PlayBtn, FileEarmarkPdfFill, FileText } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [chapterTitle, setChapterTitle] = useState('');

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
        } catch (error) { toast.error("Lỗi tải dữ liệu!"); }
    };

    useEffect(() => { fetchCourseData(); }, [courseId]);

    const handleCreateChapter = async () => {
        try {
            await axiosClient.post(`/teacher/courses/${courseId}/chapters`, { title: chapterTitle, orderIndex: chapters.length + 1 });
            toast.success("Thêm chương thành công!"); setShowChapterModal(false); setChapterTitle(''); fetchCourseData();
        } catch (error) { toast.error("Lỗi tạo chương"); }
    };

    const handleCreateLessonPlaceholder = async (chapterId) => {
        try {
            const res = await axiosClient.post(`/teacher/chapters/${chapterId}/lessons`, { 
                title: "Bài học mới (Chưa đặt tên)", contentText: "", videoUrl: "", attachmentUrl: "", orderIndex: 0 
            });
            if(res.data.status) {
                toast.success("Đang chuyển trang...");
                navigate(`/teacher/lessons/${res.data.data.lessonId}`);
            }
        } catch (error) { toast.error("Lỗi tạo bài học"); }
    };

    if (!course) return <div className="text-center mt-5">Đang tải...</div>;

    return (
        <Container className="py-5">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/teacher/courses')}>&larr; Danh sách khóa học</Button>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h2><JournalBookmarkFill className="me-2"/>{course.title}</h2>
                <Button variant="primary" onClick={() => setShowChapterModal(true)}><Plus /> Thêm Chương</Button>
            </div>

            <Accordion defaultActiveKey="0">
                {chapters.map((chapter, index) => (
                    <Accordion.Item eventKey={index.toString()} key={chapter.chapterId}>
                        <Accordion.Header><strong>Chương {index + 1}: {chapter.title}</strong></Accordion.Header>
                        <Accordion.Body>
                            <ListGroup variant="flush">
                                {chapter.lessons?.map((lesson) => (
                                    <ListGroup.Item key={lesson.lessonId} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold mb-1">{lesson.title}</div>
                                            {/* HIỂN THỊ CÁC BIỂU TƯỢNG (CHỈ ĐỂ XEM) */}
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
                                            <PencilSquare className="me-1"/> Quản lý
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                                <div className="mt-3 text-center">
                                    <Button variant="outline-success" size="sm" onClick={() => handleCreateLessonPlaceholder(chapter.chapterId)}>
                                        <Plus /> Thêm Bài Học Mới
                                    </Button>
                                </div>
                            </ListGroup>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <Modal show={showChapterModal} onHide={() => setShowChapterModal(false)}>
                <Modal.Header closeButton><Modal.Title>Thêm Chương</Modal.Title></Modal.Header>
                <Modal.Body><Form.Control value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} placeholder="Tên chương" /></Modal.Body>
                <Modal.Footer><Button onClick={handleCreateChapter}>Lưu</Button></Modal.Footer>
            </Modal>
        </Container>
    );
};
export default CourseDetail;