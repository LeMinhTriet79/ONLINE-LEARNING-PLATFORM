import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Container, Row, Col, Card, Accordion, ListGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { PlayCircle, FileEarmarkText, JournalCheck, ArrowLeft, Film } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import DoQuiz from './DoQuiz'; 
import SubmitAssignment from './SubmitAssignment'; 

const StudentCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State cho Modal làm bài
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); 

    // 1. Load thông tin khóa học
    const fetchCourseDetail = async () => {
        try {
            const res = await axiosClient.get(`/student/courses/${courseId}/full`); 
            if (res.data.status) {
                setCourse(res.data.data);
                // Mặc định chọn bài đầu tiên
                if (res.data.data.chapters?.length > 0 && res.data.data.chapters[0].lessons?.length > 0) {
                    setCurrentLesson(res.data.data.chapters[0].lessons[0]);
                }
            }
        } catch (error) { 
            toast.error(error.response?.data?.message || "Lỗi tải khóa học");
            navigate('/student/dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourseDetail(); }, [courseId]);

    // Helper: Nhận diện link YouTube
    const getYoutubeEmbed = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // Helper: Render Trình phát video (Đa năng)
    const renderVideoPlayer = (url) => {
        if (!url) {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center text-white h-100">
                    <PlayCircle size={50} className="opacity-50 mb-2"/>
                    <p className="fw-bold">Bài này không có video.</p>
                </div>
            );
        }

        const youtubeLink = getYoutubeEmbed(url);

        if (youtubeLink) {
            // TRƯỜNG HỢP 1: LINK YOUTUBE
            return (
                <iframe 
                    src={youtubeLink} 
                    title="Lesson Video" 
                    allowFullScreen 
                    style={{border: 0, width: '100%', height: '100%'}}
                ></iframe>
            );
        } else {
            // TRƯỜNG HỢP 2: VIDEO UPLOAD (Cloud/MP4)
            return (
                <video 
                    controls 
                    style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                    src={url}
                >
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
            );
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border"/></div>;

    return (
        <Container fluid className="py-3 bg-light" style={{minHeight: '100vh'}}>
            {/* Header nhỏ */}
            <div className="d-flex align-items-center mb-3">
                <Button variant="link" onClick={() => navigate('/student/dashboard')} className="text-decoration-none text-secondary">
                    <ArrowLeft/> Quay lại
                </Button>
                <h5 className="m-0 fw-bold text-primary ms-2">{course?.title}</h5>
            </div>

            <Row>
                {/* CỘT TRÁI: MÀN HÌNH HỌC & NỘI DUNG */}
                <Col md={8} className="mb-4">
                    {currentLesson ? (
                        <Card className="shadow-sm border-0 h-100">
                            {/* Màn hình Video */}
                            <div className="bg-dark text-center ratio ratio-16x9">
                                {renderVideoPlayer(currentLesson.videoUrl)}
                            </div>
                            
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className="fw-bold m-0 text-dark">{currentLesson.title}</h3>
                                    {currentLesson.attachmentUrl && (
                                        <a href={currentLesson.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
                                            <FileEarmarkText/> Tài liệu đính kèm
                                        </a>
                                    )}
                                </div>
                                <hr/>
                                
                                {/* Nội dung bài học */}
                                <div className="mb-4 text-secondary" dangerouslySetInnerHTML={{ __html: currentLesson.contentText?.replace(/\n/g, '<br/>') }} />
                                
                                {/* KHU VỰC BÀI TẬP */}
                                <div className="p-4 bg-white rounded border border-light shadow-sm">
                                    <h5 className="text-success fw-bold border-bottom pb-2 mb-3"><JournalCheck className="me-2"/> Bài Tập Thực Hành</h5>
                                    
                                    {(!currentLesson.quizzes?.length && !currentLesson.assignments?.length) ? (
                                        <span className="text-muted small">Chưa có bài tập nào.</span>
                                    ) : (
                                        <div className="d-flex flex-wrap gap-2">
                                            {/* List Quiz */}
                                            {currentLesson.quizzes?.map(quiz => (
                                                <Button key={quiz.quizId} variant="outline-success" onClick={() => {setSelectedItem(quiz); setShowQuizModal(true);}}>
                                                    📝 Trắc Nghiệm: {quiz.title}
                                                </Button>
                                            ))}
                                            
                                            {/* List Assignment */}
                                            {currentLesson.assignments?.map(assign => (
                                                <Button key={assign.assignmentId} variant="outline-warning" className="text-dark" onClick={() => {setSelectedItem(assign); setShowAssignModal(true);}}>
                                                    📤 Tự Luận: {assign.title}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="text-center mt-5 p-5 bg-white rounded shadow-sm">
                            <h4>Chọn một bài học bên phải để bắt đầu.</h4>
                        </div>
                    )}
                </Col>

                {/* CỘT PHẢI: DANH SÁCH BÀI HỌC (MENU) */}
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3 border-bottom text-primary">Nội Dung Khóa Học</Card.Header>
                        <Card.Body className="p-0 overflow-auto" style={{maxHeight: '80vh'}}>
                            <Accordion defaultActiveKey="0" flush>
                                {course?.chapters?.sort((a,b)=>a.orderIndex-b.orderIndex).map((chapter, idx) => (
                                    <Accordion.Item eventKey={idx.toString()} key={chapter.chapterId}>
                                        <Accordion.Header>
                                            <strong>Chương {idx + 1}: {chapter.title}</strong>
                                        </Accordion.Header>
                                        <Accordion.Body className="p-0">
                                            <ListGroup variant="flush">
                                                {chapter.lessons?.sort((a,b)=>a.orderIndex-b.orderIndex).map(lesson => (
                                                    <ListGroup.Item 
                                                        key={lesson.lessonId} 
                                                        action 
                                                        active={currentLesson?.lessonId === lesson.lessonId}
                                                        onClick={() => {setCurrentLesson(lesson); window.scrollTo(0,0);}}
                                                        className="d-flex align-items-center border-0 py-3"
                                                    >
                                                        <div className="me-2 text-secondary"><Film/></div>
                                                        <div className="flex-grow-1 small fw-bold">{lesson.title}</div>
                                                        {/* Badge báo bài tập */}
                                                        {(lesson.quizzes?.length > 0 || lesson.assignments?.length > 0) && 
                                                            <Badge bg="danger" pill className="ms-1 small" title="Có bài tập">BT</Badge>
                                                        }
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* MODALS LÀM BÀI */}
            {selectedItem && (
                <>
                    <DoQuiz 
                        show={showQuizModal} 
                        handleClose={() => setShowQuizModal(false)} 
                        quiz={selectedItem} 
                    />
                    <SubmitAssignment 
                        show={showAssignModal} 
                        handleClose={() => setShowAssignModal(false)} 
                        assignment={selectedItem} 
                    />
                </>
            )}
        </Container>
    );
};

export default StudentCourseDetail;