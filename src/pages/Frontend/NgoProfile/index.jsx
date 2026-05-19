import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Typography,
  Spin,
  Row,
  Col,
  Card,
  Button,
  Tag,
  Empty,
  Divider,
  Progress,
  Breadcrumb,
} from "antd";
import {
  SafetyCertificateOutlined,
  GlobalOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { ethers } from "ethers";
import { getReadOnlyContract } from "../../../blockchain/config";

const { Title, Text, Paragraph } = Typography;

const NgoProfile = () => {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch NGO Profile
        const ngoRes = await axios.get(
          `https://apigivehopes.vercel.app/ngo/public/${id}`
        );
        setNgo(ngoRes.data.ngo);

        // 2. Fetch NGO's Campaigns
        const campRes = await axios.get(
          `https://apigivehopes.vercel.app/compaigns/ngo-public/${id}`
        );
        const mongoCampaigns = campRes.data.compaigns || [];

        // 3. Sync with Blockchain
        const contract = getReadOnlyContract();
        const synced = await Promise.all(
          mongoCampaigns.map(async (c) => {
            try {
              if (c.blockchainCampaignId !== undefined) {
                const data = await contract.getCampaign(
                  c.blockchainCampaignId
                );
                const raised = ethers.formatEther(data[5]);
                const target = ethers.formatEther(data[4]);
                return {
                  ...c,
                  raisedAmount: parseFloat(raised).toFixed(2),
                  targetAmount: parseFloat(target).toFixed(2),
                  status:
                    Number(raised) >= Number(target) ? "completed" : c.status,
                };
              }
              return c;
            } catch {
              return c;
            }
          })
        );

        setCampaigns(synced);
      } catch (err) {
        console.error("Failed to fetch NGO profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  if (!ngo)
    return (
      <div className="container py-5 text-center">
        <Title level={3}>NGO not found</Title>
      </div>
    );

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: <Link to="/ngos">NGOs</Link> },
          { title: ngo.organizationName },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* NGO PROFILE CARD */}
      <Card className="shadow-sm rounded-4 mb-5">
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={6} className="text-center">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "#07887f",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: "bold",
                margin: "0 auto",
              }}
            >
              {ngo.organizationName?.charAt(0).toUpperCase()}
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Title level={3} className="mb-1">
              {ngo.organizationName}
              <Tag
                color="green"
                style={{ marginLeft: 12, verticalAlign: "middle" }}
              >
                <SafetyCertificateOutlined /> Verified
              </Tag>
            </Title>

            <Paragraph style={{ fontSize: 15, marginTop: 8 }}>
              {ngo.description ||
                "This NGO is dedicated to making a positive impact."}
            </Paragraph>

            <Row gutter={[24, 8]}>
              {ngo.phone && (
                <Col>
                  <Text type="secondary">
                    <PhoneOutlined /> {ngo.phone}
                  </Text>
                </Col>
              )}
              {ngo.address && (
                <Col>
                  <Text type="secondary">
                    <EnvironmentOutlined /> {ngo.address}
                  </Text>
                </Col>
              )}
              {ngo.website && (
                <Col>
                  <a
                    href={
                      ngo.website.startsWith("http")
                        ? ngo.website
                        : `https://${ngo.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GlobalOutlined /> {ngo.website}
                  </a>
                </Col>
              )}
              {ngo.registrationNumber && (
                <Col>
                  <Text type="secondary">
                    Reg #: {ngo.registrationNumber}
                  </Text>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Card>

      {/* CAMPAIGNS */}
      <Divider />
      <Title level={3} className="mb-4">
        Active Campaigns by {ngo.organizationName}
      </Title>

      {campaigns.length === 0 ? (
        <Empty description="No campaigns yet" />
      ) : (
        <Row gutter={[24, 24]}>
          {campaigns.map((c) => {
            const raised = Number(c.raisedAmount || 0);
            const target = Number(c.targetAmount || 0);
            const percent =
              target > 0 ? Math.min((raised / target) * 100, 100) : 0;

            return (
              <Col xs={24} sm={12} md={8} key={c._id}>
                <Card
                  hoverable
                  className="shadow-sm rounded-4"
                  cover={
                    <img
                      alt={c.title}
                      src={c.images?.[0] || c.coverImage}
                      style={{
                        height: 200,
                        objectFit: "cover",
                        borderRadius: "16px 16px 0 0",
                      }}
                    />
                  }
                >
                  <Tag color="blue" className="mb-2">
                    {c.category?.toUpperCase()}
                  </Tag>
                  <Title level={5}>{c.title}</Title>

                  <Row justify="space-between">
                    <Text strong style={{ color: "#07887f" }}>
                      {raised.toFixed(2)} MATIC
                    </Text>
                    <Text type="secondary">
                      / {target.toFixed(2)} MATIC
                    </Text>
                  </Row>

                  <Progress
                    percent={Number(percent.toFixed(0))}
                    strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                    status="active"
                    className="mt-2 mb-3"
                  />

                  <Link to={`/compaign/${c._id}`}>
                    <Button type="primary" shape="round" block>
                      View Campaign
                    </Button>
                  </Link>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default NgoProfile;
