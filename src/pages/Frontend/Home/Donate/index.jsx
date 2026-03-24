import { Button, Col, Image, Row, Typography } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Donate = () => {
    const { Title, Paragraph } = Typography
    const navigate = useNavigate()
    return (
        <div>
            <div className="container">
                <Row gutter={[16,16]} >
                    <Col xs={24} sm={24} md={24} lg={12} className='mt-5 d-flex flex-column justify-content-center align-items-start text-star' >
                        <Title level={5} className='m-0' > <span className='text-primary' style={{ fontSize: '50px', fontWeight: 'bold' }} >$20</span> /Mon</Title>
                        <Paragraph className='mt-0' >or make one time Donation</Paragraph>
                        <Title level={1} className='m-0 pb-3' style={{ fontSize: '55px', fontWeight: 'bolder', lineHeight: '1.1' }} >Feed The Hungry, Spread <span className='text-primary' >Kindness</span>  Everywhere</Title>
                        <Paragraph >Lorem ipsum dolor sit amet consectetur. Ultrices ultrices pulvinar maecenas neque. Sit tellus nunc enim cursus dolor ultrices sit ullamcorper aliqueorem aliquet.</Paragraph>
                        <Button type='primary' variant='solid' shape='round' size='large' block onClick={()=>navigate('/compaigns')} >Donate Now</Button>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} className='h-100 text-center' >
                        <Image src='https://res.cloudinary.com/djpvxvokp/image/upload/v1758467110/Untitled_design_8_1_uniinm.png' alt='child' className='img-fluid' style={{ maxWidth: '500px' }} preview={false} />
                    </Col>
                </Row >
            </div >
        </div>
    )
}

export default Donate