import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Button, Avatar, Spin, Tooltip } from "antd";
import axios from "axios";

const { Title } = Typography;

const Donations = () => {

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================
    // FETCH DONATIONS
    // =========================
    useEffect(() => {

        const fetchDonations = async () => {
            try {

                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "http://localhost:3000/dashboard/donations",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setDonations(res.data.donations || []);

            } catch (err) {
                console.error("Error fetching donations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();

    }, []);

    // =========================
    // DELETE (optional)
    // =========================
    const handleDelete = async (donation) => {
        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:3000/dashboard/delete/${donation._id}`,
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
            title: "Donation ID",
            dataIndex: "_id",
            key: "_id",
            render: (id) => (
                <Tooltip title={id}>
                    <span>
                        {id.slice(0, 6)}...{id.slice(-4)}
                    </span>
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
                    <strong>{record.fullName}</strong>
                    <br />
                    <small style={{ color: "gray" }}>
                        {record.email || "No email"}
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

                    <Avatar
                        src={record.compaign?.image}
                        shape="square"
                        size={40}
                    />

                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.compaign?.title || "Unknown Campaign"}
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
                    $ {Number(amount || 0).toLocaleString()}
                </strong>
            )
        },

        // =========================
        // STATUS
        // =========================
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color =
                    status === "Completed"
                        ? "green"
                        : status === "Pending"
                            ? "orange"
                            : "red";

                return <Tag color={color}>{status}</Tag>;
            }
        },

        // =========================
        // ACTIONS
        // =========================
        {
            title: "Action",
            key: "action",
            render: (_, donation) => (
                <Button
                    danger
                    type="link"
                    onClick={() => handleDelete(donation)}
                >
                    Delete
                </Button>
            )
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