import { Button, Col, Form, Input, Row, Select, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../../context/Auth'

const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
}

const Register = () => {

    const { Paragraph } = Typography
    const [state, setState] = useState(initialState)
    const [fileList, setFileList] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)

    const { dispatch } = useAuthContext()

    const handleChange = (e) =>
        setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const isNgo = state.role === "Ngo"

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault()

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role,
        } = state

        // =========================
        // VALIDATION
        // =========================
        if (password !== confirmPassword)
            return window.notify("Passwords do not match", "error")

        if (!role)
            return window.notify("Select role", "error")

        // =========================
        // FORM DATA (IMPORTANT FOR FILES)
        // =========================
        const formData = new FormData()

        formData.append("firstName", firstName)
        formData.append("lastName", lastName)
        formData.append("email", email)
        formData.append("password", password)
        formData.append("role", role)

        // =========================
        // NGO EXTRA DATA
        // =========================
        if (isNgo) {

            formData.append("organizationName", state.organizationName)
            formData.append("registrationNumber", state.registrationNumber)
            formData.append("address", state.address)
            formData.append("phone", state.phone)
            formData.append("website", state.website)
            formData.append("description", state.description)

            // FILE UPLOADS
            fileList.forEach(file => {
                formData.append("documents", file.originFileObj)
            })
        }

        setIsProcessing(true)

        try {

            const res = await axios.post(
                "http://localhost:5000/auth/register",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            const token = res.data.token
            localStorage.setItem("token", token)

            dispatch((s) => ({
                ...s,
                isAuth: true,
                user: res.data.user
            }))

            window.notify("Registered Successfully", "success")

        } catch (error) {
            window.notify(
                error.response?.data?.message || "Registration failed",
                "error"
            )
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <main className="auth p-3 p-md-4 p-lg-5">
            <div className='container'>
                <div className="card p-3 p-md-4">

                    <Form layout='vertical'>

                        <Row gutter={[16]}>

                            {/* FIRST NAME */}
                            <Col xs={24} md={12}>
                                <Form.Item required label="First Name">
                                    <Input name='firstName' onChange={handleChange} />
                                </Form.Item>
                            </Col>

                            {/* LAST NAME */}
                            <Col xs={24} md={12}>
                                <Form.Item required label="Last Name">
                                    <Input name='lastName' onChange={handleChange} />
                                </Form.Item>
                            </Col>

                            {/* EMAIL */}
                            <Col span={24}>
                                <Form.Item required label="Email">
                                    <Input name='email' onChange={handleChange} />
                                </Form.Item>
                            </Col>

                            {/* ROLE */}
                            <Col span={24}>
                                <Form.Item required label="Role">
                                    <Select
                                        value={state.role}
                                        onChange={(value) =>
                                            setState(prev => ({ ...prev, role: value }))
                                        }
                                    >
                                        <Select.Option value="Ngo">NGO</Select.Option>
                                        <Select.Option value="Admin">Admin</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            {/* ========================= */}
                            {/* NGO EXPANDED FORM */}
                            {/* ========================= */}
                            {isNgo && (
                                <>
                                    <Col span={24}>
                                        <Form.Item required label="Organization Name">
                                            <Input
                                                onChange={handleChange}
                                                name="organizationName"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item required label="Registration Number">
                                            <Input
                                                onChange={handleChange}
                                                name="registrationNumber"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item required label="Address">
                                            <Input
                                                onChange={handleChange}
                                                name="address"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item required label="Phone">
                                            <Input
                                                onChange={handleChange}
                                                name="phone"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item required label="Website">
                                            <Input
                                                onChange={handleChange}
                                                name="website"
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item required label="Description">
                                            <Input.TextArea
                                                onChange={handleChange}
                                                name="description"
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* ========================= */}
                                    {/* UPLOAD BUTTON */}
                                    {/* ========================= */}
                                    <Col span={24}>
                                        <Form.Item required label="Upload Documents">
                                            <Upload
                                                multiple
                                                beforeUpload={() => false}
                                                fileList={fileList}
                                                onChange={({ fileList }) =>
                                                    setFileList(fileList)
                                                }
                                            >
                                                <Button icon={<UploadOutlined />}>
                                                    Upload NGO Documents
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </>
                            )}

                            {/* PASSWORD */}
                            <Col span={24}>
                                <Form.Item required label="Password">
                                    <Input.Password name='password' onChange={handleChange} />
                                </Form.Item>
                            </Col>

                            {/* CONFIRM PASSWORD */}
                            <Col span={24}>
                                <Form.Item required label="Confirm Password">
                                    <Input.Password name='confirmPassword' onChange={handleChange} />
                                </Form.Item>
                            </Col>

                            {/* SUBMIT */}
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    block
                                    loading={isProcessing}
                                    onClick={handleSubmit}
                                >
                                    Register
                                </Button>

                                <Paragraph className='text-center mt-2'>
                                    Already have an account? <Link to="/auth/login">Login</Link>
                                </Paragraph>
                            </Col>

                        </Row>

                    </Form>

                </div>
            </div>
        </main>
    )
}

export default Register