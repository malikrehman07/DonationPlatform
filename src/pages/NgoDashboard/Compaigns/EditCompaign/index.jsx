import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Row,
  Col,
  Spin
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const EditCompaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH CAMPAIGN
  // =========================
  const fetchCompaign = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/compaigns/read/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = res.data.compaign;

      form.setFieldsValue({
        title: data.title,
        description: data.description,
        category: data.category,
        amount: data.targetAmount
      });

      // preview images
      if (data.images?.length) {
        const previews = data.images.map((url, i) => ({
          uid: `${i}`,
          name: `image-${i}`,
          status: "done",
          url
        }));

        setFileList(previews);
      }

    } catch (err) {
      console.error(err);
      window.notify?.("Failed to load campaign", "error");
      navigate("/dashboard/compaign/all");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompaign();
  }, [id]);

  // =========================
  // HANDLE FILE CHANGE
  // =========================
  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // =========================
  // UPDATE CAMPAIGN
  // =========================
  const handleUpdate = async () => {
    try {
      setIsProcessing(true);

      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("targetAmount", values.amount); // Fix: Send targetAmount to backend

      // keep existing images + new ones
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        } else {
          formData.append("existingImages", file.url);
        }
      });

      await axios.put(
        `http://localhost:5000/compaigns/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      window.notify?.("Campaign updated successfully", "success");
      navigate("/dashboard/compaign/all");

    } catch (err) {
      console.error(err);
      window.notify?.("Update failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <Title level={3}>Edit Campaign</Title>

      <Form layout="vertical" form={form}>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true }]}
        >
          <Input placeholder="Campaign title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="health">Health</Option>
                <Option value="education">Education</Option>
                <Option value="disaster">Disaster</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="amount"
              label="Target Amount (MATIC)"
              rules={[{ required: true }]}
              extra="Target amount cannot be changed once the campaign is on the blockchain."
            >
              <Input type="number" disabled />
            </Form.Item>
          </Col>
        </Row>

        {/* =========================
            IMAGES (Cloudinary via backend)
        ========================= */}
        <Form.Item label="Images">
          <Upload
            listType="picture"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            maxCount={3}
          >
            <Button icon={<UploadOutlined />}>
              Upload Images
            </Button>
          </Upload>
        </Form.Item>

        <Button
          type="primary"
          loading={isProcessing}
          onClick={handleUpdate}
        >
          Update Campaign
        </Button>

      </Form>
    </div>
  );
};

export default EditCompaign;