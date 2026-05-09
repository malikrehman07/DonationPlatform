import { Button, Space } from 'antd'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/Auth'
import { UserOutlined } from '@ant-design/icons';

const Header = () => {
    const { isAuth, user } = useAuthContext()
    return (
        <nav className="navbar navbar-expand-lg bg-primary navbar-dark">
            <div className="container">
                <Link to='/' className="navbar-brand"><b>Give</b>Hope</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/" className="nav-link active" aria-current="page">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/compaigns" className="nav-link active" aria-current="page">Compaign</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about" className="nav-link active" aria-current="page">About</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/contact" className="nav-link active" aria-current="page">Contact</Link>
                        </li>
                    </ul>
                    <div>
                        {!isAuth ? (
                            <Link to="/auth/register">
                                <UserOutlined style={{ fontSize: 22, color: "white" }} />
                            </Link>
                        ) : user?.role === "ngo" ? (
                            <Link to="/dashboard/overview">
                                <UserOutlined style={{ fontSize: 22, color: "white" }} />
                            </Link>
                        ) : user?.role === "Admin" ? (
                            <Link to="/admin/overview">
                                <UserOutlined style={{ fontSize: 22, color: "white" }} />
                            </Link>
                        ) : (
                            <Link to="/auth/login">
                                <UserOutlined style={{ fontSize: 22, color: "white" }} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Header