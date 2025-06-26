import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const adminId = user?.admin_id;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    department: '',
    position_title: '',
    bio: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(false);

  useEffect(() => {
    if (!adminId) {
      toast.error('Admin ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:5000/api/admins/${adminId}`)
      .then(res => {
        setFormData(res.data);
        setOriginalData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load admin profile');
        setLoading(false);
      });
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (formData.phone && !/^0\d{9}$/.test(formData.phone))
      newErrors.phone = 'Enter valid 10-digit SA phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasChanges()) return;
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSave = () => {
    setSaving(true);
    setShowConfirm(false);
    setLastSaved(false);

    axios.put(`http://localhost:5000/api/admins/${adminId}`, formData)
      .then(() => {
        toast.success('Profile updated successfully');
        setOriginalData(formData);
        setLastSaved(true);
      })
      .catch(() => toast.error('Failed to update profile'))
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setLastSaved(false);
    }
  };

  const getInputClass = (field) => {
    if (errors[field]) return 'form-control is-invalid';
    if (formData[field] && !errors[field]) return 'form-control is-valid';
    return 'form-control';
  };

  if (loading) return <div className="text-center mt-4"><div className="spinner-border text-primary" /></div>;
  if (!adminId) return <p className="text-danger">Admin ID not found.</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ borderRadius: '16px', maxWidth: '960px', margin: 'auto' }}>
        <h4 className="mb-4 text-primary fw-bold">Edit Admin Profile</h4>

        {lastSaved && <div className="alert alert-success">Profile saved successfully.</div>}
        {hasChanges() && <div className="alert alert-warning">You have unsaved changes</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input name="full_name" className={getInputClass('full_name')} value={formData.full_name} onChange={handleChange} />
              {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input name="email" type="email" className={getInputClass('email')} value={formData.email} onChange={handleChange} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input name="phone" className={getInputClass('phone')} value={formData.phone || ''} onChange={handleChange} />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Department</label>
              <input name="department" className="form-control" value={formData.department || ''} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Position Title</label>
              <input name="position_title" className="form-control" value={formData.position_title || ''} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Role</label>
              <input name="role" className="form-control" value={formData.role} disabled />
            </div>

            <div className="col-12">
              <label className="form-label">Address</label>
              <textarea name="address" className="form-control" rows="2" value={formData.address || ''} onChange={handleChange}></textarea>
            </div>

            <div className="col-12">
              <label className="form-label">Bio</label>
              <textarea name="bio" className="form-control" rows="3" value={formData.bio || ''} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <button className="btn btn-primary" type="submit" disabled={saving || !hasChanges()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={handleReset} disabled={saving || !hasChanges()}>
              Reset
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />

      {showConfirm && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Save</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">Are you sure you want to save your changes?</div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn btn-success" onClick={confirmSave}>Yes, Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
