import { Col, Row } from 'antd'
import React from 'react'

const Copyright = () => {
    const year = new Date().getFullYear()
  return (
    <div className="container">
        <Row>
            <Col span={24} >
            <p className="text-center text-black mb-1" >&copy;{year}. All Rights Reserved.</p>
            </Col>
        </Row>
    </div>
  )
}

export default Copyright