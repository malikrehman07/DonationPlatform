import React, { useState } from 'react';
import { Typography, Input, Button, Divider, message, Row, Col, Form, Radio, Image } from 'antd';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/Auth';
import axios from 'axios';

const { Title } = Typography;
const { VITE_STRIPE_PUBLISHABLE_KEY } = import.meta.env;
const stripePromise = loadStripe(VITE_STRIPE_PUBLISHABLE_KEY);

const initialState = { fullName: "", email: "", address: "", city: "", postalCode: "", phoneNo: "" };

const CheckoutForm = () => {
    const { user } = useAuthContext();
    const [state, setState] = useState(initialState);
    //   const [compaign,setCompaign] = useState([])
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [donationAmount, setDonationAmount] = useState("");
    const [customAmount, setCustomAmount] = useState("");
    const location = useLocation()
    const compaign = location.state?.compaign; // 👈 get compaign from state

    if (!compaign) {
        return <Title level={3}>No donation selected</Title>;
    }

    const handleChange = (e) => setState(s => ({ ...s, [e.target.name]: e.target.value }));

    // const createPaymentIntent = async (amount) => {
    //     try {
    //         const response = await axios.post("https://backend-theta-silk-38.vercel.app/create-payment-intent", {
    //             amount: Math.round(amount * 100) // cents for Stripe
    //         });
    //         return response.data.clientSecret;
    //     } catch (error) {
    //         console.error("Failed to create payment intent", error);
    //         return null;
    //     }
    // };

    // // ✅ Final donation value
    // const total = parseFloat(donationAmount) || 0;

    // const handlePayment = async () => {
    //     let { fullName, email, address, city, postalCode, phoneNo } = state;

    //     if (!user) {
    //         return message.warning('Please login to proceed with donation');
    //     }
    //     if (!email) {
    //         return message.warning('Please enter your email to proceed');
    //     }
    //     if (!address) {
    //         return message.warning('Please enter your address to proceed');
    //     }
    //     if (!city) {
    //         return message.warning('Please enter your city to proceed');
    //     }
    //     if (!postalCode) {
    //         return message.warning('Please enter your Postal Code to proceed');
    //     }
    //     if (!phoneNo) {
    //         return message.warning('Please enter your Phone No to proceed');
    //     }
    //     if (!total || total <= 0) {
    //         return message.error("Please select or enter a valid donation amount.");
    //     }

    //     const clientSecret = await createPaymentIntent(total);
    //     if (!clientSecret) {
    //         message.error("Failed to initiate payment.");
    //         setIsProcessing(false);
    //         return;
    //     }

    //     setIsProcessing(true);
    //     const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    //         payment_method: {
    //             card: elements.getElement(CardElement),
    //             billing_details: {
    //                 name: fullName,
    //                 email: email,
    //             },
    //         }
    //     });

    //     if (error) {
    //         message.error(error.message);
    //         setIsProcessing(false);
    //         return;
    //     }

    //     // Donation object to send backend
    //     const donationData = {
    //         uid: user.uid,
    //         fullName,
    //         email,
    //         phoneNo,
    //         address,
    //         city,
    //         postalCode,
    //         status: "Completed",
    //         amount: total,
    //         paymentIntentId: paymentIntent.id,
    //         compaign: {
    //             compaignId: compaign.compaignId,
    //             title: compaign.title,
    //             image: compaign.image,
    //         }
    //     };
    //     console.log('donationData', donationData)

    //     try {
    //         await axios.post(`https://backend-theta-silk-38.vercel.app/checkout`, donationData);
    //         setState(initialState);
    //     } catch (e) {
    //         console.error("Donation error:", e);
    //     } finally {
    //         setIsProcessing(false);
    //     }

    //     message.success('Donation successful! Thank you for your support.');
    //     navigate('/thank-you', { state: { total, donationData } });
    // };

    return (
        <div style={{ backgroundColor: "#ededed" }}>
            <div className="container py-5">
                <Row gutter={[16, 16]}>
                    {/* Address & Card */}
                    <Col xs={24} lg={16}>
                        <div className="card rounded-4">
                            <Form layout="vertical" className="m-4">
                                <Title level={2} className="text-center">Your Details</Title>
                                <Form.Item label="Full Name" required>
                                    <Input name="fullName" placeholder="Full Name" onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Email" required>
                                    <Input name="email" placeholder="Email" onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Phone Number" required>
                                    <Input name="phoneNo" placeholder="Phone Number" onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Address" required>
                                    <Input name="address" placeholder="Address" onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="City" required>
                                    <Input name="city" placeholder="City" onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Postal Code" required>
                                    <Input name="postalCode" placeholder="Postal Code" onChange={handleChange} />
                                </Form.Item>
                            </Form>

                            <Form layout="vertical" className="m-4">
                                <Title level={4}>Payment Details</Title>
                                <div style={{ border: '1px solid #ccc', padding: 12, borderRadius: 4, marginBottom: 20 }}>
                                    <CardElement />
                                </div>
                            </Form>
                        </div>
                    </Col>

                    {/* Donation Summary */}
                    <Col xs={24} lg={8}>
                        <div className="card rounded-4 p-4">
                            <Title level={3} className="mb-3">Donation Summary</Title>
                            <div style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                                <Row align="middle" justify="space-between">
                                    <Col span={24}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Image src={compaign.image} alt={compaign.title} preview={false} style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: 8 }} />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{compaign.title}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <Divider />

                            {/* Preset Amounts */}
                            <Title level={5}>Choose Amount</Title>
                            <Row >
                                <Col span={24} >
                                    <Radio.Group onChange={(e) => { setDonationAmount(e.target.value); setCustomAmount(""); }} value={donationAmount.toLocaleString()} className="mb-3">
                                        <Radio value="50">$50</Radio>
                                        <Radio value="90">$100</Radio>
                                        <Radio value="200">$200</Radio>
                                        <Radio value="500">$500</Radio>
                                    </Radio.Group>
                                </Col>

                                <Col span={24} >
                                    <Form.Item label="Custom Amount">
                                        <Input type="number" placeholder="Enter donation amount" value={donationAmount.toLocaleString()} onChange={(e) => setDonationAmount(e.target.value)} required
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            {/* Total */}
                            <Row justify="space-between">
                                <Col><Title level={4}>Total</Title></Col>
                                <Col><Title level={4}>${total ? total.toFixed(2).toLocaleString() : "0.00"}</Title></Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <Button type="primary" size="large" block onClick={handlePayment} loading={isProcessing}>Donate Now</Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default Checkout;
