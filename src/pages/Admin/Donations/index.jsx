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
  // FETCH DONATIONS (HYBRID: MongoDB Records + Blockchain Verification)
  // =========================
  useEffect(() => {

    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem("token");
        const contract = getReadOnlyContract();

        // 1. Get All Campaigns for blockchain ID mapping
        const compRes = await axios.get("https://apigivehopes.vercel.app/compaigns/read");
        const allCampaigns = compRes.data.compaigns || [];

        // 2. Fetch donation records from MongoDB
        const res = await axios.get(
          "https://apigivehopes.vercel.app/donations/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mongoDonations = res.data.donations || [];

        // 3. Verify each donation's amount on-chain via tx hash
        //    and fetch campaign title from blockchain via getCampaign()
        const verifiedHistory = await Promise.all(mongoDonations.map(async (d) => {
            let verifiedAmount = null;
            let blockchainTitle = null;

            // Verify amount from blockchain transaction
            try {
                if (d.transactionHash) {
                    const tx = await contract.provider.getTransaction(d.transactionHash);
                    if (tx) {
                        verifiedAmount = ethers.formatEther(tx.value);
                    }
                }
            } catch (err) {
                console.warn("Amount verification failed for:", d.transactionHash);
            }

            // Fetch campaign title from blockchain via getCampaign()
            try {
                const bcId = d.campaign?.blockchainCampaignId;
                if (bcId !== undefined && bcId !== null) {
                    const campaignData = await contract.getCampaign(bcId);
                    blockchainTitle = campaignData[2]; // title is index 2
                }
            } catch (err) {
                console.warn("Blockchain title fetch failed for campaign:", d.campaign?._id);
            }

            return {
                ...d,
                amount: verifiedAmount
                    ? parseFloat(verifiedAmount).toFixed(4)
                    : parseFloat(d.amount || 0).toFixed(4),
                campaign: {
                    ...d.campaign,
                    title: blockchainTitle || d.campaign?.title || "Unknown"
                },
                isVerified: !!verifiedAmount
            };
        }));

        setDonations(verifiedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      } catch (err) {
        console.error("Error fetching donations:", err);
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
        scroll={{ x: 'max-content' }}
      />

    </div>
  );
};

export default Donations;
