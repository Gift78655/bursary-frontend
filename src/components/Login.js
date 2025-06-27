// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { API_BASE_URL } from '../App'; // ✅ Ensure this points to your backend URL

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/login`,
        {
          email: form.email,
          password: form.password,
          role: form.role,
        },
        {
          withCredentials: true, // ✅ Needed if backend uses cookies/tokens
        }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', form.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Login successful! Redirecting...', {
        position: 'top-center',
        autoClose: 1500,
      });

      setTimeout(() => {
        const dashboard =
          form.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
        navigate(dashboard);
      }, 1600);
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="form-title">Bursary Login</h2>

        <input
          type="email"
          className="form-control custom-input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoFocus
        />

        <input
          type="password"
          className="form-control custom-input"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <select
          className="form-select custom-input"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <button
          className="btn btn-primary w-100 login-button"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <footer className="login-footer">
        <small>
          Created by Gift Mthombeni &copy; {new Date().getFullYear()} | Bursary Management System
        </small>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default Login;
