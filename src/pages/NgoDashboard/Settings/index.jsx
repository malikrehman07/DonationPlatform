import React, { useState } from "react";
import { Form, Input, Button, Upload, Typography, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/Auth";

const { Title } = Typography;

const Settings = () => {

    const { user, readProfile } = useAuthContext();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const [form] = Form.useForm();

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "givehope_uploads"); // your preset

        const res = await axios.post(
            "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload",
            data
        );

        return {
            url: res.data.secure_url,
            public_id: res.data.public_id
        };
    };

    // =========================
    // SUBMIT SETTINGS
    // =========================
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            if (!fileList.length) {
                return message.error("Please upload at least one document");
            }

            // upload all documents to cloudinary
            const uploadedDocs = [];

            for (const fileObj of fileList) {
                const uploaded = await uploadToCloudinary(fileObj.originFileObj);
                uploadedDocs.push({
                    type: "official_document",
                    url: uploaded.url,
                    public_id: uploaded.public_id
                });
            }

            const payload = {
                organization: {
                    name: values.name,
                    registrationNumber: values.registrationNumber,
                    address: values.address,
                    phone: values.phone,
                    website: values.website,
                    description: values.description
                },
                documents: uploadedDocs,
                status: "pending",
                organizationCompleted: true
            };

            await axios.put(
                `http://localhost:5000/ngo/settings/${user._id}`,
                payload
            );

            message.success("Profile submitted for verification");

            // refresh auth profile so dashboard guard updates
            await readProfile();

            navigate("/dashboard/overview");

        } catch (err) {
            console.error(err);
            message.error("Failed to submit settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">

            <Card style={{ maxWidth: 700, margin: "auto" }}>

                <Title level={3} className="text-center">
                    NGO Organization Settings
                </Title>

                <p style={{ textAlign: "center", color: "gray" }}>
                    Complete your profile to get verified
                </p>

                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                >

                    <Form.Item
                        label="Organization Name"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Enter organization name" />
                    </Form.Item>

                    <Form.Item
                        label="Registration Number"
                        name="registrationNumber"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="NGO registration number" />
                    </Form.Item>

                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Organization address" />
                    </Form.Item>

                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Contact number" />
                    </Form.Item>

                    <Form.Item label="Website" name="website">
                        <Input placeholder="Optional website URL" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={4} placeholder="About your NGO" />
                    </Form.Item>

                    {/* ========================= */}
                    {/* DOCUMENT UPLOAD */}
                    {/* ========================= */}
                    <Form.Item label="Upload Official Documents (PDF/Image)">
                        <Upload
                            multiple
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>
                                Upload Documents
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                    >
                        Submit for Verification
                    </Button>

                </Form>
            </Card>
        </div>
    );
};

export default Settings;