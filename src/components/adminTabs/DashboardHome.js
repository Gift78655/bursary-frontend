import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Alert, Button, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import {
  FaTachometerAlt, FaRegLightbulb, FaTools,
  FaUserGraduate, FaFileAlt, FaEnvelope, FaSyncAlt
} from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../App'; // adjust path if needed

export default function DashboardHome() {
  const [stats, setStats] = useState({ total_bursaries: '-', total_applications: '-', unread_messages: '-' });
  const [loading, setLoading] = useState(true);
  const adminId = JSON.parse(localStorage.getItem('user'))?.admin_id;

  useEffect(() => {
    if (!adminId) return;

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/stats/admin/${adminId}/summary`);
        setStats(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch dashboard stats', err);
      }
      setLoading(false);
    };

    fetchStats();
  }, [adminId]);

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
              <div className="fs-4 fw-semibold text-dark">
                {loading ? <Spinner animation="border" size="sm" /> : stats.total_bursaries}
              </div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaUserGraduate size={32} className="text-success mb-2" />
              <h5>Applications Received</h5>
              <p className="fs-6 text-muted">Monitor applicant activity</p>
              <div className="fs-4 fw-semibold text-dark">
                {loading ? <Spinner animation="border" size="sm" /> : stats.total_applications}
              </div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <FaEnvelope size={32} className="text-danger mb-2" />
              <h5>Unread Messages</h5>
              <p className="fs-6 text-muted">Check for student queries</p>
              <div className="fs-4 fw-semibold text-dark">
                {loading ? <Spinner animation="border" size="sm" /> : stats.unread_messages}
              </div>
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
            <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>
              <FaSyncAlt className="me-1" /> Refresh
            </Button>
          </OverlayTrigger>
        </div>
      </Card>
    </div>
  );
}
