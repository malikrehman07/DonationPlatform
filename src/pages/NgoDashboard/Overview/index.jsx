import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Alert, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../../../context/Auth';
import Donations from '../Donations';

import { getReadOnlyContract } from '../../../blockchain/config';
import { ethers } from 'ethers';

const { Title, Text } = Typography;

const Overview = () => {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [averageDonation, setAverageDonation] = useState(0);

  // =========================
  // FETCH STATS (SYNCHRONIZED WITH BLOCKCHAIN)
  // =========================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!user?._id) return;

        // 1. Fetch campaigns to get blockchain IDs
        const compRes = await axios.get(
          `https://apigivehopes.vercel.app/compaigns/my/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const myCampaigns = compRes.data.compaigns || [];
        const contract = getReadOnlyContract();

        // 2. Fetch Permanent Totals from Smart Contract Storage
        let totalRaisedWei = BigInt(0);
        let totalDonationCount = 0;

        await Promise.all(myCampaigns.map(async (c) => {
          try {
            if (c.blockchainCampaignId !== undefined) {
              const blockchainData = await contract.getCampaign(c.blockchainCampaignId);
              // raisedAmount is index 5
              totalRaisedWei += BigInt(blockchainData[5]);
            }
          } catch (e) {
            console.error("Blockchain fetch error for campaign:", c._id);
          }
        }));

        // 3. Use MongoDB for the count (or fetch from events if needed)
        const statsRes = await axios.get(
            `https://apigivehopes.vercel.app/donations/stats?ngoId=${user._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const donationCount = statsRes.data.stats.totalDonationCount || 0;

        const totalMATIC = Number(ethers.formatEther(totalRaisedWei)).toFixed(2);
        setLifetimeTotal(totalMATIC);
        setThisMonthTotal(totalMATIC); 
        setAverageDonation((totalMATIC / (donationCount || 1)).toFixed(2));

       } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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
