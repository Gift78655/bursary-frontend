import React from 'react';
import { Card, Row, Col, Alert, Button } from 'react-bootstrap';
import {
  FaHome, FaGraduationCap, FaSearch, FaEnvelopeOpenText, FaRegLightbulb
} from 'react-icons/fa';

export default function DashboardHome() {
  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0 rounded-4 p-4 bg-light">
        <div className="d-flex align-items-center mb-3">
          <FaHome size={28} className="me-2 text-primary" />
          <h3 className="mb-0 fw-bold">Welcome to Your Student Dashboard</h3>
        </div>
        <hr className="mb-4" />

        <p className="fs-5 text-muted">
          This is your personal hub for managing bursary opportunities. From here, you can:
        </p>

        <ul className="fs-6 text-muted mb-4">
          <li>🔍 Explore open bursaries aligned with your field of study</li>
          <li>🎓 Track your bursary applications and view their status</li>
          <li>📬 Stay updated with direct messages from administrators</li>
        </ul>

        <Row className="g-4">
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <FaSearch size={30} className="text-info mb-2" />
              <h5 className="fw-semibold">Explore Bursaries</h5>
              <p className="text-muted mb-0">Find bursaries that match your goals</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <FaGraduationCap size={30} className="text-success mb-2" />
              <h5 className="fw-semibold">Your Applications</h5>
              <p className="text-muted mb-0">Track the status of your submissions</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 p-3 bg-white h-100">
              <FaEnvelopeOpenText size={30} className="text-warning mb-2" />
              <h5 className="fw-semibold">Messages & Updates</h5>
              <p className="text-muted mb-0">Stay informed through direct messages</p>
            </Card>
          </Col>
        </Row>

        <Alert variant="info" className="mt-5 rounded-3 d-flex align-items-start shadow-sm">
          <FaRegLightbulb className="me-3 text-warning mt-1" size={20} />
          <div>
            <strong>Pro Tip:</strong> Always double-check your eligibility before applying. Prepare and verify all required documents in advance to ensure a smooth application process.
          </div>
        </Alert>

        <div className="text-end">
          <Button variant="outline-secondary" size="sm" disabled>
            Last synced: Just now
          </Button>
        </div>
      </Card>
    </div>
  );
}
