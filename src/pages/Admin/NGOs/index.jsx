import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Button, Space, Image, Select, Spin, Modal, Input, Row, Col, Card, DatePicker} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const NGOs = () => {

  const [ngos, setNgos] = useState([]);
  const [filteredNgos, setFilteredNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const [actionLoading, setActionLoading] = useState(null);

  const [previewDocs, setPreviewDocs] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // =========================
  // FETCH NGOs
  // =========================
  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://apigivehopes.vercel.app/admin/ngos`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNgos(res.data.ngos || []);
      setFilteredNgos(res.data.ngos || []);

    } catch (err) {
      console.error(err);
      window.notify?.("Failed to fetch NGOs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  // =========================
  // FILTER LOGIC
  // =========================
  useEffect(() => {

    let data = [...ngos];

    // STATUS FILTER
    if (statusFilter) {
      data = data.filter(n => n.status === statusFilter);
    }

    // SEARCH
    if (searchText) {
      const text = searchText.toLowerCase();
      data = data.filter(n =>
        n.organizationName?.toLowerCase().includes(text) ||
        n.registrationNumber?.toLowerCase().includes(text) ||
        n.phone?.toLowerCase().includes(text)
      );
    }

    // DATE FILTER
    if (dateRange.length === 2) {
      const [start, end] = dateRange;

      data = data.filter(n => {
        const created = dayjs(n.createdAt);
        return created.isAfter(start) && created.isBefore(end);
      });
    }

    setFilteredNgos(data);

  }, [ngos, statusFilter, searchText, dateRange]);

  // =========================
  // ACTIONS
  // =========================
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://apigivehopes.vercel.app/admin/ngos/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.notify?.("NGO Approved", "success");

      setNgos(prev =>
        prev.map(n => n._id === id ? { ...n, status: "approved" } : n)
      );

    } catch {
      window.notify?.("Approve failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://apigivehopes.vercel.app/admin/ngos/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.notify?.("NGO Rejected", "success");

      setNgos(prev =>
        prev.map(n => n._id === id ? { ...n, status: "rejected" } : n)
      );

    } catch {
      window.notify?.("Reject failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // STATUS CHANGE
  // =========================
  const handleStatusChange = async (ngoId, status) => {

  try {

    const token = localStorage.getItem("token");

    await axios.put(
      `https://apigivehopes.vercel.app/admin/ngos/${ngoId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // =========================
    // UPDATE UI WITHOUT REFRESH
    // =========================
    const updated = ngos.map((ngo) => {

      if (ngo._id === ngoId) {
        return {
          ...ngo,
          status
        };
      }

      return ngo;
    });

    setNgos(updated);
    setFilteredNgos(updated);

    window.notify?.(
      "NGO status updated",
      "success"
    );

  } catch (err) {

    console.error(err);

    window.notify?.(
      "Failed to update status",
      "error"
    );
  }
};

  // =========================
  // DOWNLOAD DOCUMENT
  // =========================
  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "document";
    link.click();
  };

  // =========================
  // STATS
  // =========================
  const stats = {
    under_review: ngos.filter(n => n.status === "under_review").length,
    approved: ngos.filter(n => n.status === "approved").length,
    rejected: ngos.filter(n => n.status === "rejected").length,
  };

  // =========================
  // TABLE
  // =========================
  const columns = [
    {
      title: "Organization",
      dataIndex: "organizationName",
    },
    {
      title: "Reg #",
      dataIndex: "registrationNumber",
    },
    {
      title: "Contact",
      render: (_, record) => (
        <>
          <div>{record.phone}</div>
          <div>{record.address}</div>
        </>
      ),
    },
    {
      title: "Documents",
      render: (_, record) => (
        <Button
          onClick={() => {
            setPreviewDocs(record.documents || []);
            setPreviewOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "approved" ? "green" :
            status === "rejected" ? "red" : "orange";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",

      render: (_, record) => (

        <Select
          value={record.status}
          style={{ width: 170 }}

          onChange={(value) =>
            handleStatusChange(record._id, value)
          }
        >

          <Select.Option value="under_review">
            Under Review
          </Select.Option>

          <Select.Option value="approved">
            Approved
          </Select.Option>

          <Select.Option value="rejected">
            Rejected
          </Select.Option>

          <Select.Option value="suspended">
            Suspended
          </Select.Option>

        </Select>
      )
    }
  ];

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
    <div>

      <Title level={2}>NGO Verification</Title>

      {/* STATS */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}><Card>Under Review: {stats.under_review}</Card></Col>
        <Col span={8}><Card>Approved: {stats.approved}</Card></Col>
        <Col span={8}><Card>Rejected: {stats.rejected}</Card></Col>
      </Row>

      {/* FILTERS */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Input
            placeholder="Search NGO..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </Col>

        <Col span={6}>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: "100%" }}>
            <Option value="">All</Option>
            <Option value="under_review">Under Review</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Col>

        <Col span={8}>
          <RangePicker
            style={{ width: "100%" }}
            onChange={(dates) => setDateRange(dates || [])}
          />
        </Col>
      </Row>

      {/* TABLE */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredNgos}
        pagination={{ pageSize: 6 }}
        scroll={{ x: 'max-content' }}
      />

      {/* MODAL */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={800}
      >
        <Space wrap>
          {previewDocs.map((doc, i) => (
            <div key={i}>
              <Image src={doc} width={200} />
              <Button onClick={() => handleDownload(doc)} block>
                Download
              </Button>
            </div>
          ))}
        </Space>
      </Modal>

    </div>
  );
};

export default NGOs;
