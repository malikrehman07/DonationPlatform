import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Avatar } from 'antd';
// import { useAuthContext } from '../../../context/Auth';
// import axios from 'axios';

const { Title } = Typography;

const Overview = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);

//   useEffect(() => {
//     const fetchDonations = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         const res = await axios.get("https://backend-theta-silk-38.vercel.app/dashboard/my-donations", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("API Donations Response:", res.data.donations);
//         setDonations(res.data.donations || []);
//       } catch (err) {
//         console.error("Error fetching donations:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDonations();
//   }, []);

  const columns = [
    {
      title: "Donation ID",
      dataIndex: "_id",
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
          <span>{record.email}</span>
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
      title: "Total Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <strong>${amount}</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="dashboard-content">
      <Title level={3}>Welcome back, <b className='text-primary' >{user.firstName}</b>!</Title>
      <div className="overview-content">
        <Title level={3} className="text-center">Manage My Donations</Title>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={donations}
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default Overview;
