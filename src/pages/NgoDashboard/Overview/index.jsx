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
  // BLOCK ACCESS IF NOT VERIFIED
  // =========================
  if (user?.role === "Ngo" && user?.status !== "verified") {
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

    const fetchDonations = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/dashboard/donations",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const fetched = res.data.donations || [];
        setDonations(fetched);

        // =========================
        // CALCULATIONS
        // =========================
        const lifetime = fetched.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        setLifetimeTotal(lifetime);

        const now = new Date();

        const thisMonth = fetched.filter(d => {
          const date = new Date(d.createdAt);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });

        const lastMonth = fetched.filter(d => {
          const date = new Date(d.createdAt);
          return (
            date.getMonth() === now.getMonth() - 1 ||
            (now.getMonth() === 0 && date.getMonth() === 11)
          );
        });

        const thisTotal = thisMonth.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const lastTotal = lastMonth.reduce((sum, d) => sum + Number(d.amount || 0), 0);

        setThisMonthTotal(thisTotal);
        setLastMonthTotal(lastTotal);

        setAverageDonation(
          fetched.length ? (lifetime / fetched.length).toFixed(2) : 0
        );

      } catch (err) {
        console.error("Donation fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

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
          <Card className="metric-card" bordered={false}>
            <Text>AVG Donation Value</Text>
            <Title level={4}>
              $ {averageDonation} {monthlyGrowth.arrow}
            </Title>
            <Text>
              <b>{monthlyGrowth.percent}</b> from last month
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card" bordered={false}>
            <Text>This Month Donations</Text>
            <Title level={4}>
              $ {thisMonthTotal.toLocaleString()} {monthlyGrowth.arrow}
            </Title>
            <Text>
              <b>{monthlyGrowth.percent}</b> growth
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card" bordered={false}>
            <Text>Lifetime Donations</Text>
            <Title level={4}>
              $ {lifetimeTotal.toLocaleString()} {lifetimeGrowth.arrow}
            </Title>
            <Text>
              <b>{lifetimeGrowth.percent}</b> vs last month
            </Text>
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