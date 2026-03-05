import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Container, Button, Form, Row, Col, Card, ProgressBar, Badge, Modal, InputGroup, ListGroup } from 'react-bootstrap';
// Giữ nguyên toàn bộ icon của bạn
import { CloudArrowUp, Trash, Plus, Save, ArrowLeft, QuestionCircle, JournalText, Youtube, XCircle, Eye, EyeSlash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import MathText from '../../components/MathText';

const LessonManager = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    // --- DATA ---
    const [lesson, setLesson] = useState({ title: '', videoUrl: '', attachmentUrl: '', contentText: '', quizzes: [], assignments: [] });
    const [loading, setLoading] = useState(true);

    // --- UPLOAD STATE ---
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const abortControllerRef = useRef(null);

    // --- MODAL STATE ---
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    
    // --- EDITING STATE ---
    const [currentQuizId, setCurrentQuizId] = useState(null);
    const [currentAssignId, setCurrentAssignId] = useState(null);
    const [showFilePreview, setShowFilePreview] = useState(false);

    // --- FORM DATA ---
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [assignData, setAssignData] = useState({ title: '', instructions: '', attachmentUrl: '' });

    // --- HELPER ---
    const hasLatex = (text) => text && text.includes('$');
    const getYoutubeEmbedUrl = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
    };
    const isYoutubeLink = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
    const getOptionLabel = (index) => String.fromCharCode(65 + index); 

    // --- API CALLS ---
    const fetchLessonInitial = async () => {
        try {
            const res = await axiosClient.get(`/teacher/lessons/${lessonId}`); 
            if (res.data.status) setLesson(res.data.data);
        } catch (error) { toast.error("Lỗi tải bài học"); } finally { setLoading(false); }
    };

    // Hàm reload nhẹ (chỉ dùng khi cần thiết)
    const reloadListsOnly = async () => {
        try {
            const res = await axiosClient.get(`/teacher/lessons/${lessonId}`);
            if (res.data.status) {
                const freshData = res.data.data;
                setLesson(prev => ({
                    ...prev, 
                    quizzes: freshData.quizzes,
                    assignments: freshData.assignments 
                }));
            }
        } catch (error) { console.error("Lỗi reload list"); }
    };

    useEffect(() => { fetchLessonInitial(); }, [lessonId]);

    const handleSaveLessonInfo = async () => {
        try {
            await axiosClient.put(`/teacher/lessons/${lessonId}`, {
                title: lesson.title, videoUrl: lesson.videoUrl, 
                attachmentUrl: lesson.attachmentUrl, contentText: lesson.contentText
            });
            toast.success("Đã lưu nội dung chính!");
        } catch (error) { toast.error("Lỗi lưu"); }
    };

    const handleGoBack = () => {
        const courseId = lesson?.chapter?.course?.courseId;
        if (courseId) navigate(`/teacher/courses/${courseId}`);
        else navigate('/teacher/courses');
    };

    // --- XÓA BÀI HỌC ---
    const handleDeleteLesson = async () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lesson.title}"?\nThao tác này không thể hoàn tác!`)) {
            try {
                await axiosClient.delete(`/teacher/lessons/${lessonId}`);
                toast.success("Đã xóa bài học!");
                handleGoBack(); 
            } catch (error) {
                toast.error("Lỗi xóa bài học!");
            }
        }
    };

    // --- UPLOAD HANDLER ---
    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        
        setUploading(true); setUploadProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { "Content-Type": "multipart/form-data" },
                signal: abortControllerRef.current.signal,
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
            });
            if (res.data.status) {
                if (field === 'assign') {
                    setAssignData(prev => ({...prev, attachmentUrl: res.data.data}));
                    toast.success("Đã tải lên đề bài!");
                } else {
                    setLesson(prev => ({ ...prev, [field]: res.data.data }));
                    toast.success("Tải lên thành công! (Nhớ bấm Lưu Nội Dung)");
                }
            }
        } catch (error) { if(!axiosClient.isCancel(error)) toast.error("Lỗi tải lên"); } 
        finally { setUploading(false); setUploadProgress(0); }
    };

    const handleCancelUpload = () => {
        if(abortControllerRef.current) abortControllerRef.current.abort();
        setUploading(false); setUploadProgress(0);
    };

    // --- QUIZ & ASSIGNMENT ACTIONS ---
    const openQuizModal = (quiz = null) => {
        if (quiz) {
            setCurrentQuizId(quiz.quizId);
            setQuizTitle(quiz.title);
            const formattedQuestions = quiz.questions.map(q => {
                let opts = q.options.map(o => ({ content: o.content, isCorrect: o.isCorrect }));
                while(opts.length < 4) opts.push({ content: '', isCorrect: false });
                return { content: q.content, options: opts.slice(0, 4) }; 
            });
            setQuestions(formattedQuestions);
        } else {
            setCurrentQuizId(null);
            setQuizTitle('');
            setQuestions([{ content: '', options: [{ content: '', isCorrect: true }, { content: '', isCorrect: false }, { content: '', isCorrect: false }, { content: '', isCorrect: false }] }]);
        }
        setShowQuizModal(true);
    };

    const handleSaveQuiz = async () => {
        if (!quizTitle) { toast.warning("Nhập tên bài kiểm tra"); return; }
        const payload = { title: quizTitle, questions: questions };
        try {
            if (currentQuizId) {
                await axiosClient.put(`/teacher/quizzes/${currentQuizId}`, payload);
                toast.success("Cập nhật Quiz thành công!");
            } else {
                await axiosClient.post(`/teacher/lessons/${lessonId}/quizzes`, payload);
                toast.success("Tạo Quiz mới thành công!");
            }
            setShowQuizModal(false); 
            reloadListsOnly(); 
        } catch (error) { toast.error("Lỗi lưu Quiz. Kiểm tra Backend!"); }
    };

    const handleDeleteQuiz = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa bài kiểm tra này?")) return;
        try {
            await axiosClient.delete(`/teacher/quizzes/${id}`);
            toast.success("Đã xóa Quiz"); 
            setLesson(prev => ({
                ...prev,
                quizzes: prev.quizzes.filter(q => q.quizId !== id)
            }));
        } catch(e) { toast.error("Lỗi xóa"); }
    };

    const openAssignModal = (assign = null) => {
        setShowFilePreview(false);
        if (assign) {
            setCurrentAssignId(assign.assignmentId);
            setAssignData({ title: assign.title, instructions: assign.instructions, attachmentUrl: assign.attachmentUrl });
        } else {
            setCurrentAssignId(null);
            setAssignData({ title: '', instructions: '', attachmentUrl: '' });
        }
        setShowAssignModal(true);
    };

    const handleSaveAssignment = async () => {
        if (!assignData.title) { toast.warning("Nhập tiêu đề"); return; }
        try {
            if (currentAssignId) {
                await axiosClient.put(`/teacher/assignments/${currentAssignId}`, assignData);
                toast.success("Cập nhật bài tập thành công!");
            } else {
                await axiosClient.post(`/teacher/lessons/${lessonId}/assignments`, assignData);
                toast.success("Giao bài tập mới thành công!");
            }
            setShowAssignModal(false); 
            reloadListsOnly();
        } catch (error) { toast.error("Lỗi lưu bài tập"); }
    };

    const handleDeleteAssign = async (id) => {
        if(!window.confirm("Xóa bài tập này?")) return;
        try {
            await axiosClient.delete(`/teacher/assignments/${id}`);
            toast.success("Đã xóa"); 
            setLesson(prev => ({
                ...prev,
                assignments: prev.assignments.filter(a => a.assignmentId !== id)
            }));
        } catch(e) { toast.error("Lỗi xóa"); }
    };

    const handleAddQuestion = () => setQuestions([...questions, { content: '', options: [{ content: '', isCorrect: true }, { content: '', isCorrect: false }, { content: '', isCorrect: false }, { content: '', isCorrect: false }] }]);
    const handleQChange = (i, v) => { const n = [...questions]; n[i].content = v; setQuestions(n); };
    const handleOChange = (qi, oi, v) => { const n = [...questions]; n[qi].options[oi].content = v; setQuestions(n); };
    const handleCorrect = (qi, oi) => { const n = [...questions]; n[qi].options.forEach((o, k) => o.isCorrect = (k === oi)); setQuestions(n); };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="text-center">
                <div className="spinner-border text-white mb-3" style={{width: '3rem', height: '3rem'}} role="status"></div>
                <p className="text-white fw-bold">Đang tải bài học...</p>
            </div>
        </div>
    );

    return (
        <Container fluid className="py-4" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
            {/* HEADER - Thiết kế hiện đại với gradient và shadow */}
            <div className="d-flex align-items-center justify-content-between p-4 mb-4" 
                 style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     borderRadius: '16px',
                     boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                 }}>
                <div className="d-flex align-items-center">
                    <Button 
                        variant="light" 
                        className="me-3 fw-semibold" 
                        onClick={handleGoBack}
                        style={{borderRadius: '12px', padding: '10px 20px'}}
                    >
                        <ArrowLeft size={18} className="me-2"/> Quay lại
                    </Button>
                    <h3 className="m-0 text-white fw-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                        ✏️ {lesson.title || 'Biên tập bài học'}
                    </h3>
                </div>
                <div>
                    <Button 
                        variant="light" 
                        className="fw-semibold text-danger border-0"
                        onClick={handleDeleteLesson} 
                        disabled={uploading}
                        style={{borderRadius: '12px', padding: '10px 24px'}}
                    >
                        <Trash className="me-2" size={18}/> Xóa Bài Học
                    </Button>
                </div>
            </div>

            <Row>
                {/* CỘT TRÁI: NỘI DUNG (VIDEO/PDF) - Thiết kế card hiện đại */}
                <Col md={7}>
                    <Card className="mb-4 border-0" style={{borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)'}}>
                        <Card.Header className="fw-bold text-white border-0 d-flex align-items-center" 
                                     style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                             borderRadius: '20px 20px 0 0', 
                                             padding: '20px 24px'}}>
                            <Youtube className="me-2" size={24}/> 
                            <span style={{fontSize: '1.1rem'}}>📹 Nội dung & Xem trước</span>
                        </Card.Header>
                        <Card.Body style={{padding: '32px'}}>
                            {/* Input tên bài học với design đẹp hơn */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold" style={{color: '#667eea', fontSize: '0.95rem', marginBottom: '12px'}}>📝 Tên bài học</Form.Label>
                                <Form.Control 
                                    size="lg"
                                    value={lesson.title} 
                                    onChange={e => setLesson({...lesson, title: e.target.value})} 
                                    className="fw-semibold" 
                                    placeholder="Nhập tên bài học..."
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e0e7ff',
                                        padding: '14px 20px',
                                        fontSize: '1.1rem',
                                        color: '#667eea',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            </Form.Group>

                            {/* Video Preview - Bo tròn góc và shadow đẹp hơn */}
                            <div className="mb-4 overflow-hidden position-relative" 
                                 style={{
                                     minHeight: '400px',
                                     borderRadius: '16px',
                                     background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                     boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                 }}>
                                {lesson.videoUrl ? (
                                    isYoutubeLink(lesson.videoUrl) ? (
                                        <iframe 
                                            src={getYoutubeEmbedUrl(lesson.videoUrl)} 
                                            className="w-100" 
                                            style={{height:'400px', borderRadius: '16px'}} 
                                            frameBorder="0" 
                                            allowFullScreen 
                                            title="Preview"
                                        ></iframe>
                                    ) : (
                                        <video 
                                            src={lesson.videoUrl} 
                                            controls 
                                            className="w-100" 
                                            style={{height:'400px', backgroundColor:'black', borderRadius: '16px'}} 
                                        />
                                    )
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center text-white h-100" style={{height:'400px'}}>
                                        <div className="text-center">
                                            <Youtube size={64} className="mb-3" style={{opacity: 0.6}}/>
                                            <p className="m-0 fw-semibold" style={{fontSize: '1.1rem'}}>📹 Chưa có Video</p>
                                            <p className="m-0 mt-2" style={{opacity: 0.8, fontSize: '0.95rem'}}>Hãy tải lên hoặc dán link YouTube bên dưới</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Video Upload Section - Design card đẹp hơn */}
                            <Form.Group className="mb-4 p-4" 
                                        style={{
                                            background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                                            borderRadius: '16px',
                                            border: '2px dashed #fdcb6e'
                                        }}>
                                <Form.Label className="fw-bold mb-3" style={{color: '#2d3436', fontSize: '1rem'}}>
                                    <Youtube className="me-2" size={20}/>🎬 Video Link / Upload File
                                </Form.Label>
                                <InputGroup size="lg">
                                    <Form.Control 
                                        value={lesson.videoUrl || ''} 
                                        onChange={e => setLesson({...lesson, videoUrl: e.target.value})} 
                                        placeholder="Dán link YouTube hoặc upload video..." 
                                        disabled={uploading}
                                        style={{borderRadius: '12px 0 0 12px', border: '2px solid #fdcb6e', padding: '12px 16px'}}
                                    />
                                    <label className={`btn btn-dark ${uploading?'disabled':''}`} 
                                           style={{borderRadius: '0 12px 12px 0', padding: '12px 24px', fontWeight: '600'}}>
                                        <CloudArrowUp className="me-2" size={20}/> Upload Video
                                        <input type="file" hidden accept="video/*" onChange={e => handleFileUpload(e, 'videoUrl')} disabled={uploading}/>
                                    </label>
                                </InputGroup>
                            </Form.Group>

                            {/* PDF Upload Section - Design với màu xanh dương */}
                            <Form.Group className="mb-4 p-4" 
                                        style={{
                                            background: 'linear-gradient(135deg, #a8edea 0%, #74ebd5 100%)',
                                            borderRadius: '16px',
                                            border: '2px dashed #74ebd5'
                                        }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form.Label className="fw-bold m-0" style={{color: '#006666', fontSize: '1rem'}}>
                                        📄 Tài liệu PDF
                                    </Form.Label>
                                    {lesson.attachmentUrl && (
                                        <a href={lesson.attachmentUrl} 
                                           target="_blank" 
                                           rel="noreferrer" 
                                           className="btn btn-sm btn-dark fw-semibold"
                                           style={{borderRadius: '8px', padding: '6px 16px'}}>
                                            <Eye className="me-1" size={14}/> Xem PDF
                                        </a>
                                    )}
                                </div>
                                <InputGroup size="lg" className="mb-3">
                                    <Form.Control 
                                        value={lesson.attachmentUrl || ''} 
                                        onChange={e => setLesson({...lesson, attachmentUrl: e.target.value})} 
                                        placeholder="Dán link PDF hoặc upload file..." 
                                        disabled={uploading}
                                        style={{borderRadius: '12px 0 0 12px', border: '2px solid #74ebd5', padding: '12px 16px'}}
                                    />
                                    <label className={`btn btn-info ${uploading?'disabled':''}`} 
                                           style={{borderRadius: '0 12px 12px 0', padding: '12px 24px', fontWeight: '600', color: 'white', background: '#006666'}}>
                                        <CloudArrowUp className="me-2" size={20}/> Upload PDF
                                        <input type="file" hidden accept="application/pdf" onChange={e => handleFileUpload(e, 'attachmentUrl')} disabled={uploading}/>
                                    </label>
                                </InputGroup>
                                {lesson.attachmentUrl && (
                                    <div className="mt-3 overflow-hidden" style={{height: '250px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                                        <embed src={lesson.attachmentUrl} type="application/pdf" width="100%" height="100%" />
                                    </div>
                                )}
                            </Form.Group>

                            {/* Upload Progress - Design hiện đại */}
                            {uploading && (
                                <Card className="mb-4 border-0" 
                                      style={{
                                          borderRadius: '16px',
                                          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                          boxShadow: '0 6px 20px rgba(255, 154, 158, 0.4)'
                                      }}>
                                    <Card.Body className="d-flex align-items-center justify-content-between p-4">
                                        <div className="w-75">
                                            <div className="fw-bold mb-2" style={{color: '#c0392b', fontSize: '1.05rem'}}>
                                                <CloudArrowUp className="me-2" size={20}/>
                                                Đang tải lên... {uploadProgress}%
                                            </div>
                                            <ProgressBar 
                                                animated 
                                                now={uploadProgress} 
                                                variant="danger" 
                                                style={{height: '14px', borderRadius: '10px'}} 
                                            />
                                        </div>
                                        <Button 
                                            variant="dark" 
                                            size="sm" 
                                            onClick={handleCancelUpload}
                                            className="fw-semibold"
                                            style={{borderRadius: '10px', padding: '8px 20px'}}
                                        >
                                            <XCircle className="me-1" size={16}/> Hủy
                                        </Button>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Nội dung chi tiết - Textarea design đẹp hơn */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold" style={{color: '#667eea', fontSize: '1rem', marginBottom: '12px'}}>
                                    📝 Nội dung chi tiết (Text)
                                </Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={7} 
                                    value={lesson.contentText || ''} 
                                    onChange={e => setLesson({...lesson, contentText: e.target.value})} 
                                    placeholder="Nhập mô tả chi tiết, hướng dẫn, ghi chú cho bài học..."
                                    style={{
                                        borderRadius: '12px',
                                        border: '2px solid #e0e7ff',
                                        padding: '16px',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        resize: 'vertical'
                                    }}
                                />
                            </Form.Group>

                            {/* NÚt Lưu - Gradient button đẹp */}
                            <Button 
                                variant="primary" 
                                className="w-100 fw-bold border-0" 
                                onClick={handleSaveLessonInfo} 
                                disabled={uploading}
                                style={{
                                    background: uploading ? '#cccccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                    transition: 'all 0.3s',
                                    cursor: uploading ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={(e) => { if(!uploading) e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
                            >
                                <Save className="me-2" size={20}/> 💾 Lưu Nội Dung Chính
                            </Button>

                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT PHẢI: BÀI TẬP - Thiết kế card hiện đại */}
                <Col md={5}>
                    {/* Quiz Card - Gradient xanh lá */}
                    <Card className="mb-4 border-0" style={{borderRadius: '20px', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.15)'}}>
                        <Card.Header className="text-white border-0 d-flex justify-content-between align-items-center" 
                                     style={{
                                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                         borderRadius: '20px 20px 0 0',
                                         padding: '20px 24px'
                                     }}>
                            <span className="fw-bold" style={{fontSize: '1.1rem'}}>
                                <QuestionCircle className="me-2" size={24}/> ❓ Trắc Nghiệm
                            </span>
                            <Button 
                                variant="light" 
                                size="sm" 
                                onClick={() => openQuizModal()}
                                className="fw-semibold"
                                style={{borderRadius: '10px', padding: '8px 16px'}}
                            >
                                <Plus className="me-1" size={16}/> Tạo Mới
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0" style={{background: '#f0fdf4'}}>
                            <ListGroup variant="flush">
                                {lesson.quizzes?.map((q, idx) => (
                                    <ListGroup.Item 
                                        key={idx} 
                                        className="d-flex justify-content-between align-items-center border-0" 
                                        onClick={() => openQuizModal(q)} 
                                        style={{
                                            cursor: 'pointer',
                                            padding: '18px 24px',
                                            background: idx % 2 === 0 ? '#ffffff' : '#f0fdf4',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f0fdf4'; }}
                                    >
                                        <div>
                                            <strong style={{color: '#059669', fontSize: '1rem'}}>
                                                {idx+1}. {q.title}
                                            </strong>
                                            <Badge 
                                                bg="success" 
                                                pill 
                                                className="ms-2"
                                                style={{padding: '6px 12px', fontWeight: '600'}}
                                            >
                                                {q.questions?.length} câu
                                            </Badge>
                                        </div>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q.quizId); }}
                                            style={{borderRadius: '8px', padding: '6px 12px'}}
                                        >
                                            <Trash size={14}/>
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                                {(!lesson.quizzes || lesson.quizzes.length === 0) && (
                                    <div className="p-4 text-center" style={{color: '#6b7280'}}>
                                        <QuestionCircle size={40} className="mb-2" style={{opacity: 0.3}}/>
                                        <p className="m-0">Chưa có bài trắc nghiệm</p>
                                        <small>Nhấn "Tạo Mới" để bắt đầu</small>
                                    </div>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Assignment Card - Gradient cam/vàng */}
                    <Card className="border-0" style={{borderRadius: '20px', boxShadow: '0 10px 40px rgba(251, 146, 60, 0.15)'}}>
                        <Card.Header className="text-dark border-0 d-flex justify-content-between align-items-center" 
                                     style={{
                                         background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                                         borderRadius: '20px 20px 0 0',
                                         padding: '20px 24px'
                                     }}>
                            <span className="fw-bold text-white" style={{fontSize: '1.1rem'}}>
                                <JournalText className="me-2" size={24}/> 📝 Tự Luận
                            </span>
                            <Button 
                                variant="light" 
                                size="sm" 
                                onClick={() => openAssignModal()}
                                className="fw-semibold"
                                style={{borderRadius: '10px', padding: '8px 16px'}}
                            >
                                <Plus className="me-1" size={16}/> Tạo Mới
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0" style={{background: '#fffbeb'}}>
                            <ListGroup variant="flush">
                                {lesson.assignments?.map((a, idx) => (
                                    <ListGroup.Item 
                                        key={idx} 
                                        className="d-flex justify-content-between align-items-center border-0" 
                                        onClick={() => openAssignModal(a)} 
                                        style={{
                                            cursor: 'pointer',
                                            padding: '18px 24px',
                                            background: idx % 2 === 0 ? '#ffffff' : '#fffbeb',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef3c7'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fffbeb'; }}
                                    >
                                        <div>
                                            <strong style={{color: '#d97706', fontSize: '1rem'}}>{a.title}</strong>
                                            {a.attachmentUrl && (
                                                <Badge 
                                                    bg="warning" 
                                                    text="dark" 
                                                    className="ms-2"
                                                    style={{padding: '6px 12px', fontWeight: '600'}}
                                                >
                                                    📄 File
                                                </Badge>
                                            )}
                                        </div>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAssign(a.assignmentId); }}
                                            style={{borderRadius: '8px', padding: '6px 12px'}}
                                        >
                                            <Trash size={14}/>
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                                {(!lesson.assignments || lesson.assignments.length === 0) && (
                                    <div className="p-4 text-center" style={{color: '#6b7280'}}>
                                        <JournalText size={40} className="mb-2" style={{opacity: 0.3}}/>
                                        <p className="m-0">Chưa có bài tự luận</p>
                                        <small>Nhấn "Tạo Mới" để bắt đầu</small>
                                    </div>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* MODAL QUIZ - Thiết kế hiện đại */}
            <Modal show={showQuizModal} onHide={() => setShowQuizModal(false)} size="lg" backdrop="static">
                <Modal.Header closeButton className="text-white border-0" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '24px'}}>
                    <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                        {currentQuizId ? "✏️ Sửa Trắc Nghiệm" : "➕ Tạo Trắc Nghiệm"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{maxHeight: '75vh', overflowY: 'auto', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '28px'}}>
                    {/* Input tên Quiz */}
                    <div className="bg-white p-4 mb-4" style={{borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)'}}>
                        <Form.Label className="fw-bold mb-2" style={{color: '#059669', fontSize: '1rem'}}>📋 Tên bài kiểm tra</Form.Label>
                        <Form.Control 
                            value={quizTitle} 
                            onChange={e => setQuizTitle(e.target.value)} 
                            placeholder="VD: Kiểm tra 15 phút - Chương 1..." 
                            size="lg"
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #10b981',
                                padding: '14px 18px',
                                fontWeight: '600',
                                fontSize: '1.05rem'
                            }}
                        />
                    </div>
                    {/* Danh sách câu hỏi - Design card đẹp hơn */}
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="mb-4 p-4 bg-white position-relative" 
                             style={{
                                 borderRadius: '16px',
                                 boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                 border: '2px solid #d1fae5'
                             }}>
                            {/* Header câu hỏi */}
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{borderBottom: '2px solid #f0fdf4'}}>
                                <strong className="text-success" style={{fontSize: '1.1rem'}}>
                                    ❓ Câu hỏi {qIdx+1}
                                </strong> 
                                <Button 
                                    variant="link" 
                                    className="text-danger p-0 text-decoration-none fw-semibold" 
                                    onClick={() => {const n=[...questions]; n.splice(qIdx,1); setQuestions(n)}}
                                    style={{fontSize: '0.95rem'}}
                                >
                                    <Trash className="me-1" size={16}/> Xóa câu này
                                </Button>
                            </div>
                            {/* Input nội dung câu hỏi */}
                            <Form.Control 
                                className="mb-3 fw-semibold" 
                                placeholder="Nhập nội dung câu hỏi (VD: $x^2$)..." 
                                value={q.content} 
                                onChange={e => handleQChange(qIdx, e.target.value)} 
                                style={{
                                    borderRadius: '10px',
                                    border: '2px solid #10b981',
                                    padding: '12px 16px',
                                    fontSize: '1rem'
                                }}
                            />
                            {/* Preview LaTeX */}
                            {hasLatex(q.content) && (
                                <div className="mb-3 ps-3 py-2" 
                                     style={{
                                         borderLeft: '4px solid #10b981',
                                         background: '#f0fdf4',
                                         borderRadius: '0 8px 8px 0'
                                     }}>
                                    <small className="text-success fw-semibold d-block mb-1">Xem trước:</small>
                                    <MathText text={q.content} />
                                </div>
                            )}
                            {/* Các đáp án - Design đẹp hơn */}
                            <Row>
                                {q.options.map((opt, oIndex) => (
                                    <Col md={6} key={oIndex} className="mb-3">
                                        <InputGroup 
                                            className={opt.isCorrect ? "" : ""} 
                                            style={{
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                border: opt.isCorrect ? '2px solid #10b981' : '2px solid #e5e7eb',
                                                background: opt.isCorrect ? '#f0fdf4' : '#ffffff'
                                            }}>
                                            <InputGroup.Text 
                                                className={opt.isCorrect ? "fw-bold border-0" : "fw-bold border-0"} 
                                                style={{
                                                    background: opt.isCorrect ? '#10b981' : '#f3f4f6',
                                                    color: opt.isCorrect ? 'white' : '#374151',
                                                    width: '50px',
                                                    justifyContent: 'center',
                                                    fontSize: '1.05rem'
                                                }}>
                                                {getOptionLabel(oIndex)}
                                            </InputGroup.Text>
                                            <InputGroup.Checkbox 
                                                checked={opt.isCorrect} 
                                                onChange={() => handleCorrect(qIdx, oIndex)} 
                                                style={{transform: 'scale(1.3)', margin: '0 12px'}}
                                            />
                                            <Form.Control 
                                                value={opt.content} 
                                                onChange={e => handleOChange(qIdx, oIndex, e.target.value)} 
                                                placeholder={`Nhập đáp án ${getOptionLabel(oIndex)}...`} 
                                                className="border-0"
                                                style={{
                                                    backgroundColor: opt.isCorrect ? '#f0fdf4' : '#ffffff',
                                                    fontWeight: opt.isCorrect ? '600' : '400',
                                                    padding: '10px 12px'
                                                }} 
                                            />
                                        </InputGroup>
                                        {/* Preview LaTeX cho option */}
                                        {hasLatex(opt.content) && (
                                            <div className="ms-5 mt-1 text-muted small">
                                                <MathText text={opt.content} />
                                            </div>
                                        )}
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                    {/* Button thêm câu hỏi - Gradient button */}
                    <div className="text-center">
                        <Button 
                            variant="outline-success" 
                            className="fw-semibold border-2" 
                            onClick={handleAddQuestion}
                            style={{
                                borderRadius: '12px',
                                padding: '12px 40px',
                                fontSize: '1rem',
                                minWidth: '250px'
                            }}
                        >
                            <Plus size={20} className="me-2"/> Thêm câu hỏi mới
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{background: '#f0fdf4', borderTop: '2px solid #d1fae5', padding: '20px 24px'}}>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowQuizModal(false)}
                        style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleSaveQuiz}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 32px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        {currentQuizId ? "✔️ Cập Nhật" : "💾 Lưu Mới"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL ASSIGNMENT - Thiết kế hiện đại */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
                <Modal.Header closeButton className="text-white border-0" style={{background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)', padding: '24px'}}>
                    <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                        {currentAssignId ? "✏️ Sửa Bài Tập" : "➕ Giao Bài Tập"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', padding: '28px'}}>
                    {/* Input tiêu đề */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold mb-2" style={{color: '#d97706', fontSize: '1rem'}}>
                            📋 Tiêu đề bài tập
                        </Form.Label>
                        <Form.Control 
                            value={assignData.title} 
                            onChange={e => setAssignData({...assignData, title: e.target.value})} 
                            placeholder="VD: Bài tập về nhà - Tuần 1..."
                            size="lg"
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #fb923c',
                                padding: '14px 18px',
                                fontWeight: '600',
                                fontSize: '1.05rem'
                            }}
                        />
                    </Form.Group>
                    {/* Upload file đề bài */}
                    <Form.Group className="mb-4 p-4 bg-white" style={{borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)'}}>
                        <Form.Label className="fw-bold mb-3" style={{color: '#d97706', fontSize: '1rem'}}>
                            📄 File Đề Bài (PDF)
                        </Form.Label>
                        <InputGroup size="lg">
                            <Form.Control 
                                value={assignData.attachmentUrl || ''} 
                                readOnly 
                                placeholder="Chưa có file..." 
                                style={{
                                    borderRadius: '12px 0 0 12px',
                                    border: '2px solid #fbbf24',
                                    padding: '12px 16px'
                                }}
                            />
                            <label 
                                className="btn btn-warning border-0" 
                                style={{
                                    borderRadius: '0',
                                    padding: '12px 20px',
                                    fontWeight: '600',
                                    color: 'white',
                                    background: '#f59e0b'
                                }}>
                                <CloudArrowUp className="me-2" size={20}/> Upload
                                <input type="file" hidden onChange={e => handleFileUpload(e, 'assign')} disabled={uploading}/>
                            </label>
                            {assignData.attachmentUrl && (
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setShowFilePreview(!showFilePreview)}
                                    style={{
                                        borderRadius: '0 12px 12px 0',
                                        padding: '12px 20px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {showFilePreview ? <EyeSlash size={18}/> : <Eye size={18}/>}
                                </Button>
                            )}
                        </InputGroup>
                        {showFilePreview && assignData.attachmentUrl && (
                            <div className="mt-3 overflow-hidden" style={{height: '350px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                                <embed src={assignData.attachmentUrl} width="100%" height="100%" type="application/pdf" />
                            </div>
                        )}
                        {uploading && (
                            <ProgressBar 
                                animated 
                                now={uploadProgress} 
                                className="mt-3" 
                                variant="warning" 
                                label={`${uploadProgress}%`} 
                                style={{height: '12px', borderRadius: '10px'}}
                            />
                        )}
                    </Form.Group>
                    {/* Hướng dẫn */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold mb-2" style={{color: '#d97706', fontSize: '1rem'}}>
                            📝 Hướng dẫn / Đề bài (Hỗ trợ Latex)
                        </Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={6} 
                            value={assignData.instructions} 
                            onChange={e => setAssignData({...assignData, instructions: e.target.value})} 
                            placeholder="Nhập hướng dẫn chi tiết (VD: Giải phương trình $\sqrt{x}$)..."
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #fbbf24',
                                padding: '14px 18px',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                resize: 'vertical'
                            }}
                        />
                        {hasLatex(assignData.instructions) && (
                            <div className="mt-3 p-3 bg-white" style={{borderRadius: '12px', border: '2px solid #fbbf24'}}>
                                <strong style={{color: '#d97706'}}>👁️ Xem trước:</strong>
                                <div className="mt-2">
                                    <MathText text={assignData.instructions} />
                                </div>
                            </div>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{background: '#fffbeb', borderTop: '2px solid #fde68a', padding: '20px 24px'}}>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowAssignModal(false)}
                        style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={handleSaveAssignment}
                        style={{
                            background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 32px',
                            fontWeight: '600',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.3)'
                        }}
                    >
                        {currentAssignId ? "✔️ Cập Nhật" : "💾 Giao Bài"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default LessonManager;