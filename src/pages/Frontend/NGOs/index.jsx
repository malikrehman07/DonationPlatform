import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Spin, Row, Col, Card, Button, Tag, Empty } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const NGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const res = await axios.get("https://apigivehopes.vercel.app/ngo/public/all");
        setNgos(res.data.ngos || []);
      } catch (err) {
        console.error("Failed to fetch NGOs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNGOs();
  }, []);

  if (loading)
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      />
    );

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <Title level={2}>
          <SafetyCertificateOutlined style={{ color: "#07887f", marginRight: 10 }} />
          Verified NGOs on GiveHope
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          These organizations have been verified by our team and are actively
          running transparent campaigns on the blockchain.
        </Paragraph>
      </div>

      {ngos.length === 0 ? (
        <Empty description="No verified NGOs found yet" />
      ) : (
        <Row gutter={[24, 24]}>
          {ngos.map((ngo) => (
            <Col xs={24} sm={12} md={8} lg={6} key={ngo._id}>
              <Card
                hoverable
                className="shadow-sm rounded-4 text-center"
                style={{ height: "100%" }}
              >
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "#07887f",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: "bold",
                    margin: "0 auto 16px",
                  }}
                >
                  {ngo.organizationName?.charAt(0).toUpperCase()}
                </div>

                <Title level={5} className="mb-1">
                  {ngo.organizationName}
                </Title>

                <Tag color="green" style={{ marginBottom: 12 }}>
                  Verified
                </Tag>

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ minHeight: 44 }}
                >
                  {ngo.description || "Dedicated to making a positive impact."}
                </Paragraph>

                <Text type="secondary" style={{ fontSize: 12 }}>
                  {ngo.address || ""}
                </Text>

                <div style={{ marginTop: 16 }}>
                  <Link to={`/ngo/${ngo._id}`}>
                    <Button type="primary" shape="round" block>
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NGOs;
