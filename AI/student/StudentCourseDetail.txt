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

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="text-center">
                <Spinner animation="border" style={{width: '3rem', height: '3rem', color: 'white'}}/>
                <p className="text-white fw-bold mt-3">Đang tải khóa học...</p>
            </div>
        </div>
    );

    return (
        <Container fluid style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '24px'}}>
            {/* Header - Gradient design */}
            <div className="d-flex align-items-center mb-4 p-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'}}>
                <Button 
                    variant="light" 
                    onClick={() => navigate('/student/dashboard')} 
                    className="fw-semibold"
                    style={{borderRadius: '10px', padding: '8px 20px'}}>
                    <ArrowLeft className="me-1" size={16}/> Quay lại
                </Button>
                <h4 className="m-0 fw-bold text-white ms-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                    📚 {course?.title}
                </h4>
            </div>

            <Row>
                {/* CỘT TRÁI: MÀN HÌNH HỌC & NỘI DUNG */}
                <Col md={8} className="mb-4">
                    {currentLesson ? (
                        <Card className="border-0 h-100" style={{borderRadius: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'}}>
                            {/* Màn hình Video - Bo tròn */}
                            <div 
                                className="text-center ratio ratio-16x9" 
                                style={{
                                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                    borderRadius: '20px 20px 0 0',
                                    overflow: 'hidden'
                                }}>
                                {renderVideoPlayer(currentLesson.videoUrl)}
                            </div>
                            
                            <Card.Body style={{padding: '32px'}}>
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <h3 className="fw-bold m-0" style={{color: '#1f2937'}}>{currentLesson.title}</h3>
                                    {currentLesson.attachmentUrl && (
                                        <a 
                                            href={currentLesson.attachmentUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="btn fw-semibold text-white border-0"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '12px',
                                                padding: '10px 20px',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                            <FileEarmarkText className="me-2" size={16}/> Tài liệu
                                        </a>
                                    )}
                                </div>
                                <hr style={{margin: '24px 0', borderColor: '#e5e7eb'}}/>
                                
                                {/* Nội dung bài học */}
                                <div 
                                    className="mb-4" 
                                    style={{color: '#4b5563', fontSize: '1rem', lineHeight: '1.8'}}
                                    dangerouslySetInnerHTML={{ __html: currentLesson.contentText?.replace(/\n/g, '<br/>') }} 
                                />
                                
                                {/* KHU VỰC BÀI TẬP */}
                                <div className="p-4" style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '16px', border: '2px solid #d1fae5'}}>
                                    <h5 className="fw-bold mb-3" style={{color: '#059669', borderBottom: '2px solid #d1fae5', paddingBottom: '12px'}}>
                                        <JournalCheck className="me-2" size={24}/> 📝 Bài Tập Thực Hành
                                    </h5>
                                    
                                    {(!currentLesson.quizzes?.length && !currentLesson.assignments?.length) ? (
                                        <div className="text-center py-3">
                                            <span className="text-muted">Chưa có bài tập nào</span>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-wrap gap-3">
                                            {/* List Quiz */}
                                            {currentLesson.quizzes?.map(quiz => (
                                                <Button 
                                                    key={quiz.quizId} 
                                                    className="fw-semibold text-white border-0"
                                                    onClick={() => {setSelectedItem(quiz); setShowQuizModal(true);}}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        borderRadius: '12px',
                                                        padding: '12px 20px',
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                    }}>
                                                    ❓ Trắc Nghiệm: {quiz.title}
                                                </Button>
                                            ))}
                                            
                                            {/* List Assignment */}
                                            {currentLesson.assignments?.map(assign => (
                                                <Button 
                                                    key={assign.assignmentId} 
                                                    className="fw-semibold text-white border-0"
                                                    onClick={() => {setSelectedItem(assign); setShowAssignModal(true);}}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                                                        borderRadius: '12px',
                                                        padding: '12px 20px',
                                                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.3)'
                                                    }}>
                                                    📝 Tự Luận: {assign.title}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="text-center p-5 bg-white" style={{borderRadius: '20px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'}}>
                            <div style={{fontSize: '4rem', marginBottom: '16px'}}>📚</div>
                            <h4 style={{color: '#6b7280'}}>Chọn một bài học bên phải để bắt đầu</h4>
                        </div>
                    )}
                </Col>

                {/* CỘT PHẢI: DANH SÁCH BÀI HỌC (MENU) */}
                <Col md={4}>
                    <Card className="border-0 h-100" style={{borderRadius: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'}}>
                        <Card.Header 
                            className="fw-bold py-3 border-0 text-white"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '20px 20px 0 0',
                                padding: '20px 24px',
                                fontSize: '1.1rem'
                            }}>
                            📑 Nội Dung Khóa Học
                        </Card.Header>
                        <Card.Body className="p-0 overflow-auto" style={{maxHeight: '80vh', background: '#ffffff'}}>
                            <Accordion defaultActiveKey="0" flush>
                                {course?.chapters?.sort((a,b)=>a.orderIndex-b.orderIndex).map((chapter, idx) => (
                                    <Accordion.Item eventKey={idx.toString()} key={chapter.chapterId}>
                                        <Accordion.Header style={{background: '#f9fafb'}}>
                                            <strong style={{color: '#667eea', fontSize: '1rem'}}>
                                                📖 Chương {idx + 1}: {chapter.title}
                                            </strong>
                                        </Accordion.Header>
                                        <Accordion.Body className="p-0" style={{background: '#f9fafb'}}>
                                            <ListGroup variant="flush">
                                                {chapter.lessons?.sort((a,b)=>a.orderIndex-b.orderIndex).map(lesson => (
                                                    <ListGroup.Item 
                                                        key={lesson.lessonId} 
                                                        action 
                                                        active={currentLesson?.lessonId === lesson.lessonId}
                                                        onClick={() => {setCurrentLesson(lesson); window.scrollTo(0,0);}}
                                                        className="d-flex align-items-center border-0 py-3"
                                                        style={{
                                                            cursor: 'pointer',
                                                            background: currentLesson?.lessonId === lesson.lessonId 
                                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                                : 'transparent',
                                                            color: currentLesson?.lessonId === lesson.lessonId ? 'white' : '#4b5563',
                                                            transition: 'all 0.2s',
                                                            padding: '12px 20px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if(currentLesson?.lessonId !== lesson.lessonId) {
                                                                e.currentTarget.style.background = '#e0e7ff';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if(currentLesson?.lessonId !== lesson.lessonId) {
                                                                e.currentTarget.style.background = 'transparent';
                                                            }
                                                        }}
                                                    >
                                                        <div className="me-2"><Film size={18}/></div>
                                                        <div className="flex-grow-1 fw-semibold" style={{fontSize: '0.95rem'}}>{lesson.title}</div>
                                                        {/* Badge báo bài tập */}
                                                        {(lesson.quizzes?.length > 0 || lesson.assignments?.length > 0) && (
                                                            <Badge 
                                                                pill 
                                                                className="ms-2" 
                                                                title="Có bài tập"
                                                                style={{
                                                                    background: currentLesson?.lessonId === lesson.lessonId ? '#fbbf24' : '#ef4444',
                                                                    color: '#1f2937',
                                                                    padding: '4px 10px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '600'
                                                                }}>
                                                                BT
                                                            </Badge>
                                                        )}
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