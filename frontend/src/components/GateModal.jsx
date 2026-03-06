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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          &times;
        </button>

        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Get instant access</h2>
          <p className="text-gray-500 text-sm mb-5">
            Enter your work email to view your practice results and unlock all gated content.
          </p>

          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your work email"
                className="w-full border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#b84a1e]"
                autoFocus
              />
              {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-[#b84a1e] text-white rounded-lg font-semibold text-sm hover:bg-[#a43400] transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFullSubmit}>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b84a1e]"
                  autoFocus
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b84a1e]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job title"
                  className="border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b84a1e]"
                />
                <input
                  type="text"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="Organisation"
                  className="border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b84a1e]"
                />
              </div>
              {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-[#b84a1e] text-white rounded-lg font-semibold text-sm hover:bg-[#a43400] transition-colors mt-0.5"
              >
                Get access
              </button>
            </form>
          )}

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
