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

  useEffect(() => {

    const fetchData = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:3000/dashboard/donations",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const donations = res.data.donations || [];

        // =========================
        // LIFETIME TOTAL
        // =========================
        const lifetime = donations.reduce(
          (sum, d) => sum + Number(d.amount || 0),
          0
        );
        setLifetimeTotal(lifetime);

        const now = new Date();

        // =========================
        // THIS MONTH
        // =========================
        const thisMonth = donations.filter(d => {
          const date = new Date(d.createdAt);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });

        // =========================
        // LAST MONTH
        // =========================
        const lastMonth = donations.filter(d => {
          const date = new Date(d.createdAt);

          return (
            (date.getMonth() === now.getMonth() - 1 &&
              date.getFullYear() === now.getFullYear()) ||
            (now.getMonth() === 0 &&
              date.getMonth() === 11 &&
              date.getFullYear() === now.getFullYear() - 1)
          );
        });

        const thisTotal = thisMonth.reduce(
          (sum, d) => sum + Number(d.amount || 0),
          0
        );

        const lastTotal = lastMonth.reduce(
          (sum, d) => sum + Number(d.amount || 0),
          0
        );

        setThisMonthTotal(thisTotal);
        setLastMonthTotal(lastTotal);

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
          <Card bordered={false}>
            <Text>This Month Revenue</Text>
            <Title level={4}>
              $ {thisMonthTotal.toLocaleString()} {monthlyGrowth.arrow}
            </Title>
            <Text>
              <b>{monthlyGrowth.percent}</b>
            </Text>
          </Card>
        </Col>

        {/* LIFETIME */}
        <Col xs={24} md={12} lg={8}>
          <Card bordered={false}>
            <Text>Total Platform Donations</Text>
            <Title level={4}>
              $ {lifetimeTotal.toLocaleString()} {lifetimeGrowth.arrow}
            </Title>
            <Text>
              <b>{lifetimeGrowth.percent}</b>
            </Text>
          </Card>
        </Col>

        {/* LAST MONTH */}
        <Col xs={24} md={12} lg={8}>
          <Card bordered={false}>
            <Text>Last Month Revenue</Text>
            <Title level={4}>
              $ {lastMonthTotal.toLocaleString()}
            </Title>
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