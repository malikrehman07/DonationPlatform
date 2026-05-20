import { Button, Col, Form, Input, Row, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../../context/Auth'

const initialState = { email: '', password: '' }
const Login = () => {
    const { Title, Paragraph } = Typography;
    const { readProfile } = useAuthContext()
    const [state, setState] = useState(initialState)
    const [isProcessing, setIsProcessing] = useState(false)
    const navigate = useNavigate()
    const handleChange = (e) => setState(s => ({ ...s, [e.target.name]: e.target.value }))
    const handleSubmit = async (e) => {
        e.preventDefault()
        let { email, password } = state;

        // =========================
        // VALIDATION
        // =========================
        if (!email.trim())
            return window.notify("Email is required", "error")

        if (!window.isEmail(email))
            return window.notify("Please enter a valid email address", "error")

        if (!password)
            return window.notify("Password is required", "error")

        if (password.length < 8)
            return window.notify("Password must be at least 8 characters", "error")

        setIsProcessing(true)
        try {
            const res = await axios.post("https://apigivehopes.vercel.app/auth/login", { email, password })
            localStorage.setItem("token", res.data.token)

            await readProfile();
            window.notify("Logged in successfully", "success")
            navigate("/")
        } catch (error) {
            window.notify(error.response?.data?.message || "Login failed", "error")
        } finally {
            setIsProcessing(false)
        }
    }
    return (
        <main className="auth p-3 p-md-4 p-lg-5">
            <div className='container'>
                <div className="card p-3 p-md-4 ">
                    <div className="d-flex align-items-center mb-4" style={{ position: 'relative', minHeight: '40px' }}>
                        <Link
                            to="/"
                            className="d-inline-flex align-items-center text-decoration-none justify-content-center"
                            style={{
                                color: '#07887f',
                                fontSize: '18px',
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(7, 136, 127, 0.08)',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(7, 136, 127, 0.15)',
                                zIndex: 2
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(7, 136, 127, 0.15)';
                                e.currentTarget.style.transform = 'translateX(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(7, 136, 127, 0.08)';
                                e.currentTarget.style.transform = 'none';
                            }}
                            title="Back to Homepage"
                        >
                            <ArrowLeftOutlined />
                        </Link>
                        <Title
                            level={3}
                            className="m-0 text-center w-100"
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                color: '#07887f',
                                fontWeight: '600',
                                pointerEvents: 'none',
                                margin: 0
                            }}
                        >
                            Login
                        </Title>
                    </div>
                    <Form layout='vertical' >
                        <Row gutter={[16]} >
                            <Col span={24} >
                                <Form.Item label="Email" required >
                                    <Input type='email' placeholder='Enter Your Email' name='email' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                            <Col span={24} >
                                <Form.Item label="Password" required >
                                    <Input.Password placeholder='Enter Your Password' name='password' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24} >
                                <Button type='primary' variant='solid' htmlType='submit' block loading={isProcessing} onClick={handleSubmit} >Login</Button>
                                <div className='d-flex justify-content-between flex-wrap align-items-center my-2'>
                                    <Link to="/auth/forgot-password" style={{ color: '#07887f', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
                                    <Paragraph className='m-0' style={{ display: 'inline' }}>Don't have an account? <Link to="/auth/register" style={{ color: '#07887f', fontWeight: '500' }}>Register</Link></Paragraph>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        </main>
    )
}

export default Login
