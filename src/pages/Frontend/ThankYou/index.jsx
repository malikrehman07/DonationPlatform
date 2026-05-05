import React from "react";
import { Typography, Card, Divider, Tag } from "antd";
import { useLocation } from "react-router-dom";

const { Title, Paragraph } = Typography;

const ThankYou = () => {
    const location = useLocation();
    const { donationData } = location.state || {};

    const txHash = donationData?.txHash;
    const explorerUrl = donationData?.explorerUrl;

    return (
        <main>
            <div className="container py-5 text-center">

                <Title level={2}>Thank You for Your Donation 🙏</Title>

                <Paragraph>
                    Your donation has been successfully processed.
                </Paragraph>

                <Card
                    title="Donation Summary"
                    bordered={false}
                    style={{ maxWidth: 600, margin: "0 auto", textAlign: "left" }}
                >

                    <p>
                        <strong>Amount:</strong>{" "}
                        ${donationData?.amount || "0.00"}
                    </p>

                    <p>
                        <strong>Status:</strong>{" "}
                        <Tag color="green">
                            {donationData?.status || "Completed"}
                        </Tag>
                    </p>

                    <Divider />

                    <Title level={5}>Campaign</Title>
                    <p>{donationData?.compaign?.title || "N/A"}</p>

                    <Divider />

                    {/* ========================= */}
                    {/* BLOCKCHAIN TRANSACTION */}
                    {/* ========================= */}
                    {txHash && (
                        <>
                            <Title level={5}>Blockchain Transaction</Title>

                            <p style={{ wordBreak: "break-all" }}>
                                <strong>Tx Hash:</strong> {txHash}
                            </p>

                            <p>
                                <strong>Verify:</strong>{" "}
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View on PolygonScan
                                </a>
                            </p>
                        </>
                    )}

                    {/* ========================= */}
                    {/* PAYMENT METHOD INFO */}
                    {/* ========================= */}
                    <Divider />

                    <p>
                        <strong>Payment Method:</strong>{" "}
                        {donationData?.paymentMethod === "crypto"
                            ? "MetaMask (Blockchain)"
                            : "Card → Crypto Gateway"}
                    </p>

                </Card>
            </div>
        </main>
    );
};

export default ThankYou;