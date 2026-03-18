import { Col, Image, Row, Typography } from 'antd'
import React from 'react'

const Help = () => {
    const { Title, Paragraph } = Typography
    return (
        <div className='py-5' style={{backgroundColor:'#ededed'}} >
            <div className="container py-5 bg-primary rounded-5">
                <Row gutter={[16, 16]} align="middle" justify="center" className='mx-auto'>
                    <Col xs={24} md={24}>
                        <Title className="text-black text-center mb-0 ">
                            How To Start Help
                        </Title>
                        <Paragraph className='text-center mt-0' >In carrying out their duties, charitable foundations provide a variety of social services such as education, food, medicine, housing, and others</Paragraph>
                    </Col>
                    <Col xs={24} md={24}>
                        <Row gutter={[24, 24]} className='mx-2 text-center' >
                            <Col xs={24} sm={24} md={8} lg={8} >
                                <Image src='https://img.icons8.com/?size=50&id=ywULFSPkh4kI&format=png&color=000000' alt='person' preview={false} />
                                <Title level={4} className="text-black text-center mb-0"> Register Yourself
                                </Title>
                                <Paragraph>Sign up to join and be part of the good people who love to share</Paragraph>
                            </Col>
                            <Col xs={24} sm={24} md={8} lg={8} >
                                <Image src='https://img.icons8.com/?size=50&id=Yv8CCpT6tRjg&format=png&color=000000' alt='clap' preview={false} />
                                <Title level={4} className="text-black text-center mb-0"> Select Donate
                                </Title>
                                <Paragraph>There are many things you can choose to share goodness with</Paragraph>
                            </Col>
                            <Col xs={24} sm={24} md={8} lg={8} >
                                <Image src='https://img.icons8.com/?size=50&id=59802&format=png&color=000000' alt='smile' preview={false} />
                                <Title level={4} className="text-black text-center mb-0"> Share Happiness
                                </Title>
                                <Paragraph>Sharing happiness with those less and doing more good for others</Paragraph>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default Help