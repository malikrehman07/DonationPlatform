import { Button, Card, Col, Image, Row, Typography } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
    const { Title, Paragraph } = Typography
    const navigate = useNavigate()
    return (
        <div style={{ backgroundColor: '#ededed' }} >
            <div className="container">
                <Row gutter={[24, 24]} className='justify-content-center text-center' >
                    <Col xs={24} sm={24} md={24} lg={12} className=' mt-5 d-flex flex-column justify-content-center align-items-start  text-start' >
                        <Title level={3} className='m-0' > Healing <b className='text-primary' >Hearts</b>, Healing <b className='text-primary' >Lives</b></Title>
                        <Title level={1} className='m-0 pb-3' style={{ fontSize: '55px', fontWeight: 'bolder', lineHeight: '1.1' }} ><span className='text-primary' >Sharing</span> Strength,<span className='text-primary' > Sparking</span> Change,<span className='text-primary' > Spreading</span> Smiles. </Title>
                        <Paragraph >Lorem ipsum dolor sit amet consectetur. Ultrices ultrices pulvinar maecenas neque. Sit tellus nunc enim cursus dolor ultrices sit ullamcorper aliqueorem aliquet.</Paragraph>
                        <Row className='my-2'>
                            <Col span={8}>
                                <Title level={2} className='mb-0'>200+</Title>
                                <Paragraph>Archived Campaigns </Paragraph>
                            </Col>
                            <Col span={8}>
                                <Title level={2} className='mb-0'>2000+</Title>
                                <Paragraph>Donations Received</Paragraph>
                            </Col>
                            <Col span={8}>
                                <Title level={2} className='mb-0'>30k+</Title>
                                <Paragraph>Total Fundraisers</Paragraph>
                            </Col>
                        </Row>
                        <Button type='primary' variant='solid' size='large' shape='round' block onClick={()=>navigate('/compaigns')} >Donate Now</Button>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} className='h-100 text-center '  >
                        <Image src='https://res.cloudinary.com/djpvxvokp/image/upload/v1758480133/Untitled_design_4_kyjla1.png' alt='charity' preview={false} className='img-fluid ' style={{ maxHeight: '600px' }} />
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default Hero