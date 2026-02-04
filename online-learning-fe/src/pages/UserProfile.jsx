import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Image, Spinner } from 'react-bootstrap';
import { PersonCircle, Camera, Save, Key, Envelope, Person } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ fullName: '', email: '', avatarUrl: '', username: '' });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // State đổi mật khẩu
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axiosClient.get('/user/profile');
            if (res.data.status) setUser(res.data.data);
        } catch (error) { toast.error("Lỗi tải thông tin"); } 
        finally { setLoading(false); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append("file", file);
        setUploading(true);

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.status) {
                setUser(prev => ({ ...prev, avatarUrl: res.data.data }));
                toast.success("Đã tải ảnh lên! Nhớ bấm Lưu.");
            }
        } catch (error) { toast.error("Lỗi upload ảnh"); } 
        finally { setUploading(false); }
    };

    const handleUpdateInfo = async () => {
        try {
            await axiosClient.put('/user/profile', {
                fullName: user.fullName,
                email: user.email,
                avatarUrl: user.avatarUrl
            });
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) { toast.error("Lỗi cập nhật!"); }
    };

    const handleChangePassword = async () => {
        if (passData.newPassword !== passData.confirmPassword) {
            toast.warning("Mật khẩu xác nhận không khớp!"); return;
        }
        try {
            await axiosClient.put('/user/change-password', {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            toast.success("Đổi mật khẩu thành công!");
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) { 
            toast.error(error.response?.data?.message || "Mật khẩu cũ không đúng!"); 
        }
    };

    const goBack = () => {
        const role = localStorage.getItem('role'); // Giả sử bạn lưu role trong localStorage
        if (role === 'TEACHER') navigate('/teacher/dashboard');
        else navigate('/student/dashboard');
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border"/></div>;

    return (
        <Container className="py-5">
            <Button variant="outline-secondary" className="mb-4" onClick={goBack}>&larr; Quay lại Dashboard</Button>
            
            <Row className="justify-content-center">
                <Col md={4} className="mb-4">
                    <Card className="text-center shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="position-relative d-inline-block mb-3">
                                {user.avatarUrl ? (
                                    <Image src={user.avatarUrl} roundedCircle style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                                ) : (
                                    <PersonCircle size={150} className="text-secondary opacity-50" />
                                )}
                                <label className="position-absolute bottom-0 end-0 bg-white border rounded-circle p-2 shadow cursor-pointer btn btn-light btn-sm">
                                    <Camera />
                                    <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading}/>
                                </label>
                            </div>
                            <h4 className="fw-bold">{user.fullName}</h4>
                            <p className="text-muted">@{user.username}</p>
                            {uploading && <div className="text-success small">Đang tải ảnh lên...</div>}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white fw-bold text-primary"><Person className="me-2"/> Thông Tin Cơ Bản</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ và Tên</Form.Label>
                                <Form.Control value={user.fullName} onChange={e => setUser({...user, fullName: e.target.value})} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><Envelope/></InputGroup.Text>
                                    <Form.Control value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
                                </InputGroup>
                            </Form.Group>
                            <Button variant="primary" onClick={handleUpdateInfo}><Save className="me-2"/> Lưu Thay Đổi</Button>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold text-danger"><Key className="me-2"/> Đổi Mật Khẩu</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu cũ</Form.Label>
                                        <Form.Control type="password" value={passData.oldPassword} onChange={e => setPassData({...passData, oldPassword: e.target.value})} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu mới</Form.Label>
                                        <Form.Control type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Xác nhận</Form.Label>
                                        <Form.Control type="password" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="danger" onClick={handleChangePassword}>Cập Nhật Mật Khẩu</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;