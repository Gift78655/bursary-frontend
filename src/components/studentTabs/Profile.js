import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { API_BASE_URL } from '../../config'; // ✅ Imported here

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user?.student_id;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    institution: '',
    field_of_study: '',
    year_of_study: '',
  });

  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(false);

  useEffect(() => {
    if (!studentId) {
      toast.error('⚠️ No student ID found. Please log in again.');
      setLoading(false);
      return;
    }

    axios.get(`${API_BASE_URL}/api/students/${studentId}`)
      .then(res => {
        setFormData(res.data);
        setOriginalData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toast.error('Failed to load profile');
      });
  }, [studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmed = typeof value === 'string' ? value.trimStart() : value;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year_of_study' ? Number(trimmed) : trimmed
    }));

    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^0\d{9}$/;

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone must be a valid 10-digit South African number starting with 0';
    }
    if (!formData.institution) {
      newErrors.institution = 'Institution is required';
    }
    if (!formData.field_of_study) {
      newErrors.field_of_study = 'Field of study is required';
    }
    if (!formData.year_of_study || formData.year_of_study < 1 || formData.year_of_study > 10) {
      newErrors.year_of_study = 'Select a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    const cleanedData = {
      ...formData,
      phone: formData.phone.trim(),
      institution: formData.institution.trim(),
      field_of_study: formData.field_of_study.trim()
    };

    axios.put(`${API_BASE_URL}/api/students/${studentId}`, cleanedData)
      .then(() => {
        toast.success('✅ Profile updated successfully');
        setOriginalData(cleanedData);
        setLastSaved(true);
      })
      .catch(() => {
        toast.error('❌ Failed to update profile');
      })
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setLastSaved(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const getInputClass = (field) => {
    if (errors[field]) return 'form-control is-invalid';
    if (formData[field] && !errors[field]) return 'form-control is-valid';
    return 'form-control';
  };

  if (loading) return <div className="text-center mt-4"><div className="spinner-border text-primary" /></div>;
  if (!studentId) return <p className="text-danger">⚠️ No student ID found. Please log in again.</p>;

  return (
    <div className="container-fluid mt-5 d-flex justify-content-center">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '960px', borderRadius: '18px' }}>
        <div className="card-body">
          <h3 className="mb-4 text-primary fw-bold"><i className="bi bi-person-circle me-2"></i>Edit Profile</h3>

          {lastSaved && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <span>Your profile was saved successfully.</span>
            </div>
          )}

          {hasChanges() && (
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              <span><strong>Note:</strong> You have unsaved changes</span>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name:</label>
              <div className="form-control-plaintext">{formData.full_name}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email:</label>
              <div className="form-control-plaintext">{formData.email}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Phone
                  <i className="bi bi-info-circle-fill ms-2 text-info"
                    title="Enter a valid SA number starting with 0 (e.g. 0821234567)"
                    data-bs-toggle="tooltip" data-bs-placement="top" />
                </label>
                <input
                  name="phone"
                  className={getInputClass('phone')}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={saving}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Institution</label>
                <input
                  name="institution"
                  className={getInputClass('institution')}
                  value={formData.institution}
                  onChange={handleChange}
                  disabled={saving}
                />
                {errors.institution && <div className="invalid-feedback">{errors.institution}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Field of Study</label>
                <input
                  name="field_of_study"
                  className={getInputClass('field_of_study')}
                  value={formData.field_of_study}
                  onChange={handleChange}
                  disabled={saving}
                />
                {errors.field_of_study && <div className="invalid-feedback">{errors.field_of_study}</div>}
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label">
                  Year of Study
                  <i className="bi bi-info-circle-fill ms-2 text-info"
                    title="Select your current year from 1 to 10"
                    data-bs-toggle="tooltip" data-bs-placement="top" />
                </label>
                <select
                  name="year_of_study"
                  className={getInputClass('year_of_study')}
                  value={formData.year_of_study}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">-- Select Year --</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                {errors.year_of_study && <div className="invalid-feedback">{errors.year_of_study}</div>}
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-end">
              <button className="btn btn-primary px-4" type="submit" disabled={saving || !hasChanges()}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-outline-secondary px-4" type="button" onClick={handleReset} disabled={saving || !hasChanges()}>
                Reset to Original
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />

      {showConfirm && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content border-0">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle-fill me-2"></i>Confirm Update
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">Are you sure you want to save your profile changes?</p>
              </div>
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
