import React, { useState } from 'react'
import { useCallback, useEffect } from 'react';
import { Button, Col, Progress, Row, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography
const Compaigns = () => {
    const [compaigns, setCompaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    // const { user } = useAuthContext()
    const [donations, setDonations] = useState([])
    const [compaignTotals, setCompaignTotals] = useState({});
    return (
        <div className="container py-5 ">
            <Row gutter={[18, 18]} justify="center" className=" text-start">
                {compaigns.slice(0, 8).map((compaign) => {
                    return (
                        <Col xs={12} sm={12} md={12} lg={6} key={compaign.id}>
                            <div className="card border-0" style={{ width: "100%", height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/compaign/${compaign._id}`)} >
                                    <img src={compaign.imageUrls?.[0]} alt={compaign.title} style={{ width: "300px", height: "200px", objectFit: "cover" }} className="img-fluid rounded-4" />
                                    <div className='my-2 text-start' >
                                        <Title className='mb-0' level={4} style={{ height: "50px", overflow: 'hidden' }} >{compaign.title}</Title>
                                        {/* <Paragraph >{compaign.description}</Paragraph> */}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center text-center w-100">
                                    <span>
                                        <Title level={5} className=" text-primary m-0">Raised</Title>
                                        <Title level={5} className=" text-primary mb-2 mt-0">${(compaignTotals[compaign._id] || 0).toLocaleString()}</Title>
                                    </span>
                                    <span>
                                        <Title level={5} className="m-0">Target</Title>
                                        <Title level={5} className="mb-2 mt-0">${compaign.amount.toLocaleString()}</Title>
                                    </span>
                                </div>
                                <Progress percent={Math.min(((compaignTotals[compaign._id] || 0) / compaign.amount) * 100, 100)} strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} status="active" showInfo={false} />

                                <div>
                                    <Button type="primary" shape="round" size='large' variant='solid' block onClick={() => handleDonate(compaign)} >Donate</Button>
                                </div>
                            </div>
                        </Col>
                    )
                })}
            </Row>
            <Row className='mt-5 mb-5 justify-content-center text-center'>
                <Col span={24} >
                    <Button type="primary" shape="round" size='large' variant='solid' onClick={() => navigate("/compaigns")} >View All</Button>
                </Col>
            </Row>
        </div>
    )
}

export default Compaigns