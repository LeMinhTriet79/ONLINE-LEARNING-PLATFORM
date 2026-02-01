import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Container, Button, Form, Row, Col, Card, ProgressBar, Badge, Table, Modal, InputGroup, ListGroup } from 'react-bootstrap';
import { CloudArrowUp, CheckCircleFill, Trash, Plus, Save, ArrowLeft, QuestionCircle, JournalText, Youtube, FileEarmarkPdfFill, FileText, XCircle, Eye, EyeSlash } from 'react-bootstrap-icons';
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
    
    // 1. Fetch ban đầu (Load hết sạch sành sanh)
    const fetchLessonInitial = async () => {
        try {
            const res = await axiosClient.get(`/teacher/lessons/${lessonId}`); 
            if (res.data.status) setLesson(res.data.data);
        } catch (error) { toast.error("Lỗi tải bài học"); } finally { setLoading(false); }
    };

    // 2. Fetch thông minh (Chỉ update danh sách Quiz/Assign, GIỮ NGUYÊN Video/PDF đang nhập dở)
    const reloadListsOnly = async () => {
        try {
            const res = await axiosClient.get(`/teacher/lessons/${lessonId}`);
            if (res.data.status) {
                const freshData = res.data.data;
                setLesson(prev => ({
                    ...prev, // Giữ nguyên title, videoUrl, attachmentUrl cũ (đang nhập dở)
                    quizzes: freshData.quizzes,       // Chỉ cập nhật list mới
                    assignments: freshData.assignments // Chỉ cập nhật list mới
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

    // --- QUIZ ACTIONS ---
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
            reloadListsOnly(); // <--- CHỈ RELOAD LIST, KHÔNG RELOAD FORM CHÍNH
        } catch (error) { toast.error("Lỗi lưu Quiz"); }
    };

    const handleDeleteQuiz = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa bài kiểm tra này?")) return;
        try {
            await axiosClient.delete(`/teacher/quizzes/${id}`);
            toast.success("Đã xóa Quiz"); 
            reloadListsOnly(); // <--- CHỈ RELOAD LIST
        } catch(e) { toast.error("Lỗi xóa"); }
    };

    // --- ASSIGNMENT ACTIONS ---
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
            reloadListsOnly(); // <--- CHỈ RELOAD LIST
        } catch (error) { toast.error("Lỗi lưu bài tập"); }
    };

    const handleDeleteAssign = async (id) => {
        if(!window.confirm("Xóa bài tập này?")) return;
        try {
            await axiosClient.delete(`/teacher/assignments/${id}`);
            toast.success("Đã xóa"); 
            reloadListsOnly(); // <--- CHỈ RELOAD LIST
        } catch(e) { toast.error("Lỗi xóa"); }
    };

    // Quiz Logic
    const handleAddQuestion = () => setQuestions([...questions, { content: '', options: [{ content: '', isCorrect: true }, { content: '', isCorrect: false }, { content: '', isCorrect: false }, { content: '', isCorrect: false }] }]);
    const handleQChange = (i, v) => { const n = [...questions]; n[i].content = v; setQuestions(n); };
    const handleOChange = (qi, oi, v) => { const n = [...questions]; n[qi].options[oi].content = v; setQuestions(n); };
    const handleCorrect = (qi, oi) => { const n = [...questions]; n[qi].options.forEach((o, k) => o.isCorrect = (k === oi)); setQuestions(n); };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <Container fluid className="py-4 bg-light" style={{minHeight: '100vh'}}>
            {/* HEADER */}
            <div className="d-flex align-items-center justify-content-between bg-white p-3 shadow-sm rounded mb-4">
                <div className="d-flex align-items-center">
                    <Button variant="light" className="me-3" onClick={handleGoBack}><ArrowLeft/> Quay lại</Button>
                    <h4 className="m-0 text-primary">Biên tập: {lesson.title}</h4>
                </div>
                <Button variant="primary" onClick={handleSaveLessonInfo} disabled={uploading}><Save className="me-2"/> Lưu Nội Dung Chính</Button>
            </div>

            <Row>
                {/* CỘT TRÁI: NỘI DUNG */}
                <Col md={7}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-white fw-bold text-danger"><Youtube className="me-2"/> Nội dung & Xem trước</Card.Header>
                        <Card.Body>
                            <div className="mb-4 bg-dark rounded overflow-hidden position-relative" style={{minHeight: '300px'}}>
                                {lesson.videoUrl ? (
                                    isYoutubeLink(lesson.videoUrl) ? (
                                        <iframe src={getYoutubeEmbedUrl(lesson.videoUrl)} className="w-100" style={{height:'400px'}} frameBorder="0" allowFullScreen title="Preview"></iframe>
                                    ) : (
                                        <video src={lesson.videoUrl} controls className="w-100" style={{height:'400px', backgroundColor:'black'}} />
                                    )
                                ) : (<div className="d-flex align-items-center justify-content-center text-white h-100" style={{height:'300px'}}><p>Chưa có Video.</p></div>)}
                            </div>

                            <Form.Group className="mb-3"><Form.Label className="fw-bold">Tên bài học</Form.Label><Form.Control value={lesson.title} onChange={e => setLesson({...lesson, title: e.target.value})} className="fw-bold fs-5" /></Form.Group>

                            <Form.Group className="mb-3 p-3 border rounded bg-light">
                                <Form.Label className="fw-bold">Video Link / Upload</Form.Label>
                                <InputGroup>
                                    <Form.Control value={lesson.videoUrl || ''} onChange={e => setLesson({...lesson, videoUrl: e.target.value})} placeholder="Link Youtube..." disabled={uploading}/>
                                    <label className={`btn btn-danger ${uploading?'disabled':''}`}><CloudArrowUp/> Upload <input type="file" hidden accept="video/*" onChange={e => handleFileUpload(e, 'videoUrl')} disabled={uploading}/></label>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3 p-3 border rounded bg-light">
                                <div className="d-flex justify-content-between mb-2">
                                    <Form.Label className="fw-bold">Tài liệu PDF</Form.Label>
                                    {lesson.attachmentUrl && <a href={lesson.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary small">Mở PDF</a>}
                                </div>
                                <InputGroup className="mb-2">
                                    <Form.Control value={lesson.attachmentUrl || ''} onChange={e => setLesson({...lesson, attachmentUrl: e.target.value})} placeholder="Link PDF..." disabled={uploading}/>
                                    <label className={`btn btn-primary ${uploading?'disabled':''}`}><CloudArrowUp/> Upload PDF <input type="file" hidden accept="application/pdf" onChange={e => handleFileUpload(e, 'attachmentUrl')} disabled={uploading}/></label>
                                </InputGroup>
                                {lesson.attachmentUrl && <div className="mt-2 border rounded overflow-hidden" style={{height: '200px'}}><embed src={lesson.attachmentUrl} type="application/pdf" width="100%" height="100%" /></div>}
                            </Form.Group>

                            {uploading && <Card className="mb-3 border-warning bg-warning bg-opacity-10"><Card.Body className="d-flex align-items-center justify-content-between py-2"><div className="w-75"><div className="fw-bold text-dark mb-1">Đang tải lên... {uploadProgress}%</div><ProgressBar animated now={uploadProgress} variant="success" style={{height: '10px'}} /></div><Button variant="danger" size="sm" onClick={handleCancelUpload}><XCircle/> Hủy</Button></Card.Body></Card>}

                            <Form.Group><Form.Label className="fw-bold">Nội dung chi tiết (Text)</Form.Label><Form.Control as="textarea" rows={6} value={lesson.contentText || ''} onChange={e => setLesson({...lesson, contentText: e.target.value})} /></Form.Group>
                        </Card.Body>
                    </Card>
                </Col>

                {/* CỘT PHẢI: BÀI TẬP */}
                <Col md={5}>
                    <Card className="shadow-sm mb-4 border-success">
                        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                            <span><QuestionCircle className="me-2"/> Trắc Nghiệm</span>
                            <Button variant="light" size="sm" onClick={() => openQuizModal()}><Plus/> Tạo Mới</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {lesson.quizzes?.map((q, idx) => (
                                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center" onClick={() => openQuizModal(q)} style={{ cursor: 'pointer' }}>
                                        <div><strong>{idx+1}. {q.title}</strong> <Badge bg="success" pill>{q.questions?.length} câu</Badge></div>
                                        <Button variant="outline-danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q.quizId); }}><Trash/></Button>
                                    </ListGroup.Item>
                                ))}
                                {(!lesson.quizzes || lesson.quizzes.length === 0) && <div className="p-3 text-center text-muted">Chưa có bài trắc nghiệm.</div>}
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-warning">
                        <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
                            <span><JournalText className="me-2"/> Tự Luận</span>
                            <Button variant="light" size="sm" onClick={() => openAssignModal()}><Plus/> Tạo Mới</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {lesson.assignments?.map((a, idx) => (
                                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center" onClick={() => openAssignModal(a)} style={{ cursor: 'pointer' }}>
                                        <div><strong>{a.title}</strong> {a.attachmentUrl && <Badge bg="info">File</Badge>}</div>
                                        <Button variant="outline-danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteAssign(a.assignmentId); }}><Trash/></Button>
                                    </ListGroup.Item>
                                ))}
                                {(!lesson.assignments || lesson.assignments.length === 0) && <div className="p-3 text-center text-muted">Chưa có bài tự luận.</div>}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- MODAL QUIZ --- */}
            <Modal show={showQuizModal} onHide={() => setShowQuizModal(false)} size="lg" backdrop="static">
                <Modal.Header closeButton className="bg-success text-white"><Modal.Title>{currentQuizId ? "Sửa Trắc Nghiệm" : "Tạo Trắc Nghiệm"}</Modal.Title></Modal.Header>
                <Modal.Body style={{maxHeight: '75vh', overflowY: 'auto', backgroundColor: '#f0f2f5'}}>
                    <div className="bg-white p-3 rounded shadow-sm mb-3">
                        <Form.Label className="fw-bold">Tên bài kiểm tra</Form.Label>
                        <Form.Control value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="VD: Kiểm tra 15 phút..." />
                    </div>
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="mb-3 p-3 border rounded bg-white shadow-sm position-relative">
                            <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                                <strong className="text-success">Câu hỏi {qIdx+1}</strong> 
                                <Button variant="link" className="text-danger p-0 text-decoration-none" onClick={() => {const n=[...questions]; n.splice(qIdx,1); setQuestions(n)}}><Trash/> Xóa câu này</Button>
                            </div>
                            <Form.Control className="mb-2 fw-bold" placeholder="Nhập nội dung câu hỏi (VD: $x^2$)..." value={q.content} onChange={e => handleQChange(qIdx, e.target.value)} />
                            {hasLatex(q.content) && (<div className="text-primary small mb-3 ps-2 border-start border-3 border-primary bg-light p-1"><MathText text={q.content} /></div>)}
                            <Row>
                                {q.options.map((opt, oIndex) => (
                                    <Col md={6} key={oIndex} className="mb-2">
                                        <InputGroup className={opt.isCorrect ? "border border-success rounded" : ""}>
                                            <InputGroup.Text className={opt.isCorrect ? "bg-success text-white fw-bold" : "bg-light fw-bold"}>{getOptionLabel(oIndex)}</InputGroup.Text>
                                            <InputGroup.Checkbox checked={opt.isCorrect} onChange={() => handleCorrect(qIdx, oIndex)} />
                                            <Form.Control value={opt.content} onChange={e => handleOChange(qIdx, oIndex, e.target.value)} placeholder={`Nhập đáp án ${getOptionLabel(oIndex)}...`} style={opt.isCorrect ? {backgroundColor: '#e8f5e9', fontWeight: '500'} : {}} />
                                        </InputGroup>
                                        {hasLatex(opt.content) && (<div className="text-muted small ms-5"><MathText text={opt.content} /></div>)}
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                    <div className="text-center"><Button variant="outline-success" className="w-50" onClick={handleAddQuestion}><Plus/> Thêm câu hỏi mới</Button></div>
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowQuizModal(false)}>Hủy</Button><Button variant="success" onClick={handleSaveQuiz}>{currentQuizId ? "Cập Nhật" : "Lưu Mới"}</Button></Modal.Footer>
            </Modal>

            {/* --- MODAL ASSIGNMENT --- */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
                <Modal.Header closeButton className="bg-warning"><Modal.Title>{currentAssignId ? "Sửa Bài Tập" : "Giao Bài Tập"}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3"><Form.Label>Tiêu đề</Form.Label><Form.Control value={assignData.title} onChange={e => setAssignData({...assignData, title: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>File Đề Bài</Form.Label>
                        <InputGroup>
                            <Form.Control value={assignData.attachmentUrl || ''} readOnly placeholder="Chưa có file..." />
                            <label className="btn btn-primary"><CloudArrowUp/> Upload <input type="file" hidden onChange={e => handleFileUpload(e, 'assign')} disabled={uploading}/></label>
                            {assignData.attachmentUrl && (<Button variant="outline-secondary" onClick={() => setShowFilePreview(!showFilePreview)}>{showFilePreview ? <EyeSlash/> : <Eye/>}</Button>)}
                        </InputGroup>
                        {showFilePreview && assignData.attachmentUrl && (<div className="mt-2 border rounded overflow-hidden" style={{height: '300px'}}><embed src={assignData.attachmentUrl} width="100%" height="100%" type="application/pdf" /></div>)}
                        {uploading && <ProgressBar animated now={uploadProgress} className="mt-2" variant="info" label={`${uploadProgress}%`} />}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Hướng dẫn / Đề bài (Hỗ trợ Latex)</Form.Label>
                        <Form.Control as="textarea" rows={5} value={assignData.instructions} onChange={e => setAssignData({...assignData, instructions: e.target.value})} placeholder="Nhập hướng dẫn (VD: $\sqrt{x}$)..." />
                        {hasLatex(assignData.instructions) && (<div className="mt-2 p-2 bg-white border rounded"><strong>Xem trước:</strong> <br/><MathText text={assignData.instructions} /></div>)}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowAssignModal(false)}>Hủy</Button><Button variant="warning" onClick={handleSaveAssignment}>{currentAssignId ? "Cập Nhật" : "Giao Bài"}</Button></Modal.Footer>
            </Modal>
        </Container>
    );
};

export default LessonManager;