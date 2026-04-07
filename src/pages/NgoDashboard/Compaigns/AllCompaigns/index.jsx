import { Button, Col, Space, Row, Typography, Spin, Table, Image } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../config/supabase';
import axios from 'axios';
import { useAuthContext } from '../../../../context/Auth';

const { Title } = Typography;

const AllCompaigns = () => {
  const { user } = useAuthContext();
  const [compaigns, setCompaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compaignTotals, setCompaignTotals] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        // force re-render to remove highlight
        setCompaigns((prev) => [...prev]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [highlightId]);



//   const handleDelete = async (compaign) => {
//     try {
//       // 🧹 Delete the image from Supabase
//       if (compaign.imageUrls?.length) {
//         for (const url of compaign.imageUrls) {
//           const pathParts = new URL(url).pathname.split(
//             "/storage/v1/object/public/GiveHope/"
//           );
//           const filePath = pathParts[1];
//           if (filePath) {
//             const { error: deleteError } = await supabase.storage
//               .from("GiveHope")
//               .remove([filePath]);
//             if (deleteError) {
//               console.warn("Image deletion failed:", deleteError.message);
//             }
//           }
//         }
//       }

//       const token = localStorage.getItem("token");
//       await axios.delete(`https://backend-theta-silk-38.vercel.app/compaigns/delete/${compaign._id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       window.notify("Campaign deleted successfully", "success");
//       setCompaigns((prev) => prev.filter((s) => s._id !== compaign._id));
//     } catch (err) {
//       console.error(err);
//       window.notify("Failed to delete campaign", "error");
//     }
//   };

//   const getCompaigns = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [compRes, donRes] = await Promise.all([
//         axios.get("https://backend-theta-silk-38.vercel.app/compaigns/read"),
//         axios.get("https://backend-theta-silk-38.vercel.app/dashboard/donations"),
//       ]);

//       setCompaigns(compRes.data.compaigns);

//       // ✅ Group donations by campaignId
//       const totals = {};
//       (donRes.data.donations || []).forEach((donation) => {
//         const compId = donation.compaign?.compaignId;
//         if (!compId) return;
//         const donationTotal = parseFloat(donation.amount || 0);
//         totals[compId] = (totals[compId] || 0) + donationTotal;
//       });
//       setCompaignTotals(totals);
//     } catch (error) {
//       window.notify("Error fetching campaigns or donations", "error");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     getCompaigns();
//   }, [getCompaigns]);

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Image",
      dataIndex: "imageUrls",
      key: "imageUrls",
      render: (images) =>
        images?.length ? (
          <Image
            src={images[0]}
            alt="campaign"
            width={40}
            height={40}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          "N/A"
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Raised",
      dataIndex: "_id",
      key: "raised",
      render: (id) => `$${(compaignTotals[id] || 0).toLocaleString()}`,
    },
    {
      title: "Target Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, compaign) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/dashboard/compaign/edit/${compaign._id}`)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => handleDelete(compaign)}
          >
            Delete
          </Button>
        </Space>
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
      <Row>
        <Col span={24}>
          <Title level={2} className="text-center">
            Campaigns
          </Title>
        </Col>
        <Col span={24}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={compaigns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
            rowClassName={(record) =>
              record._id === highlightId ? "highlight-row" : ""
            }
          />

        </Col>
        <Col span={24} className="text-center mt-3 ">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/dashboard/compaign/add")}
          >
            Add Campaign
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default AllCompaigns;
