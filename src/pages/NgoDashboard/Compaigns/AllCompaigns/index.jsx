import React, { useCallback, useEffect, useState } from 'react';
import { Button, Space, Row, Col, Typography, Spin, Table, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../../../context/Auth';

const { Title } = Typography;

const AllCompaigns = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [compaigns, setCompaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compaignTotals, setCompaignTotals] = useState({});

  // =========================
  // FETCH NGO CAMPAIGNS
  // =========================
  const getCompaigns = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const [compRes, donRes] = await Promise.all([
        axios.get(
          `http://localhost:3000/compaigns/my/${user.uid}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        ),

        axios.get(
          `http://localhost:3000/dashboard/donations`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      ]);

      setCompaigns(compRes.data.compaigns || []);

      // =========================
      // CALCULATE RAISED AMOUNT
      // =========================
      const totals = {};

      (donRes.data.donations || []).forEach((donation) => {
        const compId = donation.compaign?.compaignId;

        if (!compId) return;

        const amount = Number(donation.amount || 0);

        totals[compId] = (totals[compId] || 0) + amount;
      });

      setCompaignTotals(totals);

    } catch (err) {
      console.error("Error fetching campaigns:", err);
      window.notify?.("Failed to load campaigns", "error");
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
      dataIndex: "imageUrls",
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
      dataIndex: "_id",
      render: (id) =>
        `$${(compaignTotals[id] || 0).toLocaleString()}`
    },

    {
      title: "Target",
      dataIndex: "amount",
      render: (amount) =>
        `$${Number(amount || 0).toLocaleString()}`
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        if (!status) return "Active";

        const color =
          status === "approved"
            ? "green"
            : status === "pending"
              ? "orange"
              : "red";

        return (
          <span style={{ color, fontWeight: 500 }}>
            {status.toUpperCase()}
          </span>
        );
      }
    },

    {
      title: "Actions",
      render: (_, record) => (
        <Space>

          <Button
            type="primary"
            size="small"
            onClick={() =>
              navigate(`/dashboard/compaign/edit/${record._id}`)
            }
          >
            View / Edit
          </Button>

        </Space>
      )
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