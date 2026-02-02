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
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">Hệ Thống Học Tập</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label>Username</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Đăng Nhập</button>
                </form>
            </div>
        </div>
    );
};

export default Login;