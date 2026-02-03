import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Card } from 'react-bootstrap';
import { CheckCircle, Eye, FileEarmarkText, Pen, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const GradingDashboard = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentSub, setCurrentSub] = useState(null);
    const [score, setScore] = useState(10);
    const [feedback, setFeedback] = useState('Đã duyệt.');

    const fetchPending = async () => {
        try {
            const res = await axiosClient.get('/teacher/submissions/pending');
            if (res.data.status) setSubmissions(res.data.data);
        } catch (error) { 
            console.error("Lỗi tải danh sách chấm bài");
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const openGradeModal = (sub) => {
        setCurrentSub(sub);
        setScore(8);
        setFeedback('Bài làm tốt.');
        setShowModal(true);
    };

    const handleGradeSubmit = async () => {
        try {
            await axiosClient.post(`/teacher/submissions/${currentSub.submissionId}/grade`, {
                score: parseFloat(score),
                feedback: feedback
            });
            toast.success("Đã chấm điểm thành công!");
            setShowModal(false);
            fetchPending(); 
        } catch (error) { toast.error("Lỗi chấm điểm!"); }
    };

    return (
        <Container className="py-5">
            <div className="d-flex align-items-center mb-4">
                <Button variant="outline-secondary" className="me-3" onClick={() => navigate('/teacher/dashboard')}>
                    <ArrowLeft/> Quay lại
                </Button>
                <h2 className="text-primary m-0"><CheckCircle className="me-2"/> Danh Sách Chờ Duyệt Bài</h2>
            </div>
            
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    {submissions.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <h5>Tuyệt vời! Không có bài tập nào cần chấm.</h5>
                            <p>Hãy nhắc học sinh nộp bài nhé.</p>
                        </div>
                    ) : (
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Học Sinh</th>
                                    <th>Bài Tập</th>
                                    <th>File Nộp</th>
                                    <th>Ngày Nộp</th>
                                    <th className="text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(sub => (
                                    <tr key={sub.submissionId}>
                                        <td className="ps-4 fw-bold">{sub.enrollment?.student?.fullName}</td>
                                        <td>
                                            <div className="fw-bold text-primary">{sub.assignment?.title}</div>
                                            <small className="text-muted">{sub.enrollment?.course?.title}</small>
                                        </td>
                                        <td>
                                            {sub.attachmentUrl ? (
                                                <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="text-decoration-none">
                                                    <FileEarmarkText/> Xem File
                                                </a>
                                            ) : <span className="text-muted">Không có file</span>}
                                        </td>
                                        <td><Badge bg="warning" text="dark">Chờ chấm</Badge></td>
                                        <td className="text-center">
                                            <Button variant="success" size="sm" onClick={() => openGradeModal(sub)}>
                                                <Pen className="me-1"/> Chấm Điểm
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>Chấm Bài: {currentSub?.enrollment?.student?.fullName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Điểm số (Thang 10)</Form.Label>
                        <Form.Control 
                            type="number" min="0" max="10" 
                            value={score} onChange={e => setScore(e.target.value)} 
                            autoFocus
                        />
                        <Form.Text className="text-muted">Nhập &ge; 5.0 để tính là Đạt (Passed).</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Nhận xét / Feedback</Form.Label>
                        <Form.Control 
                            as="textarea" rows={3} 
                            value={feedback} onChange={e => setFeedback(e.target.value)} 
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="success" onClick={handleGradeSubmit}>Xác Nhận & Lưu</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GradingDashboard;