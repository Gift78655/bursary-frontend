import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../../App'; // adjust if your path is different

export default function ManageBursaries() {
  const [form, setForm] = useState({
    title: '', description: '', eligibility: '', sponsor: '', closing_date: '',
    field_of_study: '', institution: '', amount: '', application_url: '',
    contact_email: '', tags: ''
  });

  const [bursaries, setBursaries] = useState([]);
  const [filteredBursaries, setFilteredBursaries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    fetchBursaries();
  }, []);

  const fetchBursaries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bursaries`);
      setBursaries(res.data);
      setFilteredBursaries(res.data);
    } catch {
      toast.error('Failed to load bursaries');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.title || !form.sponsor || !form.closing_date || !form.description || !form.eligibility) return false;
    if (form.contact_email && !form.contact_email.includes('@')) return false;
    if (form.amount && parseFloat(form.amount) < 0) return false;
    if (form.application_url && !form.application_url.startsWith('http')) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error('Check required fields and formats');

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/bursaries`, {
        ...form,
        created_by: adminId
      });
      toast.success('Bursary created');
      setForm({
        title: '', description: '', eligibility: '', sponsor: '', closing_date: '',
        field_of_study: '', institution: '', amount: '', application_url: '', contact_email: '', tags: ''
      });
      fetchBursaries();
    } catch {
      toast.error('Failed to create bursary');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bursary?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/api/bursaries/${id}`);
        toast.success('Bursary deleted');
        fetchBursaries();
      } catch {
        toast.error('Failed to delete');
      }
      setLoading(false);
    }
  };

  const startEdit = (bursary) => {
    setEditingId(bursary.bursary_id);
    setEditingForm({ ...bursary });
  };

  const handleEditChange = (e) => {
    setEditingForm({ ...editingForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/bursaries/${id}`, editingForm);
      toast.success('Bursary updated');
      setEditingId(null);
      fetchBursaries();
    } catch {
      toast.error('Update failed');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const filtered = bursaries.filter(b =>
      b.title.toLowerCase().includes(keyword) ||
      b.sponsor.toLowerCase().includes(keyword) ||
      (b.field_of_study || '').toLowerCase().includes(keyword)
    );
    setFilteredBursaries(filtered);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Add New Bursary</h4>
      <p className="text-muted">Use the form below to submit a new bursary opportunity...</p>

      <div className="card p-3 mb-4">
        <form onSubmit={handleSubmit} className="row g-3">
          <fieldset>
            <legend>Basic Info</legend>
            <div className="col-md-6">
              <label className="form-label">Bursary Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Sponsor</label>
              <input name="sponsor" value={form.sponsor} onChange={handleChange} className="form-control" required />
            </div>
          </fieldset>

          <fieldset>
            <legend>Description & Criteria</legend>
            <div className="col-md-12">
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-12">
              <label className="form-label">Eligibility</label>
              <textarea name="eligibility" value={form.eligibility} onChange={handleChange} className="form-control" required />
            </div>
          </fieldset>

          <fieldset>
            <legend>Details</legend>
            <div className="col-md-6">
              <label className="form-label">Field of Study</label>
              <input name="field_of_study" value={form.field_of_study} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Institution</label>
              <input name="institution" value={form.institution} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Funding Amount (ZAR)</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Application URL</label>
              <input name="application_url" value={form.application_url} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Email</label>
              <input name="contact_email" value={form.contact_email} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tags</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Closing Date</label>
              <input type="date" name="closing_date" value={form.closing_date} onChange={handleChange} className="form-control" required />
            </div>
          </fieldset>

          <div className="col-md-12">
            <button className="btn btn-success" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Create Bursary'}
            </button>
          </div>
        </form>
      </div>

      <input className="form-control mb-3" value={search} onChange={handleSearch} placeholder="Search by title, sponsor, or field..." />

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card p-3">
          <h5 className="mb-3">Existing Bursaries</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Title</th>
                <th>Sponsor</th>
                <th>Closing Date</th>
                <th>Amount</th>
                <th>Tags</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBursaries.map(b => (
                <tr key={b.bursary_id} className={editingId === b.bursary_id ? 'table-warning' : ''}>
                  <td>{editingId === b.bursary_id ? <input name="title" value={editingForm.title} onChange={handleEditChange} /> : b.title}</td>
                  <td>{editingId === b.bursary_id ? <input name="sponsor" value={editingForm.sponsor} onChange={handleEditChange} /> : b.sponsor}</td>
                  <td>{editingId === b.bursary_id ? <input type="date" name="closing_date" value={editingForm.closing_date} onChange={handleEditChange} /> : b.closing_date}</td>
                  <td>{Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(b.amount || 0)}</td>
                  <td>
                    {(b.tags || '').split(',').map((tag, i) => (
                      <span key={i} className="badge bg-secondary me-1">{tag.trim()}</span>
                    ))}
                  </td>
                  <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    {editingId === b.bursary_id ? (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => handleUpdate(b.bursary_id)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-primary me-1" onClick={() => startEdit(b)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.bursary_id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}
