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
  // FETCH DONATIONS (BLOCKCHAIN ONLY HISTORICAL EVENTS)
  // =========================
  useEffect(() => {

    const fetchDonations = async () => {
      try {
        const contract = getReadOnlyContract();
        const provider = new ethers.JsonRpcProvider("https://polygon-amoy-bor-rpc.publicnode.com");
        
        // 1. Get All Campaigns for Title Mapping
        const compRes = await axios.get("https://apigivehopes.vercel.app/compaigns/read");
        const allCampaigns = compRes.data.compaigns || [];

        // 2. Scan All DonationReceived Events from Block 0
        const filter = contract.filters.DonationReceived();
        const allEvents = await contract.queryFilter(filter, 0);

        // 3. Map events to Donation layout
        const resolvedHistory = await Promise.all(allEvents.map(async (evt) => {
            let blockTime = new Date().toISOString();
            try {
                const block = await provider.getBlock(evt.blockNumber);
                if (block) {
                    blockTime = new Date(block.timestamp * 1000).toISOString();
                }
            } catch (blockErr) {
                console.warn("Failed to retrieve block timestamp:", evt.blockNumber, blockErr);
            }

            const bcId = Number(evt.args.campaignId);
            const donorAddress = evt.args.donor;
            const amountEth = ethers.formatEther(evt.args.amount);

            // Find campaign metadata from MongoDB campaigns API to map title & NGO info
            const campaignMatch = allCampaigns.find(c => c.blockchainCampaignId === bcId);

            return {
                _id: `${evt.transactionHash}-${evt.index || Math.random()}`,
                transactionHash: evt.transactionHash,
                amount: parseFloat(amountEth).toFixed(4),
                donorName: `${donorAddress.slice(0, 6)}...${donorAddress.slice(-4)}`,
                donorEmail: "On-Chain Wallet",
                ngo: {
                    organizationName: campaignMatch?.createdBy?.organizationName || "Unknown NGO"
                },
                campaign: {
                    title: campaignMatch?.title || `Campaign #${bcId}`
                },
                createdAt: blockTime,
                status: "Completed",
                isVerified: true
            };
        }));

        setDonations(resolvedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      } catch (err) {
        console.error("Error fetching blockchain donations:", err);
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
