import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../../../context/Auth';
import Donations from '../Donations';

const { Title, Text } = Typography;

const Overview = () => {
  const { user } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [averageDonation, setAverageDonation] = useState(0);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDonations = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await axios.get('https://backend-theta-silk-38.vercel.app/dashboard/donations', {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         const fetchedDonations = res.data.donations || [];
//         setDonations(fetchedDonations);

//         // ✅ Lifetime total
//         const lifetime = fetchedDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
//         setLifetimeTotal(lifetime);

//         // ✅ Monthly totals
//         const now = new Date();
//         const thisMonth = fetchedDonations.filter(d => new Date(d.createdAt).getMonth() === now.getMonth() &&
//           new Date(d.createdAt).getFullYear() === now.getFullYear());

//         const lastMonth = fetchedDonations.filter(d => {
//           const dDate = new Date(d.createdAt);
//           return (
//             (dDate.getMonth() === now.getMonth() - 1 && dDate.getFullYear() === now.getFullYear()) ||
//             (now.getMonth() === 0 && dDate.getMonth() === 11 && dDate.getFullYear() === now.getFullYear() - 1)
//           );
//         });

//         const thisMonthTotalCalc = thisMonth.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
//         const lastMonthTotalCalc = lastMonth.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

//         setThisMonthTotal(thisMonthTotalCalc);
//         setLastMonthTotal(lastMonthTotalCalc);

//         // ✅ Average
//         setAverageDonation(fetchedDonations.length > 0 ? (lifetime / fetchedDonations.length).toFixed(2) : 0);

//       } catch (err) {
//         console.error("Error fetching donations:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDonations();
//   }, []);

  // ✅ Percentage & Arrow logic
  
  const calcGrowth = (current, previous) => {
    if (previous === 0) return { percent: "+100%", arrow: <ArrowUpOutlined style={{ color: "green" }} /> };
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    if (diff > 0) return { percent: `+${percent}%`, arrow: <ArrowUpOutlined style={{ color: "green" }} /> };
    if (diff < 0) return { percent: `${percent}%`, arrow: <ArrowDownOutlined style={{ color: "red" }} /> };
    return { percent: "0%", arrow: <ArrowUpOutlined style={{ color: "grey" }} /> };
  };

  const monthlyGrowth = calcGrowth(thisMonthTotal, lastMonthTotal);
  const lifetimeGrowth = calcGrowth(lifetimeTotal, lastMonthTotal);

  return (
    <div className="overview-content">
      <Title level={3}>Welcome back, <b className='text-primary' >{user.firstName}</b>!</Title>
      <Text>Here's Your Donation Overview</Text>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card" bordered={false}>
            <Text className="text-white">AVG. Donation Value</Text>
            <Title level={4} className="text-white">
              $ {averageDonation} {monthlyGrowth.arrow}
            </Title>
            <Text className="text-white">
              <span className="fw-bold">{monthlyGrowth.percent}</span> from last month
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card" bordered={false}>
            <Text className="text-white">Total Donations (This Month)</Text>
            <Title level={4} className="text-white">
              $ {thisMonthTotal.toLocaleString()} {monthlyGrowth.arrow}
            </Title>
            <Text className="text-white">
              <span className="fw-bold">{monthlyGrowth.percent}</span> from last month
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="metric-card" bordered={false}>
            <Text className="text-white">Lifetime Donations</Text>
            <Title level={4} className="text-white">
              $ {lifetimeTotal.toLocaleString()} {lifetimeGrowth.arrow}
            </Title>
            <Text className="text-white">
              <span className="fw-bold">{lifetimeGrowth.percent}</span> compared to last month
            </Text>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4">
        <Donations />
      </Card>
    </div>
  );
};

export default Overview;
