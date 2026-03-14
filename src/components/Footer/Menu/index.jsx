import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Col, Flex, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;
const Menu = () => {
    return (
        <div className='container py-5'>
            <Row gutter={[18, 18]} >
                <Col xs={12} sm={12} md={6} lg={6} >
                    <Title level={2} ><span className='text-primary m-0' >Give</span>Hope</Title>
                    <Paragraph style={{ fontSize: '17px' }} >Together with Give Hope Foundation, You Share Hope and Healing</Paragraph>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} >
                    <Title level={4} >Useful Links</Title>
                    <Link to='/about' className="nav-link py-1" >About Us</Link>
                    <Link to='/' className="nav-link py-1" >Events</Link>
                    <Link to='/' className="nav-link py-1" >Blog</Link>
                    <Link to='/' className="nav-link py-1" >FAQ</Link>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} >
                    <Title level={4} >Main Menu</Title>
                    <Link to='/' className="nav-link py-1" >Home</Link>
                    <Link to='/' className="nav-link py-1" >Offers</Link>
                    <Link to='/compaigns' className="nav-link py-1" >Compaign</Link>
                    <Link to='/' className="nav-link py-1" >Reservation</Link>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} >
                    <Title level={4} >Contact Us</Title>
                    <Paragraph>contact@malikrehman.xyz</Paragraph>
                    <Paragraph>+64 958 248 966</Paragraph>
                    <Paragraph><Flex gap="middle" align="center">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebookF size={20} color="#1877F2" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <FaTwitter size={20} color="#1DA1F2" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram size={20} color="#E1306C" />
                        </a>
                    </Flex></Paragraph>
                </Col>
            </Row>
        </div>
    )
}

export default Menu
