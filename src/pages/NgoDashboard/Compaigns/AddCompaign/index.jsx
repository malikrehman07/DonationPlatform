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
import { ethers } from 'ethers';
import { useAuthContext } from '../../../../context/Auth';
import { getContract, CONTRACT_ADDRESS } from '../../../../blockchain/config';

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

        if (!user.walletAddress) {
            message.error("Please link your wallet in the Payout section before creating a campaign");
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

        if (!window.ethereum) {
            message.error("Please install MetaMask to create a campaign");
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
            // =========================
            // 1. SMART CONTRACT CREATION
            // =========================
            message.loading({ content: "Please confirm transaction in MetaMask...", key: "tx" });
            
            const contract = await getContract();
            
            // Amount in wei
            const targetInWei = ethers.parseEther(state.amount.toString());

            // If MetaMask gas estimation fails, you can optionally set gas limit
            // const tx = await contract.createCampaign(state.title.trim(), state.description.trim(), targetInWei, { gasLimit: 500000 });
            
            // Polygon Amoy specific gas overrides to fix "transaction gas price below minimum"
            // Hardcoding to 30/40 gwei to bypass getFeeData() throwing "eth_maxPriorityFeePerGas not available"
            const tx = await contract.createCampaign(
                state.title.trim(),
                state.description.trim(),
                targetInWei,
                {
                    maxPriorityFeePerGas: ethers.parseUnits("40", "gwei"),
                    maxFeePerGas: ethers.parseUnits("60", "gwei")
                }
            );

            message.loading({ content: "Waiting for blockchain confirmation...", key: "tx" });
            const receipt = await tx.wait();

            // Extract CampaignCreated event to get blockchainCampaignId
            let blockchainCampaignId = null;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog.name === "CampaignCreated") {
                        blockchainCampaignId = Number(parsedLog.args.campaignId);
                        break;
                    }
                } catch (e) {
                    // Ignore logs that aren't from our contract interface
                }
            }

            if (!blockchainCampaignId) {
                // Fallback if event parsing fails
                blockchainCampaignId = Date.now(); 
                console.warn("Could not find CampaignCreated event, using fallback ID");
            }

            message.success({ content: "Blockchain creation successful!", key: "tx" });

            // =========================
            // 2. BACKEND CREATION (MULTER)
            // =========================
            message.loading({ content: "Uploading images and saving...", key: "db" });

            const formData = new FormData();
            formData.append("blockchainCampaignId", blockchainCampaignId);
            formData.append("contractAddress", CONTRACT_ADDRESS);
            formData.append("ngoWallet", user.walletAddress || "0x"); 
            formData.append("title", state.title.trim());
            formData.append("description", state.description.trim());
            formData.append("category", state.category);
            formData.append("targetAmount", state.amount);

            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append("images", file.originFileObj);
                }
            });

            await axios.post(
                "http://localhost:5000/compaigns/add",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            message.success({ content: "Campaign fully created!", key: "db" });

            setState(initialState);
            setFileList([]);

        } catch (err) {
            console.error(err);
            if (err.code === "ACTION_REJECTED") {
                message.error({ content: "Transaction rejected in MetaMask", key: "tx" });
            } else {
                message.error({ content: err.reason || "Failed to create campaign", key: "tx" });
                message.error({ content: "Error details: " + err.message, key: "db" });
            }
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
                            <Form.Item label="Target Amount (MATIC)" required>
                                <Input
                                    type="number"
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
                        Create Campaign (Blockchain & DB)
                    </Button>

                </Form>

            </Card>

        </div>
    );
};

export default AddCompaign;