import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import NGOs from './NGOs';
import { useAuthContext } from '../../context/Auth';
import Overview from './Overview';
import Donations from './Donations';
import Donors from './Donors';

const { Header, Sider, Content } = Layout;

const Admin = () => {
  const { handleLogout } = useAuthContext();
  const location = useLocation();

  const getSelectedKey = () => {
        if (location.pathname.includes('/overview')) return '1';
        if (location.pathname.includes('/ngos')) return '2';
        if (location.pathname.includes('/donations')) return '3';
        if (location.pathname.includes('/donors')) return '4';
        return '';
    };

    const selectedKey = getSelectedKey();

  return (
    <Layout>
      <Sider collapsedWidth="0">
        <div className="logo text-center py-3 text-white">
          <b>Admin Panel</b>
        </div>

        <Menu mode="inline" selectedKeys={[getSelectedKey()]}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/admin/overview">Overview</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<CheckCircleOutlined />}>
            <Link to="/admin/ngos">NGO Verification</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<CheckCircleOutlined />}>
            <Link to="/admin/donations">Donations</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<CheckCircleOutlined />}>
            <Link to="/admin/donors">Donors</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="d-flex justify-content-end">
          <Button type="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Header>

        <Content style={{ padding: 20 }}>
          <Routes>
            <Route path="/overview" element={<Overview />} />
            <Route path="/ngos" element={<NGOs />} />
            <Route path="/donations" element={<Donations/>} />
            <Route path="/donors" element={<Donors />} />
          </Routes>

          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;