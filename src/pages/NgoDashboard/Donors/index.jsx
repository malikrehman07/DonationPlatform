import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography, Table } from 'antd';
import { useAuthContext } from '../../../context/Auth';
import axios from 'axios';

const { Title } = Typography;

const Donors = () => {
  const { user } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDonations = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await axios.get("https://backend-theta-silk-38.vercel.app/dashboard/donations", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
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
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone No",
      dataIndex: "phoneNo",
      key: "phoneNo",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Postal Code",
      dataIndex: "postalCode",
      key: "postalCode",
    },
  ];


  if (loading) {
    return (
      <Spin size="large" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", }} />
    );
  }
  return (
    <div className="dashboard-content">
      <Row>
        <Col span={24}>
          <Title level={2} className="text-center">
            Donors
          </Title>
        </Col>
        <Col span={24}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={donations}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Donors;
