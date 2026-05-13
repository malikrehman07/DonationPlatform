import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Alert, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../../../context/Auth';
import Donations from '../Donations';

const { Title, Text } = Typography;

const Overview = () => {

  const { user } = useAuthContext();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [averageDonation, setAverageDonation] = useState(0);

  // =========================
  // BLOCK ACCESS IF NOT Approved
  // =========================
  if (user?.role === "Ngo" && user?.status !== "approved") {
    return (
      <div className="p-4">
        <Alert
          type="warning"
          showIcon
          message="Account Not Verified"
          description="Your NGO is currently under review. You cannot access donation analytics until admin verification is completed."
        />
      </div>
    );
  }

  // =========================
  // FETCH DONATIONS
  // =========================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!user?._id) return;

        const res = await axios.get(
          `http://localhost:5000/donations/stats?ngoId=${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const { stats } = res.data;
        setLifetimeTotal(stats.totalDonations);
        setThisMonthTotal(stats.totalDonations); // Simplified for demo
        setAverageDonation((stats.totalDonations / (stats.totalDonationCount || 1)).toFixed(2));
        setLastMonthTotal(0);

      } catch (err) {
        console.error("Donation fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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
    const percent = ((diff / previous) * 100).toFixed(1);

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

  const monthlyGrowth = calcGrowth(thisMonthTotal, lastMonthTotal);
  const lifetimeGrowth = calcGrowth(lifetimeTotal, lastMonthTotal);

  // =========================
  // LOADING STATE
  // =========================
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
        Welcome back, <b className='text-primary'>{user.firstName}</b>!
      </Title>

      <Text>Here's your donation overview</Text>

      <Row gutter={[16, 16]} className="mt-4">

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card shadow-sm" bordered={false}>
            <Text secondary>AVG Donation Value</Text>
            <Title level={4} className="m-0">
               {averageDonation} <span style={{fontSize: '14px'}}>MATIC</span>
            </Title>
            <Text type="secondary">Across all campaigns</Text>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card shadow-sm" bordered={false}>
            <Text secondary>Current Month Total</Text>
            <Title level={4} className="m-0">
               {thisMonthTotal.toLocaleString()} <span style={{fontSize: '14px'}}>MATIC</span>
            </Title>
            <Text type="success"><ArrowUpOutlined /> New contributions</Text>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card shadow-sm" bordered={false}>
            <Text secondary>Lifetime Donations</Text>
            <Title level={4} className="m-0">
               {lifetimeTotal.toLocaleString()} <span style={{fontSize: '14px'}}>MATIC</span>
            </Title>
            <Text type="success"><ArrowUpOutlined /> Total impact</Text>
          </Card>
        </Col>

      </Row>

      {/* Donation table */}
      <Card className="mt-4">
        <Donations />
      </Card>

    </div>
  );
};

export default Overview;