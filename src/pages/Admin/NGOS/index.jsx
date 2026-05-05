import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Image,
  Select,
  Spin,
  Modal,
  Input,
  Row,
  Col,
  Card,
  DatePicker
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const NGOs = () => {

  const [ngos, setNgos] = useState([]);
  const [filteredNgos, setFilteredNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("pending");
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
        `http://localhost:3000/admin/ngos`,
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
        `http://localhost:3000/admin/ngos/approve/${id}`,
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
        `http://localhost:3000/admin/ngos/reject/${id}`,
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
    pending: ngos.filter(n => n.status === "pending").length,
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
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            loading={actionLoading === record._id}
            disabled={record.status !== "pending"}
            onClick={() => handleApprove(record._id)}
          >
            Approve
          </Button>

          <Button
            danger
            loading={actionLoading === record._id}
            disabled={record.status !== "pending"}
            onClick={() => handleReject(record._id)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <div>

      <Title level={2}>NGO Verification</Title>

      {/* STATS */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}><Card>Pending: {stats.pending}</Card></Col>
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
            <Option value="pending">Pending</Option>
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