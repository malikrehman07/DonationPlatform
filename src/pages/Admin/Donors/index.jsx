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
          "http://localhost:5000/dashboard/donations",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const donations = res.data.donations || [];

        // ✅ Extract UNIQUE donors
        const uniqueMap = {};

        donations.forEach(d => {
          const key = d.isAnonymous
            ? `anon-${d._id}`   // treat anonymous separately
            : d.email;

          if (!uniqueMap[key]) {
            uniqueMap[key] = {
              _id: key,
              fullName: d.fullName,
              email: d.email,
              phoneNo: d.phoneNo,
              city: d.city,
              isAnonymous: d.isAnonymous,
              totalDonated: Number(d.amount || 0),
            };
          } else {
            uniqueMap[key].totalDonated += Number(d.amount || 0);
          }
        });

        setDonors(Object.values(uniqueMap));

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
      render: (_, record) =>
        record.isAnonymous
          ? <Tag>Anonymous</Tag>
          : record.fullName
    },

    {
      title: "Email",
      render: (_, record) =>
        record.isAnonymous ? "Hidden" : record.email
    },

    {
      title: "Phone",
      render: (_, record) =>
        record.isAnonymous ? "Hidden" : record.phoneNo
    },

    {
      title: "City",
      render: (_, record) =>
        record.isAnonymous ? "Hidden" : record.city
    },

    {
      title: "Total Donated",
      dataIndex: "totalDonated",
      render: (amount) => (
        <strong>$ {amount.toLocaleString()}</strong>
      )
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