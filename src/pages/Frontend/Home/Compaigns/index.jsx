import React, { useState, useEffect } from "react";
import { Button, Col, Progress, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getReadOnlyContract } from "../../../../blockchain/config";
import { ethers } from "ethers";

const { Title } = Typography;

const Compaigns = () => {
    const [compaigns, setCompaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [donations, setDonations] = useState([]);
    const [compaignTotals, setCompaignTotals] = useState({});

    // =========================
    // FETCH CAMPAIGNS (SYNCHRONIZED WITH BLOCKCHAIN)
    // =========================
    const fetchCompaigns = async () => {
        try {
            setLoading(true);

            // 1. Fetch from MongoDB
            const res = await axios.get("http://localhost:5000/compaigns/read");
            const mongoCampaigns = res.data.compaigns || [];

            // 2. Sync with Blockchain
            const contract = getReadOnlyContract();
            const syncedCampaigns = await Promise.all(
                mongoCampaigns.map(async (c) => {
                    try {
                        if (c.blockchainCampaignId !== undefined) {
                            const blockchainData = await contract.getCampaign(c.blockchainCampaignId);
                            // blockchainData[2]: title, [4]: target, [5]: raised
                            const raisedOnChain = ethers.formatEther(blockchainData[5]);
                            const targetOnChain = ethers.formatEther(blockchainData[4]);
                            return {
                                ...c,
                                title: blockchainData[2] || c.title,
                                raisedAmount: parseFloat(raisedOnChain).toFixed(2),
                                targetAmount: parseFloat(targetOnChain).toFixed(2)
                            };
                        }
                        return c;
                    } catch (err) {
                        console.error(`Error syncing campaign ${c._id}:`, err);
                        return c;
                    }
                })
            );

            setCompaigns(syncedCampaigns);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompaigns();
    }, []);

    // =========================
    // DONATE BUTTON
    // =========================
    const handleDonate = (compaign) => {
        navigate(`/checkout`, {
            state: { compaign },
        });
    };

    return (
        <div className="container py-5">
            <Row gutter={[18, 18]} justify="center">

                {/* LOADING STATE */}
                {loading ? (
                    <Col span={24} style={{ textAlign: "center" }}>
                        <p>Loading campaigns...</p>
                    </Col>
                ) : (
                    compaigns.slice(0, 4).map((compaign) => {
                        const raised = compaign.raisedAmount || 0;
                        const percent = Math.min(
                            (raised / (compaign.targetAmount || 1)) * 100,
                            100
                        );

                        return (
                            <Col xs={12} sm={12} md={12} lg={6} key={compaign._id}>
                                <div
                                    className="card border-0"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    {/* IMAGE + TITLE */}
                                    <div
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                            navigate(`/compaign/${compaign._id}`)
                                        }
                                    >
                                        <img
                                            src={
                                                compaign.images?.[0] ||
                                                "https://via.placeholder.com/300"
                                            }
                                            alt={compaign.title}
                                            style={{
                                                width: "100%",
                                                height: "200px",
                                                objectFit: "cover",
                                                borderRadius: "12px",
                                            }}
                                        />

                                        <div className="my-2 text-start">
                                            <Title
                                                level={4}
                                                style={{
                                                    height: "50px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {compaign.title}
                                            </Title>
                                        </div>
                                    </div>

                                    {/* AMOUNT INFO */}
                                    <div className="d-flex justify-content-between align-items-center text-center w-100">
                                        <span>
                                            <Title
                                                level={5}
                                                className="text-primary m-0"
                                            >
                                                Raised
                                            </Title>
                                            <Title
                                                level={5}
                                                className="text-primary mb-2 mt-0"
                                            >
                                                {raised.toLocaleString()} MATIC
                                            </Title>
                                        </span>

                                        <span>
                                            <Title level={5} className="m-0">
                                                Target
                                            </Title>
                                            <Title
                                                level={5}
                                                className="mb-2 mt-0"
                                            >
                                                {(compaign.targetAmount || 0).toLocaleString()} MATIC
                                            </Title>
                                        </span>
                                    </div>

                                    {/* PROGRESS BAR */}
                                    <Progress
                                        percent={percent}
                                        strokeColor={{
                                            "0%": "#108ee9",
                                            "100%": "#87d068",
                                        }}
                                        status="active"
                                        showInfo={false}
                                    />

                                    {/* DONATE BUTTON */}
                                    <div className="mt-2">
                                        <Button
                                            type="primary"
                                            shape="round"
                                            size="large"
                                            block
                                            onClick={() =>
                                                handleDonate(compaign)
                                            }
                                        >
                                            Donate
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        );
                    })
                )}
            </Row>

            {/* VIEW ALL */}
            <Row className="mt-5 mb-5 justify-content-center text-center">
                <Col span={24}>
                    <Button
                        type="primary"
                        shape="round"
                        size="large"
                        onClick={() => navigate("/compaigns")}
                    >
                        View All
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default Compaigns;