import React from 'react';
import { Card, Container } from 'react-bootstrap';

export default function ApplicationStatus() {
  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0 rounded-4 p-4">
        <Card.Body>
          <h3 className="fw-semibold text-primary mb-3">📊 Application Status</h3>
          <p className="text-muted">
            Track the progress of your bursary applications below. Here you can view real-time updates, status changes, and any remarks provided by the admin team regarding your submission.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
