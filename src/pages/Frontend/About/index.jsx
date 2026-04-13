import React from 'react';
import { Row, Col, Typography, Button } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const About = () => {
  const navigate = useNavigate()
  return (
    <main>
      <div className="container my-5 py-4">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <img src="https://www.wildapricot.com/wp-content/uploads/2023/02/donation-button.png" alt="About Foodi" className="img-fluid rounded shadow"
            />
          </Col>
          <Col xs={24} md={12}>
            <Title level={2}>About <b className='text-primary'>Give</b>Hope</Title>
            <Paragraph className='my-2' style={{ fontSize: '16px' }}>
              At <strong>GiveHope</strong>, we believe that a small act of kindness can create a ripple of change. Our mission is simple yet powerful — to connect people who want to make a difference with the communities and causes that need it most.
            </Paragraph>
            <Paragraph className='my-2' style={{ fontSize: '16px' }}>
              We work hand-in-hand with trusted NGOs, volunteers, and donors to ensure every contribution reaches the right hands. From providing food and shelter to supporting education, healthcare, and disaster relief, GiveHope is more than a platform — it’s a movement of compassion and empowerment.
            </Paragraph>
            <Paragraph className='my-2' style={{ fontSize: '16px' }}>
              What makes us different?
            </Paragraph>
            <Paragraph className='my-2' style={{ fontSize: '16px' }} >
              Transparency – We ensure your donations are tracked and directed where they matter most.
            </Paragraph>

            <Paragraph className='my-2' style={{ fontSize: '16px' }} >
              Community Impact – Every campaign tells a story of real people, real struggles, and real change.
            </Paragraph>

            <Paragraph className='my-2' style={{ fontSize: '16px' }} >
              Trust – We partner only with verified organizations to protect your generosity.
            </Paragraph>

            <Paragraph className='my-2' style={{ fontSize: '16px' }} >
              Together, we can turn hope into action and transform lives. 🌱
            </Paragraph>

            <Paragraph className='my-2' style={{ fontSize: '16px' }} >
              Because when you give hope, you give someone a future. 💙
            </Paragraph>

            <Button type="primary" icon={<SmileOutlined />} size="large" onClick={() => { navigate("/compaigns") }} >Explore Our Compaigns</Button>
          </Col>
        </Row>
      </div>
    </main>
  );
};

export default About;
