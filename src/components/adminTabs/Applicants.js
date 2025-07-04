import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Card, Badge, Button, Form, Spinner, Tabs, Tab,
  Row, Col, Collapse, ListGroup, Alert
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminApplications.css';
import { API_BASE_URL } from '../../config';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFormId, setActiveFormId] = useState(null);
  const [statusTab, setStatusTab] = useState('All');
  const [showHistory, setShowHistory] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [previewStatusMap, setPreviewStatusMap] = useState({});
  const [previewEmailMap, setPreviewEmailMap] = useState({});
  const [documentVisibility, setDocumentVisibility] = useState({});
  const [applicationDocuments, setApplicationDocuments] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    axios.get(`${API_BASE_URL}/api/admin/applications`)
      .then(res => {
        setApplications(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching applications:', err);
        setLoading(false);
      });
  };

  const fetchDocuments = async (applicationId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/applications/${applicationId}/documents`);
      setApplicationDocuments(prev => ({
        ...prev,
        [applicationId]: res.data
      }));
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to load documents');
    }
  };

  const generateEmailPreview = (studentName, bursaryTitle, status, remarks) => {
    return `Dear ${studentName},\n\nYour application for the bursary "${bursaryTitle}" has been marked as: ${status}.\n\n${remarks || 'Thank you for applying.'}\n\nBest regards,\nBursary Office`;
  };

  const handleStatusUpdate = (e, application_id, currentStatus) => {
    e.preventDefault();
    const form = e.target;
    const status = form.status.value;
    const remarks = form.remarks.value;
    const adminId = parseInt(localStorage.getItem('adminId'));

    if (!status) return toast.error('Please select a status');
    if (!adminId) return toast.error('Admin ID not found. Please re-login.');
    if (status === currentStatus) return toast.info('Selected status is the same as current. No change made.');

    const confirmMsg = `\nYou are about to change the status of this application to "${status}".\n\nPlease note:\n- This action may trigger an email notification to the applicant.\n- It may affect the applicant's eligibility or visibility.\n- This action is logged and cannot be undone.\n\nAre you sure you want to proceed?`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(application_id);

    axios.post(`${API_BASE_URL}/api/status/update`, {
      application_id,
      status,
      remarks,
      updated_by: adminId,
      updated_by_role: 'admin',
      is_visible_to_student: 1,
      action_type: 'Manual Review',
      attachment_url: null
    })
      .then(() => {
        toast.success('Status updated successfully');
        fetchApplications();
        setActiveFormId(null);
        setPreviewStatusMap(prev => ({ ...prev, [application_id]: '' }));
        setPreviewEmailMap(prev => ({ ...prev, [application_id]: '' }));
        form.reset();
      })
      .catch(err => {
        console.error('Status update failed:', err.response?.data || err.message);
        toast.error('Status update failed: ' + (err.response?.data?.message || 'Server error'));
      })
      .finally(() => setUpdatingId(null));
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Approved': return '🟢';
      case 'Under Review': return '🟡';
      case 'Declined': return '🔴';
      case 'Submitted': return '⚪️';
      default: return '⚫️';
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const statusMatch = statusTab === 'All' || (app.status || app.current_status) === statusTab;
      const keywordMatch =
        app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.bursary_title.toLowerCase().includes(searchQuery.toLowerCase());

      const appliedDate = app.applied_on ? new Date(app.applied_on) : null;
      const dateMatch =
        (!startDate || (appliedDate && appliedDate >= startDate)) &&
        (!endDate || (appliedDate && appliedDate <= endDate));

      const extraStatusMatch = !statusFilter || (app.status || app.current_status) === statusFilter;

      return statusMatch && keywordMatch && dateMatch && extraStatusMatch;
    });
  }, [applications, statusTab, searchQuery, startDate, endDate, statusFilter]);

  if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;

 return (
    <div className="container mt-4">
      <h3 className="mb-3 fw-semibold text-dark">All Bursary Applications</h3>

      {/* Search and Filters */}
      <Form className="mb-4">
        <Row className="gy-2 align-items-center">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Search student/email/title"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Filter by status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              className="form-control"
              placeholderText="Start date"
            />
          </Col>
          <Col md={2}>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              className="form-control"
              placeholderText="End date"
            />
          </Col>
          <Col md={2}>
            <Button variant="secondary" onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setStartDate(null);
              setEndDate(null);
            }}>Reset</Button>
          </Col>
        </Row>
      </Form>

      {/* Tabs by Status */}
      <Tabs activeKey={statusTab} onSelect={setStatusTab} className="mb-4">
        {['All', 'Submitted', 'Under Review', 'Approved', 'Declined'].map(k => (
          <Tab eventKey={k} title={k} key={k} />
        ))}
      </Tabs>

      {/* Applications List */}
      {filteredApps.length === 0 && <p className="text-muted">No applications found.</p>}

      {filteredApps.map(app => {
        const currentStatus = app.status || app.current_status;
        const history = app.status_history || [];
        const previewStatus = previewStatusMap[app.application_id] || '';
        const previewEmail = previewEmailMap[app.application_id] || '';

        return (
          <Card className="mb-4 border-0 shadow-sm rounded-4 px-3 py-3" key={app.application_id}>
            <Card.Body className="px-2">
              <Row className="align-items-center">
                <Col md={9}>
                  <h5 className="fw-semibold text-dark mb-1">{getStatusDot(currentStatus)} {app.student_name}</h5>
                  <p className="mb-1 text-muted small">{app.email}</p>
                  <p className="mb-1 text-muted small">{app.institution} | {app.field_of_study} | Year {app.year_of_study}</p>
                  <hr />
                  <p className="mb-1">
                    <strong>{app.bursary_title}</strong> <span className="text-muted small">({app.sponsor})</span>
                  </p>
                  <p className="mb-1 text-muted small">Last updated: {app.updated_at ? new Date(app.updated_at).toLocaleString() : '—'}</p>
                  <p className="mb-0">Status:
                    <Badge bg={
                      currentStatus === 'Approved' ? 'success' :
                        currentStatus === 'Declined' ? 'danger' :
                          currentStatus === 'Under Review' ? 'warning' : 'secondary'}
                      className="ms-2"
                    >
                      {currentStatus}
                    </Badge>
                  </p>
                </Col>
                <Col md={3} className="text-end sticky-action">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setActiveFormId(activeFormId === app.application_id ? null : app.application_id)}
                  >
                    {activeFormId === app.application_id ? 'Close' : 'Edit'}
                  </Button>
                  <Button
                    variant="link"
                    className="d-block mt-2 text-decoration-none"
                    onClick={() => setShowHistory(prev => ({
                      ...prev,
                      [app.application_id]: !prev[app.application_id]
                    }))}
                  >
                    {showHistory[app.application_id] ? 'Hide Timeline' : 'Show Timeline'}
                  </Button>
                  <Button
                    variant="link"
                    className="d-block mt-1 text-decoration-none"
                    onClick={() => {
                      const isVisible = documentVisibility[app.application_id];
                      setDocumentVisibility(prev => ({ ...prev, [app.application_id]: !isVisible }));
                      if (!isVisible && !applicationDocuments[app.application_id]) {
                        fetchDocuments(app.application_id);
                      }
                    }}
                  >
                    {documentVisibility[app.application_id] ? 'Hide Documents' : 'Show Documents'}
                  </Button>
                </Col>
              </Row>

              {/* Document Viewer */}
              {documentVisibility[app.application_id] && (
                <div className="mt-3">
                  <h6 className="fw-bold">Uploaded Documents</h6>
                  {applicationDocuments[app.application_id]?.length > 0 ? (
                    <ListGroup className="mb-3">
                      {applicationDocuments[app.application_id].map((doc, i) => (
                        <ListGroup.Item key={i} className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{doc.original_name}</strong>
                            <div className="text-muted small">{doc.file_category} • {new Date(doc.uploaded_at).toLocaleString()}</div>
                            <div className="text-muted small">{(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type}</div>
                          </div>
                          <a
  href={`${API_BASE_URL}/${doc.file_path}`}
  target="_blank"
  rel="noopener noreferrer"
  className="btn btn-sm btn-outline-primary"
>
  View
</a>

                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted small">No documents uploaded for this application.</p>
                  )}
                </div>
              )}

              {/* Timeline */}
              <Collapse in={showHistory[app.application_id]}>
                <div className="mt-3">
                  <ListGroup variant="flush">
                    {history.length === 0 ? (
                      <ListGroup.Item>No status history found.</ListGroup.Item>
                    ) : (
                      history.map((s, i) => (
                        <ListGroup.Item key={i} className="mb-2 border rounded px-3 py-2 shadow-sm bg-light">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-1 fw-bold">
                              <Badge bg={
                                s.status === 'Approved' ? 'success' :
                                  s.status === 'Declined' ? 'danger' :
                                  s.status === 'Under Review' ? 'warning' : 'secondary'}>{s.status}</Badge>
                            </h6>
                            <small className="text-muted">{new Date(s.updated_at).toLocaleString()}</small>
                          </div>
                          <div className="text-muted small fst-italic mb-1">{s.remarks || 'No remarks'}</div>
                          <div className="text-end text-muted small">— by <strong>{s.updated_by_role}</strong></div>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </div>
              </Collapse>

              {/* Edit Status Form */}
              <Collapse in={activeFormId === app.application_id}>
                <div>
                  <Form className="mt-4 fade-in" onSubmit={(e) => handleStatusUpdate(e, app.application_id, currentStatus)}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Status</Form.Label>
                      <Form.Select
                        name="status"
                        defaultValue={currentStatus || ''}
                        onChange={e => {
                          const selected = e.target.value;
                          setPreviewStatusMap(prev => ({ ...prev, [app.application_id]: selected }));
                          setPreviewEmailMap(prev => ({
                            ...prev,
                            [app.application_id]: generateEmailPreview(app.student_name, app.bursary_title, selected, '')
                          }));
                        }}
                      >
                        <option value="">Select status</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approve</option>
                        <option value="Declined">Decline</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Remarks (optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="remarks"
                        rows={2}
                        placeholder="Enter remarks..."
                        onChange={e => {
                          setPreviewEmailMap(prev => ({
                            ...prev,
                            [app.application_id]: generateEmailPreview(app.student_name, app.bursary_title, previewStatus, e.target.value)
                          }));
                        }}
                      />
                    </Form.Group>

                    {previewStatus && (
                      <Alert variant="info" className="mb-3">
                        <strong>Email Preview:</strong>
                        <pre className="mt-2 small bg-white p-2 border rounded">{previewEmail}</pre>
                      </Alert>
                    )}

                    {app.attachment_url && (
                      <p className="mb-3">
                        <a href={app.attachment_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary">
                          View Attached Document
                        </a>
                      </p>
                    )}

                    <div className="text-end">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={updatingId === app.application_id}
                      >
                        {updatingId === app.application_id ? 'Updating...' : 'Update Status'}
                      </Button>
                    </div>
                  </Form>
                </div>
              </Collapse>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

