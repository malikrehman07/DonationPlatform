import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography, Table, Tag } from 'antd';
import { useAuthContext } from '../../../context/Auth';
import axios from 'axios';

const { Title } = Typography;

const Donors = () => {

  const { user } = useAuthContext();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DONORS
  // =========================
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!user?._id) return;

        const res = await axios.get(
          `http://localhost:5000/donations/ngo-donors/${user._id}`,
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
  }, [user]);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: "Donor Name",
      dataIndex: "name",
      key: "name",
      render: (name) => name || <Tag color="default">Anonymous</Tag>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "Hidden"
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "Hidden"
    },
    {
      title: "Total Donated",
      dataIndex: "totalDonated",
      key: "totalDonated",
      render: (amount) => (
        <b style={{ color: "#52c41a" }}>{Number(amount || 0).toLocaleString()} MATIC</b>
      )
    },
    {
      title: "Times Donated",
      dataIndex: "donationCount",
      key: "donationCount",
      render: (count) => <Tag color="blue">{count} times</Tag>
    },
    {
      title: "Last Donation",
      dataIndex: "lastDonation",
      key: "lastDonation",
      render: (date) => new Date(date).toLocaleDateString()
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
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>Donor Insights</Title>
          <p className="text-secondary">Track who is supporting your campaigns.</p>
        </Col>

        <Col span={24}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={donors}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
            className="shadow-sm border rounded-3"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Donors;