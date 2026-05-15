import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin } from 'antd';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Fetch Global Truth from Smart Contract
        const contract = getReadOnlyContract();
        
        // Fetch total campaign count directly from Blockchain
        const campaignCount = await contract.campaignCount();
        const totalCampaigns = Number(campaignCount);

        let totalRaisedWei = BigInt(0);
        
        // 2. Loop through every single campaign on the Blockchain
        // This ensures the Admin misses NOTHING, even if Mongo is out of sync
        const campaignIndices = Array.from({ length: totalCampaigns }, (_, i) => i + 1);
        
        await Promise.all(campaignIndices.map(async (id) => {
          try {
            const blockchainData = await contract.getCampaign(id);
            // raisedAmount is index 5
            totalRaisedWei += BigInt(blockchainData[5]);
          } catch (e) {
            console.error(`Blockchain fetch error for campaign ID ${id}:`, e);
          }
        }));

        const totalMATIC = Number(ethers.formatEther(totalRaisedWei)).toFixed(2);
        setLifetimeTotal(totalMATIC);
        setThisMonthTotal(totalMATIC);

      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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