import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Card, Tabs, Tab } from 'react-bootstrap';
// Bổ sung thêm icon Trash
import { CheckCircle, Eye, FileEarmarkText, Pen, ArrowLeft, Trash } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const GradingDashboard = () => {
    const navigate = useNavigate();
    
    // --- STATE 2 TAB ---
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [gradedSubmissions, setGradedSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');

    const [showModal, setShowModal] = useState(false);
    const [currentSub, setCurrentSub] = useState(null);
    const [score, setScore] = useState(10);
    const [feedback, setFeedback] = useState('Đã duyệt.');

    const fetchSubmissions = async () => {
        try {
            const [resPending, resGraded] = await Promise.all([
                axiosClient.get('/teacher/submissions/pending'),
                axiosClient.get('/teacher/submissions/graded')
            ]);
            if (resPending.data.status) setPendingSubmissions(resPending.data.data);
            if (resGraded.data.status) setGradedSubmissions(resGraded.data.data);
        } catch (error) { 
            console.error("Lỗi tải danh sách chấm bài", error);
            if (error.response?.status === 403) {
                toast.error("Bạn không có quyền truy cập. Vui lòng đăng nhập lại bằng tài khoản GIÁO VIÊN.");
            } else {
                toast.error("Không thể tải danh sách bài chấm. Vui lòng thử lại sau.");
            }
        }
    };

    useEffect(() => { fetchSubmissions(); }, []);

    // Dùng chung cho cả Chấm Mới và Sửa Điểm
    const openGradeModal = (sub) => {
        setCurrentSub(sub);
        if (sub.status === 'GRADED') {
            setScore(sub.score);
            setFeedback(sub.teacherFeedback || '');
        } else {
            setScore(8);
            setFeedback('Bài làm tốt.');
        }
        setShowModal(true);
    };

    const handleGradeSubmit = async () => {
        try {
            await axiosClient.post(`/teacher/submissions/${currentSub.submissionId}/grade`, {
                score: parseFloat(score),
                feedback: feedback
            });
            toast.success(currentSub.status === 'GRADED' ? "Sửa điểm thành công!" : "Đã chấm điểm thành công!");
            setShowModal(false);
            fetchSubmissions(); 
        } catch (error) { toast.error("Lỗi xử lý điểm!"); }
    };

    // Xóa bài nộp để học sinh làm lại
    const handleDeleteSubmission = async (subId) => {
        if (window.confirm("CẢNH BÁO: Xóa bài nộp này sẽ khiến học sinh bị mất điểm và tụt tiến độ. Học sinh sẽ phải nộp lại bài. Bạn có chắc chắn?")) {
            try {
                await axiosClient.delete(`/teacher/submissions/${subId}`);
                toast.success("Đã xóa bài nộp. Học sinh có thể nộp lại.");
                fetchSubmissions();
            } catch (error) {
                toast.error("Lỗi xóa bài nộp!");
            }
        }
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
                            <CheckCircle className="me-2" size={28}/> 🗂️ Quản Lý Chấm Bài
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
            
                <Tabs 
                    activeKey={activeTab} 
                    onSelect={(k) => setActiveTab(k)} 
                    className="mb-4 custom-tabs"
                    style={{
                        borderBottom: '3px solid #e5e7eb',
                        '& .nav-link': { borderRadius: '12px 12px 0 0' }
                    }}>
                    
                    {/* --- TAB 1: BÀI CẦN CHẤM --- */}
                    <Tab eventKey="pending" title={<span className="fw-bold px-3 py-1" style={{fontSize: '1.05rem'}}>⏳ Cần Chấm ({pendingSubmissions.length})</span>}>
                        <Card style={{border: 'none', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'}}>
                            <Card.Body className="p-0">
                                {pendingSubmissions.length === 0 ? (
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
                                            {pendingSubmissions.map(sub => (
                                                <tr key={sub.submissionId} style={{transition: 'background 0.2s'}}>
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold" style={{color: '#1f2937'}}>{sub.enrollment?.student?.fullName}</div>
                                                        <small className="text-primary fw-bold">Lớp: {sub.enrollment?.classRoom?.className || 'N/A'}</small>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="fw-bold mb-1" style={{color: '#667eea'}}>{sub.assignment?.title}</div>
                                                        <small className="text-muted">{sub.enrollment?.classRoom?.course?.title}</small>
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
                    </Tab>

                    {/* --- TAB 2: LỊCH SỬ ĐÃ CHẤM --- */}
                    <Tab eventKey="graded" title={<span className="fw-bold px-3 py-1" style={{fontSize: '1.05rem'}}>✔️ Đã Chấm ({gradedSubmissions.length})</span>}>
                        <Card style={{border: 'none', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'}}>
                            <Card.Body className="p-0">
                                {gradedSubmissions.length === 0 ? (
                                    <div className="text-center p-5">
                                        <div style={{fontSize: '4rem', marginBottom: '16px'}}>📭</div>
                                        <h5 style={{color: '#6b7280'}}>Chưa có lịch sử chấm bài nào.</h5>
                                    </div>
                                ) : (
                                    <Table hover responsive className="m-0 align-middle" style={{fontSize: '0.95rem'}}>
                                        <thead style={{background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                                            <tr>
                                                <th className="ps-4 py-3 fw-bold" style={{color: '#4b5563'}}>Học Sinh</th>
                                                <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Bài Tập</th>
                                                <th className="py-3 fw-bold" style={{color: '#4b5563'}}>Điểm / Feedback</th>
                                                <th className="text-center py-3 fw-bold" style={{color: '#4b5563'}}>Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gradedSubmissions.map(sub => (
                                                <tr key={sub.submissionId} style={{background: sub.score < 5 ? '#fef2f2' : 'white'}}>
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold" style={{color: '#1f2937'}}>{sub.enrollment?.student?.fullName}</div>
                                                        <small className="text-primary fw-bold">Lớp: {sub.enrollment?.classRoom?.className || 'N/A'}</small>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="fw-bold mb-1" style={{color: '#667eea'}}>{sub.assignment?.title}</div>
                                                        {sub.attachmentUrl ? (
                                                            <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.85rem', color: '#6b7280'}}>
                                                                <FileEarmarkText className="me-1"/> Xem bài nộp
                                                            </a>
                                                        ) : <span className="text-muted small">Không có file</span>}
                                                    </td>
                                                    <td className="py-3" style={{maxWidth: '300px'}}>
                                                        <div className="d-flex align-items-center mb-1">
                                                            <strong style={{color: sub.score >= 5 ? '#059669' : '#dc2626', fontSize: '1.2rem'}}>
                                                                {sub.score}/10
                                                            </strong>
                                                            {sub.score >= 5 ? <Badge bg="success" className="ms-2">Đạt</Badge> : <Badge bg="danger" className="ms-2">Chưa Đạt</Badge>}
                                                        </div>
                                                        <small className="text-muted text-truncate d-block" title={sub.teacherFeedback}>
                                                            "{sub.teacherFeedback || 'Không có nhận xét'}"
                                                        </small>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <Button variant="outline-primary" size="sm" className="me-2 fw-semibold" onClick={() => openGradeModal(sub)} style={{borderRadius: '8px'}}>
                                                            <Pen className="me-1"/> Sửa Điểm
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => handleDeleteSubmission(sub.submissionId)} style={{borderRadius: '8px'}}>
                                                            <Trash className="me-1"/> Xóa Bài
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>

                {/* MODAL CHẤM BÀI / SỬA ĐIỂM */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header 
                        closeButton 
                        className="border-0 text-white"
                        style={{
                            background: currentSub?.status === 'GRADED' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            padding: '24px'
                        }}>
                        <Modal.Title className="fw-bold" style={{fontSize: '1.3rem'}}>
                            {currentSub?.status === 'GRADED' ? '✏️ Cập Nhật Điểm:' : '✅ Chấm Bài:'} {currentSub?.enrollment?.student?.fullName} {currentSub?.enrollment?.classRoom ? `(${currentSub.enrollment.classRoom.className})` : ''}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold mb-2" style={{color: currentSub?.status === 'GRADED' ? '#2563eb' : '#10b981'}}>🎯 Điểm số (Thang 10)</Form.Label>
                            <Form.Control 
                                type="number" min="0" max="10" step="0.5"
                                value={score} onChange={e => setScore(e.target.value)} 
                                autoFocus
                                size="lg"
                                style={{
                                    borderRadius: '12px',
                                    border: `2px solid ${currentSub?.status === 'GRADED' ? '#2563eb' : '#10b981'}`,
                                    padding: '12px 16px',
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: currentSub?.status === 'GRADED' ? '#2563eb' : '#10b981',
                                    textAlign: 'center'
                                }}
                            />
                            <Form.Text className="text-muted d-block mt-2" style={{fontSize: '0.9rem'}}>
                                ℹ️ Nhập ≥ 5.0 để tính là Đạt (Passed).
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold mb-2" style={{color: currentSub?.status === 'GRADED' ? '#2563eb' : '#10b981'}}>💬 Nhận xét / Feedback</Form.Label>
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
                                background: currentSub?.status === 'GRADED' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '10px',
                                padding: '10px 32px',
                                boxShadow: '0 4px 12px rgba(0,0,0, 0.2)'
                            }}>
                            {currentSub?.status === 'GRADED' ? '✔️ Cập Nhật' : '✔️ Xác Nhận & Lưu'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
};

export default GradingDashboard;