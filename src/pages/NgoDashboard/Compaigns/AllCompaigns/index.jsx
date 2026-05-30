import React, { useCallback, useEffect, useState } from 'react';
import { Button, Space, Row, Col, Typography, Spin, Table, Image } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../../../context/Auth';

import { getReadOnlyContract } from '../../../../blockchain/config';
import { ethers } from 'ethers';
import { Tag } from 'antd';

const { Title } = Typography;

const AllCompaigns = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [compaigns, setCompaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get("highlight");

  // =========================
  // FETCH NGO CAMPAIGNS (SYNCHRONIZED WITH BLOCKCHAIN)
  // =========================
  const getCompaigns = useCallback(async () => {
    const userId = user?.uid || user?._id;
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 1. Fetch from MongoDB
      const compRes = await axios.get(
        `https://apigivehopes.vercel.app/compaigns/my/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const mongoCampaigns = compRes.data.compaigns || [];
      
      // 2. Sync with Blockchain
      const contract = getReadOnlyContract();
      
      const syncedCampaigns = await Promise.all(
        mongoCampaigns.map(async (c) => {
          try {
            if (c.blockchainCampaignId !== undefined) {
              const blockchainData = await contract.getCampaign(c.blockchainCampaignId);
              // blockchainData[5] is raisedAmount, [4] is targetAmount
              const raisedOnChain = ethers.formatEther(blockchainData[5]);
              const targetOnChain = ethers.formatEther(blockchainData[4]);
              
              return {
                ...c,
                title: blockchainData[2] || c.title,
                raisedAmount: parseFloat(raisedOnChain).toFixed(2),
                targetAmount: parseFloat(targetOnChain).toFixed(2),
                status: Number(raisedOnChain) >= Number(targetOnChain) ? "completed" : c.status
              };
            }
            return c;
          } catch (err) {
            console.error(`Error syncing campaign ${c._id}:`, err);
            return c;
          }
        })
      );

      setCompaigns(syncedCampaigns);

    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getCompaigns();
  }, [getCompaigns]);

  // =========================
  // TABLE COLUMNS (NO DELETE)
  // =========================
  const columns = [
    {
      title: "#",
      render: (_, __, i) => i + 1,
    },

    {
      title: "Image",
      dataIndex: "images",
      render: (images) =>
        images?.length ? (
          <Image
            src={images[0]}
            width={45}
            height={45}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : "N/A"
    },

    {
      title: "Title",
      dataIndex: "title",
    },

    {
      title: "Category",
      dataIndex: "category",
    },

    {
      title: "Raised",
      dataIndex: "raisedAmount",
      render: (amount) =>
        `${Number(amount || 0).toLocaleString()} MATIC`
    },

    {
      title: "Target",
      dataIndex: "targetAmount",
      render: (amount) =>
        `${Number(amount || 0).toLocaleString()} MATIC`
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color = "blue";
        let text = status || "active";

        if (text === "completed") color = "success";
        if (text === "active") color = "processing";
        if (text === "approved") color = "success";
        if (text === "pending") color = "warning";
        if (text === "rejected") color = "error";

        return (
          <Tag color={color} style={{ borderRadius: 10, padding: "0 10px", fontWeight: 600 }}>
            {text.toUpperCase()}
          </Tag>
        );
      }
    }
  ];

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div style={{
        display: "flex",
        height: "70vh",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <Row>
        <Col span={24}>
          <Title level={2} style={{ textAlign: "center" }}>
            My Campaigns
          </Title>
        </Col>

        <Col span={24}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={compaigns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
            rowClassName={(record) => record._id === highlightId ? 'highlight-row' : ''}
          />
        </Col>

        <Col span={24} style={{ textAlign: "center", marginTop: 20 }}>
          <Button
            type="primary"
            size="large"
            onClick={() =>
              navigate("/dashboard/compaign/add")
            }
          >
            Create New Campaign
          </Button>
        </Col>

      </Row>

    </div>
  );
};

export default AllCompaigns;
