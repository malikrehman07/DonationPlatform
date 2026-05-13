import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Avatar, Spin, Tooltip } from "antd";
import axios from "axios";

const { Title } = Typography;

const Donations = () => {

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/donations/all",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setDonations(res.data.donations || []);

      } catch (err) {
        console.error("Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

  }, []);

  const columns = [

    {
      title: "Transaction Hash",
      dataIndex: "transactionHash",
      render: (hash) => (
        <Tooltip title={hash}>
          <a 
            href={`https://amoy.polygonscan.com/tx/${hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontFamily: "monospace" }}
          >
            {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : "N/A"}
          </a>
        </Tooltip>
      )
    },

    {
      title: "Donor",
      render: (_, record) => (
        <div>
          <strong>{record.isAnonymous ? "Anonymous" : record.donorName}</strong>
          <br />
          <small>{record.donorEmail}</small>
        </div>
      )
    },

    {
      title: "NGO",
      render: (_, record) => (
        <span>{record.ngo?.organizationName || "N/A"}</span>
      )
    },

    {
      title: "Campaign",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>{record.campaign?.title || "Unknown"}</span>
        </div>
      )
    },

    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount, record) => (
        <strong style={{ color: "#1890ff" }}>
          {Number(amount).toLocaleString()} {record.paymentMethod === 'crypto' ? 'MATIC' : 'USD'}
        </strong>
      )
    },

    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString()
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "Completed" ? "green" :
          status === "Pending" ? "orange" : "red";

        return <Tag color={color}>{status}</Tag>;
      }
    }

  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", height: "70vh", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      <Title level={2} className="text-center">
        All Donations (Platform)
      </Title>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={donations}
        pagination={{ pageSize: 6 }}
      />

    </div>
  );
};

export default Donations;