import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Form, Input, Button, Select, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../../../config/supabase';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const EditCompaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);


  const fetchCompaigns = async () => {
    try {
      const res = await axios.get(`https://backend-theta-silk-38.vercel.app/compaigns/read/${id}`);
      const data = res.data.compaign;
      form.setFieldsValue(data);

      if (data.imageUrls?.length) {
        const previewList = data.imageUrls.map((url, index) => ({
          uid: `${index}`,
          name: `image-${index + 1}`,
          status: 'done',
          url,
        }));
        setFileList(previewList);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      window.notify("Failed to fetch Compaign", "error");
      navigate("/dashboard/compaign/all");
    }
  };

  const handleRemove = async (file) => {
    try {
      const url = file.url || file.response?.url;
      if (!url) return;

      const path = new URL(url).pathname.split("/storage/v1/object/public/Compaign/")[1];

      if (path) {
        const { error } = await supabase.storage.from("Compaign").remove([path]);
        if (error) {
          console.error("Failed to delete from Supabase:", error.message);
          window.notify("Failed to delete image", "error");
        } else {
          window.notify("Image removed from Supabase", "success");
        }
      }
    } catch (err) {
      console.error("Remove error:", err);
    }
  };



  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setIsProcessing(true);

      let imageUrls = [];

      for (let fileObj of fileList) {
        const file = fileObj.originFileObj;

        if (!file) {
          if (fileObj.url) imageUrls.push(fileObj.url);
          continue;
        }
        const fileExt = file.name?.split('.').pop();
        const filePath = `compaigns/${id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('GiveHope')
          .upload(filePath, file);

        if (uploadError) {
          console.warn("Upload error:", uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("GiveHope")
          .getPublicUrl(filePath);
        imageUrls.push(publicUrlData?.publicUrl);
      }

      const token = localStorage.getItem("token");

      await axios.put(`https://backend-theta-silk-38.vercel.app/compaigns/update/${id}`, {
        ...values,
        imageUrls,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      window.notify("Compaign updated successfully!", "success");
      navigate("/dashboard/compaign/all");
    } catch (err) {
      if (err.response) {
        console.error("Server error:", err.response.data);
        window.notify(err.response.data.message || "Server Error", "error");
      } else {
        console.error("Client error:", err.message);
        window.notify("Network or client error", "error");
      }

    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    fetchCompaigns();
  }, [id]);

  return (
    <div className="dashboard-content">
      <Title level={3}>Edit Compaign</Title>
      <Form layout="vertical" form={form} >
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter compaign title' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter compaign description' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Row gutter={24} align="middle" className='mb-3'>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
              <Select>
                <Option value="health">health</Option>
                <Option value="education">education</Option>
                <Option value="disaster">disaster</Option>
                <Option value="other">other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter compaign amount' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Upload New Images (optional)">
          <Upload beforeUpload={() => false} listType="picture" fileList={fileList} onChange={({ fileList }) => setFileList([...fileList])} onRemove={handleRemove} maxCount={2}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleUpdate} htmlType='submit' color='default' variant='solid' loading={isProcessing}>Update Compaign</Button>
        </Form.Item>
      </Form>
    </div>
  )
};

export default EditCompaign;
