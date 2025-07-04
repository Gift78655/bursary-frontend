import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../../App'; // adjust if needed

export default function MessagesAdmin() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.admin_id) {
        setAdminId(parsed.admin_id);
      } else {
        setError('⚠️ Admin ID missing from session.');
      }
    } catch (err) {
      console.error('❌ Failed to parse admin from localStorage', err);
      setError('⚠️ Admin session invalid. Please login again.');
    }
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/students`)
      .then(res => setStudents(res.data))
      .catch(err => {
        console.error('❌ Failed to fetch students', err);
        setError('Failed to fetch students');
      });
  }, []);

  const handleStudentSelect = async (e) => {
    const studentId = parseInt(e.target.value);
    const student = students.find(s => s.student_id === studentId);
    setSelectedStudent(student);
    setMessages([]);
    setConversationId(null);
    setError('');

    if (!adminId || isNaN(adminId)) {
      setError('⚠️ Admin ID missing from session.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/conversations/initiate`, {
        student_id: studentId,
        admin_id: adminId
      });

      setConversationId(res.data.conversation_id);
      loadMessages(res.data.conversation_id);
    } catch (err) {
      console.error('❌ Failed to initiate conversation', err);
      setError('Failed to initiate conversation');
    }
  };

  const loadMessages = async (convId) => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversation/${convId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('❌ Failed to load messages', err);
      setError('Failed to load messages');
    }
    setLoadingMessages(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!adminId || !selectedStudent?.student_id || !conversationId) {
      setError('❌ Missing data to send message');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/api/messages/send`, {
        conversation_id: conversationId,
        sender_id: adminId,
        receiver_id: selectedStudent.student_id,
        sender_role: 'admin',
        message: newMessage
      });
      setNewMessage('');
      loadMessages(conversationId);
    } catch (err) {
      console.error('❌ Failed to send message', err);
      setError('Failed to send message');
    }
    setSending(false);
  };

  return (
    <Card className="p-4 shadow-sm">
      <h5 className="mb-3">📨 Admin Messaging Panel</h5>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group controlId="studentSelect">
        <Form.Label>Select a student to start conversation:</Form.Label>
        <Form.Select onChange={handleStudentSelect} value={selectedStudent?.student_id || ''}>
          <option value="">-- Choose a student --</option>
          {students.map((student) => (
            <option key={student.student_id} value={student.student_id}>
              {student.full_name} ({student.email})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {selectedStudent && (
        <div className="mt-4">
          <h6>Conversation with <strong>{selectedStudent.full_name}</strong></h6>

          {loadingMessages ? (
            <Spinner animation="border" />
          ) : (
            <div className="border rounded p-3 mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div className="text-muted">No messages yet. Start the conversation below.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.message_id} className={`mb-2 ${msg.sender_role === 'admin' ? 'text-end' : 'text-start'}`}>
                    <div className={`d-inline-block p-2 rounded ${msg.sender_role === 'admin' ? 'bg-primary text-white' : 'bg-light'}`}>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="ms-2">
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </Form.Group>
        </div>
      )}
    </Card>
  );
}
