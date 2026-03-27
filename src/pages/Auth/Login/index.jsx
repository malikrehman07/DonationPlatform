import { Button, Col, Form, Input, Row, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom';

const Login = () => {
    const { Title, Paragraph } = Typography;
    return (
        <main className="auth p-5 p-md-4 p-lg-5">
            <div className="container">
                <div className="card p-3 p-md-4">
                    <Form layout='vertical' >
                        <Row>
                            <Col span={24}>
                                <Title className='text-center'>Login</Title>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item label="Email">
                                    <Input placeholder='Please Enter Your Email' name='email' type="email" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item label="Password">
                                    <Input placeholder='Please Enter Your Password' name='password' type="password" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Button type='primary' variant="solid" color="default" block>Login</Button>
                                <Paragraph className='text-center my-1' >Don't have an account? <Link to="/auth/register">Register</Link></Paragraph>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        </main>
    )
}

export default Login