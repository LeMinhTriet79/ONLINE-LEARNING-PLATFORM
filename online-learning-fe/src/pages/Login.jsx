import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Thông báo đẹp

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Dùng để chuyển trang

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Gọi API Login
            const res = await axiosClient.post('/auth/login', { username, password });
            
            if (res.data.status) {
                const { token, role, username: user } = res.data.data;
                
                // Lưu thông tin vào bộ nhớ trình duyệt
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('username', user);

                toast.success('Đăng nhập thành công!');

                // Điều hướng dựa trên Role
                if (role === 'TEACHER') {
                    navigate('/teacher/courses'); // Sẽ làm trang này sau
                } else if (role === 'STUDENT') {
                    navigate('/student/dashboard'); 
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error('Đăng nhập thất bại! Kiểm tra lại tài khoản.');
            console.error(error);
        }
    };

    return (
        <div 
            className="d-flex justify-content-center align-items-center vh-100 position-relative"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                overflow: 'hidden'
            }}
        >
            {/* Decorative circles - Tạo hiệu ứng hiện đại */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(40px)'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-150px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(60px)'
            }}></div>

            {/* Login Card - Thiết kế hiện đại */}
            <div 
                className="card border-0 p-5 position-relative" 
                style={{ 
                    width: '450px',
                    borderRadius: '24px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.95)'
                }}
            >
                {/* Logo/Icon Section */}
                <div className="text-center mb-4">
                    <div 
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        <span style={{ fontSize: '2.5rem' }}>📚</span>
                    </div>
                    <h2 className="fw-bold mb-2" style={{ color: '#667eea' }}>
                        Hệ Thống Học Tập
                    </h2>
                    <p className="text-muted mb-0">Đăng nhập để tiếp tục</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Username Input - Styling hiện đại */}
                    <div className="mb-4">
                        <label className="fw-semibold mb-2" style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                            Tên đăng nhập
                        </label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập username..."
                            required
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                padding: '14px 18px',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Password Input - Styling hiện đại */}
                    <div className="mb-4">
                        <label className="fw-semibold mb-2" style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                            Mật khẩu
                        </label>
                        <input 
                            type="password" 
                            className="form-control form-control-lg" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập password..."
                            required
                            style={{
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                padding: '14px 18px',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Submit Button - Gradient styling */}
                    <button 
                        type="submit" 
                        className="btn btn-lg w-100 text-white fw-bold border-0"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '1.1rem',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        🔐 Đăng Nhập
                    </button>
                </form>

                {/* Footer text */}
                <div className="text-center mt-4">
                    <small className="text-muted">
                        Dành cho Học sinh & Giáo viên THPT
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;