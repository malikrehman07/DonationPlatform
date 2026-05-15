import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Avatar, Spin, Tooltip } from "antd";
import axios from "axios";

import { getReadOnlyContract } from "../../../blockchain/config";
import { ethers } from "ethers";

const { Title } = Typography;

const Donations = () => {

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DONATIONS (PERMANENT HYBRID HISTORY)
  // =========================
  useEffect(() => {

    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem("token");
        const contract = getReadOnlyContract();
        
        // 1. Get All Campaigns for Title Mapping
        const compRes = await axios.get("https://apigivehopes.vercel.app/compaigns/read");
        const allCampaigns = compRes.data.compaigns || [];

        // 2. Fetch Full History from MongoDB (Base)
        const res = await axios.get(
          "https://apigivehopes.vercel.app/donations/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mongoDonations = res.data.donations || [];

        // 3. Scan Recent Blocks
        const filter = contract.filters.DonationReceived();
        const recentEvents = await contract.queryFilter(filter, -1000);
        const bcMap = {};
        recentEvents.forEach(e => {
            bcMap[e.transactionHash.toLowerCase()] = ethers.formatEther(e.args.amount);
        });

        // 4. Verification Engine for Entire History
        const verifiedHistory = await Promise.all(mongoDonations.map(async (d) => {
            try {
                // Priority 1: Recent scan
                let verifiedAmount = bcMap[d.transactionHash?.toLowerCase()];
                
                // Priority 2: Direct Tx fetch for older history
                if (!verifiedAmount && d.transactionHash) {
                    const tx = await contract.provider.getTransaction(d.transactionHash);
                    if (tx) verifiedAmount = ethers.formatEther(tx.value);
                }

                if (verifiedAmount) {
                    const bcId = Number(d.campaign?.blockchainCampaignId || 0);
                    const campaignMatch = allCampaigns.find(c => c._id === d.campaign?._id);

                    return {
                        ...d,
                        amount: parseFloat(verifiedAmount).toFixed(2),
                        isVerified: true
                    };
                }
            } catch (err) {
                console.warn("Admin history verification failed for:", d.transactionHash);
            }
            return { ...d, isVerified: false };
        }));

        // 5. Add "Direct" donations from recent scan not in MongoDB
        const directDonations = recentEvents
            .filter(evt => !mongoDonations.some(d => d.transactionHash?.toLowerCase() === evt.transactionHash.toLowerCase()))
            .map(evt => {
                const bcId = Number(evt.args.campaignId);
                const campaignMatch = allCampaigns.find(c => c.blockchainCampaignId === bcId);
                return {
                    _id: evt.transactionHash,
                    transactionHash: evt.transactionHash,
                    amount: parseFloat(ethers.formatEther(evt.args.amount)).toFixed(2),
                    donorName: "Direct Wallet Donor",
                    donorEmail: "N/A",
                    ngo: {
                        organizationName: campaignMatch?.createdBy?.organizationName || "Unknown NGO"
                    },
                    campaign: {
                        title: campaignMatch?.title || `Campaign #${bcId}`
                    },
                    createdAt: new Date().toISOString(),
                    status: "Completed",
                    isVerified: true
                };
            });

        setDonations([...verifiedHistory, ...directDonations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      } catch (err) {
        console.error("Error fetching admin permanent donations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

  }, []);

  const columns = [

    {
      title: "Transaction Hash",
      dataIndex: "transactionHash",
      render: (hash) => (
        <Tooltip title={hash}>
          <a
            href={`https://amoy.polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "monospace" }}
          >
            {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : "N/A"}
          </a>
        </Tooltip>
      )
    },

    {
      title: "Donor",
      render: (_, record) => (
        <div>
          <strong>{record.isAnonymous ? "Anonymous" : record.donorName}</strong>
          <br />
          <small>{record.donorEmail}</small>
        </div>
      )
    },

    {
      title: "NGO",
      render: (_, record) => (
        <span>{record.ngo?.organizationName || "N/A"}</span>
      )
    },

    {
      title: "Campaign",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>{record.campaign?.title || "Unknown"}</span>
        </div>
      )
    },

    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => (
        <strong style={{ color: "#1890ff" }}>
          {Number(amount).toLocaleString()} MATIC
        </strong>
      )
    },

    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString()
    },

    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = record.status;
        const color =
          status === "Completed" ? "green" :
            status === "Pending" ? "orange" : "red";

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <Tag color={color} style={{ margin: 0 }}>{status}</Tag>
                {record.isVerified && (
                    <Tag color="cyan" style={{ margin: 0, fontSize: "10px" }}>
                        BLOCKCHAIN VERIFIED
                    </Tag>
                )}
            </div>
        );
      }
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

      <Title level={2} className="text-center">
        All Donations (Platform)
      </Title>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={donations}
        pagination={{ pageSize: 6 }}
      />

    </div>
  );
};

export default Donations;
