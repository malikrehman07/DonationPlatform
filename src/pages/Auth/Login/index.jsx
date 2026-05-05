import { Button, Col, Form, Input, Row, Typography } from 'antd'
import Paragraph from 'antd/es/skeleton/Paragraph'
import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../../context/Auth'

const initialState = { email: '', password: '' }
const Login = () => {
    const { Paragraph } = Typography;
    const { readProfile } = useAuthContext()
    const [state, setState] = useState(initialState)
    const [isProcessing, setIsProcessing] = useState(false)
    const navigate = useNavigate()
    const handleChange = (e) => setState(s => ({ ...s, [e.target.name]: e.target.value }))
    const handleSubmit = async (e) => {
        e.preventDefault()
        let { email, password } = state;
        if (!window.isEmail(email)) {
            return window.notify("Please Enter Your Email Correctly", "error")
        }
        if (password.length < 8) {
            return window.notify("Password must be atleast of 8 characters", "error")
        }
        setIsProcessing(true)
        try {
            const res = await axios.post("http://localhost:3000/auth/login", { email, password })
            localStorage.setItem("token", res.data.token)
            console.log('token', res.data.token)

            await readProfile();
            window.notify("Logged in successfully", "success")
            navigate("/")
        } catch (error) {
            window.notify(error.response?.data?.message || "Logged in Failed", "error")
            console.log('error', error)
        } finally {
            setIsProcessing(false)
        }
    }
    return (
        <main className="auth p-3 p-md-4 p-lg-5">
            <div className='container'>
                <div className="card p-3 p-md-4 ">
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
                                <Paragraph className='text-center my-1' >Don't have an account?<Link to="/auth/register" >Register</Link></Paragraph>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        </main>
    )
}

export default Login