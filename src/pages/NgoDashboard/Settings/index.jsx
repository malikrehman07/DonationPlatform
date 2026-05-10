import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, Typography, message, Card, Alert } from "antd";
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

    const [latestUser, setLatestUser] = useState(null);

    // =========================
    // FETCH LATEST USER (IMPORTANT FIX)
    // =========================
    useEffect(() => {

        const fetchUser = async () => {
            try {

                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "http://localhost:5000/auth/user",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setLatestUser(res.data.user);

            } catch (err) {
                console.error("User fetch error:", err);
            }
        };

        fetchUser();

    }, []);

    const currentUser = latestUser || user;
    const status = currentUser?.status || "under_review";

    // =========================
    // STATUS RULES
    // =========================
    const isEditable =
        status === "rejected";

    const isLocked =
        status === "approved" || status === "suspended" || status === "under_review";

    // =========================
    // LOAD DATA INTO FORM
    // =========================
    useEffect(() => {

        if (currentUser) {

            form.setFieldsValue({
                name: currentUser.organizationName,
                registrationNumber: currentUser.registrationNumber,
                address: currentUser.address,
                phone: currentUser.phone,
                website: currentUser.website,
                description: currentUser.description,
            });
        }

        if (currentUser?.documents) {
            setFileList(
                currentUser.documents.map((doc, i) => ({
                    uid: i,
                    url: doc.url,
                    name: `doc-${i}`,
                    status: "done",
                }))
            );
        }

    }, [currentUser]);

    // =========================
    // SUBMIT → under_review
    // =========================
    const handleSubmit = async (values) => {

        try {
            setLoading(true);

            if (!fileList.length) {
                return message.error("Upload at least one document");
            }

            const formData = new FormData();

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("documents", file.originFileObj);
                }
            });

            formData.append("name", values.name);
            formData.append("registrationNumber", values.registrationNumber);
            formData.append("address", values.address);
            formData.append("phone", values.phone);
            formData.append("website", values.website || "");
            formData.append("description", values.description);

            // 🔥 STATUS CHANGE (NO PENDING ANYMORE)
            formData.append("status", "under_review");

            await axios.put(
                `http://localhost:5000/ngo/settings/${currentUser._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            message.success("Submitted for verification");

            await readProfile();
            navigate("/dashboard/overview");

        } catch (err) {
            console.error(err);
            message.error("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // STATUS UI
    // =========================
    const renderStatus = () => {

        switch (status) {

            case "under_review":
                return <Alert type="warning" message="Your profile is under review" showIcon />;

            case "approved":
                return <Alert type="success" message="Approved" showIcon />;

            case "rejected":
                return <Alert type="error" message="Rejected - You can update and resubmit" showIcon />;

            case "suspended":
                return <Alert type="error" message="Account Suspended" showIcon />;

            default:
                return null;
        }
    };

    return (
        <div className="container">

            <Card>

                <Title level={3} className="text-center">
                    NGO Settings
                </Title>

                {renderStatus()}

                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                    disabled={isLocked}   // 🔒 HARD LOCK
                >

                    <Form.Item label="Organization Name" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Registration Number" name="registrationNumber" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Website" name="website">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    {/* FILES */}
                    <Form.Item label="Documents">
                        <Upload
                            multiple
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            disabled={isLocked}
                        >
                            <Button icon={<UploadOutlined />} disabled={isLocked}>
                                Upload Documents
                            </Button>
                        </Upload>
                    </Form.Item>

                    {/* BUTTON LOGIC */}
                    {isEditable && (
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            Submit for Verification
                        </Button>
                    )}

                </Form>

            </Card>
        </div>
    );
};

export default Settings;