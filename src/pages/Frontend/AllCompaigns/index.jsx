import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Progress, Row, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";

const { Title } = Typography;

import { getContract, getReadOnlyContract, CONTRACT_ADDRESS } from "../../../blockchain/config";
import ABI from "../../../blockchain/GiveHope.json";

const AllCompaigns = () => {
  const [compaigns, setCompaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // =========================
  // GET ALL CAMPAIGNS
  // =========================
  const getCompaigns = useCallback(async () => {
    setLoading(true);

    try {
      // =========================
      // FETCH MONGODB DATA
      // =========================
      const response = await axios.get(
        "http://localhost:5000/compaigns/read"
      );

      const mongoCampaigns = response.data.compaigns || [];

      // =========================
      // CONNECT TO BLOCKCHAIN
      // =========================
      const contract = getReadOnlyContract();

      // =========================
      // MERGE BLOCKCHAIN DATA
      // =========================
      const updatedCampaigns = await Promise.all(
        mongoCampaigns.map(async (compaign) => {
          try {
            const blockchainData = await contract.getCampaign(
              compaign.blockchainCampaignId
            );

            return {
              ...compaign,
              blockchainId: Number(blockchainData[0]),
              // We keep the MongoDB raisedAmount as it includes both card & blockchain donations
              raisedAmount: compaign.raisedAmount,
              targetAmount: compaign.targetAmount,
              status: compaign.status
            };
          } catch (error) {
            console.error("Blockchain fetch error:", error);
            return compaign;
          }
        })
      );

      setCompaigns(updatedCampaigns);
    } catch (error) {
      console.error(error);
      window.notify("Failed to fetch campaigns", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCompaigns();
  }, [getCompaigns]);

  // =========================
  // DONATE FUNCTION (Redirect to Checkout)
  // =========================
  const handleDonate = (compaign) => {
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

  return (
    <div className="container py-5">
      <Row
        gutter={[18, 18]}
        justify="center"
        align="middle"
        className="text-center"
      >
        {compaigns.map((compaign) => {
          const raised = Number(compaign.raisedAmount || 0);

          const target = Number(compaign.targetAmount || 0);

          const progress =
            target > 0
              ? Math.min((raised / target) * 100, 100)
              : 0;

          return (
            <Col
              xs={12}
              sm={12}
              md={12}
              lg={6}
              key={compaign.blockchainCampaignId}
            >
              <div
                className="card border-0"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* =========================
                    CAMPAIGN IMAGE
                ========================= */}
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `/compaign/${compaign.blockchainCampaignId}`
                    )
                  }
                >
                  <img
                    src={compaign.images?.[0] || "https://via.placeholder.com/300"}
                    alt={compaign.title}
                    style={{
                      width: "300px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    className="img-fluid rounded-4"
                  />

                  <div className="my-2 text-start">
                    <Title
                      className="mb-0"
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

                {/* =========================
                    RAISED / TARGET
                ========================= */}
                <div className="d-flex justify-content-between align-items-center text-center w-100">
                  <span>
                    <Title level={5} className="text-primary m-0">
                      Raised
                    </Title>

                    <Title level={5} className="text-primary mb-2 mt-0">
                      {raised} MATIC
                    </Title>
                  </span>

                  <span>
                    <Title level={5} className="m-0">
                      Target
                    </Title>

                    <Title level={5} className="mb-2 mt-0">
                      {target} MATIC
                    </Title>
                  </span>
                </div>

                {/* =========================
                    PROGRESS BAR
                ========================= */}
                <Progress
                  percent={progress}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  status="active"
                  showInfo={false}
                />

                {/* =========================
                    STATUS
                ========================= */}
                <div className="text-start mt-2">
                  <strong>Status:</strong> {compaign.status}
                </div>

                <div className="mt-3">
                  <Button
                    type="primary"
                    shape="round"
                    size="large"
                    block
                    disabled={compaign.status === "completed"}
                    onClick={() => handleDonate(compaign)}
                  >
                    {compaign.status === "completed"
                      ? "Campaign Completed"
                      : "Donate"}
                  </Button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default AllCompaigns;