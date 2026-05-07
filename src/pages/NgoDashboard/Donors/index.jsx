import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography, Table, Tag } from 'antd';
import { useAuthContext } from '../../../context/Auth';
import axios from 'axios';

const { Title } = Typography;

const Donors = () => {

  const { user } = useAuthContext();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DONORS
  // =========================
  useEffect(() => {

    const fetchDonations = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/dashboard/donations",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setDonations(res.data.donations || []);

      } catch (err) {
        console.error("Error fetching donors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

  }, []);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [

    {
      title: "Donor Name",
      key: "fullName",
      render: (_, record) => (
        record.isAnonymous
          ? <Tag color="default">Anonymous</Tag>
          : record.fullName || "Anonymous"
      )
    },

    {
      title: "Email",
      key: "email",
      render: (_, record) => (
        record.isAnonymous
          ? "Hidden"
          : record.email || "-"
      )
    },

    {
      title: "Phone",
      key: "phoneNo",
      render: (_, record) => (
        record.isAnonymous
          ? "Hidden"
          : record.phoneNo || "-"
      )
    },

    {
      title: "City",
      key: "city",
      render: (_, record) => (
        record.isAnonymous
          ? "Hidden"
          : record.city || "-"
      )
    },

    {
      title: "Campaign",
      key: "campaign",
      render: (_, record) => (
        record.compaign?.title || "Unknown Campaign"
      )
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <b>${Number(amount || 0).toLocaleString()}</b>
      )
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Completed"
            ? "green"
            : status === "Pending"
              ? "orange"
              : "red";

        return <Tag color={color}>{status}</Tag>;
      }
    }

  ];

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      <Row>
        <Col span={24}>
          <Title level={2} className="text-center">
            NGO Donors List
          </Title>
        </Col>

        <Col span={24}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={donations}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>

    </div>
  );
};

export default Donors;