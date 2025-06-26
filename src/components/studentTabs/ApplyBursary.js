import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton from 'react-loading-skeleton';

export default function ApplyBursary() {
  const [bursaries, setBursaries] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 600 });
    const stored = localStorage.getItem('user');
    try {
      const parsed = JSON.parse(stored);
      if (!parsed || !parsed.student_id) {
        notify('error', 'Student not logged in. Please log in again.');
        return;
      }
      setStudentId(parsed.student_id);
    } catch (err) {
      console.error('Failed to parse student ID from localStorage', err);
      notify('error', 'Student not logged in. Please log in again.');
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    fetchBursaries();
    fetchApplications();
  }, [studentId]);

  const notify = (type, message) => {
    const options = {
      position: 'top-center',
      autoClose: 3000,
      pauseOnHover: true,
      draggable: true,
      transition: Slide,
      icon: true,
      theme: 'colored'
    };

    switch (type) {
      case 'success':
        toast.success(`✅ ${message}`, options);
        break;
      case 'info':
        toast.info(`ℹ️ ${message}`, options);
        break;
      case 'error':
        toast.error(`❌ ${message}`, options);
        break;
      case 'warn':
        toast.warn(`⚠️ ${message}`, options);
        break;
      default:
        toast(message, options);
    }
  };

  const fetchBursaries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/bursaries/available');
      setBursaries(res.data);
    } catch (err) {
      console.error(err);
      notify('error', 'Failed to load bursaries');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications?student_id=${studentId}`);
      const applied = res.data.map(app => app.bursary_id);
      setAppliedIds(applied);
    } catch (err) {
      console.error(err);
      notify('error', 'Could not fetch applications');
    }
  };

  const confirmAction = ({ title, message, onConfirm }) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal shadow p-4 rounded bg-white">
          <h4 className="mb-3 fw-semibold">{title}</h4>
          <p className="text-muted" style={{ fontSize: '0.95em' }}>{message}</p>
          <div className="mt-4 d-flex justify-content-end gap-2">
            <button className="btn btn-success" onClick={() => { onConfirm(); onClose(); }}>Yes, Proceed</button>
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      )
    });
  };

  const handleApply = (bursary) => {
    if (!bursary?.bursary_id) return notify('error', 'Invalid bursary data.');
    const days = getDaysLeft(bursary.closing_date);
    if (days < 0) {
      notify('warn', 'This bursary has already closed. You cannot apply.');
      return;
    }

    confirmAction({
      title: 'Confirm Application',
      message: 'Ensure your profile is accurate. After submission, you’ll receive an email confirmation aligned with POPIA guidelines.',
      onConfirm: async () => {
        try {
          await axios.post('http://localhost:5000/api/applications', {
            student_id: studentId,
            bursary_id: bursary.bursary_id
          });
          notify('success', '🎉 Application submitted! Check your email for confirmation.');
          setAppliedIds(prev => [...prev, bursary.bursary_id]);
        } catch (error) {
          console.error(error);
          const message = error?.response?.data?.message || 'Could not apply. Please try again.';
          notify('error', message);
        }
      }
    });
  };

  const handleWithdraw = (bursary) => {
    if (!bursary?.bursary_id) return notify('error', 'Invalid bursary data.');
    const days = getDaysLeft(bursary.closing_date);
    if (days < 0) {
      notify('warn', 'You cannot withdraw because this bursary has already closed.');
      return;
    }

    confirmAction({
      title: 'Withdraw Application',
      message: 'You’ll receive an email confirming this withdrawal. Proceed?',
      onConfirm: async () => {
        try {
          await axios.post('http://localhost:5000/api/applications/withdraw', {
            student_id: studentId,
            bursary_id: bursary.bursary_id
          });

          notify('info', '📩 Application withdrawn. Check your inbox.');
          setAppliedIds(prev => prev.filter(id => id !== bursary.bursary_id));
        } catch (error) {
          console.error(error);
          notify('error', 'Failed to withdraw application.');
        }
      }
    });
  };

  const formatCurrency = (value) => {
    return Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDaysLeft = (closingDate) => {
    const today = new Date();
    const closing = new Date(closingDate);
    const diff = (closing - today) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBursaries = bursaries.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.sponsor.toLowerCase().includes(search.toLowerCase()) ||
    (b.field_of_study && b.field_of_study.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mt-4">
      <h3 className="mb-3" style={{ fontFamily: 'Segoe UI Semibold' }}>Available Bursaries</h3>
      <p className="text-muted">
        You can apply once per bursary. Withdrawals must happen before the bursary deadline. Email confirmations comply with POPIA.
      </p>

      <input
        type="text"
        className="form-control mb-4 sticky-top bg-white z-3"
        placeholder="Search by title, sponsor, or field..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="col">
              <Skeleton height={250} borderRadius={10} />
            </div>
          ))}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {filteredBursaries.length === 0 ? (
            <div className="alert alert-info">No bursaries found matching your search.</div>
          ) : (
            filteredBursaries.map(b => {
              const isApplied = appliedIds.includes(b.bursary_id);
              const days = getDaysLeft(b.closing_date);
              const isClosingSoon = days <= 7 && days > 0;
              const isClosed = days < 0;

              return (
                <div key={b.bursary_id} className="col" data-aos="fade-up">
                  <div className={`card shadow h-100 ${isClosed ? 'bg-light border border-1' : 'border'} ${isClosingSoon ? 'border-warning' : ''}`} style={{ transition: 'all 0.3s ease-in-out' }}>
                    <div className="card-body d-flex flex-column justify-content-between pb-3">
                      <div>
                        <h5 className="card-title fw-semibold" style={{ fontSize: '1.25rem' }}>{b.title}</h5>
                        <p><strong>Sponsor:</strong> {b.sponsor}</p>
                        <p><strong>Eligibility:</strong> <span>{b.eligibility}</span></p>
                        {b.field_of_study && <p><strong>Field:</strong> <span className="badge bg-primary">{b.field_of_study}</span></p>}
                        {b.institution && <p><strong>Institution:</strong> {b.institution}</p>}
                        <p><strong>Amount:</strong> {b.amount ? formatCurrency(b.amount) : 'N/A'}</p>
                        <p>
                          <strong>Closing Date:</strong>{' '}
                          <span className={isClosed ? 'text-danger fw-bold' : isClosingSoon ? 'text-warning fw-semibold' : ''}>
                            {formatDate(b.closing_date)} {isClosed ? '(Closed)' : `(${days} days left)`}
                          </span>
                        </p>

                        {b.description && (
                          <details className="mb-2">
                            <summary className="fw-semibold">View Description</summary>
                            <p className="mt-2 text-muted" style={{ fontSize: '0.95em' }}>{b.description}</p>
                          </details>
                        )}

                        <div className="mb-3 d-flex flex-wrap gap-2">
                          {b.application_url && (
                            <a href={b.application_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                              Apply Online
                            </a>
                          )}
                          {b.contact_email && (
                            <a href={`mailto:${b.contact_email}`} className="btn btn-outline-secondary btn-sm">
                              Contact
                            </a>
                          )}
                          {isApplied && (
                            <span className="badge bg-success align-self-center">Already Applied</span>
                          )}
                        </div>
                      </div>

                      <div className="card-footer bg-transparent border-0 px-0">
                        {!isClosed && (
                          isApplied ? (
                            <button className="btn btn-outline-danger w-100" onClick={() => handleWithdraw(b)}>
                              Withdraw Application
                            </button>
                          ) : (
                            <button className="btn btn-success w-100" onClick={() => handleApply(b)}>
                              Apply Now
                            </button>
                          )
                        )}
                        {isClosed && (
                          <button className="btn btn-secondary w-100" disabled>
                            Closed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <ToastContainer
        limit={3}
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
