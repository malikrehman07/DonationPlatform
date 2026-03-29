import React, { useState } from 'react'
import { useCallback, useEffect } from 'react';
// import axios from 'axios'
import { Button, Col, Progress, Row, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
// import { useAuthContext } from '../../../context/Auth';

const { Title, Paragraph } = Typography
const AllCompaigns = () => {
    const [compaigns, setCompaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    // const { user } = useAuthContext()
    const [donations, setDonations] = useState([])
    const [compaignTotals, setCompaignTotals] = useState({});


    const handleDonate = (compaign) => {

        const compaignItem = {
            compaignId: compaign._id,
            title: compaign.title,
            image: compaign.imageUrls?.[0],
            uid: user?.uid || null,
            addedAt: new Date().toISOString(),
        };

        navigate("/checkout", { state: { compaign: compaignItem } });
    };

    // const getCompaigns = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const token = localStorage.getItem("token");

    //         const [compRes, donRes] = await Promise.all([
    //             axios.get("https://backend-theta-silk-38.vercel.app/compaigns/read"),
    //             axios.get("https://backend-theta-silk-38.vercel.app/dashboard/donations"),
    //         ]);

    //         setCompaigns(compRes.data.compaigns);
    //         setDonations(donRes.data.donations || []);

    //         // ✅ Group donations by campaignId
    //         const totals = {};
    //         (donRes.data.donations || []).forEach((donation) => {
    //             const compId = donation.compaign?.compaignId; // correct path
    //             if (!compId) return; // skip if no campaign

    //             const donationTotal = parseFloat(donation.amount || 0); // donations already have amount
    //             totals[compId] = (totals[compId] || 0) + donationTotal;
    //         });
    //         setCompaignTotals(totals);
    //     } catch (error) {
    //         window.notify("Error fetching compaigns or donations", "error");
    //         console.error(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);


    // useEffect(() => { getCompaigns() }, [getCompaigns])
    if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', }} />;
    return (
        <div className="container py-5 ">
            <Row gutter={[18, 18]} justify="center" align='middle' className=" text-center">
                {compaigns.map((compaign) => {
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
        </div>
    )
}

export default AllCompaigns