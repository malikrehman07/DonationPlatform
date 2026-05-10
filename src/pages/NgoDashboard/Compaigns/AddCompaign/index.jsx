import React, { useState } from 'react';
import {
    Typography,
    Input,
    Button,
    Card,
    Form,
    Select,
    Upload,
    Row,
    Col,
    message
} from 'antd';

import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthContext } from '../../../../context/Auth';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const initialState = {
    title: "",
    description: "",
    category: "",
    amount: ''
};

const AddCompaign = () => {

    const { user } = useAuthContext();

    const [fileList, setFileList] = useState([]);
    const [state, setState] = useState(initialState);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e) =>
        setState(s => ({ ...s, [e.target.name]: e.target.value }));

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", "givehope_uploads");

        const res = await axios.post(
            "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
            formData
        );

        return res.data.secure_url;
    };

    // =========================
    // VALIDATION
    // =========================
    const validateForm = () => {

        const { title, description, category, amount } = state;

        if (!user) {
            message.error("Login required");
            return false;
        }

        if (user.role === "Ngo" && user.status !== "approved") {
            message.error("Your NGO is not verified yet");
            return false;
        }

        if (!title || title.trim().length < 3) {
            message.error("Enter valid campaign title");
            return false;
        }

        if (!description || description.length > 500) {
            message.error("Description required (max 500 chars)");
            return false;
        }

        if (!category) {
            message.error("Select category");
            return false;
        }

        if (!amount || Number(amount) <= 0) {
            message.error("Enter valid target amount");
            return false;
        }

        if (fileList.length === 0) {
            message.error("Upload at least 1 image");
            return false;
        }

        return true;
    };

    // =========================
    // HANDLE SUBMIT
    // =========================
    const handleSubmit = async () => {

        if (!validateForm()) return;

        setIsProcessing(true);

        try {

            const compaignId = Date.now().toString();

            // =========================
            // UPLOAD IMAGES TO CLOUDINARY
            // =========================
            const imageUrls = [];

            for (const fileObj of fileList) {
                const url = await uploadToCloudinary(fileObj.originFileObj);
                imageUrls.push(url);
            }

            // =========================
            // CAMPAIGN PAYLOAD
            // =========================
            const compaignData = {
                uid: user._id,
                title: state.title.trim(),
                description: state.description.trim(),
                category: state.category,
                amount: Number(state.amount),
                compaignId,
                imageUrls,
                status: "active"
            };

            await axios.post(
                "http://localhost:5000/compaigns/add",
                compaignData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            message.success("Campaign created successfully");

            setState(initialState);
            setFileList([]);

        } catch (err) {
            console.error(err);
            message.error("Failed to create campaign");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>

            <Title level={3}>Add New Campaign</Title>

            <Card bordered={false} className="mt-3">

                <Form layout="vertical">

                    <Form.Item label="Campaign Name" required>
                        <Input
                            name="title"
                            value={state.title}
                            onChange={handleChange}
                            placeholder="e.g. Cancer Treatment Fund"
                        />
                    </Form.Item>

                    <Form.Item label="Description" required>
                        <TextArea
                            rows={4}
                            name="description"
                            value={state.description}
                            onChange={handleChange}
                            placeholder="Campaign description..."
                        />
                    </Form.Item>

                    <Row gutter={24}>

                        <Col xs={24} md={12}>
                            <Form.Item label="Category" required>
                                <Select
                                    value={state.category}
                                    onChange={(value) =>
                                        setState(s => ({ ...s, category: value }))
                                    }
                                >
                                    <Option value="health">Health</Option>
                                    <Option value="education">Education</Option>
                                    <Option value="disaster">Disaster</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Target Amount ($)" required>
                                <Input
                                    name="amount"
                                    value={state.amount}
                                    onChange={handleChange}
                                    placeholder="1000"
                                />
                            </Form.Item>
                        </Col>

                    </Row>

                    <Form.Item label="Upload Images" required>
                        <Upload
                            multiple
                            listType="picture"
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>
                                Upload Images
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Button
                        type="primary"
                        block
                        loading={isProcessing}
                        onClick={handleSubmit}
                    >
                        Create Campaign
                    </Button>

                </Form>

            </Card>

        </div>
    );
};

export default AddCompaign;