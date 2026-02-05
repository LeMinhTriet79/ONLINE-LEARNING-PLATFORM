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
        <Container fluid style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '32px'}}>
            <Container>
                <Button 
                    className="mb-4 fw-semibold"
                    onClick={goBack}
                    style={{
                        background: 'white',
                        border: '2px solid #667eea',
                        color: '#667eea',
                        borderRadius: '12px',
                        padding: '10px 24px',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
                    }}>
                    &larr; Quay lại Dashboard
                </Button>
            
                <Row className="justify-content-center">
                    <Col md={4} className="mb-4">
                        <Card 
                            className="text-center h-100"
                            style={{
                                border: 'none',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                background: 'white'
                            }}>
                            <Card.Body style={{padding: '48px 24px'}}>
                                <div className="position-relative d-inline-block mb-4">
                                    {user.avatarUrl ? (
                                        <Image 
                                            src={user.avatarUrl} 
                                            roundedCircle 
                                            style={{ 
                                                width: '160px', 
                                                height: '160px', 
                                                objectFit: 'cover',
                                                border: '6px solid transparent',
                                                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box',
                                                padding: '4px'
                                            }} 
                                        />
                                    ) : (
                                        <div style={{
                                            width: '160px',
                                            height: '160px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <PersonCircle size={100} className="text-white" />
                                        </div>
                                    )}
                                    <label 
                                        className="position-absolute bottom-0 end-0 rounded-circle shadow"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            border: '4px solid white'
                                        }}>
                                        <Camera size={20} className="text-white" />
                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading}/>
                                    </label>
                                </div>
                                <h4 className="fw-bold mb-2" style={{color: '#1f2937', fontSize: '1.5rem'}}>{user.fullName}</h4>
                                <p className="text-muted mb-3" style={{fontSize: '1.05rem'}}>@{user.username}</p>
                                {uploading && (
                                    <div className="small fw-semibold" style={{color: '#10b981'}}>
                                        💾 Đang tải ảnh lên...
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={8}>
                        <Card 
                            className="mb-4"
                            style={{
                                border: 'none',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                overflow: 'hidden'
                            }}>
                            <Card.Header 
                                className="fw-bold text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '20px 24px',
                                    fontSize: '1.1rem',
                                    border: 'none'
                                }}>
                                <Person className="me-2" size={20}/> Thông Tin Cơ Bản
                            </Card.Header>
                            <Card.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold mb-2" style={{color: '#667eea'}}>👤 Họ và Tên</Form.Label>
                                    <Form.Control 
                                        value={user.fullName} 
                                        onChange={e => setUser({...user, fullName: e.target.value})}
                                        size="lg"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e5e7eb',
                                            padding: '12px 16px'
                                        }}
                                        onFocus={(e) => e.target.style.border = '2px solid #667eea'}
                                        onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold mb-2" style={{color: '#667eea'}}>📧 Email</Form.Label>
                                    <InputGroup size="lg">
                                        <InputGroup.Text style={{
                                            background: 'white',
                                            border: '2px solid #e5e7eb',
                                            borderRight: 'none',
                                            borderRadius: '12px 0 0 12px'
                                        }}>
                                            <Envelope style={{color: '#667eea'}}/>
                                        </InputGroup.Text>
                                        <Form.Control 
                                            value={user.email} 
                                            onChange={e => setUser({...user, email: e.target.value})}
                                            style={{
                                                border: '2px solid #e5e7eb',
                                                borderLeft: 'none',
                                                borderRadius: '0 12px 12px 0',
                                                padding: '12px 16px'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.border = '2px solid #667eea';
                                                e.target.previousSibling.style.border = '2px solid #667eea';
                                                e.target.previousSibling.style.borderRight = 'none';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.border = '2px solid #e5e7eb';
                                                e.target.style.borderLeft = 'none';
                                                e.target.previousSibling.style.border = '2px solid #e5e7eb';
                                                e.target.previousSibling.style.borderRight = 'none';
                                            }}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Button 
                                    onClick={handleUpdateInfo}
                                    className="fw-semibold text-white border-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '12px',
                                        padding: '12px 32px',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    }}>
                                    <Save className="me-2" size={18}/> Lưu Thay Đổi
                                </Button>
                            </Card.Body>
                        </Card>

                        <Card 
                            style={{
                                border: 'none',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                overflow: 'hidden'
                            }}>
                            <Card.Header 
                                className="fw-bold text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    padding: '20px 24px',
                                    fontSize: '1.1rem',
                                    border: 'none'
                                }}>
                                <Key className="me-2" size={20}/> Đổi Mật Khẩu
                            </Card.Header>
                            <Card.Body style={{padding: '32px', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'}}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold mb-2" style={{color: '#dc2626'}}>🔒 Mật khẩu cũ</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                value={passData.oldPassword} 
                                                onChange={e => setPassData({...passData, oldPassword: e.target.value})}
                                                size="lg"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e5e7eb',
                                                    padding: '12px 16px'
                                                }}
                                                onFocus={(e) => e.target.style.border = '2px solid #dc2626'}
                                                onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold mb-2" style={{color: '#dc2626'}}>🆕 Mật khẩu mới</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                value={passData.newPassword} 
                                                onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                                size="lg"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e5e7eb',
                                                    padding: '12px 16px'
                                                }}
                                                onFocus={(e) => e.target.style.border = '2px solid #dc2626'}
                                                onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold mb-2" style={{color: '#dc2626'}}>✔️ Xác nhận</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                value={passData.confirmPassword} 
                                                onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                                                size="lg"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e5e7eb',
                                                    padding: '12px 16px'
                                                }}
                                                onFocus={(e) => e.target.style.border = '2px solid #dc2626'}
                                                onBlur={(e) => e.target.style.border = '2px solid #e5e7eb'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button 
                                    onClick={handleChangePassword}
                                    className="fw-semibold text-white border-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                        borderRadius: '12px',
                                        padding: '12px 32px',
                                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                                    }}>
                                    Cập Nhật Mật Khẩu
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};

export default UserProfile;