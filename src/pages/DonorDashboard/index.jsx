// DashboardLayout.js
import React from 'react';
import { Layout, Menu, Input, Button } from 'antd';
import { BarChartOutlined, EnvironmentOutlined, SearchOutlined, SettingOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Overview from './Overview'
// import { useAuthContext } from '../../context/Auth';
import NoPage from '../Misc/NoPage';

const { Header, Sider, Content } = Layout;
const DonorDashboard = () => {
    // const { handleLogout } = useAuthContext()

    const pathKeyMap = {
        '/donor/donations': '1',
    };

    const location = useLocation();
    const selectedKey = location.pathname.includes(pathKeyMap) // Adjust logic as needed

    return (
        <Layout>
            <Sider breakpoint="lg" collapsedWidth="0" onBreakpoint={broken => { console.log(broken); }} onCollapse={(collapsed, type) => { console.log(collapsed, type); }} className="custom-sider">
                <div className="logo text-center py-4 fw-bold text-black"><b className='text-primary' >Give</b>Hope</div>
                <Menu mode="inline" selectedKeys={[selectedKey]} className="menu-light">
                    <Menu.Item key="1" icon={<BarChartOutlined />}>
                        <Link to="/donor/donations">Donations</Link>
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout>
                <Header className="topbar d-flex justify-content-between align-items-center px-4">
                    <Input prefix={<SearchOutlined />} placeholder="Search..." style={{ width: 300 }} />
                    <div className="d-flex align-items-center">
                        <Button type="primary" variant='solid' htmlType="submit" onClick={handleLogout}>Logout</Button>
                    </div>
                </Header>

                <Content className="dashboard-content px-4 py-4">
                    <Routes>
                        <Route path='/donations' element={<Overview />} />
                        <Route path='*' element={<NoPage />} />
                    </Routes>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DonorDashboard;
