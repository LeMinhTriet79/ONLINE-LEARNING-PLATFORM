import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Alert, Badge, Card } from 'react-bootstrap';
import { CloudArrowUp, FileEarmarkText, Trash, ClockHistory, CheckCircle, XCircle } from 'react-bootstrap-icons';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const SubmitAssignment = ({ show, handleClose, assignment }) => {
    const [fileUrl, setFileUrl] = useState('');
    const [textResponse, setTextResponse] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const [submission, setSubmission] = useState(null); // Bài đã nộp

    useEffect(() => {
        if (show && assignment) {
            fetchSubmission();
            setFileUrl('');
            setTextResponse('');
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
        try {
            const res = await axiosClient.post('/upload', formData, {headers: { "Content-Type": "multipart/form-data" }});
            if (res.data.status) {
                setFileUrl(res.data.data);
                toast.success("Upload thành công!");
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

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Nộp Bài: {assignment?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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

                {/* TRẠNG THÁI BÀI NỘP */}
                {submission ? (
                    <Card className="border-primary mb-3">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <span>Bài nộp của bạn</span>
                            <Badge bg={submission.status === 'GRADED' ? 'success' : 'warning'} text="dark">
                                {submission.status === 'GRADED' ? 'Đã Chấm' : 'Đang Chờ Chấm'}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            {submission.attachmentUrl && (
                                <p><a href={submission.attachmentUrl} target="_blank" rel="noreferrer"><FileEarmarkText/> Xem file bài làm</a></p>
                            )}
                            {submission.studentTextResponse && (
                                <Alert variant="secondary" className="p-2 small">"{submission.studentTextResponse}"</Alert>
                            )}
                            
                            {/* KẾT QUẢ CHẤM */}
                            {submission.status === 'GRADED' && (
                                <div className="mt-3 pt-3 border-top">
                                    <h5 className={submission.score >= 5 ? "text-success" : "text-danger"}>
                                        Điểm: {submission.score}/10
                                    </h5>
                                    <p className="text-muted small">Nhận xét: {submission.teacherFeedback || "Không có"}</p>
                                </div>
                            )}

                            {/* NÚT THU HỒI (CHỈ KHI CHƯA CHẤM) */}
                            {submission.status === 'PENDING' && (
                                <Button variant="outline-danger" size="sm" className="mt-2 w-100" onClick={handleDelete}>
                                    <Trash className="me-1"/> Thu hồi & Nộp lại
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                ) : (
                    // FORM NỘP BÀI (NẾU CHƯA CÓ BÀI)
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">File bài làm</Form.Label>
                            <InputGroup>
                                <Form.Control value={fileUrl} placeholder="Link file..." readOnly />
                                <label className={`btn btn-primary ${uploading?'disabled':''}`}>
                                    <CloudArrowUp/> Upload <input type="file" hidden onChange={handleFileUpload}/>
                                </label>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Ghi chú</Form.Label>
                            <Form.Control as="textarea" rows={3} value={textResponse} onChange={e => setTextResponse(e.target.value)} />
                        </Form.Group>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                {!submission && <Button variant="success" onClick={handleSubmit}>Xác Nhận Nộp</Button>}
            </Modal.Footer>
        </Modal>
    );
};

export default SubmitAssignment;