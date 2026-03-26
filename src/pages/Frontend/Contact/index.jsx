import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, Typography, message } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
// import axios from 'axios';

const { Title, Paragraph } = Typography;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false)
  // const handleSubmit = async (values) => {
  //   setLoading(true);
  //   try {
  //     await axios.post("https://backend-theta-silk-38.vercel.app/contact", values);
  //     message.success("Message sent successfully!");
  //   } catch (err) {
  //     console.error(err);
  //     message.error("Failed to send message");
  //   } finally {
  //     setLoading(false);
  //     form.resetFields();
  //   }
  // };
  const handleSubmit = (values) => {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      message.success("Message sent successfully!"); 
      form.resetFields();
    }, 2000);
  };
  return (
    <div className="container my-5 py-4">
      <Row gutter={[24, 24]}>
        {/* Left Side - Contact Info */}
        <Col xs={24} md={10}>
          <Title level={2}>Contact <span className='text-primary'>Us</span></Title>
          <Paragraph>
            We'd love to hear from you! Whether you have a question about our menu, orders, or anything else — our team is ready to answer all your questions.
          </Paragraph>
          <p><PhoneOutlined style={{ color: '#07887f', marginRight: 8 }} /> +1 (234) 567-890</p>
          <p><MailOutlined style={{ color: '#07887f', marginRight: 8 }} /> contact@malikrehman.xyz</p>
          <p><EnvironmentOutlined style={{ color: '#07887f', marginRight: 8 }} /> 123 Food Street, Lake City</p>
        </Col>

        {/* Right Side - Contact Form */}
        <Col xs={24} md={14}>
          <Form layout="vertical" form={form} onFinish={handleSubmit} size="large">
            <Form.Item label="Your Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
              <Input placeholder="John Doe" />
            </Form.Item>

            <Form.Item label="Your Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Invalid email address' }]}>
              <Input placeholder="john@example.com" />
            </Form.Item>

            <Form.Item label="Message" name="message" rules={[{ required: true, message: 'Please enter a message' }]} >
              <Input.TextArea placeholder="Type your message..." rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} >Send Message</Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Contact;
