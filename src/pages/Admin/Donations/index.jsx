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
          "http://localhost:3000/dashboard/donations",
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
      title: "ID",
      dataIndex: "_id",
      render: (id) => (
        <Tooltip title={id}>
          {id.slice(0, 6)}...{id.slice(-4)}
        </Tooltip>
      )
    },

    {
      title: "Donor",
      render: (_, record) => (
        record.isAnonymous
          ? <Tag>Anonymous</Tag>
          : (
            <div>
              <strong>{record.fullName}</strong>
              <br />
              <small>{record.email}</small>
            </div>
          )
      )
    },

    {
      title: "Campaign",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={record.compaign?.image} shape="square" />
          <span>{record.compaign?.title || "Unknown"}</span>
        </div>
      )
    },

    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => (
        <strong style={{ color: "#1890ff" }}>
          $ {Number(amount).toLocaleString()}
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