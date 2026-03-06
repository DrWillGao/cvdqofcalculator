import React, { useState, useEffect } from 'react';
import {
  isUnlocked,
  getStoredEmail,
  isFastTrackEligible,
  saveEmail,
  completeFull,
  submitGate
} from '../hooks/useGate';

const GateModal = ({ isOpen, onClose, onUnlock, selectedPractice }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPractice) {
      setOrganisation(selectedPractice.PRACTICE_NAME || '');
    }
  }, [selectedPractice]);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredEmail();
      if (stored) setEmail(stored);
      setStep(1);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    saveEmail(trimmed);

    if (isFastTrackEligible(trimmed)) {
      submitGate({ email: trimmed });
      onUnlock();
      onClose();
    } else {
      setStep(2);
    }
  };

  const handleFullSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !jobTitle.trim() || !organisation.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    const trimmedEmail = email.trim();
    completeFull(trimmedEmail);
    submitGate({
      email: trimmedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      jobTitle: jobTitle.trim(),
      organisation: organisation.trim()
    });
    onUnlock();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors absolute top-4 right-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-[#0E3D89]/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#0E3D89]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-0">Get instant access</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Enter your work email to view your practice results and unlock all gated content.
          </p>

          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your work email"
                className="w-full border border-gray-200 px-4 py-3 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#0E3D89] transition-colors"
                autoFocus
              />
              {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                className="w-full py-4 bg-[#0E3D89] text-white rounded-xl text-lg font-semibold hover:bg-[#0A2F6B] transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFullSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="border border-gray-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3D89] transition-colors"
                  autoFocus
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="border border-gray-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3D89] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job title"
                  className="border border-gray-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3D89] transition-colors"
                />
                <input
                  type="text"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="Organisation"
                  className="border border-gray-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3D89] transition-colors"
                />
              </div>
              {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                className="w-full py-4 bg-[#0E3D89] text-white rounded-xl text-lg font-semibold hover:bg-[#0A2F6B] transition-colors"
              >
                Get access
              </button>
            </form>
          )}

          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center justify-center gap-2 w-full mt-6 text-sm">
            Maybe later
          </button>

          <p className="mt-4 text-[11px] text-gray-400 leading-snug">
            By continuing you agree to our{' '}
            <a href="https://www.suvera.com/privacy-notice" target="_blank" rel="noopener noreferrer" className="text-gray-400 underline">Privacy Notice</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GateModal;
