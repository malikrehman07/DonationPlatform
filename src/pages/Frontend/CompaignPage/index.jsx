import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Typography, Spin, Row, Col, Button, Card, Divider, Breadcrumb } from 'antd';
import { Carousel } from 'antd';
import Compaigns from '../Home/Compaigns'
// import axios from 'axios';
// import { useAuthContext } from '../../../context/Auth';
import { Progress } from 'antd';



const { Title, Paragraph } = Typography;

const CompaignPage = () => {
    const { category, id } = useParams();
    const [compaign, setCompaign] = useState(null);
    const [loading, setLoading] = useState(true);
    // const { user } = useAuthContext();
    const navigate = useNavigate()
    const [raised, setRaised] = useState(0);
    const [donations, setDonations] = useState([])


    // const handleDonate = () => {

    //     const compaignItem = {
    //         compaignId: id,
    //         title: compaign.title,
    //         image: compaign.imageUrls?.[0],
    //         uid: user?.uid || null,
    //         addedAt: new Date().toISOString(),
    //     };

    //     navigate("/checkout", { state: { compaign: compaignItem } });
    // };


    const handleDonate = () => {
        message.info("Donation flow is currently disabled for demo purposes. Please check back later.");
    };

    
    // useEffect(() => {
    //     const fetchCompaign = async () => {
    //         setLoading(true);
    //         try {
    //             // get compaign
    //             const res = await axios.get(`https://backend-theta-silk-38.vercel.app/compaigns/read/${id}`);
    //             setCompaign(res.data.compaign);

    //             const donRes = await axios.get(`https://backend-theta-silk-38.vercel.app/compaign/${id}`);

    //             // sum donations
    //             const totalRaised = (donRes.data.donations || []).reduce(
    //                 (sum, d) => sum + (parseFloat(d.amount) || 0),
    //                 0
    //             );
    //             setRaised(totalRaised);
    //             setDonations(donRes.data.donations)

    //         } catch (error) {
    //             window.notify("Error fetching compaign or donations", "error");
    //             console.error(error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchCompaign();
    // }, [id]);



    if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', }} />;

    if (!compaign) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center', }}>
                <Title level={3}>Compaign not found</Title>
            </div>
        );
    }


    return (
        <>
            <div className="container mt-3 ">
                <Row>
                    <Col span={24}>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to="/">Home</Link>,
                                },
                                {
                                    title: compaign.title,
                                },
                            ]}
                        />
                    </Col>
                </Row>
            </div>
            <div className="container py-5">
                <Row gutter={[16, 16]} align='middle' >
                    <Col xs={24} sm={24} md={24} lg={12} style={{ textAlign: "center" }} >
                        <Carousel autoplay dots={false}>
                            {compaign.imageUrls?.map((imgUrl, i) => (
                                <div key={i}>
                                    <img src={imgUrl} alt={`Compaign ${i + 1}`} style={{ maxHeight: "500px" }} className='img-fluid' />
                                </div>
                            ))}
                        </Carousel>
                    </Col>


                    <Col xs={24} sm={24} md={24} lg={12}>
                        <Row>
                            <Col span={24}>
                                <Title level={2}>{compaign.title}</Title>
                            </Col>
                        </Row>
                        <Row gutter={[8, 8]} >
                            <Col span={24}>
                                <Title level={4}>Compaign Details</Title>
                                <pre className='mb-1' style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                    <Paragraph className='mb-1' >{compaign.description}</Paragraph>
                                </pre>
                            </Col>
                        </Row>
                        <Row className='mb-1'  >
                            <Col span={24}>
                                <div className="d-flex justify-content-between align-items-center text-center w-100">
                                    <span>
                                        <Title level={5} className=" text-primary m-0">Raised</Title>
                                        <Title level={5} className=" text-primary mb-2 mt-0">${raised.toLocaleString()}</Title>
                                    </span>
                                    <span>
                                        <Title level={5} className="m-0">Target</Title>
                                        <Title level={5} className="mb-2 mt-0">${compaign.amount.toLocaleString()}</Title>
                                    </span>
                                </div>
                                <Progress
                                    percent={Math.min((raised / compaign.amount) * 100, 100)}
                                    showInfo={false}
                                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                />
                            </Col>
                        </Row>
                        <Row className='mt-3'>
                            <Col span={24}>
                                <Button type="primary" variant='solid' size='large' shape='round' block onClick={handleDonate} >Donate</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row >
            </div >
            <div className="container">
                <Row>
                    <Col span={12} className='text-center'>
                        <Title level={5}><a href="#donation-details" style={{ color: "#222" }}>Compaign Details</a></Title>
                        <Divider style={{ borderColor: '#222' }} />
                    </Col>
                    <Col span={12} className='text-center'>
                        <Title level={5}><a href="#donations" style={{ color: "#222" }}>Recent Donations</a></Title>
                        <Divider style={{ borderColor: '#222' }} />
                    </Col>
                </Row>
                <Row gutter={[8, 8]} className='py-5' id='donation-details' >
                    <Col span={24}>
                        <Title level={2}>Compaign Details</Title>
                        <pre className='mb-1' style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            <Paragraph className='mb-1' >{compaign.description}</Paragraph>
                        </pre>
                    </Col>
                </Row>
                <Divider style={{ borderColor: '#222' }} />
                <Row id="donations" className="mt-5">
                    <Col span={24}>
                        <Title level={2}>Recent Donations</Title>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} justify="center">
                    {donations.slice(0, 6).map((donation) => (
                        <Col xs={24} sm={12} md={12} lg={8} key={donation._id}>
                            <Card bordered style={{ borderRadius: 12, textAlign: "center", padding: 10 }}>
                                <Row justify="space-between" align="middle" >
                                    <Paragraph strong>{donation.fullName}</Paragraph>
                                    <br />
                                    <Paragraph type="success">Donated: ${donation.amount.toLocaleString()}</Paragraph>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Divider style={{ borderColor: '#222' }} />
            </div>
            <div className="container py-2 mb-5">
                <Row gutter={[16, 16]} >
                    <Col span={24} className='text-center'>
                        <Title level={1}>Other Compaigns</Title>
                        <Compaigns />
                    </Col>
                </Row>
                <Divider style={{ borderColor: '#222' }} />
            </div>
        </>
    );
};

export default CompaignPage;
