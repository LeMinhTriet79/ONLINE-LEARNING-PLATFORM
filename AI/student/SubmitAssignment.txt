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
            {/* Header - Gradient cam/vàng */}
            <Modal.Header closeButton className="border-0 text-white" style={{background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)', padding: '24px'}}>
                <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                    📝 Nộp Bài: {assignment?.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '80vh', overflowY: 'auto', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', padding: '28px'}}>
                {/* ĐỀ BÀI - Card hiện đại */}
                <div className="mb-4 p-4 bg-white" style={{borderRadius: '16px', border: '2px solid #fbbf24', boxShadow: '0 4px 12px rgba(251, 146, 60, 0.15)'}}>
                    <div className="d-flex align-items-start">
                        <div className="me-3" style={{fontSize: '2rem'}}>📝</div>
                        <div className="flex-grow-1">
                            <h6 className="fw-bold mb-2" style={{color: '#d97706'}}>Đề bài tập:</h6>
                            <p className="mb-0" style={{fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563'}}>
                                {assignment?.instructions}
                            </p>
                        </div>
                    </div>
                </div>
                {assignment?.attachmentUrl && (
                    <div className="mb-4">
                        <a 
                            href={assignment.attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn fw-semibold text-white border-0"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                padding: '12px 24px',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}>
                            <CloudArrowUp className="me-2" size={18}/> 📄 Tải Đề Bài (PDF)
                        </a>
                    </div>
                )}

                {/* --- TRƯỜNG HỢP 1: ĐÃ NỘP BÀI (XEM LẠI & KẾT QUẢ) --- */}
                {submission ? (
                    <Card className="border-0 mb-3" style={{borderRadius: '20px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'}}>
                        <Card.Header 
                            className="text-white d-flex justify-content-between align-items-center border-0"
                            style={{
                                background: submission.status === 'GRADED' 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                                borderRadius: '20px 20px 0 0',
                                padding: '20px 24px'
                            }}>
                            <span className="fw-bold" style={{fontSize: '1.1rem'}}>
                                ✅ Bài nộp của bạn
                            </span>
                            <Badge 
                                style={{
                                    background: submission.status === 'GRADED' ? '#fbbf24' : '#fbbf24',
                                    color: '#1f2937',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                {submission.status === 'GRADED' ? '✅ Đã Chấm' : '⏳ Đang Chờ Chấm'}
                            </Badge>
                        </Card.Header>
                        <Card.Body style={{padding: '24px', background: '#ffffff'}}>
                            {/* PREVIEW BÀI ĐÃ NỘP */}
                            {submission.attachmentUrl && (
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <a 
                                            href={submission.attachmentUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="fw-semibold text-decoration-none"
                                            style={{color: '#667eea', fontSize: '1rem'}}>
                                            <FileEarmarkText className="me-2" size={20}/> 🔗 Link file gốc
                                        </a>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            onClick={() => setShowPreview(!showPreview)}
                                            style={{borderRadius: '8px', fontWeight: '600'}}>
                                            {showPreview ? <><EyeSlash className="me-1"/> Ẩn xem trước</> : <><Eye className="me-1"/> Xem file</>}
                                        </Button>
                                    </div>
                                    {renderFilePreview(submission.attachmentUrl)}
                                </div>
                            )}

                            {submission.studentTextResponse && (
                                <div className="mb-3 p-3" style={{background: '#f3f4f6', borderRadius: '12px', borderLeft: '4px solid #667eea'}}>
                                    <small className="fw-bold" style={{color: '#667eea'}}>Ghi chú của bạn:</small>
                                    <p className="mb-0 mt-1" style={{fontSize: '0.95rem'}}>"{submission.studentTextResponse}"</p>
                                </div>
                            )}
                            
                            {/* KẾT QUẢ CHẤM */}
                            {submission.status === 'GRADED' && (
                                <div 
                                    className="mt-4 p-4"
                                    style={{
                                        background: submission.score >= 5 
                                            ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                                            : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                        borderRadius: '16px',
                                        border: submission.score >= 5 ? '3px solid #10b981' : '3px solid #ef4444'
                                    }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <small style={{color: '#6b7280', fontWeight: '600'}}>Kết quả chấm:</small>
                                            <h3 
                                                className="fw-bold mb-0"
                                                style={{color: submission.score >= 5 ? '#059669' : '#dc2626'}}>
                                                🎯 Điểm: <span style={{fontSize: '2.5rem'}}>{submission.score}</span>/10
                                            </h3>
                                        </div>
                                        <div style={{fontSize: '3rem'}}>
                                            {submission.score >= 5 ? '🎉' : '😔'}
                                        </div>
                                    </div>
                                    <div className="p-3" style={{background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px'}}>
                                        <div className="d-flex align-items-center mb-2">
                                            <span style={{fontSize: '1.2rem'}}>💬</span>
                                            <strong className="ms-2" style={{color: '#4b5563'}}>Feedback giáo viên:</strong>
                                        </div>
                                        <p className="mb-0 fst-italic" style={{color: '#6b7280', fontSize: '0.95rem'}}>
                                            "{submission.teacherFeedback || "Không có nhận xét"}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* NÚT THU HỒI (CHỈ KHI CHƯA CHẤM) */}
                            {submission.status === 'PENDING' && (
                                <Button 
                                    variant="outline-danger" 
                                    className="mt-3 w-100 fw-semibold" 
                                    onClick={handleDelete}
                                    style={{borderRadius: '12px', padding: '12px', borderWidth: '2px'}}>
                                    <Trash className="me-2" size={18}/> Thu hồi & Nộp lại
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                ) : (
                    // --- TRƯỜNG HỢP 2: CHƯA NỘP (FORM UPLOAD) ---
                    <div className="p-3 bg-white" style={{borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'}}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold mb-3" style={{color: '#667eea', fontSize: '1rem'}}>
                                📄 File bài làm (Ảnh/PDF)
                            </Form.Label>
                            <InputGroup size="lg">
                                <Form.Control 
                                    value={fileUrl} 
                                    placeholder="Link file..." 
                                    readOnly 
                                    style={{
                                        borderRadius: '12px 0 0 12px',
                                        border: '2px solid #e5e7eb',
                                        background: '#f9fafb'
                                    }}
                                />
                                <label 
                                    className={`btn ${uploading?'disabled':''}`}
                                    style={{
                                        background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        fontWeight: '600',
                                        cursor: uploading ? 'not-allowed' : 'pointer'
                                    }}>
                                    <CloudArrowUp className="me-2" size={18}/> Upload
                                    <input type="file" hidden onChange={handleFileUpload} disabled={uploading}/>
                                </label>
                                {fileUrl && (
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => setShowPreview(!showPreview)}
                                        style={{borderRadius: '0 12px 12px 0', padding: '12px 20px', fontWeight: '600'}}>
                                        {showPreview ? <EyeSlash size={18}/> : <Eye size={18}/>}
                                    </Button>
                                )}
                            </InputGroup>
                            
                            {/* Thanh tiến độ upload */}
                            {uploading && (
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <small className="fw-semibold" style={{color: '#667eea'}}>Đang tải lên...</small>
                                        <small className="fw-bold" style={{color: '#667eea'}}>{uploadProgress}%</small>
                                    </div>
                                    <div style={{background: '#e0e7ff', borderRadius: '10px', height: '12px', overflow: 'hidden'}}>
                                        <div style={{
                                            width: `${uploadProgress}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                            transition: 'width 0.3s',
                                            borderRadius: '10px'
                                        }}></div>
                                    </div>
                                </div>
                            )}
                            
                            {/* PREVIEW FILE VỪA UPLOAD */}
                            {fileUrl && renderFilePreview(fileUrl)}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold mb-2" style={{color: '#667eea', fontSize: '1rem'}}>
                                📝 Ghi chú / Trả lời trực tiếp
                            </Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={4} 
                                value={textResponse} 
                                onChange={e => setTextResponse(e.target.value)} 
                                placeholder="Nhập câu trả lời hoặc lời nhắn cho giáo viên..."
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '14px',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6'
                                }}
                            />
                        </Form.Group>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer style={{background: '#fffbeb', borderTop: '2px solid #fde68a', padding: '20px 28px'}}>
                <Button 
                    variant="secondary" 
                    onClick={handleClose}
                    style={{borderRadius: '10px', padding: '12px 28px', fontWeight: '600'}}>
                    Đóng
                </Button>
                {!submission && (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={uploading}
                        className="text-white border-0 fw-semibold"
                        style={{
                            background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '10px',
                            padding: '12px 32px',
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            cursor: uploading ? 'not-allowed' : 'pointer'
                        }}>
                        ✅ Xác Nhận Nộp
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default SubmitAssignment;