import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Alert, Badge, Card, ProgressBar } from 'react-bootstrap';
import { CloudArrowUp, FileEarmarkText, Trash, CheckCircle, XCircle, Eye, EyeSlash } from 'react-bootstrap-icons';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const SubmitAssignment = ({ show, handleClose, assignment }) => {
    const [fileUrl, setFileUrl] = useState('');
    const [textResponse, setTextResponse] = useState('');
    
    // Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [submission, setSubmission] = useState(null); // Bài đã nộp
    const [showPreview, setShowPreview] = useState(true); // Toggle xem trước

    useEffect(() => {
        if (show && assignment) {
            fetchSubmission();
            setFileUrl('');
            setTextResponse('');
            setShowPreview(true);
        }
    }, [show, assignment]);

    const fetchSubmission = async () => {
        try {
            const res = await axiosClient.get(`/student/assignment/${assignment.assignmentId}/latest`);
            if (res.data.status) setSubmission(res.data.data);
        } catch (error) { setSubmission(null); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        
        setUploading(true);
        setUploadProgress(0);

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
            });
            if (res.data.status) {
                setFileUrl(res.data.data);
                toast.success("Upload thành công!");
                setShowPreview(true); // Tự động hiện preview khi up xong
            }
        } catch (error) { toast.error("Lỗi upload file"); } 
        finally { setUploading(false); }
    };

    const handleSubmit = async () => {
        if (!fileUrl && !textResponse) { toast.warning("Nhập nội dung hoặc file!"); return; }
        try {
            await axiosClient.post('/student/assignment/submit', {
                assignmentId: assignment.assignmentId,
                fileUrl: fileUrl,
                textResponse: textResponse
            });
            toast.success("Nộp bài thành công!");
            fetchSubmission();
        } catch (error) { toast.error("Lỗi nộp bài!"); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn muốn thu hồi bài nộp này?")) return;
        try {
            await axiosClient.delete(`/student/submissions/${submission.submissionId}`);
            toast.success("Đã thu hồi bài làm.");
            setSubmission(null);
        } catch (error) { toast.error("Không thể xóa bài đã chấm!"); }
    };

    // --- HELPER: RENDER PREVIEW (Dùng chung cho cả lúc nộp và lúc xem lại) ---
    const renderFilePreview = (url) => {
        if (!url || !showPreview) return null;

        // Check đuôi file đơn giản
        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
        const isPdf = url.match(/\.pdf$/i);

        return (
            <div className="mt-2 border rounded bg-light overflow-hidden text-center position-relative">
                {isImage ? (
                    <img src={url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                ) : isPdf ? (
                    <div style={{ height: '300px' }}>
                        <embed src={url} width="100%" height="100%" type="application/pdf" />
                    </div>
                ) : (
                    <div className="p-4 text-muted">
                        <FileEarmarkText size={40} className="mb-2"/>
                        <p className="m-0 small">File này không hỗ trợ xem trước. Vui lòng tải về.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Nộp Bài: {assignment?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '80vh', overflowY: 'auto'}}>
                {/* ĐỀ BÀI */}
                <Alert variant="info" className="small mb-3">
                    <strong>Đề bài:</strong> {assignment?.instructions}
                </Alert>
                {assignment?.attachmentUrl && (
                    <div className="mb-4">
                        <a href={assignment.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                            <CloudArrowUp className="me-1"/> Tải Đề Bài (PDF)
                        </a>
                    </div>
                )}

                {/* --- TRƯỜNG HỢP 1: ĐÃ NỘP BÀI (XEM LẠI & KẾT QUẢ) --- */}
                {submission ? (
                    <Card className="border-primary mb-3 shadow-sm">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Bài nộp của bạn</span>
                            <Badge bg={submission.status === 'GRADED' ? 'success' : 'warning'} text="dark">
                                {submission.status === 'GRADED' ? 'Đã Chấm' : 'Đang Chờ Chấm'}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            {/* PREVIEW BÀI ĐÃ NỘP */}
                            {submission.attachmentUrl && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <a href={submission.attachmentUrl} target="_blank" rel="noreferrer" className="fw-bold text-decoration-none">
                                            <FileEarmarkText className="me-1"/> Link file gốc
                                        </a>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setShowPreview(!showPreview)}>
                                            {showPreview ? <><EyeSlash/> Ẩn xem trước</> : <><Eye/> Xem file</>}
                                        </Button>
                                    </div>
                                    {renderFilePreview(submission.attachmentUrl)}
                                </div>
                            )}

                            {submission.studentTextResponse && (
                                <Alert variant="secondary" className="p-2 small">
                                    <strong>Ghi chú của bạn:</strong> "{submission.studentTextResponse}"
                                </Alert>
                            )}
                            
                            {/* KẾT QUẢ CHẤM */}
                            {submission.status === 'GRADED' && (
                                <div className="mt-3 pt-3 border-top bg-light p-2 rounded">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className={`m-0 ${submission.score >= 5 ? "text-success" : "text-danger"}`}>
                                            Điểm: <span className="fw-bold display-6">{submission.score}</span>/10
                                        </h5>
                                        <span className="badge bg-secondary">Feedback giáo viên</span>
                                    </div>
                                    <p className="text-muted mt-2 fst-italic border-start border-4 border-warning ps-2">
                                        "{submission.teacherFeedback || "Không có nhận xét"}"
                                    </p>
                                </div>
                            )}

                            {/* NÚT THU HỒI (CHỈ KHI CHƯA CHẤM) */}
                            {submission.status === 'PENDING' && (
                                <Button variant="outline-danger" size="sm" className="mt-3 w-100" onClick={handleDelete}>
                                    <Trash className="me-1"/> Thu hồi & Nộp lại
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                ) : (
                    // --- TRƯỜNG HỢP 2: CHƯA NỘP (FORM UPLOAD) ---
                    <div className="p-1">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">File bài làm (Ảnh/PDF)</Form.Label>
                            <InputGroup>
                                <Form.Control value={fileUrl} placeholder="Link file..." readOnly />
                                <label className={`btn btn-primary ${uploading?'disabled':''}`}>
                                    <CloudArrowUp/> Upload <input type="file" hidden onChange={handleFileUpload} disabled={uploading}/>
                                </label>
                                {/* Nút bật/tắt preview khi đang upload */}
                                {fileUrl && (
                                    <Button variant="outline-secondary" onClick={() => setShowPreview(!showPreview)}>
                                        {showPreview ? <EyeSlash/> : <Eye/>}
                                    </Button>
                                )}
                            </InputGroup>
                            
                            {/* Thanh tiến độ upload */}
                            {uploading && <ProgressBar animated now={uploadProgress} className="mt-2" variant="success" label={`${uploadProgress}%`} style={{height: '10px'}}/>}
                            
                            {/* PREVIEW FILE VỪA UPLOAD */}
                            {fileUrl && renderFilePreview(fileUrl)}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Ghi chú / Trả lời trực tiếp</Form.Label>
                            <Form.Control 
                                as="textarea" rows={3} 
                                value={textResponse} 
                                onChange={e => setTextResponse(e.target.value)} 
                                placeholder="Nhập câu trả lời hoặc lời nhắn cho giáo viên..."
                            />
                        </Form.Group>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                {!submission && <Button variant="success" onClick={handleSubmit} disabled={uploading}>Xác Nhận Nộp</Button>}
            </Modal.Footer>
        </Modal>
    );
};

export default SubmitAssignment;