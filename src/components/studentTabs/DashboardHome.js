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
        <hr />

        <p className="fs-5 text-muted">
          This is your personal hub for managing bursary opportunities. From here, you can explore open bursaries, track your applications, receive updates, and communicate with administrators.
        </p>

        <Row className="mt-4">
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaSearch size={30} className="text-info mb-2" />
              <h5>Explore Bursaries</h5>
              <p className="fs-6 text-muted">Find bursaries that match your goals</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaGraduationCap size={30} className="text-success mb-2" />
              <h5>Your Applications</h5>
              <p className="fs-6 text-muted">Track the status of your submissions</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaEnvelopeOpenText size={30} className="text-warning mb-2" />
              <h5>Messages & Updates</h5>
              <p className="fs-6 text-muted">Stay informed through direct messages</p>
            </Card>
          </Col>
        </Row>

        <Alert variant="info" className="mt-4 rounded-3 d-flex align-items-start">
          <FaRegLightbulb className="me-2 text-warning mt-1" />
          <div>
            <strong>Pro Tip:</strong> Always double-check eligibility before applying. Prepare all documents in advance to streamline the application process.
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
