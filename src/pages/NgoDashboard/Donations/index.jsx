import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Button, Avatar, Spin, Tooltip } from "antd";
import axios from "axios";
import { useAuthContext } from "../../../context/Auth";

import { getReadOnlyContract } from "../../../blockchain/config";
import { ethers } from "ethers";

const { Title } = Typography;

const Donations = () => {
    const { user } = useAuthContext();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================
    // FETCH DONATIONS (PERMANENT HYBRID HISTORY)
    // =========================
    useEffect(() => {
        const fetchDonations = async () => {
            const userId = user?._id || user?.uid;
            if (!userId) return;

            try {
                const token = localStorage.getItem("token");
                const contract = getReadOnlyContract();
                
                // 1. Get NGO's Campaigns for Title Mapping
                const compRes = await axios.get(
                    `http://localhost:5000/compaigns/my/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const myCampaigns = compRes.data.compaigns || [];
                const myBcIds = myCampaigns.map(c => c.blockchainCampaignId).filter(id => id !== undefined);

                // 2. Fetch Full History from MongoDB (Base)
                const mongoRes = await axios.get(
                    `http://localhost:5000/donations/ngo/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const mongoDonations = mongoRes.data.donations || [];

                // 3. Scan Recent Blocks for "Direct" or "Live" events
                const filter = contract.filters.DonationReceived();
                const recentEvents = await contract.queryFilter(filter, -1000); 

                // 4. Verification Engine for Entire History
                const verifiedHistory = await Promise.all(mongoDonations.map(async (d) => {
                    try {
                        // Priority 1: Check recent events scan
                        const recentMatch = recentEvents.find(e => e.transactionHash.toLowerCase() === d.transactionHash?.toLowerCase());
                        if (recentMatch) {
                            return {
                                ...d,
                                amount: parseFloat(ethers.formatEther(recentMatch.args.amount)).toFixed(2),
                                isVerified: true
                            };
                        }

                        // Priority 2: Direct on-chain verification for historical transactions
                        if (d.transactionHash) {
                            const tx = await contract.provider.getTransaction(d.transactionHash);
                            if (tx) {
                                return {
                                    ...d,
                                    amount: parseFloat(ethers.formatEther(tx.value)).toFixed(2),
                                    isVerified: true
                                };
                            }
                        }
                    } catch (err) {
                        console.warn("Verification failed for history item:", d.transactionHash);
                    }
                    return { ...d, isVerified: false };
                }));

                // 5. Add "Direct Wallet" donations found in scan but NOT in Mongo
                const directDonations = recentEvents
                    .filter(evt => {
                        const bcId = Number(evt.args.campaignId);
                        const isNgoCampaign = myBcIds.includes(bcId);
                        const existsInMongo = mongoDonations.some(d => d.transactionHash?.toLowerCase() === evt.transactionHash.toLowerCase());
                        return isNgoCampaign && !existsInMongo;
                    })
                    .map(evt => ({
                        _id: evt.transactionHash,
                        transactionHash: evt.transactionHash,
                        amount: parseFloat(ethers.formatEther(evt.args.amount)).toFixed(2),
                        donorName: "Direct Wallet Donor",
                        donorEmail: "N/A",
                        campaign: {
                            title: myCampaigns.find(c => c.blockchainCampaignId === Number(evt.args.campaignId))?.title || `Campaign #${evt.args.campaignId}`
                        },
                        createdAt: new Date().toISOString(),
                        status: "Completed",
                        isVerified: true
                    }));

                setDonations([...verifiedHistory, ...directDonations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

            } catch (err) {
                console.error("Error fetching permanent donations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();

    }, [user]);

    // =========================
    // DELETE (optional)
    // =========================
    const handleDelete = async (donation) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/dashboard/delete/${donation._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDonations(prev =>
                prev.filter(d => d._id !== donation._id)
            );
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    // =========================
    // TABLE COLUMNS
    // =========================
    const columns = [
        {
            title: "Transaction Hash",
            dataIndex: "transactionHash",
            key: "transactionHash",
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

        // =========================
        // DONOR INFO
        // =========================
        {
            title: "Donor",
            key: "donor",
            render: (_, record) => (
                <div>
                    <strong>{record.donorName}</strong>
                    <br />
                    <small style={{ color: "gray" }}>
                        {record.donorEmail || "Anonymous"}
                    </small>
                </div>
            )
        },

        // =========================
        // CAMPAIGN INFO
        // =========================
        {
            title: "Campaign",
            key: "campaign",
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.campaign?.title || "Unknown Campaign"}
                        </div>
                    </div>
                </div>
            )
        },

        // =========================
        // AMOUNT
        // =========================
        {
            title: "Amount Received",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => (
                <strong style={{ color: "#1890ff" }}>
                    {Number(amount || 0).toLocaleString()} MATIC
                </strong>
            )
        },

        // =========================
        // STATUS
        // =========================
        {
            title: "Status",
            key: "status",
            render: (_, record) => {
                const status = record.status;
                let color =
                    status === "Completed"
                        ? "green"
                        : status === "Pending"
                            ? "orange"
                            : "red";

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
        },

        // =========================
        // ACTIONS
        // =========================
        // {
        //     title: "Action",
        //     key: "action",
        //     render: (_, donation) => (
        //         <Button
        //             danger
        //             type="link"
        //             onClick={() => handleDelete(donation)}
        //         >
        //             Delete
        //         </Button>
        //     )
        // }
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

    // =========================
    // UI
    // =========================
    return (
        <div className="dashboard-content">

            <Title level={2} className="text-center">
                Donations Received
            </Title>

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={donations}
                pagination={{ pageSize: 6 }}
                scroll={{ x: "max-content" }}
            />

        </div>
    );
};

export default Donations;