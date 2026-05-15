import React, { useEffect } from "react";
import { Typography, Card, Divider, Tag, Button, Result, Row, Col, Space } from "antd";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircleFilled, ArrowRightOutlined, GlobalOutlined, WalletOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const ThankYou = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { donationData } = location.state || {};

    // Redirect if no data (user refreshed or direct accessed)
    useEffect(() => {
        if (!donationData) {
            const timer = setTimeout(() => navigate("/"), 5000);
            return () => clearTimeout(timer);
        }
    }, [donationData, navigate]);

    if (!donationData) {
        return (
            <div className="container py-5 text-center">
                <Result
                    status="404"
                    title="No Donation Data Found"
                    subTitle="It seems you reached this page directly. Redirecting to home..."
                    extra={<Button type="primary" onClick={() => navigate("/")}>Go Home Now</Button>}
                />
            </div>
        );
    }

    const { amount, txHash, paymentMethod, compaign, status, explorerUrl } = donationData;

    return (
        <main style={{ background: "#f9f9f9", minHeight: "100vh" }}>
            <div className="container py-5">
                <Row justify="center">
                    <Col xs={24} md={20} lg={16}>
                        <Result
                            status="success"
                            icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
                            title={<Title level={1}>Thank You for Your Generosity!</Title>}
                            subTitle={
                                <Paragraph style={{ fontSize: 18 }}>
                                    Your donation of <b className="text-primary">{amount} MATIC</b> has been successfully processed for the <b>{compaign?.title}</b> campaign.
                                </Paragraph>
                            }
                            extra={[
                                <Button type="primary" size="large" shape="round" key="home" onClick={() => navigate("/")}>
                                    Return to Home
                                </Button>,
                                <Button size="large" shape="round" key="compaigns" onClick={() => navigate("/compaigns")}>
                                    Explore More Campaigns <ArrowRightOutlined />
                                </Button>,
                            ]}
                        />

                        <Card 
                            bordered={false} 
                            className="shadow-sm rounded-4 overflow-hidden mb-5"
                            bodyStyle={{ padding: 0 }}
                        >
                            <div style={{ background: "#001529", padding: "20px 30px" }}>
                                <Title level={4} style={{ color: "white", margin: 0 }}>Donation Receipt Summary</Title>
                            </div>
                            
                            <div style={{ padding: "30px" }}>
                                <Row gutter={[32, 24]}>
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary">Campaign Supported</Text>
                                            <Title level={5} className="m-0">{compaign?.title || "GiveHope Initiative"}</Title>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary">Amount Donated</Text>
                                            <Title level={5} className="m-0 text-success">{amount} MATIC</Title>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary">Payment Method</Text>
                                            <Text strong>
                                                {paymentMethod === "crypto" ? (
                                                    <><WalletOutlined /> MetaMask (Blockchain)</>
                                                ) : (
                                                    <><GlobalOutlined /> Card to Crypto Gateway</>
                                                )}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary">Transaction Status</Text>
                                            <Tag color="green" style={{ borderRadius: 10, padding: "0 10px" }}>
                                                {status?.toUpperCase() || "COMPLETED"}
                                            </Tag>
                                        </Space>
                                    </Col>
                                </Row>

                                <Divider />

                                <div className="p-4 rounded-3" style={{ background: "#f0f5ff", border: "1px dashed #adc6ff" }}>
                                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                        <div className="d-flex justify-content-between">
                                            <Text strong>PolygonScan Verification</Text>
                                            <Link to={explorerUrl} target="_blank" style={{ color: "#1890ff" }}>
                                                View Receipt <ArrowRightOutlined />
                                            </Link>
                                        </div>
                                        <Text type="secondary" style={{ fontSize: 12, wordBreak: "break-all" }}>
                                            TX Hash: {txHash}
                                        </Text>
                                    </Space>
                                </div>

                                <div className="mt-5 text-center">
                                    <Text type="secondary">
                                        A confirmation email has been sent to your registered email address. 
                                        Thank you for being part of the <b>GiveHope</b> family.
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </main>
    );
};

export default ThankYou;
