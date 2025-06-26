import React from 'react';
import { Card, Row, Col, Alert, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  FaTachometerAlt, FaRegLightbulb, FaTools,
  FaUserGraduate, FaFileAlt, FaEnvelope, FaSyncAlt
} from 'react-icons/fa';

export default function DashboardHome() {
  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0 rounded-4 p-4 bg-light">
        <div className="d-flex align-items-center mb-3">
          <FaTachometerAlt size={28} className="me-2 text-primary" />
          <h3 className="mb-0 fw-bold">Welcome to the Admin Dashboard</h3>
        </div>
        <hr />

        <p className="fs-5 text-muted">
          This is your central control panel for the bursary system. Use the navigation tabs to manage listings,
          track applicants, communicate with students, and update your profile settings.
        </p>

        <Row className="mt-4">
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaFileAlt size={32} className="text-info mb-2" />
              <h5>Bursaries Posted</h5>
              <p className="fs-6 text-muted">Create and manage opportunities</p>
              <div className="fs-4 fw-semibold text-dark">–</div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaUserGraduate size={32} className="text-success mb-2" />
              <h5>Applications Received</h5>
              <p className="fs-6 text-muted">Monitor applicant activity</p>
              <div className="fs-4 fw-semibold text-dark">–</div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaEnvelope size={32} className="text-danger mb-2" />
              <h5>Unread Messages</h5>
              <p className="fs-6 text-muted">Check for student queries</p>
              <div className="fs-4 fw-semibold text-dark">–</div>
            </Card>
          </Col>
        </Row>

        <Alert variant="info" className="mt-4 rounded-3 d-flex align-items-start">
          <FaRegLightbulb className="me-2 text-warning mt-1" />
          <div>
            <strong>Tip:</strong> Keep your listings clear and up to date. Add closing dates and contact information to improve applicant experience. A transparent process builds trust.
          </div>
        </Alert>

        <div className="mt-2">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Reload this dashboard view</Tooltip>}
          >
            <Button variant="outline-secondary" size="sm" disabled>
              <FaSyncAlt className="me-1" /> Refresh
            </Button>
          </OverlayTrigger>
        </div>
      </Card>
    </div>
  );
}
