import { Col, Row, Typography } from 'antd'
import React from 'react'

const Companies = () => {
    const {Title} = Typography
    return (
        <>
            <div className='bg-primary'>
                <div className="container py-3 ">
                    <Row gutter={16} className='text-center'>
                        <Col xs={12} sm={12} md={12} lg={6} className='my-3 text-center'><Title level={3} className='text-white m-0'>TEAM<b>TALK</b></Title></Col>
                        <Col xs={12} sm={12} md={12} lg={6} className='my-3 text-center'><Title level={3} className='text-white m-0'>EX<b>DONE</b> </Title></Col>
                        <Col xs={12} sm={12} md={12} lg={6} className='my-3 text-center'><Title level={3} className='text-white m-0'><b>NEXT</b>FLOWS</Title></Col>
                        <Col xs={12} sm={12} md={12} lg={6} className='my-3 text-center'><Title level={3} className='text-white m-0'>GLOBAL<b>CHART</b> </Title></Col>
                    </Row>
                </div>
            </div>
        </>
    )
}

export default Companies