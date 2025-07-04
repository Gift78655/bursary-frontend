import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, ListGroup, Card, Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../../config'; // ✅ Import API base URL

export default function Messages() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [sending, setSending] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const studentId = storedUser?.student_id;

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/admins`)
      .then(res => {
        setAdmins(res.data);
        setLoadingAdmins(false);
      })
      .catch(err => {
        console.error('❌ Failed to fetch admins:', err);
        setLoadingAdmins(false);
      });
  }, []);

  const initiateConversation = async (admin) => {
    if (!studentId || !admin?.admin_id) return console.error('❌ Missing IDs for conversation');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/conversations/initiate`, {
        student_id: studentId,
        admin_id: admin.admin_id
      });
      setConversationId(res.data.conversation_id);
      setSelectedAdmin(admin);
      fetchMessages(res.data.conversation_id);
    } catch (err) {
      console.error('❌ Conversation initiation failed:', err.response?.data || err);
    }
  };

  const fetchMessages = async (convoId) => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversation/${convoId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('❌ Fetching messages failed:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      await axios.post(`${API_BASE_URL}/api/messages/send`, {
        conversation_id: conversationId,
        sender_id: studentId,
        receiver_id: selectedAdmin.admin_id,
        sender_role: 'student',
        message: newMessage
      });
      setNewMessage('');
      fetchMessages(conversationId);
    } catch (err) {
      console.error('❌ Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-3">
      <h4 className="mb-3">📨 Contact an Admin</h4>

      <Form.Group className="mb-3">
        <Form.Label>Select an admin to chat with:</Form.Label>
        {loadingAdmins ? (
          <div><Spinner animation="border" size="sm" /> Loading admins...</div>
        ) : (
          <Form.Select
            onChange={(e) => {
              const admin = admins.find(a => a.admin_id === parseInt(e.target.value));
              if (admin) initiateConversation(admin);
            }}
          >
            <option value="">-- Choose an admin --</option>
            {admins.map(admin => (
              <option key={admin.admin_id} value={admin.admin_id}>
                {admin.full_name} ({admin.email})
              </option>
            ))}
          </Form.Select>
        )}
      </Form.Group>

      {selectedAdmin && (
        <Card className="p-3 bg-light border">
          <h5>Conversation with {selectedAdmin.full_name}</h5>

          {loadingMessages ? (
            <div className="text-center my-3"><Spinner animation="border" /></div>
          ) : messages.length === 0 ? (
            <Alert variant="info">No messages yet. Start the conversation below.</Alert>
          ) : (
            <ListGroup className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {messages.map(msg => (
                <ListGroup.Item
                  key={msg.message_id}
                  className={msg.sender_role === 'student' ? 'text-end' : 'text-start'}
                >
                  <div>
                    <strong>{msg.sender_role === 'student' ? 'Me' : 'Admin'}:</strong> {msg.message}
                  </div>
                  <small className="text-muted">{new Date(msg.sent_at).toLocaleString()}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button className="mt-2" onClick={sendMessage} disabled={!newMessage.trim() || sending}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Card>
      )}
    </div>
  );
}
