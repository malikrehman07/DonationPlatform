import React, { useState } from 'react';
import { Typography, Input, Button, Card, Form, Select, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../../../context/Auth';
import { supabase } from '../../../../config/supabase';
import axios from 'axios';
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const initialState = { title: "", description: "", category: "", amount: '' }
const AddCompaign = () => {
    const { user } = useAuthContext()
    const [fileList, setFileList] = useState([])
    const [state, setState] = useState(initialState)
    const [isProccessing, setIsProccessing] = useState(false)

    const handleChange = (e) => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault();

        let { title, description, category, amount } = state;

        title = title.trim();
        if (title.length < 3) { return window.notify("Please Enter the Product Title", "error") }


        description = description.trim();
        if (description.length > 500 || description == "") { return window.notify("Description must be provided and no more than 500 characters", "error"); }


        if (category == "") { return window.notify("Please Select the Category", "error") }


        if (fileList.length === 0 || fileList.length > 5) { return window.notify("Please upload between 1 and 5 images", "error") }

        setIsProccessing(true)
        const compaignId = getRandomId();
        const imageUrls = [];

        for (let fileObj of fileList) {
            const file = fileObj.originFileObj;
            const url = await handleUploadFile(file, compaignId); // use Date.now() as product ID base
            if (url) imageUrls.push(url);
        }

        if (imageUrls.length === 0) {
            return window.notify("Image upload failed", "error");
        }


        const compaignData = { uid: user.uid, title, description, category, amount, imageUrls };

        try {
            const token = localStorage.getItem("token");
            console.log("Token:", token);
            const res = await axios.post("https://backend-theta-silk-38.vercel.app/compaigns/add", compaignData, {
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ Must be "Bearer <token>"
                }
            });
            window.notify("Compaign added successfully!", "success");
            setState(initialState);
            setFileList([]);
        } catch (error) {
            console.error("Add Compaign Error:", error); // Log full error
            const msg = error?.response?.data?.message || "Failed to add Compaign";
            window.notify(msg, "error");
        } finally {
            setIsProccessing(false);
        }

    }
    const handleUploadFile = async (file, compaignId) => {
        // const id = getRandomId()
        const fileExt = file.name.split('.').pop();
        const filePath = `compaigns/${compaignId}/${Date.now()}.${fileExt}`; // removed extra spaces

        const { data, error } = await supabase.storage.from('GiveHope').upload(filePath, file);

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage.from('GiveHope').getPublicUrl(filePath);

        return publicUrlData?.publicUrl || null;
    };

    return (
        <div className="">
            <Title level={3}>Add New Compaign</Title>
            <Card bordered={false} className="mt-3">
                <Form layout="vertical">
                    <Form.Item label="Compaign Name" required >
                        <Input type='text' name="title" placeholder="e.g. Cancer Treatment Fundraiser" value={state.title} onChange={handleChange} />
                    </Form.Item>

                    <Form.Item label="Description" required>
                        <TextArea name="description" rows={4} placeholder="Compaign description here..." value={state.description} onChange={handleChange} />
                    </Form.Item>
                    <Row gutter={24} align="middle" className='mb-3'>
                        <Col xs={24} sm={24} md={12} lg={12}>
                            <Form.Item label="Category" required >
                                <Select name="category" placeholder="Select category" onChange={(value) => setState(s => ({ ...s, category: value }))} value={state.category} >
                                    <Option value="health">health</Option>
                                    <Option value="education">education</Option>
                                    <Option value="disaster">disaster</Option>
                                    <Option value="other">other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12}>
                            <Form.Item label="Price" required>
                                <Input name="amount" placeholder="$90" value={state.amount} onChange={handleChange} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="images" label="Upload Images" required >
                        <Upload name="image" listType="picture" beforeUpload={() => false} multiple fileList={fileList} onChange={({ fileList = [] }) => setFileList([...fileList])} maxCount={2}>
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" color='default' variant='solid' htmlType="submit" loading={isProccessing} onClick={handleSubmit}>Add Compaign</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}


export default AddCompaign;
