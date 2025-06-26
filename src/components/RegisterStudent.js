import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterStudent() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    institution: '',
    field_of_study: '',
    year_of_study: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Register the student
      await axios.post('http://localhost:5000/api/register/student', form);

      // Step 2: Auto-login
      const loginRes = await axios.post('http://localhost:5000/api/login', {
        email: form.email,
        password: form.password,
        role: 'student'
      });

      const { token } = loginRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'student');

      // Step 3: Toast + Redirect
      toast.success('Student registered and logged in! Redirecting...', {
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1600);

    } catch (err) {
      console.error(err);
      if (err.response?.data?.message?.includes('exists')) {
        toast.error('A student with that email already exists.');
      } else {
        toast.error('Error registering student.');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto' }}>
        <h2 className="mb-3">Register Student</h2>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Full Name"
          onChange={e => setForm({ ...form, full_name: e.target.value })}
          required
        />

        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Phone"
          onChange={e => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Institution"
          onChange={e => setForm({ ...form, institution: e.target.value })}
          required
        />

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Field of Study"
          onChange={e => setForm({ ...form, field_of_study: e.target.value })}
          required
        />

        <input
          type="number"
          className="form-control mb-3"
          placeholder="Year of Study"
          onChange={e => setForm({ ...form, year_of_study: e.target.value })}
          required
        />

        <button type="submit" className="btn btn-success w-100">Register Student</button>
      </form>

      <ToastContainer position="top-center" />
    </>
  );
}

export default RegisterStudent;
