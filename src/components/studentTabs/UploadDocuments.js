import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
  Accordion, Table, Badge, Modal, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { API_BASE_URL } from '../../config'; // ✅ Import API base

export default function UploadDocuments() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [applicationId, setApplicationId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    if (!studentId) return;
    axios.get(`${API_BASE_URL}/api/student/applications/${studentId}`)
      .then(res => {
        const latestApp = res.data?.[0];
        if (latestApp) {
          setApplicationId(latestApp.application_id);
          fetchDocuments(studentId);
        } else {
          setMessage('No active bursary application found.');
          setVariant('warning');
        }
      })
      .catch(err => {
        console.error(err);
        setMessage('Could not fetch application info.');
        setVariant('danger');
      });
  }, [studentId]);

  const fetchDocuments = (studentId) => {
    axios.get(`${API_BASE_URL}/api/student/${studentId}/documents`)
      .then(res => setDocuments(res.data))
      .catch(err => {
        console.error(err);
        setMessage('Failed to fetch uploaded documents.');
        setVariant('danger');
      });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !category || !applicationId) {
      setMessage('Please select a document category and a file.');
      setVariant('danger');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage('File too large. Maximum allowed size is 5MB.');
      setVariant('warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('application_id', applicationId);
    formData.append('student_id', studentId);

    try {
      setUploading(true);
      await axios.post(`${API_BASE_URL}/api/upload-document`, formData);
      setMessage('Document uploaded successfully.');
      setVariant('success');
      setFile(null);
      setCategory('');
      fetchDocuments(studentId);
    } catch (err) {
      console.error(err);
      setMessage('Upload failed. Please try again.');
      setVariant('danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-document/${documentId}`);
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
      setMessage('Document deleted.');
      setVariant('info');
    } catch (err) {
      console.error(err);
      setMessage('Delete failed.');
      setVariant('danger');
    }
  };

  const openPreview = (doc) => {
    setPreviewFile(doc);
    setShowPreview(true);
  };

  const isImage = (type) => ['image/jpeg', 'image/png', 'image/jpg'].includes(type);
  const isPDF = (type) => type === 'application/pdf';

  const categoryCount = documents.reduce((acc, doc) => {
    acc[doc.file_category] = (acc[doc.file_category] || 0) + 1;
    return acc;
  }, {});

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h3 className="mb-4 text-center fw-semibold text-dark">Upload Supporting Documents</h3>

          <Accordion className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Guidelines for Uploading</Accordion.Header>
              <Accordion.Body className="bg-light text-dark">
                <ul>
                  <li>Documents must be <strong>clear and legible</strong>.</li>
                  <li>Only <strong>PDF, JPG, JPEG, or PNG</strong> formats are accepted.</li>
                  <li>Maximum file size: <strong>5MB</strong>.</li>
                  <li>Ensure files are <strong>certified by relevant authorities</strong>.</li>
                  <li>Use the correct category for each document.</li>
                  <li><em>Do not upload expired or outdated documents.</em></li>
                </ul>
                <Alert variant="info" className="mt-3 mb-0">
                  📌 Reminder: Some documents like ID or academic transcripts may need to be <strong>certified by a Commissioner of Oaths</strong> or relevant authority.
                </Alert>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {message && <Alert variant={variant}>{message}</Alert>}

          <Card className="mb-5 shadow-sm rounded-3 border-light">
            <Card.Body>
              <Form onSubmit={handleUpload} encType="multipart/form-data">
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Document Category</Form.Label>
                      <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip>Select the category that best matches the file being uploaded.</Tooltip>}
                      >
                        <Form.Select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value="">-- Select Category --</option>
                          <option value="ID Proof">ID Proof</option>
                          <option value="Academic Transcript">Academic Transcript</option>
                          <option value="Proof of Registration">Proof of Registration</option>
                          <option value="Motivational Letter">Motivational Letter</option>
                          <option value="Reference Letter">Reference Letter</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </OverlayTrigger>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="formFile">
                      <Form.Label className="fw-semibold">Select File</Form.Label>
                      <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip>Only PDF, JPG, JPEG, PNG files. Max size: 5MB.</Tooltip>}
                      >
                        <Form.Control
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFile(e.target.files[0])}
                          required
                        />
                      </OverlayTrigger>
                      <Form.Text muted className="ms-1">
                        Max 5MB • PDF, JPG, PNG only
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end mt-4">
                  <Button variant="primary" type="submit" className="px-4" disabled={uploading}>
                    {uploading ? <Spinner size="sm" animation="border" /> : 'Upload Document'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold fs-5 d-flex justify-content-between align-items-center">
              <span>Uploaded Documents</span>
              <Badge bg="secondary">{documents.length} total</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {documents.length === 0 ? (
                <div className="p-3 text-muted">No documents uploaded yet.</div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>File</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.document_id}>
                        <td>
                          <Button variant="link" className="p-0 text-decoration-none" onClick={() => openPreview(doc)}>
                            {doc.original_name}
                          </Button>
                        </td>
                        <td>
                          {doc.file_category}{' '}
                          <Badge bg="info" pill className="ms-1">
                            {categoryCount[doc.file_category] || 1}
                          </Badge>
                        </td>
                        <td><Badge bg="light" text="dark">{doc.file_type}</Badge></td>
                        <td className="text-end">
                          <small className="text-muted me-3">{new Date(doc.uploaded_at).toLocaleString()}</small>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(doc.document_id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Preview */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewFile && isImage(previewFile.file_type) && (
            <img src={`${API_BASE_URL}/${previewFile.file_path}`} alt="preview" className="img-fluid rounded shadow" />
          )}
          {previewFile && isPDF(previewFile.file_type) && (
            <iframe
              title="PDF Preview"
              src={`${API_BASE_URL}/${previewFile.file_path}`}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          )}
          {!isImage(previewFile?.file_type) && !isPDF(previewFile?.file_type) && (
            <p>Preview not available for this file type.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
