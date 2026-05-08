import { Button, Col, Form, Input, Row, Select, Typography } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../../context/Auth'

// const initialState = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: '' }
const initialState = { firstName: '', lastName: '', email: '', password: '', confirmPassword: ''}
const Register = () => {
    const { Paragraph } = Typography
    const [state, setState] = useState(initialState)
    const [isProcessing, setIsProcessing] = useState(false)
    const { isAuth, dispatch } = useAuthContext();
    const handleChange = (e) => setState(s => ({ ...s, [e.target.name]: e.target.value }))
    const handleSubmit = async (e) => {
        e.preventDefault()
        let { firstName, lastName, email, password, confirmPassword } = state;
        if (firstName.length < 3) {
            return window.notify("Please Enter Your First Name Correctly", "error")
        }
        if (lastName.length < 3) {
            return window.notify("Please Enter Your Last Name Correctly", "error")
        }
        if (!window.isEmail(email)) {
            return window.notify("Please Enter Your Email Correctly", "error")
        }
        // if (!role) {
        //     return window.notify("Please Select Your Role", "error")
        // }
        if (password.length < 8) {
            return window.notify("Password must be atleast of 8 characters", "error")
        }
        if (confirmPassword !== password) {
            return window.notify("Password doesn't match", "error")
        }
        let userData = { firstName, lastName, email, password }
        setIsProcessing(true)
        try {
            const res = await axios.post("http://localhost:5000/auth/register", userData)
            const token = res.data.token;

            localStorage.setItem("token", token)

            dispatch((s) => ({ ...s, isAuth: true, user: res.data.user }))
            window.notify(res.data.message || "Registered Successfully", "success")
        } catch (error) {
            console.log('error', error)
            window.notify(error.response?.data?.message || "Registered Failed", "error")
        } finally {
            setIsProcessing(false);
        }
    }
    return (
        <main className="auth p-3 p-md-4 p-lg-5">
            <div className='container'>
                <div className="card p-3 p-md-4 ">
                    <Form layout='vertical' >
                        <Row gutter={[16]} >
                            <Col xs={24} sm={24} md={12} lg={12} >
                                <Form.Item label="First Name" required >
                                    <Input type='text' placeholder='Enter Your First Name' name='firstName' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} >
                                <Form.Item label="Last Name" required >
                                    <Input type='text' placeholder='Enter Your Last Name' name='lastName' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                            <Col span={24} >
                                <Form.Item label="Email" required >
                                    <Input type='email' placeholder='Enter Your Email' name='email' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                            {/* <Col span={24}>
                                <Form.Item label="Role" required>
                                    <Select name="role" value={state.role} onChange={(value) => setState((prev) => ({ ...prev, role: value }))}>
                                        <Select.Option value="NGO">NGO</Select.Option>
                                        <Select.Option value="Donor">Donor</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col> */}
                            <Col span={24} >
                                <Form.Item label="Password" required >
                                    <Input.Password placeholder='Enter Your Password' name='password' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                            <Col span={24} >
                                <Form.Item label="Confirm Password" required >
                                    <Input.Password placeholder='Please Confirm Your Password' name='confirmPassword' onChange={handleChange} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24} >
                                <Button type='primary' variant='solid' block loading={isProcessing} onClick={handleSubmit}  >Register</Button>
                                <Paragraph className='text-center my-1' >Already have an account?<Link to="/auth/login" >Login</Link></Paragraph>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        </main>
    )
}

export default Register