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
        <Container fluid style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '32px'}}>
            <Container>
                {/* Header gradient */}
                <div className="mb-4 p-4" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="text-white fw-bold m-0" style={{textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                            <CheckCircle className="me-2" size={28}/> ✅ Danh Sách Chờ Duyệt Bài
                        </h2>
                        <Button 
                            className="fw-semibold"
                            onClick={() => navigate('/teacher/dashboard')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.25)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid white',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '10px 24px'
                            }}>
                            <ArrowLeft className="me-1" size={18}/> Quay lại
                        </Button>
                    </div>
                </div>
            
                <Card style={{border: 'none', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'}}>
                    <Card.Body className="p-0">
                        {submissions.length === 0 ? (
                            <div className="text-center p-5">
                                <div style={{fontSize: '4rem', marginBottom: '16px'}}>🎉</div>
                                <h5 style={{color: '#6b7280', marginBottom: '12px'}}>Tuyệt vời! Không có bài tập nào cần chấm.</h5>
                                <p className="text-muted">Hãy nhắc học sinh nộp bài nhé.</p>
                            </div>
                        ) : (
                            <Table hover responsive className="m-0 align-middle" style={{fontSize: '0.95rem'}}>
                                <thead style={{background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                                    <tr>
                                        <th className="ps-4 py-3 fw-bold" style={{color: '#4b5563'}}>Học Sinh</th>
                                        <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Bài Tập</th>
                                        <th className="py-3 fw-bold" style={{color: '#4b5563'}}>File Nộp</th>
                                        <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Trạng Thái</th>
                                        <th className="text-center py-3 fw-bold" style={{color: '#4b5563'}}>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.submissionId} style={{transition: 'background 0.2s'}}>
                                            <td className="ps-4 py-3 fw-bold" style={{color: '#1f2937'}}>{sub.enrollment?.student?.fullName}</td>
                                            <td className="py-3">
                                                <div className="fw-bold mb-1" style={{color: '#667eea'}}>{sub.assignment?.title}</div>
                                                <small className="text-muted">{sub.enrollment?.course?.title}</small>
                                            </td>
                                            <td className="py-3">
                                                {sub.attachmentUrl ? (
                                                    <a 
                                                        href={sub.attachmentUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'white',
                                                            border: '2px solid #667eea',
                                                            color: '#667eea',
                                                            borderRadius: '8px',
                                                            padding: '6px 14px',
                                                            textDecoration: 'none'
                                                        }}>
                                                        <FileEarmarkText className="me-1" size={14}/> Xem File
                                                    </a>
                                                ) : <span className="text-muted">Không có file</span>}
                                            </td>
                                            <td className="py-3">
                                                <Badge 
                                                    className="p-2"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                                                        color: 'white',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600'
                                                    }}>
                                                    Chờ chấm
                                                </Badge>
                                            </td>
                                            <td className="text-center py-3">
                                                <Button 
                                                    size="sm" 
                                                    className="fw-semibold text-white border-0"
                                                    onClick={() => openGradeModal(sub)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        borderRadius: '10px',
                                                        padding: '8px 20px',
                                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                    }}>
                                                    <Pen className="me-1" size={14}/> Chấm Điểm
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
                    <Modal.Header 
                        closeButton 
                        className="border-0 text-white"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            padding: '24px'
                        }}>
                        <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                            ✅ Chấm Bài: {currentSub?.enrollment?.student?.fullName}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold mb-2" style={{color: '#10b981'}}>🎯 Điểm số (Thang 10)</Form.Label>
                            <Form.Control 
                                type="number" min="0" max="10" 
                                value={score} onChange={e => setScore(e.target.value)} 
                                autoFocus
                                size="lg"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #10b981',
                                    padding: '12px 16px',
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    textAlign: 'center'
                                }}
                            />
                            <Form.Text className="text-muted d-block mt-2" style={{fontSize: '0.9rem'}}>
                                ℹ️ Nhập ≥ 5.0 để tính là Đạt (Passed).
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold mb-2" style={{color: '#10b981'}}>💬 Nhận xét / Feedback</Form.Label>
                            <Form.Control 
                                as="textarea" rows={4} 
                                value={feedback} onChange={e => setFeedback(e.target.value)} 
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    lineHeight: '1.6'
                                }}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{background: '#f9fafb', borderTop: '2px solid #e5e7eb', padding: '20px 32px'}}>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowModal(false)}
                            style={{borderRadius: '10px', padding: '10px 28px', fontWeight: '600'}}>
                            Hủy
                        </Button>
                        <Button 
                            onClick={handleGradeSubmit}
                            className="text-white border-0 fw-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '10px',
                                padding: '10px 32px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}>
                            ✔️ Xác Nhận & Lưu
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
};

export default GradingDashboard;