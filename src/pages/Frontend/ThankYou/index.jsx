import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import { useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ThankYou = () => {
    const { state } = useLocation();
    const location = useLocation();
    console.log("Thank You Page State:", location.state);
    const { total, donationData } = location.state || {};

    return (
        <main>
            <div className="container py-5 text-center">
                <Title level={2}>Thank You!</Title>
                <Paragraph>Your donation has been placed successfully.</Paragraph>

                <Card title="Donation Summary" bordered={false}>
                    <p><strong>Total Donated:</strong> ${total ? total.toFixed(2) : "0.00"}</p>
                    <p><strong>Status:</strong> {state?.status || "Completed"}</p>
                    <Title level={5}>Campaign:</Title>
                    <p>{donationData?.compaign?.title || "No campaign found"}</p>
                </Card>

            </div>
        </main>
    );
};

export default ThankYou;
