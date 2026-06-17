import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Divider } from "antd";
import { MailOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuthContext } from "../../../context/Auth";

const { Title, Paragraph } = Typography;

const Settings = () => {
  const { user, readProfile } = useAuthContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Set initial form values when user is loaded
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    const { email, password, oldPassword, confirmPassword } = values;

    if (email && !window.isEmail(email)) {
      return window.notify("Please enter a valid email address", "error");
    }

    if (!oldPassword) {
      return window.notify("Please enter your current password to save changes", "error");
    }

    if (password) {
      if (password.length < 8) {
        return window.notify("Password must be at least 8 characters long", "error");
      }
      if (password !== confirmPassword) {
        return window.notify("Passwords do not match", "error");
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { email, oldPassword };
      if (password) {
        payload.password = password;
      }

      const res = await axios.put(
        "https://apigivehopes.vercel.app/auth/update-profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.notify("Profile updated successfully", "success");
      
      // Update Auth context and reset password fields
      await readProfile();
      form.setFieldsValue({
        oldPassword: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      window.notify(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 0" }}>
      <Card
        className="shadow-sm"
        style={{ borderRadius: "12px", border: "1px solid #e0e0e0" }}
      >
        <div className="text-center mb-4">
          <Title level={3} style={{ color: "#07887f", margin: 0 }}>
            Account Settings
          </Title>
          <Paragraph className="text-muted">
            Update your administrator email and account password.
          </Paragraph>
        </div>

        <Divider />

        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          {/* EMAIL */}
          <Form.Item
            label="Admin Email Address"
            name="email"
            rules={[
              { required: true, message: "Email address is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-muted" />}
              placeholder="admin@givehope.com"
              size="large"
            />
          </Form.Item>

          <Divider style={{ margin: "24px 0 12px 0" }} />
          <Paragraph style={{ fontWeight: 600, color: "#07887f", marginBottom: "16px" }}>
            Change Password (Leave blank to keep current password)
          </Paragraph>

          {/* OLD PASSWORD */}
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your current password to save changes" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-muted" />}
              placeholder="Enter your current password to authorize changes"
              size="large"
            />
          </Form.Item>

          {/* PASSWORD */}
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { min: 8, message: "Password must be at least 8 characters" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-muted" />}
              placeholder="Enter at least 8 characters"
              size="large"
            />
          </Form.Item>

          {/* CONFIRM PASSWORD */}
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-muted" />}
              placeholder="Re-enter your new password"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                backgroundColor: "#07887f",
                borderColor: "#07887f",
                height: "48px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Save Profile Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
