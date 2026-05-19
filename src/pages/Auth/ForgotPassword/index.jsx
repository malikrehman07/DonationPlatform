import React, { useState } from 'react'
import { Button, Col, Form, Input, Row, Typography } from 'antd'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
    const { Title, Paragraph } = Typography
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const [step, setStep] = useState(1) // Step 1: Send OTP, Step 2: Reset Password
    const [isProcessing, setIsProcessing] = useState(false)

    // Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault()

        if (!email.trim()) {
            return window.notify("Email is required", "error")
        }
        if (!window.isEmail(email)) {
            return window.notify("Please enter a valid email address", "error")
        }

        setIsProcessing(true)
        try {
            await axios.post("https://apigivehopes.vercel.app/auth/forgot-password", { email })
            window.notify("OTP has been sent to your email address", "success")
            setStep(2)
        } catch (error) {
            window.notify(error.response?.data?.message || "Failed to send OTP. Please check your email.", "error")
        } finally {
            setIsProcessing(false)
        }
    }

    // Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!otp.trim()) {
            return window.notify("OTP code is required", "error")
        }
        if (otp.length !== 6) {
            return window.notify("OTP must be exactly 6 digits", "error")
        }
        if (!newPassword) {
            return window.notify("New password is required", "error")
        }
        if (newPassword.length < 8) {
            return window.notify("Password must be at least 8 characters long", "error")
        }
        if (newPassword !== confirmPassword) {
            return window.notify("Passwords do not match", "error")
        }

        setIsProcessing(true)
        try {
            await axios.post("https://apigivehopes.vercel.app/auth/reset-password", {
                email,
                otp,
                newPassword
            })
            window.notify("Password reset successfully. You can now login.", "success")
            navigate("/auth/login")
        } catch (error) {
            window.notify(error.response?.data?.message || "Failed to reset password. Please verify the OTP.", "error")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <main className="auth p-3 p-md-4 p-lg-5">
            <div className='container'>
                <div className="card p-3 p-md-4" style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '12px', boxShadow: '0 8px 32px 0 rgba(7, 136, 127, 0.08)' }}>
                    
                    <Title level={3} className="text-center mb-1 text-primary" style={{ color: '#07887f' }}>
                        Forgot Password
                    </Title>
                    <Paragraph className='text-center text-muted mb-4'>
                        {step === 1 
                            ? "Enter your email address to receive a 6-digit verification code."
                            : "Enter the verification code sent to your email along with your new password."
                        }
                    </Paragraph>

                    {step === 1 ? (
                        <Form layout='vertical' onSubmitCapture={handleSendOTP}>
                            <Row gutter={[16]}>
                                <Col span={24}>
                                    <Form.Item label="Email Address" required>
                                        <Input 
                                            type='email' 
                                            placeholder='Enter your registered email' 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col span={24}>
                                    <Button 
                                        type='primary' 
                                        htmlType='submit' 
                                        block 
                                        loading={isProcessing}
                                        style={{ backgroundColor: '#07887f', borderColor: '#07887f' }}
                                    >
                                        Send OTP
                                    </Button>
                                    <Paragraph className='text-center my-3'>
                                        Remembered your password? <Link to="/auth/login" style={{ color: '#07887f', fontWeight: 'bold' }}>Login</Link>
                                    </Paragraph>
                                </Col>
                            </Row>
                        </Form>
                    ) : (
                        <Form layout='vertical' onSubmitCapture={handleResetPassword}>
                            <Row gutter={[16]}>
                                <Col span={24}>
                                    <Form.Item label="Verification Code (OTP)" required>
                                        <Input 
                                            type='text' 
                                            maxLength={6}
                                            placeholder='Enter 6-digit OTP' 
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="New Password" required>
                                        <Input.Password 
                                            placeholder='Enter at least 8 characters' 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Confirm New Password" required>
                                        <Input.Password 
                                            placeholder='Confirm your new password' 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col span={24}>
                                    <Button 
                                        type='primary' 
                                        htmlType='submit' 
                                        block 
                                        loading={isProcessing}
                                        style={{ backgroundColor: '#07887f', borderColor: '#07887f' }}
                                    >
                                        Reset Password
                                    </Button>
                                    <div className="d-flex justify-content-between my-3">
                                        <Button type="link" onClick={() => setStep(1)} style={{ color: '#07887f', padding: 0 }}>
                                            &larr; Back to Email
                                        </Button>
                                        <Link to="/auth/login" style={{ color: '#07887f', fontWeight: 'bold' }}>
                                            Back to Login
                                        </Link>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </div>
            </div>
        </main>
    )
}

export default ForgotPassword
