import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';

// ✅ Component imports
import Login from './components/Login';
import RegisterStudent from './components/RegisterStudent';
import RegisterAdmin from './components/RegisterAdmin';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

// 🌐 Backend URL
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🚫 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

// 🔐 Route protection
function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  if (role !== allowedRole) {
    return <Navigate to={`/${role}-dashboard`} />;
  }

  return children;
}

// 🧭 Navbar
function NavigationBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 mb-4">
      <Link className="navbar-brand" to="/">Bursary App</Link>
      <div className="ms-auto">
        {!token ? (
          <>
            <Link className="btn btn-outline-light mx-1" to="/register-student">Student Register</Link>
            <Link className="btn btn-outline-light mx-1" to="/register-admin">Admin Register</Link>
            <Link className="btn btn-outline-light mx-1" to="/">Login</Link>
          </>
        ) : (
          <>
            <span className="text-light me-3">Logged in as: {role}</span>
            <button onClick={handleLogout} className="btn btn-warning">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ❌ 404 fallback
function NotFound() {
  return (
    <div className="text-center mt-5">
      <h1>404</h1>
      <p>Page not found.</p>
    </div>
  );
}
