import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge } from 'react-bootstrap';
// Import Icon
import { CheckCircleFill, XCircleFill, ArrowRepeat } from 'react-bootstrap-icons';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const DoQuiz = ({ show, handleClose, quiz }) => {
    const [answers, setAnswers] = useState({});
    const [submission, setSubmission] = useState(null);
    const [viewMode, setViewMode] = useState('DOING'); 

    useEffect(() => {
        if (show && quiz) {
            fetchHistory();
            setAnswers({});
        }
    }, [show, quiz]);

    const fetchHistory = async () => {
        try {
            const res = await axiosClient.get(`/student/quiz/${quiz.quizId}/latest`);
            if (res.data.status && res.data.data) {
                setSubmission(res.data.data);
                setViewMode('REVIEW');
            } else {
                setSubmission(null);
                setViewMode('DOING');
            }
        } catch (error) { console.error(error); }
    };

    const handleSelectOption = (qId, oId) => {
        setAnswers(prev => ({ ...prev, [qId]: oId }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Bạn chắc chắn muốn nộp bài?")) return;
        const payload = {
            quizId: quiz.quizId,
            answers: Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                selectedOptionId: answers[qId]
            }))
        };

        try {
            const res = await axiosClient.post('/student/quiz/submit', payload);
            if (res.data.status) {
                toast.success("Nộp bài thành công!");
                fetchHistory(); 
            }
        } catch (error) { toast.error("Lỗi nộp bài!"); }
    };

    const handleRetake = () => {
        setAnswers({});
        setViewMode('DOING');
    };

    // --- LOGIC MÀU SẮC (SỬA LẠI ĐỂ CHUẨN XÁC) ---
    const getOptionStyle = (qId, option, isSelected) => {
        if (viewMode !== 'REVIEW') return {};
        
        // 1. Nếu đây là đáp án ĐÚNG -> Luôn hiện Xanh (để học sinh biết đáp án đúng là gì)
        if (option.isCorrect) {
            return { backgroundColor: '#d1e7dd', border: '1px solid #198754' }; // Xanh lá
        }

        // 2. Nếu đây là đáp án BẠN CHỌN mà nó SAI (vì nó ko phải Correct) -> Hiện Đỏ
        if (isSelected && !option.isCorrect) {
            return { backgroundColor: '#f8d7da', border: '1px solid #dc3545' }; // Đỏ
        }

        return {};
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {quiz?.title} {viewMode === 'REVIEW' && <Badge bg="info">Xem Lại Kết Quả</Badge>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '75vh', overflowY: 'auto'}}>
                
                {/* PHẦN ĐIỂM SỐ */}
                {viewMode === 'REVIEW' && submission && (
                    <div className={`text-center mb-4 p-3 border rounded ${submission.score >= 5 ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                        <h1 className={submission.score >= 5 ? "text-success" : "text-danger"}>
                            {submission.score ? submission.score.toFixed(1) : 0} / 10
                        </h1>
                        <p className="fw-bold mb-2">{submission.score >= 5 ? "ĐÃ ĐẠT (PASSED)" : "CHƯA ĐẠT (FAILED)"}</p>
                        
                        <div className="d-flex justify-content-center gap-3 text-muted small">
                             <span><CheckCircleFill className="text-success"/> Đáp án đúng</span>
                             <span><XCircleFill className="text-danger"/> Đáp án bạn chọn sai</span>
                        </div>

                        <div className="mt-3">
                            <Button variant="primary" size="sm" onClick={handleRetake}>
                                <ArrowRepeat className="me-1"/> Làm Lại Bài Thi
                            </Button>
                        </div>
                    </div>
                )}

                {/* DANH SÁCH CÂU HỎI */}
                {quiz?.questions?.map((q, index) => (
                    <div key={q.questionId} className="mb-4 p-3 border rounded shadow-sm bg-white">
                        <h6 className="fw-bold text-primary">Câu {index + 1}: {q.content}</h6>
                        <div className="mt-2">
                            {q.options.map(opt => {
                                // Logic tìm xem User đã chọn option này chưa
                                // Dùng == thay vì === để tránh lỗi khác kiểu dữ liệu (string/number)
                                const userAns = submission?.answers?.find(a => a.question && a.question.questionId == q.questionId);
                                const isSelected = userAns?.selectedOption?.optionId == opt.optionId;

                                return (
                                    <div key={opt.optionId} 
                                         className="p-2 mb-2 rounded d-flex align-items-center"
                                         style={getOptionStyle(q.questionId, opt, isSelected)}
                                    >
                                        <Form.Check 
                                            type="radio"
                                            label={opt.content}
                                            name={`question-${q.questionId}`}
                                            checked={
                                                viewMode === 'DOING' 
                                                ? answers[q.questionId] == opt.optionId
                                                : !!isSelected // Chế độ xem lại: Chỉ check vào cái mình đã chọn
                                            }
                                            disabled={viewMode === 'REVIEW'} 
                                            onChange={() => handleSelectOption(q.questionId, opt.optionId)}
                                            className="mb-0 flex-grow-1"
                                            style={{pointerEvents: viewMode === 'REVIEW' ? 'none' : 'auto'}}
                                        />
                                        
                                        {/* Icon minh họa */}
                                        {viewMode === 'REVIEW' && opt.isCorrect && <CheckCircleFill className="text-success ms-2 fs-5"/>}
                                        {viewMode === 'REVIEW' && !opt.isCorrect && isSelected && <XCircleFill className="text-danger ms-2 fs-5"/>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                {viewMode === 'DOING' ? (
                    <Button variant="primary" onClick={handleSubmit} disabled={Object.keys(answers).length < (quiz?.questions?.length || 0)}>
                        Nộp Bài
                    </Button>
                ) : (
                    <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default DoQuiz;