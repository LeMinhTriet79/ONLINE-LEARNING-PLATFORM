import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, InputGroup, Spinner } from 'react-bootstrap';
// Import Icon
import { CheckCircleFill, XCircleFill, ArrowRepeat, Robot, SendFill, XLg } from 'react-bootstrap-icons';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const DoQuiz = ({ show, handleClose, quiz }) => {
    const [answers, setAnswers] = useState({});
    const [submission, setSubmission] = useState(null);
    const [viewMode, setViewMode] = useState('DOING'); 

    // --- STATE CHO AI TUTOR ---
    const [activeAiQuestion, setActiveAiQuestion] = useState(null); // ID câu hỏi đang mở chat AI
    const [aiQuery, setAiQuery] = useState(''); // Text học sinh nhập
    const [aiResponse, setAiResponse] = useState(''); // Text AI trả lời
    const [isAiLoading, setIsAiLoading] = useState(false); // Trạng thái loading API Gemini

    useEffect(() => {
        if (show && quiz) {
            fetchHistory();
            setAnswers({});
            // Reset AI state khi mở bài mới
            setActiveAiQuestion(null);
            setAiQuery('');
            setAiResponse('');
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
        setActiveAiQuestion(null); // Tắt chat AI khi làm lại
    };

    // --- LOGIC GỌI API GEMINI AI ---
    const handleAskAi = async (question) => {
        if (!aiQuery.trim()) return;
        setIsAiLoading(true);
        
        // Gom nội dung câu hỏi và các lựa chọn để gửi làm ngữ cảnh cho AI
        const optionsText = question.options.map((o, i) => `${i + 1}. ${o.content}`).join(' | ');
        const questionContext = `Câu hỏi: ${question.content} \nCác lựa chọn: ${optionsText}`;

        try {
            const res = await axiosClient.post('/student/quiz/help', {
                questionContent: questionContext,
                studentQuery: aiQuery
            });
            if (res.data.status) {
                setAiResponse(res.data.data);
                setAiQuery(''); // Xóa text input sau khi hỏi xong
            }
        } catch (error) {
            toast.error("AI Gia sư đang bận, vui lòng thử lại sau!");
        } finally {
            setIsAiLoading(false);
        }
    };

    const toggleAiChat = (questionId) => {
        if (activeAiQuestion === questionId) {
            setActiveAiQuestion(null); // Đóng nếu đang mở
        } else {
            setActiveAiQuestion(questionId); // Mở câu hỏi mới
            setAiResponse(''); // Xóa câu trả lời cũ
            setAiQuery('');
        }
    };

    // --- LOGIC MÀU SẮC CHO OPTION ---
    const getOptionStyle = (qId, option, isSelected) => {
        if (viewMode !== 'REVIEW') return {};
        
        if (option.isCorrect) {
            return { backgroundColor: '#d1e7dd', border: '1px solid #198754' }; // Xanh lá
        }

        if (isSelected && !option.isCorrect) {
            return { backgroundColor: '#f8d7da', border: '1px solid #dc3545' }; // Đỏ
        }

        return {};
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton className="border-0 text-white" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '24px'}}>
                <Modal.Title className="fw-bold d-flex align-items-center" style={{fontSize: '1.3rem'}}>
                    ❓ {quiz?.title} 
                    {viewMode === 'REVIEW' && (
                        <Badge className="ms-3" style={{ background: '#fbbf24', color: '#1f2937', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600' }}>
                            👁️ Xem Lại Kết Quả
                        </Badge>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '75vh', overflowY: 'auto', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '28px'}}>
                
                {/* PHẦN ĐIỂM SỐ XEM LẠI */}
                {viewMode === 'REVIEW' && submission && (
                    <div className="text-center mb-4 p-5"
                        style={{
                            background: submission.score >= 5 ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            borderRadius: '20px',
                            border: submission.score >= 5 ? '3px solid #10b981' : '3px solid #ef4444',
                            boxShadow: submission.score >= 5 ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 8px 24px rgba(239, 68, 68, 0.3)'
                        }}>
                        <div className="mb-3">
                            <div className="d-inline-block mb-2">
                                <span style={{fontSize: '4rem'}}>{submission.score >= 5 ? '🎉' : '😢'}</span>
                            </div>
                            <h1 className="fw-bold mb-2" style={{ fontSize: '3.5rem', color: submission.score >= 5 ? '#059669' : '#dc2626', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {submission.score ? submission.score.toFixed(1) : 0} / 10
                            </h1>
                            <h4 className="fw-bold mb-4" style={{color: submission.score >= 5 ? '#047857' : '#b91c1c'}}>
                                {submission.score >= 5 ? "✅ ĐÃ ĐẠT (PASSED)" : "❌ CHƯA ĐẠT (FAILED)"}
                            </h4>
                        </div>
                        
                        <div className="d-flex justify-content-center gap-4 mb-4 p-3" style={{background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px'}}>
                             <span className="fw-semibold" style={{color: '#059669'}}><CheckCircleFill className="me-2" size={18}/> Đáp án đúng</span>
                             <span className="fw-semibold" style={{color: '#dc2626'}}><XCircleFill className="me-2" size={18}/> Đáp án bạn chọn sai</span>
                        </div>

                        <div>
                            <Button onClick={handleRetake} className="fw-semibold border-0 text-white"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '12px 32px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' }}>
                                <ArrowRepeat className="me-2" size={18}/> 🔄 Làm Lại Bài Thi
                            </Button>
                        </div>
                    </div>
                )}

                {/* DANH SÁCH CÂU HỎI */}
                {quiz?.questions?.map((q, index) => (
                    <div key={q.questionId} className="mb-4 p-4 bg-white position-relative"
                        style={{ borderRadius: '16px', border: '2px solid #d1fae5', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
                        
                        <h6 className="fw-bold mb-3 pb-2" style={{color: '#059669', fontSize: '1.1rem', borderBottom: '2px solid #f0fdf4'}}>
                            ❓ Câu {index + 1}: {q.content}
                        </h6>

                        <div className="mt-3">
                            {q.options.map(opt => {
                                const userAns = submission?.answers?.find(a => a.question && a.question.questionId == q.questionId);
                                const isSelected = userAns?.selectedOption?.optionId == opt.optionId;

                                return (
                                    <div key={opt.optionId} className="p-3 mb-2 d-flex align-items-center"
                                        style={{
                                            ...getOptionStyle(q.questionId, opt, isSelected),
                                            borderRadius: '12px',
                                            border: '2px solid',
                                            borderColor: viewMode === 'REVIEW' && opt.isCorrect ? '#10b981' : viewMode === 'REVIEW' && isSelected && !opt.isCorrect ? '#ef4444' : '#e5e7eb',
                                            transition: 'all 0.2s',
                                            cursor: viewMode === 'DOING' ? 'pointer' : 'default',
                                            backgroundColor: viewMode === 'REVIEW' && opt.isCorrect ? '#f0fdf4' : viewMode === 'REVIEW' && isSelected && !opt.isCorrect ? '#fee2e2' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => { if(viewMode === 'DOING') { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.background = '#f5f7fa'; } }}
                                        onMouseLeave={(e) => { if(viewMode === 'DOING') { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'transparent'; } }}
                                    >
                                        <Form.Check 
                                            type="radio"
                                            label={opt.content}
                                            name={`question-${q.questionId}`}
                                            checked={viewMode === 'DOING' ? answers[q.questionId] == opt.optionId : !!isSelected}
                                            disabled={viewMode === 'REVIEW'} 
                                            onChange={() => handleSelectOption(q.questionId, opt.optionId)}
                                            className="mb-0 flex-grow-1 fw-semibold"
                                            style={{ pointerEvents: viewMode === 'REVIEW' ? 'none' : 'auto', fontSize: '1rem' }}
                                        />
                                        {viewMode === 'REVIEW' && opt.isCorrect && <CheckCircleFill className="ms-2" size={24} style={{color: '#10b981'}}/>}
                                        {viewMode === 'REVIEW' && !opt.isCorrect && isSelected && <XCircleFill className="ms-2" size={24} style={{color: '#ef4444'}}/>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- KHU VỰC GIA SƯ AI TUTOR --- */}
                        {viewMode === 'DOING' && (
                            <div className="mt-3 pt-3 border-top border-light">
                                <div className="text-end">
                                    <Button 
                                        variant="link" 
                                        onClick={() => toggleAiChat(q.questionId)}
                                        className="text-decoration-none fw-bold"
                                        style={{ color: activeAiQuestion === q.questionId ? '#dc2626' : '#6366f1', fontSize: '0.9rem' }}
                                    >
                                        {activeAiQuestion === q.questionId 
                                            ? <><XLg className="me-1"/> Đóng gợi ý</> 
                                            : <><Robot className="me-1" size={18}/> Cần AI gợi ý?</>
                                        }
                                    </Button>
                                </div>

                                {/* Giao diện khung chat AI */}
                                {activeAiQuestion === q.questionId && (
                                    <div className="mt-2 p-3" style={{ background: 'linear-gradient(to right, #f8fafc, #e0e7ff)', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                                        <div className="d-flex align-items-center mb-2">
                                            <Robot size={22} style={{ color: '#4f46e5' }} className="me-2"/>
                                            <h6 className="m-0 fw-bold" style={{ color: '#4f46e5' }}>Gia sư Gemini</h6>
                                        </div>
                                        
                                        {/* Hiển thị kết quả AI trả về */}
                                        {aiResponse && (
                                            <div className="mb-3 p-3 bg-white" style={{ borderRadius: '10px', fontSize: '0.95rem', borderLeft: '4px solid #6366f1', color: '#334155', lineHeight: '1.6' }}>
                                                {/* Dùng dangerouslySetInnerHTML để render xuống dòng (replace \n -> <br/>) */}
                                                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>') }} />
                                            </div>
                                        )}

                                        {/* Input đặt câu hỏi cho AI */}
                                        <InputGroup className="mt-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <Form.Control 
                                                placeholder="Ví dụ: Giảng lại cho em khái niệm này với..." 
                                                value={aiQuery}
                                                onChange={(e) => setAiQuery(e.target.value)}
                                                disabled={isAiLoading}
                                                style={{ border: 'none', fontSize: '0.95rem' }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAskAi(q);
                                                    }
                                                }}
                                            />
                                            <Button 
                                                onClick={() => handleAskAi(q)} 
                                                disabled={isAiLoading || !aiQuery.trim()}
                                                style={{ background: '#4f46e5', border: 'none', padding: '0 20px' }}
                                            >
                                                {isAiLoading ? <Spinner size="sm" animation="border" /> : <SendFill />}
                                            </Button>
                                        </InputGroup>
                                        <small className="text-muted mt-2 d-block" style={{ fontSize: '0.8rem' }}>
                                            * AI sẽ không nói trực tiếp đáp án, hãy đặt câu hỏi để được hướng dẫn tư duy.
                                        </small>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* --- KẾT THÚC KHU VỰC AI TUTOR --- */}

                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer style={{background: '#f0fdf4', borderTop: '2px solid #d1fae5', padding: '20px 28px'}}>
                {viewMode === 'DOING' ? (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={Object.keys(answers).length < (quiz?.questions?.length || 0)}
                        className="fw-semibold border-0 text-white"
                        style={{
                            background: Object.keys(answers).length < (quiz?.questions?.length || 0) ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '10px',
                            padding: '12px 32px',
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            cursor: Object.keys(answers).length < (quiz?.questions?.length || 0) ? 'not-allowed' : 'pointer'
                        }}>
                        📝 Nộp Bài
                    </Button>
                ) : (
                    <Button variant="secondary" onClick={handleClose} style={{borderRadius: '10px', padding: '12px 32px', fontWeight: '600'}}>
                        Đóng
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default DoQuiz;