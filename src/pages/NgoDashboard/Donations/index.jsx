import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Button, Avatar, Spin } from "antd";
import axios from "axios";

const { Title } = Typography;

const Donations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);

    // const handleDelete = async (donation) => {
    //     const token = localStorage.getItem("token");
    //     try {
    //         await axios.delete(`https://backend-theta-silk-38.vercel.app/dashboard/delete/${donation._id}`, {
    //             headers: { Authorization: `Bearer ${token}` }
    //         });
    //         setDonations(prev => prev.filter(d => d._id !== donation._id));
    //         window.notify("Donation Deleted Successfully", "success");
    //     } catch (error) {
    //         console.error("Delete Error:", error);
    //         window.notify("Error Deleting the Donation", "error");
    //     }
    // };



    // useEffect(() => {
    //     const fetchDonations = async () => {
    //         setLoading(true);
    //         const token = localStorage.getItem("token");
    //         try {
    //             const res = await axios.get('https://backend-theta-silk-38.vercel.app/dashboard/donations', {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`, // ✅ Must be "Bearer <token>"
    //                 }
    //             })
    //             setDonations(res.data.donations)
    //         } catch (err) {
    //             console.error("Error fetching donations:", err)
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     fetchDonations()
    // }, [])

    const columns = [
        {
            title: "Donation ID",
            dataIndex: "_id",   // ✅ Use MongoDB _id
            key: "_id",
            render: (id) => <span>{id}</span>,
        },
        {
            title: "Donor",
            key: "donor",
            render: (_, record) => (
                <div>
                    <strong>{record.fullName}</strong>
                    <br />
                    {/* <span>{record.email}</span> */}
                    {/* <span>{record.phoneNo}</span> */}
                </div>
            ),
        },
        {
            title: "Campaign",
            key: "campaign",
            render: (_, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={record.compaign?.image} shape="square" size={40} />
                    <span style={{ marginLeft: 10 }}>{record.compaign?.title}</span>
                </div>
            ),
        },
        {
            title: "Total",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => <strong>${amount.toLocaleString()}</strong>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color =
                    status === "Completed" ? "green" : "red";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, donation) => (
                <Button danger type="link" onClick={() => handleDelete(donation)}>
                    Delete
                </Button>
            ),
        },
    ];


    if (loading) {
        return (
            <Spin size="large" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", }} />
        );
    }

    return (
        <div className="dashboard-content">
            <Title level={2} className="text-center">
                Donations
            </Title>
            <Table
                rowKey="_id"   // ✅ Important
                columns={columns}
                dataSource={donations}
                loading={loading}
                pagination={{ pageSize: 5 }}
                scroll={{ x: "max-content" }}
            />

        </div>
    );
};

export default Donations;
