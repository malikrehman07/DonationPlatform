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
} from "antd";

import axios from "axios";
import { ethers } from "ethers";
import Compaigns from "../Home/Compaigns";

const { Title, Paragraph } = Typography;

import { getContract, getReadOnlyContract, CONTRACT_ADDRESS } from "../../../blockchain/config";
import ABI from "../../../blockchain/GiveHope.json";

const CompaignPage = () => {
  const { id } = useParams();

  const [compaign, setCompaign] = useState(null);

  const [loading, setLoading] = useState(true);

  const [donationAmount, setDonationAmount] = useState("");

  const navigate = useNavigate();

  // =========================
  // FETCH CAMPAIGN
  // =========================
  useEffect(() => {
    const fetchCompaign = async () => {
      setLoading(true);

      try {
        // =========================
        // FETCH MONGODB DATA
        // =========================
        const response = await axios.get(
          `http://localhost:5000/compaigns/read/${id}`
        );

        const mongoCampaign = response.data.compaign;

        // =========================
        // FETCH BLOCKCHAIN DATA
        // =========================
        const contract = getReadOnlyContract();
        
        const blockchainData = await contract.getCampaign(
          mongoCampaign.blockchainCampaignId
        );

        // =========================
        // MERGE DATA
        // =========================
        const finalCampaign = {
          ...mongoCampaign,

          id: Number(blockchainData[0]),

          ngo: blockchainData[1],

          title: blockchainData[2],

          description: blockchainData[3],

          targetAmount: ethers.formatEther(blockchainData[4]),

          raisedAmount: ethers.formatEther(blockchainData[5]),

          status:
            Number(blockchainData[6]) === 0
              ? "Active"
              : "Completed",
        };

        setCompaign(finalCampaign);
      } catch (error) {
        console.error(error);

        message.error("Failed to fetch campaign");
      } finally {
        setLoading(false);
      }
    };

    fetchCompaign();
  }, [id]);

  // =========================
  // DONATE FUNCTION
  // =========================
  // =========================
  // DONATE FUNCTION (Redirect to Checkout)
  // =========================
  const handleDonate = () => {
    navigate("/checkout", {
      state: { compaign }
    });
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      />
    );
  }

  // =========================
  // NOT FOUND
  // =========================
  if (!compaign) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Title level={3}>
          Campaign not found
        </Title>
      </div>
    );
  }

  const raised = Number(compaign.raisedAmount);

  const target = Number(compaign.targetAmount);

  const progress =
    target > 0
      ? Math.min((raised / target) * 100, 100)
      : 0;

  return (
    <>
      {/* =========================
          BREADCRUMB
      ========================= */}
      <div className="container mt-3">
        <Row>
          <Col span={24}>
            <Breadcrumb
              items={[
                {
                  title: <Link to="/">Home</Link>,
                },
                {
                  title: compaign.title,
                },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* =========================
          MAIN SECTION
      ========================= */}
      <div className="container py-5">
        <Row gutter={[16, 16]} align="middle">
          {/* IMAGES */}
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            style={{ textAlign: "center" }}
          >
            <Carousel autoplay dots={false}>
              {compaign.images?.map(
                (imgUrl, i) => (
                  <div key={i}>
                    <img
                      src={imgUrl}
                      alt={`Campaign ${i + 1}`}
                      style={{
                        maxHeight: "500px",
                      }}
                      className="img-fluid"
                    />
                  </div>
                )
              )}
            </Carousel>
          </Col>

          {/* DETAILS */}
          <Col xs={24} sm={24} md={24} lg={12}>
            <Title level={2}>
              {compaign.title}
            </Title>

            <Title level={4}>
              Campaign Details
            </Title>

            <Paragraph>
              {compaign.description}
            </Paragraph>

            {/* RAISED / TARGET */}
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
                  {raised} MATIC
                </Title>
              </span>

              <span>
                <Title
                  level={5}
                  className="m-0"
                >
                  Target
                </Title>

                <Title
                  level={5}
                  className="mb-2 mt-0"
                >
                  {target} MATIC
                </Title>
              </span>
            </div>

            {/* PROGRESS */}
            <Progress
              percent={progress}
              showInfo={false}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />

            {/* STATUS */}
            <div className="mt-3">
              <strong>Status:</strong>{" "}
              {compaign.status}
            </div>

            {/* DONATION INPUT */}
            <div className="mt-4">
              <Input
                size="large"
                placeholder="Enter amount in MATIC"
                value={donationAmount}
                onChange={(e) =>
                  setDonationAmount(
                    e.target.value
                  )
                }
              />
            </div>

            {/* DONATE BUTTON */}
            <Row className="mt-3">
              <Col span={24}>
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  block
                  disabled={
                    compaign.status ===
                    "Completed"
                  }
                  onClick={handleDonate}
                >
                  {compaign.status ===
                    "Completed"
                    ? "Campaign Completed"
                    : "Donate Now"}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* DETAILS SECTION */}
      <div className="container">
        <Row>
          <Col
            span={12}
            className="text-center"
          >
            <Title level={5}>
              <a
                href="#donation-details"
                style={{ color: "#222" }}
              >
                Campaign Details
              </a>
            </Title>

            <Divider
              style={{ borderColor: "#222" }}
            />
          </Col>

          <Col
            span={12}
            className="text-center"
          >
            <Title level={5}>
              <a
                href="#donations"
                style={{ color: "#222" }}
              >
                Donations
              </a>
            </Title>

            <Divider
              style={{ borderColor: "#222" }}
            />
          </Col>
        </Row>

        {/* DESCRIPTION */}
        <Row
          gutter={[8, 8]}
          className="py-5"
          id="donation-details"
        >
          <Col span={24}>
            <Title level={2}>
              Campaign Details
            </Title>

            <Paragraph>
              {compaign.description}
            </Paragraph>
          </Col>
        </Row>

        <Divider style={{ borderColor: "#222" }} />
      </div>

      {/* OTHER CAMPAIGNS */}
      <div className="container py-2 mb-5">
        <Row gutter={[16, 16]}>
          <Col
            span={24}
            className="text-center"
          >
            <Title level={1}>
              Other Campaigns
            </Title>

            <Compaigns />
          </Col>
        </Row>

        <Divider style={{ borderColor: "#222" }} />
      </div>
    </>
  );
};

export default CompaignPage;