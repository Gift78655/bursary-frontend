import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, Spinner, Alert, Table, Badge, Row, Col, Form, InputGroup
} from 'react-bootstrap';
import {
  FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock, FaHourglassHalf, FaSearch
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config'; // ✅ Add this import
import './ApplicationStatus.css'; // Optional for extra styling

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState(null);
  const [checkedSession, setCheckedSession] = useState(false);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role');

    if (!storedUser || role !== 'student') {
      navigate('/');
      return;
    }

    setStudentId(storedUser.student_id);
    setCheckedSession(true);
  }, [navigate]);

  useEffect(() => {
    if (!studentId || !checkedSession) return;

    axios
      .get(`${API_BASE_URL}/api/student/${studentId}/applications`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.application_date) - new Date(a.application_date));
        setApplications(sorted);
        setFilteredApps(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch applications:', err);
        setError('Unable to load your applications. Please try again later.');
        setLoading(false);
      });
  }, [studentId, checkedSession]);

  const getStatusInfo = (status) => {
    const key = (status || '').toLowerCase();
    switch (key) {
      case 'approved': return { variant: 'success', icon: <FaCheckCircle /> };
      case 'declined': return { variant: 'danger', icon: <FaTimesCircle /> };
      case 'pending': return { variant: 'warning', icon: <FaClock /> };
      case 'under review': return { variant: 'info', icon: <FaHourglassHalf /> };
      default: return { variant: 'secondary', icon: null };
    }
  };

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = applications.filter(app =>
      (app.bursary_title?.toLowerCase().includes(q) || app.sponsor?.toLowerCase().includes(q))
    );
    setFilteredApps(filtered);
  }, [searchQuery, applications]);

  const countByStatus = (statusKey) =>
    applications.filter(app => (app.current_status || '').toLowerCase() === statusKey.toLowerCase()).length;

  if (!checkedSession) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Card className="shadow border-0">
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col xs="auto"><FaClipboardList size={28} className="text-primary" /></Col>
            <Col><h4 className="mb-0 fw-semibold">Application Status</h4></Col>
          </Row>
          <p className="text-muted">Track all bursary applications you've submitted and monitor their current statuses.</p>

          <Row className="mb-3 text-center gx-2">
            <Col><Badge bg="success">✅ Approved: {countByStatus('approved')}</Badge></Col>
            <Col><Badge bg="danger">❌ Declined: {countByStatus('declined')}</Badge></Col>
            <Col><Badge bg="info">⏳ Under Review: {countByStatus('under review')}</Badge></Col>
            <Col><Badge bg="warning">⌛ Pending: {countByStatus('pending')}</Badge></Col>
          </Row>

          <InputGroup className="mb-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search by bursary title or sponsor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          {loading && (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && filteredApps.length === 0 && (
            <Alert variant="info" className="text-center">
              <strong>No applications found.</strong><br />
              Try refining your search.
            </Alert>
          )}

          {!loading && filteredApps.length > 0 && (
            <Table responsive bordered hover className="mt-4">
              <thead className="table-dark text-center align-middle">
                <tr>
                  <th>#</th>
                  <th>Bursary Title</th>
                  <th>Sponsor</th>
                  <th>Amount</th>
                  <th>Closing Date</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app, idx) => {
                  const statusInfo = getStatusInfo(app.current_status);
                  return (
                    <tr key={app.application_id}>
                      <td className="text-center">{idx + 1}</td>
                      <td>{app.bursary_title || 'N/A'}</td>
                      <td>{app.sponsor || 'N/A'}</td>
                      <td>R {parseFloat(app.amount || 0).toLocaleString()}</td>
                      <td>{app.closing_date ? new Date(app.closing_date).toISOString().split('T')[0] : 'N/A'}</td>
                      <td className="text-center">
                        <Badge bg={statusInfo.variant} className="d-inline-flex align-items-center gap-1">
                          {statusInfo.icon} {app.current_status || 'Unknown'}
                        </Badge>
                      </td>
                      <td>{app.application_date ? new Date(app.application_date).toISOString().split('T')[0] : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
