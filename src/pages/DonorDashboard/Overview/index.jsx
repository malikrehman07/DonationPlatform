import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Avatar } from "antd";
import axios from "axios";
import { useAuthContext } from "../../../context/Auth";

const { Title } = Typography;

const Overview = () => {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);

  // =========================
  // FETCH DONATIONS
  // =========================
  useEffect(() => {
    const fetchDonations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          "http://localhost:5000/dashboard/my-donations",
          {
            headers: { Authorization: `Bearer ${token}` },
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

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: "Donation ID",
      dataIndex: "_id",
      key: "_id",
    },

    {
      title: "Donor",
      key: "donor",
      render: (_, record) => (
        <div>
          <strong>{record.fullName}</strong>
          <br />
          <span>{record.email}</span>
        </div>
      ),
    },

    {
      title: "Campaign",
      key: "campaign",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={record.compaign?.image}
            shape="square"
            size={40}
          />
          <span style={{ marginLeft: 10 }}>
            {record.compaign?.title}
          </span>
        </div>
      ),
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <strong>${amount}</strong>,
    },

    // =========================
    // PAYMENT METHOD
    // =========================
    {
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <Tag color={method === "crypto" ? "blue" : "purple"}>
          {method === "crypto"
            ? "MetaMask"
            : "Card → Crypto"}
        </Tag>
      ),
    },

    // =========================
    // STATUS
    // =========================
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Completed"
            ? "green"
            : status === "Processing"
            ? "orange"
            : "red";

        return <Tag color={color}>{status}</Tag>;
      },
    },

    // =========================
    // TX HASH (IMPORTANT)
    // =========================
    {
      title: "Transaction",
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash) =>
        txHash ? (
          <a
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash.slice(0, 10)}...
          </a>
        ) : (
          <span style={{ color: "#aaa" }}>N/A</span>
        ),
    },
  ];

  return (
    <div className="dashboard-content">
      <Title level={3}>
        Welcome back,{" "}
        <b className="text-primary">{user?.firstName}</b>!
      </Title>

      <div className="overview-content">
        <Title level={3} className="text-center">
          Manage My Donations
        </Title>

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={donations}
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default Overview;