import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Import backend base URL from App.js
import { API_BASE_URL } from '../App';

function RegisterAdmin() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'admin',
    phone: '',
    department: '',
    position_title: '',
    address: '',
    bio: '',
    profile_photo_url: '' // Optional for now
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/api/register/admin`, form);

      const loginRes = await axios.post(`${API_BASE_URL}/api/login`, {
        email: form.email,
        password: form.password,
        role: form.role
      });

      const { token, user } = loginRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', form.role);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Admin registered and logged in! Redirecting...', {
        autoClose: 1500
      });

      setTimeout(() => {
        navigate(form.role === 'superadmin' ? '/superadmin-dashboard' : '/admin-dashboard');
      }, 1600);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message?.includes('exists')) {
        toast.error('An admin with that email already exists.');
      } else {
        toast.error('Error registering admin.');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: 'auto' }}>
        <h3 className="mb-4 text-primary fw-bold">Register Admin</h3>

        <input type="text" name="full_name" className="form-control mb-2" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" className="form-control mb-2" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" className="form-control mb-2" placeholder="Password" onChange={handleChange} required />

        <input type="text" name="phone" className="form-control mb-2" placeholder="Phone (optional)" onChange={handleChange} />
        <input type="text" name="department" className="form-control mb-2" placeholder="Department (optional)" onChange={handleChange} />
        <input type="text" name="position_title" className="form-control mb-2" placeholder="Position Title (optional)" onChange={handleChange} />
        <input type="text" name="address" className="form-control mb-2" placeholder="Address (optional)" onChange={handleChange} />
        <textarea name="bio" className="form-control mb-2" placeholder="Bio (optional)" rows="3" onChange={handleChange}></textarea>

        <select name="role" className="form-control mb-3" value={form.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>

        <button type="submit" className="btn btn-primary w-100">Register Admin</button>
      </form>

      <ToastContainer position="top-center" />
    </>
  );
}

export default RegisterAdmin;
