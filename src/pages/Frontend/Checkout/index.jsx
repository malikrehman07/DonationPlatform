import React, { useState } from "react";
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
} from "antd";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/Auth";

const { Title } = Typography;
const initialState = {
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNo: "",
};

const CheckoutForm = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();

    const compaign = location.state?.compaign;

    const [state, setState] = useState(initialState);
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [donationAmount, setDonationAmount] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!compaign) return <Title>No campaign selected</Title>;

    const handleChange = (e) =>
        setState((s) => ({ ...s, [e.target.name]: e.target.value }));

    // =========================
    // CONNECT METAMASK
    // =========================
    const connectWallet = async () => {
        try {
            if (!window.ethereum)
                return message.error("MetaMask not installed");

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            setWalletAddress(accounts[0]);
            message.success("Wallet connected");
        } catch (err) {
            console.error(err);
            message.error("Wallet connection failed");
        }
    };

    // =========================
    // METAMASK PAYMENT
    // =========================
    const payWithMetaMask = async () => {
        if (!window.ethereum) {
            message.error("MetaMask not installed");
            return null;
        }

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        const from = accounts[0];

        const amountInWei = (Number(donationAmount) * 1e18).toString();

        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [
                {
                    from,
                    to: compaign.walletAddress, // NGO wallet
                    value: amountInWei,
                },
            ],
        });

        return {
            txHash,
            walletAddress: from,
            explorerUrl: `https://polygonscan.com/tx/${txHash}`,
        };
    };

    // =========================
    // CARD → CRYPTO (NOWPAYMENTS)
    // =========================
    const payWithCardCrypto = async () => {
        const res = await axios.post(
            "http://localhost:3000/create-nowpayments-invoice",
            {
                price_amount: donationAmount,
                price_currency: "usd",
                pay_currency: "eth",
                order_id: compaign.compaignId,
                order_description: compaign.title,
                success_url: window.location.origin + "/thank-you",
            }
        );

        window.location.href = res.data.invoice_url;
    };

    // =========================
    // MAIN HANDLER
    // =========================
    const handlePayment = async () => {
        const { fullName, email, address, city, postalCode, phoneNo } = state;

        if (!user) return message.warning("Login required");
        if (!email || !address || !city || !postalCode || !phoneNo)
            return message.warning("Fill all fields");

        if (!donationAmount || donationAmount <= 0)
            return message.error("Invalid amount");

        setIsProcessing(true);

        try {
            let paymentResult = null;

            // =====================
            // CARD → CRYPTO FLOW
            // =====================
            if (paymentMethod === "card") {
                await payWithCardCrypto();

                paymentResult = {
                    type: "card_crypto",
                };
            }

            // =====================
            // METAMASK FLOW
            // =====================
            if (paymentMethod === "crypto") {
                const tx = await payWithMetaMask();

                if (!tx?.txHash) {
                    throw new Error("Transaction failed");
                }

                paymentResult = {
                    type: "metamask",
                    txHash: tx.txHash,
                    walletAddress: tx.walletAddress,
                    explorerUrl: tx.explorerUrl,
                };
            }

            // =====================
            // SAVE TO BACKEND
            // =====================
            const donationData = {
                uid: user.uid,
                fullName,
                email,
                phoneNo,
                address,
                city,
                postalCode,
                amount: donationAmount,
                status: "Processing",
                paymentMethod,

                ...paymentResult,

                compaign: {
                    compaignId: compaign.compaignId,
                    title: compaign.title,
                    image: compaign.image,
                },
            };

            await axios.post(
                "http://localhost:3000/checkout",
                donationData
            );

            message.success("Donation recorded successfully!");
            navigate("/thank-you");

        } catch (err) {
            console.error(err);
            message.error("Payment failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ background: "#f5f5f5" }}>
            <div className="container py-5">
                <Row gutter={16}>
                    {/* LEFT */}
                    <Col span={16}>
                        <div className="card p-4">
                            <Title level={3}>Your Details</Title>

                            {Object.keys(initialState).map((key) => (
                                <Form.Item key={key}>
                                    <Input
                                        name={key}
                                        placeholder={key}
                                        onChange={handleChange}
                                    />
                                </Form.Item>
                            ))}

                            <Divider />

                            <Title level={4}>Payment Method</Title>

                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <Radio value="card">Card (Auto Crypto)</Radio>
                                <Radio value="crypto">MetaMask</Radio>
                            </Radio.Group>

                            <Divider />

                            {paymentMethod === "crypto" && (
                                <div>
                                    {!walletAddress ? (
                                        <Button onClick={connectWallet}>
                                            Connect Wallet
                                        </Button>
                                    ) : (
                                        <p>Wallet: {walletAddress}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* RIGHT */}
                    <Col span={8}>
                        <div className="card p-4">
                            <Image src={compaign.image} />

                            <Title level={4}>{compaign.title}</Title>

                            <Input
                                type="number"
                                placeholder="Amount (USD)"
                                onChange={(e) =>
                                    setDonationAmount(e.target.value)
                                }
                            />

                            <Divider />

                            <Button
                                type="primary"
                                block
                                loading={isProcessing}
                                onClick={handlePayment}
                            >
                                Donate
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CheckoutForm;