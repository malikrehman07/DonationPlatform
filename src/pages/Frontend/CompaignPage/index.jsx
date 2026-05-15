import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Spin,
  Row,
  Col,
  Button,
  Card,
  Divider,
  Breadcrumb,
  Progress,
  Carousel,
  Input,
  message,
  Tag,
} from "antd";

import axios from "axios";
import { ethers } from "ethers";
import Compaigns from "../Home/Compaigns";
import { getReadOnlyContract } from "../../../blockchain/config";

const { Title, Paragraph, Text } = Typography;

const CompaignPage = () => {
  const { id } = useParams();

  const [compaign, setCompaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [donations, setDonations] = useState([]);

  const navigate = useNavigate();

  // =========================
  // FETCH CAMPAIGN & DONATIONS
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://apigivehopes.vercel.app/compaigns/read/${id}`);
        const mongoCampaign = res.data.compaign;

        const contract = getReadOnlyContract();
        const blockchainData = await contract.getCampaign(mongoCampaign.blockchainCampaignId);

        const raisedOnChain = ethers.formatEther(blockchainData[5]);
        const targetOnChain = ethers.formatEther(blockchainData[4]);
        const titleOnChain = blockchainData[2];
        const descriptionOnChain = blockchainData[3];

        setCompaign({
          ...mongoCampaign, // Keep images and creator info
          title: titleOnChain || mongoCampaign.title,
          description: descriptionOnChain || mongoCampaign.description,
          blockchainId: Number(blockchainData[0]),
          raisedAmount: parseFloat(raisedOnChain).toFixed(2),
          targetAmount: parseFloat(targetOnChain).toFixed(2),
          status: Number(raisedOnChain) >= Number(targetOnChain) ? "completed" : mongoCampaign.status,
        });

        // Fetch Donations directly from Blockchain Events
        const filter = contract.filters.DonationReceived();
        const allEvents = await contract.queryFilter(filter, -10000); 
        const events = allEvents.filter(evt => Number(evt.args.campaignId) === Number(mongoCampaign.blockchainCampaignId));

        const mongoDonorRes = await axios.get(`https://apigivehopes.vercel.app/donations/campaign/${mongoCampaign._id}`);
        const mongoDonations = mongoDonorRes.data.donations || [];

        const syncedDonors = events.map(evt => {
            const txHash = evt.transactionHash.toLowerCase();
            const match = mongoDonations.find(d => d.transactionHash?.toLowerCase() === txHash);
            return {
                donorName: match ? (match.isAnonymous ? "Anonymous" : match.donorName) : "Wallet Donor",
                amount: parseFloat(ethers.formatEther(evt.args.amount)).toFixed(2),
                createdAt: new Date().toISOString(), // Mocking date or fetch from block
                wallet: evt.args.donor,
                txHash: txHash
            };
        });

        setDonations(syncedDonors.reverse());
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch campaign data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // =========================
  // DONATE FUNCTION (Redirect to Checkout)
  // =========================
  const handleDonate = () => {
    navigate("/checkout", {
      state: { compaign }
    });
  };

  if (loading) return <Spin size="large" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }} />;
  if (!compaign) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Title level={3}>Campaign not found</Title></div>;

  const raised = Number(compaign.raisedAmount);
  const target = Number(compaign.targetAmount);
  const progress = target > 0 ? Math.min((raised / target) * 100, 100).toLocaleString() : 0;

  return (
    <>
      <div className="container mt-3">
        <Breadcrumb items={[{ title: <Link to="/">Home</Link> }, { title: compaign.title }]} />
      </div>

      <div className="container py-5">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <Carousel autoplay dots={false}>
              {compaign.images?.map((imgUrl, i) => (
                <div key={i}>
                  <img src={imgUrl} alt={`Campaign ${i + 1}`} style={{ height: "450px", width: "100%", objectFit: "cover", borderRadius: "15px" }} />
                </div>
              ))}
            </Carousel>
          </Col>

          <Col xs={24} lg={12}>
            <Title level={2} className="mb-0">{compaign.title}</Title>
            <Tag color="blue" className="mb-3">{compaign.category?.toUpperCase()}</Tag>
            
            <div className="p-4 bg-light rounded-4 mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Raised</Text>
                  <Title level={3} className="m-0 text-primary">{raised.toLocaleString()} MATIC</Title>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Goal</Text>
                  <Title level={3} className="m-0">{target.toLocaleString()} MATIC</Title>
                </Col>
              </Row>
              <Progress percent={progress} strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }} status="active" className="mt-3" />
            </div>

            <Card bordered={false} className="shadow-sm rounded-4 mb-4">
              <Title level={4}>NGO Profile</Title>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-3" style={{width: 50, height: 50, fontSize: 20}}>
                  {compaign.createdBy?.organizationName?.charAt(0)}
                </div>
                <div>
                  <Title level={5} className="m-0">{compaign.createdBy?.organizationName}</Title>
                  <Text type="secondary">{compaign.createdBy?.address}</Text>
                </div>
              </div>
              <Paragraph className="mt-3 text-muted">
                {compaign.createdBy?.description || "This NGO is dedicated to making a positive impact in the community through transparent and effective campaigns."}
              </Paragraph>
            </Card>

            <Button type="primary" size="large" block shape="round" style={{ height: 50, fontSize: 18 }} onClick={handleDonate} disabled={compaign.status === "completed"}>
              {compaign.status === "completed" ? "Campaign Completed" : "Donate Now"}
            </Button>
          </Col>
        </Row>
      </div>

      <div className="container pb-5">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Title level={3}>About the Campaign</Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>{compaign.description}</Paragraph>
            
            <Divider />
            
            <Title level={3}>Impact Summary</Title>
            <Paragraph>
              By donating to this campaign, you are helping directly with {compaign.category}. 
              Your contribution is recorded on the Polygon blockchain for 100% transparency.
            </Paragraph>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Recent Donors" bordered={false} className="shadow-sm rounded-4">
              {donations.length === 0 ? (
                <Text type="secondary">Be the first one to donate!</Text>
              ) : (
                donations.map((d, i) => (
                  <div key={i} className="mb-3 d-flex justify-content-between align-items-center">
                    <div style={{ maxWidth: "70%" }}>
                      <Text strong>{d.donorName}</Text>
                      {d.donorName === "Wallet Donor" && (
                        <div style={{ fontSize: 10, color: "#8c8c8c", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {d.wallet}
                        </div>
                      )}
                      <br />
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${d.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: 11 }}
                      >
                        Verify on Blockchain
                      </a>
                    </div>
                    <Text strong className="text-success">+{d.amount} MATIC</Text>
                  </div>
                ))
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <div className="container py-5 text-center">
        <Divider />
        <Title level={2}>More Active Campaigns</Title>
        <Compaigns />
      </div>
    </>
  );
};

export default CompaignPage;
