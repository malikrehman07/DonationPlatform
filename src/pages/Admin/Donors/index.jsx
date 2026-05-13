import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography, Table, Tag } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const Donors = () => {

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDonors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/donations/donors",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setDonors(res.data.donors || []);

      } catch (err) {
        console.error("Error fetching donors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();

  }, []);

  const columns = [
    {
      title: "Donor Name",
      dataIndex: "name",
      render: (name) => <strong>{name || "Anonymous"}</strong>
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => email || "N/A"
    },
    {
      title: "Phone Number",
      dataIndex: "phone", // Need to ensure phone is included in aggregation
      render: (phone) => phone || "N/A"
    },
    {
      title: "Total Donated",
      dataIndex: "totalDonated",
      render: (amount) => (
        <strong style={{ color: "#1890ff" }}>{amount.toLocaleString()} MATIC</strong>
      )
    },
    {
      title: "Donations Count",
      dataIndex: "donationCount",
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

      <Row>
        <Col span={24}>
          <Title level={2} className="text-center">
            All Donors (Platform)
          </Title>
        </Col>

        <Col span={24}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={donors}
            pagination={{ pageSize: 8 }}
          />
        </Col>
      </Row>

    </div>
  );
};

export default Donors;