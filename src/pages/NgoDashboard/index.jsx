// DashboardLayout.js
import React from 'react';
import { Layout, Menu, Input, Button, Dropdown } from 'antd';
import { AppstoreOutlined, BarChartOutlined, CreditCardOutlined, SearchOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Overview from './Overview';
import { useAuthContext } from '../../context/Auth';
import Compaigns from './Compaigns';
import Donors from './Donors';
import Donations from './Donations';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Search } = Input;
const NGODashboard = () => {
    const { handleLogout } = useAuthContext()
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    
    
    const pathKeyMap = {
        '/dashboard/overview': '1',
        '/dashboard/compaign/*': '2',
        '/dashboard/donations': '3',
        '/dashboard/donors': '4',
    };
    const selectedKey = location.pathname.includes(pathKeyMap) // Adjust logic as needed
    
    // useEffect(() => {
    //     if (!searchQuery) {
    //         setResults([]);
    //         return;
    //     }

    //     const timer = setTimeout(async () => {
    //         setLoading(true);
    //         try {
    //             const res = await axios.get(`https://backend-theta-silk-38.vercel.app/compaigns/search?query=${searchQuery}`);
    //             setResults(res.data.compaigns || []);
    //         } catch (err) {
    //             console.error("Search error:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }, 300); // debounce

    //     return () => clearTimeout(timer);
    // }, [searchQuery]);

    const searchMenu = (
        <Menu>
            {results.length === 0 && searchQuery && !loading ? (
                <Menu.Item key="no-result">No results found</Menu.Item>
            ) : (
                results.map(c => (
                    <Menu.Item key={c._id} onClick={() => setResults([])}>
                        <Link to={`/dashboard/compaign/all?highlight=${c._id}`} onClick={() => setResults([])}>{c.title}</Link>
                    </Menu.Item>
                ))
            )}
        </Menu>
    );
    return (
        <Layout>
            <Sider breakpoint="lg" collapsedWidth="0" onBreakpoint={broken => { console.log(broken); }} onCollapse={(collapsed, type) => { console.log(collapsed, type); }} className="custom-sider">
                <div className="logo text-center py-4 fw-bold text-black"><b className='text-primary' >Give</b>Hope</div>
                <Menu mode="inline"
                    selectedKeys={[pathKeyMap[selectedKey]]}
                    className="menu-light">
                    <Menu.Item key="1" icon={<BarChartOutlined />}>
                        <Link to="/dashboard/overview">Overview</Link>
                    </Menu.Item>
                    <SubMenu key="2" icon={<AppstoreOutlined />} title="Compaign">
                        <Menu.Item key="2-1">
                            <Link to="/dashboard/compaign/all">Manage Compaign</Link>
                        </Menu.Item>
                        <Menu.Item key="2-2">
                            <Link to="/dashboard/compaign/add">Add Compaign</Link>
                        </Menu.Item>
                    </SubMenu>
                    <Menu.Item key="3" icon={<CreditCardOutlined />}>
                        <Link to="/dashboard/donations">Donations</Link>
                    </Menu.Item>
                    <Menu.Item key="4" icon={<UserOutlined />}>
                        <Link to="/dashboard/donors">Donors</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header className="topbar d-flex justify-content-between align-items-center px-4">
                    <Dropdown overlay={searchMenu} trigger={['click']} visible={results.length > 0}>
                        <Search
                            prefix={<SearchOutlined />}
                            placeholder="Search campaigns..."
                            style={{ width: 300 }}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            loading={loading}
                        />
                    </Dropdown>
                    <div className="d-flex align-items-center">
                        <Button type="primary" variant='solid' htmlType="submit" onClick={handleLogout}>Logout</Button>
                    </div>
                </Header>

                <Content className="dashboard-content px-4 py-4">
                    <Routes>
                        <Route path='/overview' element={<Overview />} />
                        <Route path='/compaign/*' element={<Compaigns />} />
                        <Route path='/donations' element={<Donations />} />
                        <Route path='/donors' element={<Donors />} />
                    </Routes>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default NGODashboard;
