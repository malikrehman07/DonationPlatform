import React from 'react';
import { Layout, Menu, Input, Button } from 'antd';
import { BarChartOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Overview from './Overview';
import NoPage from '../Misc/NoPage';
import { useAuthContext } from '../../context/Auth';

const { Header, Sider, Content } = Layout;

const DonorDashboard = () => {
    const { handleLogout } = useAuthContext();

    const location = useLocation();

    // =========================
    // FIXED MENU ACTIVE STATE
    // =========================
    const selectedKey = location.pathname === '/donor/donations' ? '1' : '';

    return (
        <Layout>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                className="custom-sider"
            >
                <div className="logo text-center py-4 fw-bold text-black">
                    <b className='text-primary'>Give</b>Hope
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    className="menu-light"
                >
                    <Menu.Item key="1" icon={<BarChartOutlined />}>
                        <Link to="/donor/donations">Donations</Link>
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout>
                <Header className="topbar d-flex justify-content-between align-items-center px-4">
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Search..."
                        style={{ width: 300 }}
                    />

                    <div className="d-flex align-items-center">
                        {/* FIX: no crash if logout not defined */}
                        <Button
                            type="primary"
                            variant="solid"
                            htmlType="button"
                            onClick={() => {
                                handleLogout();
                            }}
                        >
                            Logout
                        </Button>
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