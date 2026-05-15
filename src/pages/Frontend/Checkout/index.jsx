import React, { useState, useEffect } from "react";
import {
    Typography,
    Input,
    Button,
    Divider,
    message,
    Row,
    Col,
    Form,
    Radio,
    Image,
    Switch,
    Space,
    Card,
    Modal,
} from "antd";
import { CreditCardOutlined, UserOutlined, GlobalOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/Auth";
import { getContract } from "../../../blockchain/config";
import { ethers } from "ethers";

const { Title, Text } = Typography;
const initialState = {
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNo: "",
};

// Conversion Rate: 1 MATIC = 0.10 USD (Used for internal UI estimates)
const MATIC_PRICE_USD = 0.10;

const CheckoutForm = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();

    const compaign = location.state?.compaign;

    const [state, setState] = useState(initialState);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("crypto");
    const [donationAmount, setDonationAmount] = useState(""); 
    const [isProcessing, setIsProcessing] = useState(false);

    if (!compaign) return (
        <div className="container py-5 text-center">
            <Title level={2}>No campaign selected</Title>
            <Button type="primary" onClick={() => navigate("/compaigns")}>Go Back</Button>
        </div>
    );

    const handleChange = (e) =>
        setState((s) => ({ ...s, [e.target.name]: e.target.value }));

    const getMaticAmount = () => {
        if (paymentMethod === "crypto") return Number(donationAmount || 0);
        return Number(donationAmount || 0) / MATIC_PRICE_USD;
    };

    // =========================
    // CRYPTO PAYMENT (MetaMask)
    // =========================
    const handleBlockchainPayment = async () => {
        try {
            const contract = await getContract();
            const maticAmount = getMaticAmount();
            const amountInWei = ethers.parseEther(maticAmount.toString());

            const tx = await contract.donate(compaign.blockchainCampaignId, {
                value: amountInWei,
                maxPriorityFeePerGas: ethers.parseUnits("40", "gwei"),
                maxFeePerGas: ethers.parseUnits("60", "gwei")
            });

            message.loading({ content: "Waiting for blockchain confirmation...", key: "payment" });
            const receipt = await tx.wait();

            return {
                txHash: receipt.hash,
                status: "Completed"
            };
        } catch (err) {
            throw new Error(err.reason || "Blockchain transaction failed");
        }
    };

    // =========================
    // TRANSAK PAYMENT (Real Fiat-to-Crypto Gateway)
    // =========================
    // =========================
    // SECURE GATEWAY (Stripe-style Test Integration)
    // =========================
    const [isCardModalVisible, setIsCardModalVisible] = useState(false);
    
    const handleCardPayment = () => {
        return new Promise((resolve) => {
            setIsCardModalVisible(true);
            window.resolvePayment = (cardData) => {
                setIsCardModalVisible(false);
                resolve(cardData);
            };
        });
    };

    // =========================
    // MAIN HANDLER
    // =========================
    const handlePaymentSubmit = async () => {
        if (!donationAmount || Number(donationAmount) <= 0) {
            return message.error("Please enter a valid amount");
        }

        if (!state.email) return message.warning("Please enter your email");
        
        if (!isAnonymous && (!state.fullName || !state.phoneNo)) {
            return message.warning("Please fill in your contact details");
        }

        try {
            setIsProcessing(true);
            const maticAmount = getMaticAmount();
            let paymentResult = null;

            if (paymentMethod === "crypto") {
                paymentResult = await handleBlockchainPayment();
                
                // SAVE TO BACKEND (CRYPTO PATH)
                const donationData = {
                    campaignId: compaign._id,
                    ngoId: compaign.createdBy,
                    donorName: isAnonymous ? "Anonymous" : state.fullName,
                    donorEmail: state.email,
                    phoneNo: state.phoneNo,
                    address: state.address,
                    city: state.city,
                    postalCode: state.postalCode,
                    amount: maticAmount,
                    isAnonymous: isAnonymous,
                    paymentMethod: paymentMethod,
                    transactionHash: paymentResult.txHash,
                    status: paymentResult.status
                };

                await axios.post("https://apigivehopes.vercel.app/donations/create", donationData);
            } else {
                // CARD PATH - Call the Backend Simulated Fiat-to-Crypto Bridge
                await handleCardPayment(); // Wait for user to fill modal
                
                message.loading({ content: "Processing Secure Payment & Blockchain Bridge...", key: "payment" });

                const cardDonationData = {
                    campaignId: compaign._id,
                    ngoId: compaign.createdBy,
                    donorName: isAnonymous ? "Anonymous" : state.fullName,
                    donorEmail: state.email,
                    phoneNo: state.phoneNo,
                    address: state.address,
                    city: state.city,
                    postalCode: state.postalCode,
                    amount: maticAmount,
                    isAnonymous: isAnonymous
                };

                const res = await axios.post("https://apigivehopes.vercel.app/donations/card-payment", cardDonationData);
                paymentResult = {
                    txHash: res.data.transactionHash,
                    status: "Completed"
                };
            }

            message.success({ content: "Donation Confirmed! Thank you.", key: "payment" });
            
            navigate("/thank-you", {
                state: {
                    donationData: {
                        amount: maticAmount,
                        txHash: paymentResult.txHash,
                        paymentMethod: paymentMethod,
                        compaign: compaign,
                        status: paymentResult.status,
                        explorerUrl: `https://amoy.polygonscan.com/tx/${paymentResult.txHash}`
                    }
                }
            });

        } catch (err) {
            console.error(err);
            if (err.message !== "Cancel") {
                message.error({ content: err.message || "Payment failed", key: "payment" });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
            <div className="container py-5">
                <Row gutter={32}>
                    {/* LEFT - FORM */}
                    <Col xs={24} lg={15}>
                        <Card bordered={false} className="shadow-sm rounded-4 p-3">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <Title level={3} className="m-0">Donation Details</Title>
                                <Space>
                                    <Text strong>Donate Anonymously</Text>
                                    <Switch checked={isAnonymous} onChange={setIsAnonymous} />
                                </Space>
                            </div>

                            <Form layout="vertical">
                                <Row gutter={16}>
                                    {!isAnonymous && (
                                        <Col span={24}>
                                            <Form.Item label="Full Name" required>
                                                <Input name="fullName" size="large" prefix={<UserOutlined />} placeholder="John Doe" onChange={handleChange} />
                                            </Form.Item>
                                        </Col>
                                    )}
                                    <Col span={12}>
                                        <Form.Item label="Email Address" required>
                                            <Input name="email" size="large" placeholder="john@example.com" onChange={handleChange} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Phone Number" required>
                                            <Input name="phoneNo" size="large" placeholder="+1 234 567 890" onChange={handleChange} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {!isAnonymous && (
                                    <>
                                        <Form.Item label="Address">
                                            <Input name="address" size="large" placeholder="Street Address" onChange={handleChange} />
                                        </Form.Item>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="City">
                                                    <Input name="city" size="large" placeholder="City" onChange={handleChange} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label="Postal Code">
                                                    <Input name="postalCode" size="large" placeholder="12345" onChange={handleChange} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Form>

                            <Divider />

                            <Title level={4}>Select Payment Method</Title>
                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-100"
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Radio.Button value="crypto" className="w-100 text-center py-2 h-auto">
                                            <div className="py-2">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" alt="MetaMask" height="30" className="mb-2" />
                                                <br /> MetaMask (MATIC)
                                            </div>
                                        </Radio.Button>
                                    </Col>
                                    <Col span={12}>
                                        <Radio.Button value="card" className="w-100 text-center py-2 h-auto">
                                            <div className="py-2">
                                                <GlobalOutlined style={{ fontSize: 30, color: '#f5222d' }} className="mb-2" />
                                                <br /> Card to Polygon (Alchemy Pay)
                                            </div>
                                        </Radio.Button>
                                    </Col>
                                </Row>
                            </Radio.Group>
                        </Card>
                    </Col>

                    {/* RIGHT - SUMMARY */}
                    <Col xs={24} lg={9}>
                        <Card bordered={false} className="shadow-sm rounded-4 text-center">
                            <Image 
                                src={compaign.images?.[0] || compaign.image} 
                                className="rounded-3 mb-3" 
                                style={{ maxHeight: 200, width: '100%', objectFit: 'cover' }}
                            />
                            <Title level={4}>{compaign.title}</Title>
                            <Text type="secondary">Your contribution makes a difference.</Text>

                            <Divider />

                            <Title level={5} className="text-start">Amount to Donate</Title>
                            <Input
                                size="large"
                                type="number"
                                prefix={<span className="text-muted">{paymentMethod === 'crypto' ? 'MATIC' : 'USD'}</span>}
                                placeholder="0.00"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                className="mb-2"
                            />
                            
                            {paymentMethod === 'card' && donationAmount > 0 && (
                                <div className="text-start mb-4">
                                    <Text type="secondary">
                                        ≈ {(Number(donationAmount) / MATIC_PRICE_USD).toFixed(2)} MATIC
                                    </Text>
                                </div>
                            )}

                            <Button
                                type="primary"
                                size="large"
                                block
                                shape="round"
                                loading={isProcessing}
                                onClick={handlePaymentSubmit}
                                style={{ height: 50, fontSize: 18, marginTop: 10 }}
                            >
                                {isProcessing ? "Confirming..." : "Confirm Donation"}
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </div>
            {/* SECURE GATEWAY MODAL (Stripe-style Test Mode) */}
            <Modal
                title={
                    <span>
                        <CreditCardOutlined /> Secure Card Payment (Test Mode)
                    </span>
                }
                open={isCardModalVisible}
                onCancel={() => setIsCardModalVisible(false)}
                footer={null}
                centered
                width={450}
            >
                <div className="p-2">
                    <div className="mb-4 text-center">
                        <Title level={4} style={{ color: '#1890ff' }}>
                            Total: ${Number(donationAmount).toLocaleString()}
                        </Title>
                        <Text type="secondary">
                            <LockOutlined /> Test Gateway Active
                        </Text>
                    </div>

                    <Form layout="vertical" onFinish={window.resolvePayment}>
                        <Form.Item label="Cardholder Name" required>
                            <Input 
                                name="name" 
                                prefix={<UserOutlined />} 
                                placeholder="Full name on card" 
                                size="large"
                                required
                            />
                        </Form.Item>
                        
                        <Form.Item 
                            label="Card Number" 
                            required 
                            extra="Use 4242 4242 4242 4242 for testing"
                        >
                            <Input 
                                name="number" 
                                prefix={<CreditCardOutlined />} 
                                placeholder="4242 4242 4242 4242" 
                                size="large"
                                maxLength={19}
                                required
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Expiry Date" required>
                                    <Input 
                                        name="expiry" 
                                        placeholder="MM/YY" 
                                        size="large"
                                        maxLength={5}
                                        required
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="CVC" required>
                                    <Input 
                                        name="cvc" 
                                        placeholder="123" 
                                        size="large"
                                        maxLength={3}
                                        required
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large" 
                                block 
                                shape="round"
                                style={{ height: 50, fontSize: 16 }}
                            >
                                Pay Now (Test)
                            </Button>
                        </div>
                        
                        <div className="text-center mt-3">
                            <Image 
                                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                                width={40} 
                                preview={false} 
                                className="mx-2" 
                            />
                            <Image 
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                                width={40} 
                                preview={false} 
                                className="mx-2" 
                            />
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default CheckoutForm;
