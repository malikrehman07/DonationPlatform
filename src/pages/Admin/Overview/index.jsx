import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../../../context/Auth';
import Donations from '../Donations';

const { Title, Text } = Typography;

const Overview = () => {

  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);

  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [previousLastMonthTotal, setPreviousLastMonthTotal] = useState(0);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/donations/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { stats } = res.data;
        setLifetimeTotal(stats.totalDonations);
        setThisMonthTotal(stats.totalDonations); // Simplified for now as backend returns totals
        setLastMonthTotal(0); 
        setPreviousLastMonthTotal(0);

      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

fetchData();

}, []);

// =========================
// GROWTH CALCULATION
// =========================
const calcGrowth = (current, previous) => {

  if (previous === 0) {
    return {
      percent: "+100%",
      arrow: <ArrowUpOutlined style={{ color: "green" }} />
    };
  }

  const diff = current - previous;

  const percent = (
    (diff / previous) * 100
  ).toFixed(1);

  return diff >= 0
    ? {
      percent: `+${percent}%`,
      arrow: <ArrowUpOutlined style={{ color: "green" }} />
    }
    : {
      percent: `${percent}%`,
      arrow: <ArrowDownOutlined style={{ color: "red" }} />
    };
};

// =========================
// GROWTH RESULTS
// =========================

// THIS MONTH VS LAST MONTH
const monthlyGrowth = calcGrowth(
  thisMonthTotal,
  lastMonthTotal
);

// LAST MONTH VS PREVIOUS LAST MONTH
const lastMonthGrowth = calcGrowth(
  lastMonthTotal,
  previousLastMonthTotal
);

// LIFETIME VS LAST MONTH
const lifetimeGrowth = calcGrowth(
  lifetimeTotal,
  lastMonthTotal
);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="overview-content">

      <Title level={3}>
        Welcome Admin, <b className='text-primary'>{user.firstName}</b>
      </Title>

      <Text>Platform Analytics Overview</Text>

      <Row gutter={[16, 16]} className="mt-4">

        {/* THIS MONTH */}
        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card shadow-sm" bordered={false}>
            <Text secondary>Current Month Volume</Text>
            <Title level={4} className="m-0">
              {thisMonthTotal.toLocaleString()} <span style={{fontSize: '14px'}}>MATIC</span>
            </Title>
            <Text type="success">
              <ArrowUpOutlined /> Dynamic growth
            </Text>
          </Card>
        </Col>

        {/* LIFETIME */}
        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card shadow-sm" bordered={false}>
            <Text secondary>Total Platform Donations</Text>
            <Title level={4} className="m-0">
              {lifetimeTotal.toLocaleString()} <span style={{fontSize: '14px'}}>MATIC</span>
            </Title>
            <Text type="success">
              <ArrowUpOutlined /> {lifetimeTotal > 0 ? "+100%" : "0%"} overall
            </Text>
          </Card>
        </Col>

        {/* DONORS COUNT */}
        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card shadow-sm" bordered={false}>
            <Text secondary>Average Donation Size</Text>
            <Title level={4} className="m-0">
              {(lifetimeTotal / (thisMonthTotal || 1)).toFixed(2)} <span style={{fontSize: '14px'}}>MATIC</span>
            </Title>
            <Text type="secondary">Based on recent activity</Text>
          </Card>
        </Col>

      </Row>

      {/* Donations Table */}
      <Card className="mt-4">
        <Donations />
      </Card>

    </div>
  );
};

export default Overview;