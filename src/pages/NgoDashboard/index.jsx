import React, { useEffect, useState } from 'react';
import { Layout, Menu, Input, Button, Dropdown, Spin } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CreditCardOutlined,
    SearchOutlined,
    UserOutlined,
    SettingOutlined
} from '@ant-design/icons';
import {
    Link,
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate
} from 'react-router-dom';

import Overview from './Overview';
import Compaigns from './Compaigns';
import Donors from './Donors';
import Donations from './Donations';
import Settings from './Settings'; // ✅ NEW PAGE

import { useAuthContext } from '../../context/Auth';
import axios from 'axios';
import Payouts from './Payouts';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Search } = Input;

const NgoDashboard = () => {

    const { handleLogout, user, isAppLoading } = useAuthContext();
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const location = useLocation();

    // =========================
    // 🔐 ONBOARDING GUARD
    // =========================
    useEffect(() => {
        if (!isAppLoading && user) {

            if (user.role === "Ngo") {

                // ❌ rejected NGO → block access
                if (user.status === "rejected" || user.status === "under_review" || user.status === "suspended") {
                    navigate("/dashboard/settings");
                }
            }
        }
    }, [user, isAppLoading, navigate]);

    // =========================
    // MENU SELECTION
    // =========================
    const getSelectedKey = () => {
        if (location.pathname.includes('/overview')) return '1';
        if (location.pathname.includes('/compaign')) return '2';
        if (location.pathname.includes('/donations')) return '3';
        if (location.pathname.includes('/donors')) return '4';
        if (location.pathname.includes('/settings')) return '5';
        if (location.pathname.includes('/payouts')) return '6';
        return '';
    };

    const selectedKey = getSelectedKey();

    // =========================
    // SEARCH LOGIC
    // =========================
    useEffect(() => {
        if (!searchQuery) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `http://localhost:5000/compaigns/search?query=${searchQuery}`
                );
                setResults(res.data.compaigns || []);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchMenu = (
        <Menu>
            {results.length === 0 && searchQuery && !loading ? (
                <Menu.Item key="no-result">
                    No results found
                </Menu.Item>
            ) : (
                results.map(c => (
                    <Menu.Item key={c._id} onClick={() => setResults([])}>
                        <Link to={`/dashboard/compaign/all?highlight=${c._id}`}>
                            {c.title}
                        </Link>
                    </Menu.Item>
                ))
            )}
        </Menu>
    );

    // =========================
    // LOADING STATE
    // =========================
    if (isAppLoading || !user) {
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout>

            {/* SIDEBAR */}
            <Sider breakpoint="lg" collapsedWidth="0" className="custom-sider">

                <div className="logo text-center py-4 fw-bold text-black">
                    <b className='text-primary'>Give</b>Hope
                </div>

                <Menu mode="inline" selectedKeys={[selectedKey]} className="menu-light">

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

                    {/* ========================= */}
                    {/* SETTINGS (NEW REQUIRED) */}
                    {/* ========================= */}
                    <Menu.Item key="5" icon={<SettingOutlined />}>
                        <Link to="/dashboard/settings">Settings</Link>
                    </Menu.Item>
                    <Menu.Item key="6" icon={<CreditCardOutlined />}>
                        <Link to="/dashboard/payouts">Payouts</Link>
                    </Menu.Item>

                </Menu>
            </Sider>

            {/* MAIN */}
            <Layout>

                <Header className="topbar d-flex justify-content-between align-items-center px-4">

                    <Dropdown overlay={searchMenu} trigger={['click']} open={results.length > 0}>
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
                        <Button type="primary" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>

                </Header>

                <Content className="dashboard-content px-4 py-4">

                    <Routes>
                        <Route path='/overview' element={<Overview />} />
                        <Route path='/compaign/*' element={<Compaigns />} />
                        <Route path='/donations' element={<Donations />} />
                        <Route path='/donors' element={<Donors />} />
                        <Route path='/payouts' element={<Payouts />} />
                        {/* ========================= */}
                        {/* SETTINGS ROUTE */}
                        {/* ========================= */}
                        <Route path='/settings' element={<Settings />} />
                    </Routes>

                    <Outlet />

                </Content>

            </Layout>
        </Layout>
    );
};

export default NgoDashboard;