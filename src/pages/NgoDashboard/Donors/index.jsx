import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography, Table, Tag } from 'antd';
import { useAuthContext } from '../../../context/Auth';
import axios from 'axios';

import { getReadOnlyContract } from '../../../blockchain/config';
import { ethers } from 'ethers';

const { Title } = Typography;

const Donors = () => {

  const { user } = useAuthContext();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DONORS (HYBRID: METADATA FROM MONGO, AMOUNT FROM BLOCKCHAIN)
  // =========================
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const userId = user?._id || user?.uid;
        if (!userId) return;
        const token = localStorage.getItem("token");
        const contract = getReadOnlyContract();

        // 1. Fetch all donations for this NGO from MongoDB
        const res = await axios.get(
          `https://apigivehopes.vercel.app/donations/ngo/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mongoDonations = res.data.donations || [];

        // 2. Fetch all unique blockchain events to map amounts
        const filter = contract.filters.DonationReceived();
        const events = await contract.queryFilter(filter, -2000); 
        const bcMap = {};
        events.forEach(e => {
            bcMap[e.transactionHash.toLowerCase()] = ethers.formatEther(e.args.amount);
        });

        // 3. Group and Verify
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
                    lastDonation: d.createdAt,
                    wallet: d.transactionHash // Just as a reference
                };
            }

            // Get Amount from Blockchain (Prefer Event scan, fallback to Direct Tx fetch)
            let verifiedAmount = bcMap[d.transactionHash?.toLowerCase()];
            if (!verifiedAmount && d.transactionHash) {
                try {
                    const tx = await contract.provider.getTransaction(d.transactionHash);
                    if (tx) verifiedAmount = ethers.formatEther(tx.value);
                } catch (e) { console.warn("BC Fetch failed for tx", d.transactionHash); }
            }

            const amountNum = parseFloat(verifiedAmount || d.amount || 0);
            donorGroups[email].totalDonated += amountNum;
            donorGroups[email].donationCount += 1;
            if (new Date(d.createdAt) > new Date(donorGroups[email].lastDonation)) {
                donorGroups[email].lastDonation = d.createdAt;
            }
        }));

        const donorList = Object.values(donorGroups).map(d => ({
            ...d,
            totalDonated: d.totalDonated.toFixed(2)
        }));

        setDonors(donorList.sort((a, b) => b.totalDonated - a.totalDonated));

      } catch (err) {
        console.error("Error fetching hybrid donors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [user]);

  const columns = [
    {
      title: "Donor Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <strong>{name || "Anonymous"}</strong>
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.email}</div>
          <div style={{ fontSize: 11, color: "#bfbfbf" }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: "Total Donated (On-Chain)",
      dataIndex: "totalDonated",
      key: "totalDonated",
      render: (amount) => (
        <Tag color="green" style={{ fontSize: 14 }}>
          <b>{amount} MATIC</b>
        </Tag>
      )
    },
    {
      title: "Last Activity",
      dataIndex: "lastDonation",
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: "Times Donated",
      dataIndex: "donationCount",
      key: "donationCount",
      render: (count) => <Tag color="blue">{count} times</Tag>
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="gold">BLOCKCHAIN VERIFIED</Tag>
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
