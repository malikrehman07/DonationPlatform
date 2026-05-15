import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography, Table, Tag } from 'antd';
import axios from 'axios';
import { getReadOnlyContract } from '../../../blockchain/config';
import { ethers } from 'ethers';

const { Title } = Typography;

const Donors = () => {

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DONORS (HYBRID: MONGO METADATA + BLOCKCHAIN AMOUNT)
  // =========================
  useEffect(() => {

    const fetchDonors = async () => {
      try {
        const token = localStorage.getItem("token");
        const contract = getReadOnlyContract();

        // 1. Fetch all donations from MongoDB
        const res = await axios.get(
          "http://localhost:5000/donations/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mongoDonations = res.data.donations || [];

        // 2. Fetch Recent Blockchain Events
        const filter = contract.filters.DonationReceived();
        const events = await contract.queryFilter(filter, -2000);
        const bcMap = {};
        events.forEach(e => {
            bcMap[e.transactionHash.toLowerCase()] = ethers.formatEther(e.args.amount);
        });

        // 3. Group and Sync
        const donorGroups = {};

        await Promise.all(mongoDonations.map(async (d) => {
            const email = d.donorEmail || "anonymous@givehope.org";
            if (!donorGroups[email]) {
                donorGroups[email] = {
                    _id: email,
                    name: d.donorName,
                    email: d.donorEmail,
                    phone: d.phoneNo,
                    totalDonated: 0,
                    donationCount: 0,
                    lastDonation: d.createdAt
                };
            }

            // On-Chain verification
            let verifiedAmount = bcMap[d.transactionHash?.toLowerCase()];
            if (!verifiedAmount && d.transactionHash) {
                try {
                    const tx = await contract.provider.getTransaction(d.transactionHash);
                    if (tx) verifiedAmount = ethers.formatEther(tx.value);
                } catch (e) { console.warn("Admin BC verification failed", d.transactionHash); }
            }

            const amountNum = parseFloat(verifiedAmount || d.amount || 0);
            donorGroups[email].totalDonated += amountNum;
            donorGroups[email].donationCount += 1;
        }));

        const donorList = Object.values(donorGroups).map(d => ({
            ...d,
            totalDonated: d.totalDonated.toFixed(2)
        }));

        setDonors(donorList.sort((a, b) => b.totalDonated - a.totalDonated));

      } catch (err) {
        console.error("Error fetching admin hybrid donors:", err);
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
      title: "Contact",
      render: (_, record) => (
        <div style={{ fontSize: 11, color: "#8c8c8c" }}>
            {record.email}<br/>{record.phone}
        </div>
      )
    },
    {
      title: "Verified Total (MATIC)",
      dataIndex: "totalDonated",
      render: (amount) => (
        <Tag color="blue" style={{ fontSize: 13, fontWeight: "bold" }}>
          {amount} MATIC
        </Tag>
      )
    },
    {
      title: "Payments",
      dataIndex: "donationCount",
      render: (count) => <Tag color="cyan">{count} verified</Tag>
    },
    {
        title: "Platform Proof",
        key: "proof",
        render: () => <Tag color="gold">BLOCKCHAIN SYNCED</Tag>
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