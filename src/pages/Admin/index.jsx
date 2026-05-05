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

const { Header, Sider, Content } = Layout;

const Admin = () => {
  const { handleLogout } = useAuthContext();
  const location = useLocation();

  const getSelectedKey = () => {
    if (location.pathname.includes('/admin/ngos')) return '1';
    return '';
  };

  return (
    <Layout>
      <Sider collapsedWidth="0">
        <div className="logo text-center py-3 text-white">
          <b>Admin Panel</b>
        </div>

        <Menu mode="inline" selectedKeys={[getSelectedKey()]}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link to="/admin/ngos">NGO Verification</Link>
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
            <Route path="/ngos" element={<NGOs />} />
          </Routes>

          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;