import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Slider } from './components/ui/slider';
import FinancialAnalysis from './components/FinancialAnalysis';
import { useAuth, useMemberstack } from "@memberstack/react";

const CustomAuthModal = ({ isOpen, onClose, onLoginSuccess, memberstack, selectedPractice }) => {
  const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'login'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    organisation: selectedPractice ? selectedPractice.PRACTICE_NAME : '',
    email: ''
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (selectedPractice) {
      setFormData(prev => ({
        ...prev,
        organisation: selectedPractice.PRACTICE_NAME
      }));
    }
  }, [selectedPractice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e) => {
    setLoginEmail(e.target.value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Signing up with data:', formData);
      
      // Store the form data in local state to use during verification
      localStorage.setItem('signupData', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        organisation: formData.organisation
      }));
      
      const response = await memberstack.sendMemberSignupPasswordlessEmail({
        email: formData.email,
        redirectUrl: `${window.location.origin}${window.location.pathname}`,
        customFields: {
          "first-name": formData.firstName,
          "last-name": formData.lastName,
          "job-title": formData.jobTitle,
          organisation: formData.organisation
        },
        plans: [{
          planId: "pln_free-trial-c8zqm9xj3",
          type: "DEFAULT"
        }]
      });
      
      console.log('Signup response:', response);
      setIsEmailSent(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || "Couldn't send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending login email to:', loginEmail);
      const response = await memberstack.sendMemberLoginPasswordlessEmail({
        email: loginEmail,
        redirectUrl: `${window.location.origin}${window.location.pathname}`
      });
      
      console.log('Login email response:', response);
      setIsEmailSent(true);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Couldn't send login email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (activeTab === 'signup') {
        // Get stored signup data
        const storedData = JSON.parse(localStorage.getItem('signupData') || '{}');
        console.log('Using stored data for verification:', storedData);
        
        // Complete signup with customFields
        const signupResult = await memberstack.signupMemberPasswordless({
          passwordlessToken: verificationCode,
          email: formData.email,
          customFields: {
            "first-name": storedData.firstName || formData.firstName,
            "last-name": storedData.lastName || formData.lastName,
            "job-title": storedData.jobTitle || formData.jobTitle,
            organisation: storedData.organisation || formData.organisation
          }
        });
        
        console.log('Signup completed with result:', signupResult);
        
        // After signup is complete, try to get the member data
        const member = await memberstack.getMemberJSON();
        console.log('Member data after signup:', member);
        
        // Update custom fields explicitly after signup as a final attempt
        await memberstack.updateMember({
          customFields: {
            "first-name": storedData.firstName || formData.firstName,
            "last-name": storedData.lastName || formData.lastName,
            "job-title": storedData.jobTitle || formData.jobTitle,
            organisation: storedData.organisation || formData.organisation
          }
        });
        
        console.log('Custom fields updated after signup');
      } else {
        await memberstack.loginMemberPasswordless({
          passwordlessToken: verificationCode,
          email: loginEmail
        });
      }
      
      // Clean up stored data
      localStorage.removeItem('signupData');
      
      console.log('Successfully authenticated');
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      console.error('Verification error:', err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 relative overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Tab navigation */}
        <div className="flex border-b overflow-hidden">
          <button
            className={`flex-1 py-3 ${activeTab === 'signup' ? 'bg-white font-medium' : 'bg-gray-100'}`}
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setIsEmailSent(false);
            }}
          >
            Sign up
          </button>
          <button
            className={`flex-1 py-3 ${activeTab === 'login' ? 'bg-white font-medium' : 'bg-gray-100'}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
              setIsEmailSent(false);
            }}
          >
            Log in
          </button>
        </div>
        
        <div className="p-6">
          {!isEmailSent ? (
            <>
              {activeTab === 'signup' ? (
                <>
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">
                    Sign up to view your results
                  </h2>
                  
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Job title
                      </label>
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g Practice manager"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1">
                        Organisation
                      </label>
                      <input
                        type="text"
                        id="organisation"
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ICB, PCN, or Practice"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                        loading ? 'bg-[#742400]' : 'bg-[#a43400] hover:bg-orange-700'
                      } transition-colors`}
                    >
                      {loading ? 'Processing...' : 'Sign up'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">
                    Log in to view your results
                  </h2>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="loginEmail"
                        value={loginEmail}
                        onChange={handleLoginInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                        loading ? 'bg-[#742400]' : 'bg-[#a43400] hover:bg-orange-700'
                      } transition-colors`}
                    >
                      {loading ? 'Processing...' : 'Log in'}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-medium text-gray-900 mb-2">
                Verify your email
              </h2>
              
              <p className="text-gray-600 mb-4">
                We've sent a verification code to your email. If you don't see it, please check your junk folder.
              </p>
              
              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter verification code"
                    required
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    loading ? 'bg-[#742400]' : 'bg-[#a43400] hover:bg-orange-700'
                  } transition-colors`}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsEmailSent(false)}
                  className="w-full text-blue-600 text-sm hover:underline rounded-lg py-2"
                >
                  ← Back to {activeTab === 'signup' ? 'sign up' : 'log in'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { isLoggedIn, member } = useAuth();
  const memberstack = useMemberstack();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Memberstack
  useEffect(() => {
    // Check if Memberstack is available
    if (memberstack) {
      console.log("Memberstack initialized");
      
      // Just add a listener without expecting an unsubscribe function
      try {
        memberstack.onAuthChange(auth => {
          console.log("Auth state changed:", auth);
        });
      } catch (e) {
        console.error("Error setting up auth change listener:", e);
      }
    } else {
      console.error("Memberstack not initialized properly");
    }
    
    // No cleanup needed for this effect
  }, [memberstack]);

  useEffect(() => {
    // Set loading to false once we have auth state
    setIsLoading(false);
    
    // Debug auth state
    console.log("Auth state in main component:", { isLoggedIn, member });

    let previousHeight = 0;

    // Function to send the height of the document to the parent iframe
    function sendHeight() {
      // Check if we're in an iframe before trying to communicate with parent
      const isInIframe = window !== window.parent;
      
      if (!isInIframe) {
        console.log("Not in iframe, skipping height message");
        return;
      }
      
      // Get the actual content height by measuring the main content element
      const contentHeight = Math.ceil(
        document.documentElement.getBoundingClientRect().height
      );
      
      // Only send message if height has changed significantly (more than 10px)
      if (Math.abs(contentHeight - previousHeight) > 10) {
        try {
          // Send the exact content height without any buffer
          parent.postMessage(contentHeight, '*');
          previousHeight = contentHeight;
          console.log("Sent new height:", contentHeight);
        } catch (e) {
          console.error("Error posting message to parent:", e);
        }
      }
    }

    // Initial height check after a short delay to ensure content is rendered
    setTimeout(sendHeight, 100);

    // Set up a ResizeObserver for the body
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to debounce and ensure accurate measurements
      cancelAnimationFrame(window.rafId);
      window.rafId = requestAnimationFrame(sendHeight);
    });

    // Observe the body element
    resizeObserver.observe(document.body);

    // Also observe any dynamic content changes
    const mutationObserver = new MutationObserver(() => {
      // Use requestAnimationFrame to debounce and ensure accurate measurements
      cancelAnimationFrame(window.rafId);
      window.rafId = requestAnimationFrame(sendHeight);
    });

    // Observe the entire document for content changes
    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    // Clean up
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      cancelAnimationFrame(window.rafId);
    };
  }, [isLoggedIn]);

  // Monitor authentication changes
  useEffect(() => {
    console.log("Authentication state changed:", { isLoggedIn });
    if (isLoggedIn) {
      console.log("User is authenticated:", member);
    }
  }, [isLoggedIn, member]);

  return (
    <QofAnalysisTool isAuthenticated={isLoggedIn} />
  );
};

const QofAnalysisTool = ({ isAuthenticated }) => {
  const { auth } = useAuth();
  const memberstack = useMemberstack();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [practiceData, setPracticeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cholPrevalence, setCholPrevalence] = useState(1);
  const [showPrevalence, setShowPrevalence] = useState(false);
  const searchInputRef = React.useRef(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleViewResults = async () => {
    if (!isAuthenticated) {
      // Show our custom modal instead of Memberstack's
      setShowAuthModal(true);
      return;
    }
    
    // If already authenticated, show results directly
    console.log("User already authenticated, showing results");
    setShowResults(true);
  };

  // Handle successful login from modal
  const handleLoginSuccess = () => {
    // This will be handled by the auth state change effect
    console.log("Login successful");
  };

  // Effect to update showResults when authentication state changes
  useEffect(() => {
    if (isAuthenticated && selectedPractice) {
      setShowResults(true);
    }
  }, [isAuthenticated, selectedPractice]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching CSV data...');
        const response = await fetch('/data/qof_data.csv');
        
        if (!response.ok) {
          console.error('Failed to fetch CSV:', response.status, response.statusText);
          throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('CSV data received, first 100 chars:', text.substring(0, 100));
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              console.log('CSV parsing complete');
              console.log('First row of data:', results.data[0]);
              console.log('Number of rows:', results.data.length);
              console.log('Available columns:', Object.keys(results.data[0]));
              setPracticeData(results.data);
            } else {
              console.error('No data found in CSV file');
              setError('No data found in CSV file');
            }
            setIsLoading(false);
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            setError(`Error parsing CSV: ${error.message}`);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Data loading error:', error);
        setError(`Error loading data: ${error.message}`);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    console.log('Searching for:', searchTerm);
    console.log('Available practice data:', practiceData);

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = practiceData.filter(practice => {
      const practiceCode = practice.PRACTICE_CODE ? practice.PRACTICE_CODE.toString().toLowerCase() : '';
      const postCode = practice.POST_CODE ? practice.POST_CODE.toString().toLowerCase() : '';
      const practiceName = practice.PRACTICE_NAME ? practice.PRACTICE_NAME.toString().toLowerCase() : '';
      
      const match = practiceCode.includes(lowerSearchTerm) ||
                   postCode.includes(lowerSearchTerm) ||
                   practiceName.includes(lowerSearchTerm);
      
      if (match) {
        console.log('Found matching practice:', practice);
      }
      
      return match;
    });
    
    console.log('Search results:', filtered);
    setSearchResults(filtered.slice(0, 10));
    setShowDropdown(filtered.length > 0);
  }, [searchTerm, practiceData]);

  // Prepare prevalence data for chart
  const getPrevalenceData = (practice) => {
    if (!practice) return [];
    
    const cleanPercentage = (value) => {
      if (!value && value !== 0) return 0;
    if (typeof value === 'string') {
        return parseFloat(value.replace('%', '')) || 0;
      }
      return value || 0;
    };

    // Log all available keys for debugging
    console.log('All available keys:', Object.keys(practice));
    console.log('Raw practice data:', practice);

    // Create data with exact column names (note the trailing spaces where needed)
    const data = [
      {
        name: 'Cholesterol',
        Practice: cleanPercentage(practice['CHOL Prevalence']),
        SubICB: cleanPercentage(practice['SUB ICB CHOL Prevalence ']), // Note the trailing space
        National: cleanPercentage(practice['National CHOL Prevalence ']) // Note the trailing space
      },
      {
        name: 'Hypertension',
        Practice: cleanPercentage(practice['HYP Prevalence']),
        SubICB: cleanPercentage(practice['SUB ICB HYP Prevalence']),
        National: cleanPercentage(practice['National HYP Prevalence'])
      },
      {
        name: 'Diabetes',
        Practice: cleanPercentage(practice['DM Prevalence']),
        SubICB: cleanPercentage(practice['SUB ICB DM Prevalence ']), // Note the trailing space
        National: cleanPercentage(practice['National DM Prevalence ']) // Note the trailing space
      },
      {
        name: 'Stroke/TIA',
        Practice: cleanPercentage(practice['STIA Prevalence']),
        SubICB: cleanPercentage(practice['SUB ICB STIA Prevalence ']), // Note the trailing space
        National: cleanPercentage(practice['National STIA Prevalence ']) // Note the trailing space
      },
      {
        name: 'Coronary Heart Disease',
        Practice: cleanPercentage(practice['CHD Prevalence']),
        SubICB: cleanPercentage(practice['SUB ICB CHD Prevalence ']), // Note the trailing space
        National: cleanPercentage(practice['National CHD Prevalence ']) // Note the trailing space
      }
    ];

    // Log each indicator's values for verification
    data.forEach(item => {
      console.log(`${item.name} processed values:`, {
        Practice: item.Practice,
        SubICB: item.SubICB,
        National: item.National
      });
    });

    return data;
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (value) => {
    if (!value) return '£0.00';
    if (typeof value === 'string' && value.startsWith('£')) return value;
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  };

  const renderIndicatorCard = (indicator) => {
    if (!indicator) return null;

    return (
      <div key={indicator.code} className=" p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-700 mb-2">{indicator.name}</h3>
        <div className="mb-3">
          <p className="text-sm text-gray-600">Achievement: {indicator.achievement ? `${indicator.achievement}%` : 'N/A'}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${indicator.achievement || 0}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-gray-600">24/25 Earnings</p>
            <p className="font-bold text-blue-600 text-sm">{formatCurrency(indicator.earnings2324)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">25/26 Earnings</p>
            <p className="font-bold text-green-600 text-sm">{formatCurrency(indicator.earnings2526)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Potential</p>
            <p className="font-bold text-purple-600 text-sm">{formatCurrency(indicator.potential)}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDiseaseSection = (diseaseArea) => {
    const indicators = {
      CHOL: [
        {
          code: "CHOL003",
          name: "CHOL003: Statin Initiation",
          achievement: selectedPractice['CHOL003 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_2'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_2'],
          increasePerPercent: selectedPractice['Earnings increase per 1% prevalence CHOL003'] || 0
        },
        {
          code: "CHOL004",
          name: "CHOL004: Lipid Optimisation",
          achievement: selectedPractice['CHOL004 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003_1'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_3'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_3'],
          increasePerPercent: selectedPractice['Earnings increase per 1% prevalence CHOL004'] || 0
        }
      ],
      HYP: [
        {
          code: "HYP008",
          name: "HYP008: BP Control",
          achievement: selectedPractice['HYP008 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 HYP008'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes']
        },
        {
          code: "HYP009",
          name: "HYP009: BP Optimisation",
          achievement: selectedPractice['HYP009 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 HYP008_1'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_1'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_1']
        }
      ],
      DM: [
        {
          code: "DM033",
          name: "DM033: Diabetes Control",
          achievement: selectedPractice['DM033 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003_2'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_4'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_4']
        }
      ],
      STIA: [
        {
          code: "STIA14",
          name: "STIA14: Stroke/TIA BP Control",
          achievement: selectedPractice['STIA14 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003_3'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_5'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_5']
        },
        {
          code: "STIA15",
          name: "STIA15: Stroke/TIA BP Optimisation",
          achievement: selectedPractice['STIA15 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003_4'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_6'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_6']
        }
      ],
      CHD: [
        {
          code: "CHD015",
          name: "CHD015: CHD BP Control",
          achievement: selectedPractice['CHD015 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003_5'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_7'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_7']
        },
        {
          code: "CHD016",
          name: "CHD016: CHD BP Optimisation",
          achievement: selectedPractice['CHD016 2024/25 Achievement'],
          earnings2324: selectedPractice['Earnings in 2024/25 CHOL003_6'],
          earnings2526: selectedPractice['Earnings in 2025/26 for same achievement_8'],
          potential: selectedPractice['Potential Earnings achievable if same outcomes_8']
        }
      ]
    };

    const calculateTotalEarnings = (indicators) => {
      const totals = {
        earnings2324: 0,
        earnings2526: 0,
        potential: 0
      };

      indicators.forEach(ind => {
        const clean = (val) => {
          if (typeof val === 'string' && val.startsWith('£')) {
            return parseFloat(val.replace('£', '').replace(/,/g, '')) || 0;
          }
          return val || 0;
        };

        totals.earnings2324 += clean(ind.earnings2324);
        totals.earnings2526 += clean(ind.earnings2526);
        totals.potential += clean(ind.potential);
      });

      return totals;
    };

    const totals = calculateTotalEarnings(indicators[diseaseArea]);

    // Special rendering for CHOL section
    if (diseaseArea === 'CHOL') {
      const baseData = {
        CHOL003: {
          baseEarnings2023: parseFloat(indicators.CHOL[0].earnings2324?.replace('£', '').replace(/,/g, '') || '0'),
          baseEarnings2025: parseFloat(indicators.CHOL[0].earnings2526?.replace('£', '').replace(/,/g, '') || '0'),
          increasePerPercent: parseFloat(indicators.CHOL[0].increasePerPercent || '0')
        },
        CHOL004: {
          baseEarnings2023: parseFloat(indicators.CHOL[1].earnings2324?.replace('£', '').replace(/,/g, '') || '0'),
          baseEarnings2025: parseFloat(indicators.CHOL[1].earnings2526?.replace('£', '').replace(/,/g, '') || '0'),
          increasePerPercent: parseFloat(indicators.CHOL[1].increasePerPercent || '0')
        }
      };

      const currentEarnings = {
        CHOL003: baseData.CHOL003.baseEarnings2025 + (cholPrevalence * baseData.CHOL003.increasePerPercent),
        CHOL004: baseData.CHOL004.baseEarnings2025 + (cholPrevalence * baseData.CHOL004.increasePerPercent)
      };

      const combinedEarnings = currentEarnings.CHOL003 + currentEarnings.CHOL004;

      const comparisonData = [
        { 
          name: 'Earnings in 2024/25', 
          CHOL003: baseData.CHOL003.baseEarnings2023,
          CHOL004: baseData.CHOL004.baseEarnings2023,
          total: baseData.CHOL003.baseEarnings2023 + baseData.CHOL004.baseEarnings2023
        },
        { 
          name: 'Estimated earnings with same 24/25 achievement levels', 
          CHOL003: baseData.CHOL003.baseEarnings2025,
          CHOL004: baseData.CHOL004.baseEarnings2025,
          total: baseData.CHOL003.baseEarnings2025 + baseData.CHOL004.baseEarnings2025
        },
        { 
          name: 'Increased earnings with max achievement & enhanced prevalence', 
          CHOL003: currentEarnings.CHOL003,
          CHOL004: currentEarnings.CHOL004,
          total: combinedEarnings
        }
      ];

      const detailedTableData = [
        { 
          label: 'CHOL003', 
          earnings2023: baseData.CHOL003.baseEarnings2023,
          earnings2025Base: baseData.CHOL003.baseEarnings2025,
          earningsWithPrevalence: currentEarnings.CHOL003,
          percentIncrease2023to2025: ((baseData.CHOL003.baseEarnings2025 / baseData.CHOL003.baseEarnings2023) - 1) * 100,
          percentIncreaseWithPrevalence: ((currentEarnings.CHOL003 / baseData.CHOL003.baseEarnings2025) - 1) * 100
        },
        { 
          label: 'CHOL004', 
          earnings2023: baseData.CHOL004.baseEarnings2023,
          earnings2025Base: baseData.CHOL004.baseEarnings2025,
          earningsWithPrevalence: currentEarnings.CHOL004,
          percentIncrease2023to2025: ((baseData.CHOL004.baseEarnings2025 / baseData.CHOL004.baseEarnings2023) - 1) * 100,
          percentIncreaseWithPrevalence: ((currentEarnings.CHOL004 / baseData.CHOL004.baseEarnings2025) - 1) * 100
        },
        { 
          label: 'Combined', 
          earnings2023: baseData.CHOL003.baseEarnings2023 + baseData.CHOL004.baseEarnings2023,
          earnings2025Base: baseData.CHOL003.baseEarnings2025 + baseData.CHOL004.baseEarnings2025,
          earningsWithPrevalence: combinedEarnings,
          percentIncrease2023to2025: (((baseData.CHOL003.baseEarnings2025 + baseData.CHOL004.baseEarnings2025) / 
                                    (baseData.CHOL003.baseEarnings2023 + baseData.CHOL004.baseEarnings2023)) - 1) * 100,
          percentIncreaseWithPrevalence: ((combinedEarnings / 
                                        (baseData.CHOL003.baseEarnings2025 + baseData.CHOL004.baseEarnings2025)) - 1) * 100
        }
      ];

      const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className=" p-4 border rounded shadow">
              <p className="font-semibold">{label}</p>
              {payload.map((entry, index) => (
                <p key={index} style={{ color: entry.color }}>
                  {entry.name}: {formatCurrency(entry.value)}
                </p>
              ))}
              {payload.length > 1 && (
                <p className="font-semibold pt-2 border-t mt-2">
                  Total: {formatCurrency(payload.reduce((sum, entry) => sum + entry.value, 0))}
                </p>
              )}
            </div>
          );
        }
        return null;
      };

      return (
        <div key={diseaseArea} className=" p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <div className="bg-[#f8f3f0] p-6 rounded-lg mb-6">
                <h2 className="text-xl text-gray-800 mb-4">How the contract changes impact your CVD indicators</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Earnings 2024/25</span> = What your practice earned last year</p>
                  <p><span className="font-medium">Earnings 2025/26</span> = What your practice will earn next year if you perform the same as last year</p>
                  <p><span className="font-medium">Full Target</span> = What you could earn next year if you hit the maximum thresholds</p>
                </div>
              </div>

              <h2 className="text-xl text-gray-800 mb-6">Cholesterol Indicators</h2>
              {showPrevalence && (
                <>
                  <div className="h-64 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(1)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="CHOL003" stackId="a" name="CHOL003" fill="#3b82f6" />
                        <Bar dataKey="CHOL004" stackId="a" name="CHOL004" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">INDICATOR</th>
                          <th className="text-right py-2">24/25</th>
                          <th className="text-right py-2">25/26</th>
                          <th className="text-right py-2">TARGET</th>
                          <th className="text-right py-2">1%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedTableData.map((row) => (
                          <tr key={row.label} className="border-b">
                            <td className="py-2 font-medium">{row.label}</td>
                            <td className="text-right py-2">{formatCurrency(row.earnings2023)}</td>
                            <td className="text-right py-2">{formatCurrency(row.earnings2025Base)}</td>
                            <td className="text-right py-2">{formatCurrency(row.earningsWithPrevalence)}</td>
                            <td className="text-right py-2">{formatCurrency(row.earningsWithPrevalence * 1.01)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="w-[300px] flex-shrink-0">
              <div className="bg-[#f8f3f0] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">See what you could earn with increased disease prevalence?</h3>
                <button
                  onClick={() => {
                    setShowPrevalence(!showPrevalence);
                    if (!showPrevalence) {
                      setCholPrevalence(1);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    showPrevalence 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showPrevalence ? 'Yes' : 'No'}
                </button>

                {showPrevalence && (
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-2">Disease Prevalence: {cholPrevalence}%</div>
                    <p className="text-xs text-gray-500 italic mt-2">
                      Adjust the slider to see potential earnings with increased disease prevalence
                    </p>
                    <div className="w-full">
                      <Slider
                        defaultValue={[1]}
                        max={3}
                        min={1}
                        step={1}
                        value={[cholPrevalence]}
                        onValueChange={(value) => setCholPrevalence(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">1%</span>
                        <span className="text-xs text-gray-500">2%</span>
                        <span className="text-xs text-gray-500">3%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default rendering for other disease areas
    return (
      <div key={diseaseArea} className=" p-6 rounded-lg shadow-lg">
        <h2 className="text-xl text-gray-800 mb-4">{diseaseArea}</h2>
        
        {/* 2024/25 Estimated Earnings */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-600 mb-1">2024/25 Estimated Earnings</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totals.earnings2324)}
          </p>
        </div>

        {/* 2025/26 New Earnings */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-600 mb-1">2025/26 New Earnings with 24/25 achievement</h3>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totals.earnings2526)}
          </p>
        </div>

        {/* 2025/26 Total Earnings */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-600 mb-1">2025/26 Total Earnings with full target achievement</h3>
          <p className="text-2xl font-bold text-purple-600">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totals.potential)}
          </p>
        </div>

        {/* Prevalence Scale */}
      <div className="mb-6">
          <h3 className="text-sm text-gray-600 mb-2">2025/26 Total Earnings if 1-3% increase in disease prevalence</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs text-gray-600">1%</div>
              <div className="text-xs text-gray-600">2%</div>
              <div className="text-xs text-gray-600">3%</div>
            </div>
            <div className="h-2 bg-blue-200 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full" style={{ width: '66%' }}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-semibold text-gray-700">
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
                  .format(totals.potential * 1.01)}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
                  .format(totals.potential * 1.02)}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
                  .format(totals.potential * 1.03)}
              </span>
            </div>
          </div>
        </div>

        {/* Individual Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {indicators[diseaseArea].map(renderIndicatorCard)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-lg">
        <p className="font-semibold">Error loading data:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-[#f8f3f0] p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-2xl text-black mb-4">2025/26 Cardiovascular QOF Indicator Analysis Tool</h1>
        <p className="text-black mb-4">
          Please type in your Practice Name or ODS Code or Post code to reveal how the QOF 25/26 contract will impact your CVD indicators, and outline where there is room for opportunity
        </p>
        
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search by practice name or ODS code or postcode..."
            className="w-full p-4 rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:outline-none"
          />
          
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((practice) => (
                <div
                  key={practice.PRACTICE_CODE}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedPractice(practice);
                    setSearchTerm(practice.PRACTICE_NAME);
                    setShowDropdown(false);
                    setShowResults(false); // Reset results view when new practice is selected
                    searchInputRef.current?.blur();
                  }}
                >
                  <div className="font-medium">{practice.PRACTICE_NAME}</div>
                  <div className="text-sm text-gray-600">
                    {practice.PRACTICE_CODE} | {practice.POST_CODE}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPractice && !showResults && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-[#D7D1CC]">
          <h2 className="text-2xl mb-4">{selectedPractice.PRACTICE_NAME}</h2>
          <div className="space-y-2 mb-6 details">
            <p className="text-gray-600">Practice Code: {selectedPractice.PRACTICE_CODE}</p>
            <p className="text-gray-600">ICB: {selectedPractice.ICB_NAME} ({selectedPractice.ICB_ODS_CODE})</p>
            <p className="text-gray-600">PCN: {selectedPractice.PCN_NAME} ({selectedPractice.PCN_ODS_CODE})</p>
            <p className="text-gray-600">List Size: {selectedPractice['Practice List Size']?.toLocaleString()}</p>
          </div>
          <button
            onClick={handleViewResults}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            View your practice results now!
          </button>
        </div>
      )}

      {/* Render the custom auth modal */}
      <CustomAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        memberstack={memberstack}
        selectedPractice={selectedPractice}
      />

      {selectedPractice && showResults && isAuthenticated && (
        <div className="space-y-8">
          {/* Practice Details */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 bg-white border border-[#D7D1CC]">
            <h2 className="text-2xl mb-4">{selectedPractice.PRACTICE_NAME}</h2>
            <div className="space-y-2 mb-6 details">
              <p className="text-gray-600">Practice Code: {selectedPractice.PRACTICE_CODE}</p>
              <p className="text-gray-600">ICB: {selectedPractice.ICB_NAME} ({selectedPractice.ICB_ODS_CODE})</p>
              <p className="text-gray-600">PCN: {selectedPractice.PCN_NAME} ({selectedPractice.PCN_ODS_CODE})</p>
              <p className="text-gray-600">List Size: {selectedPractice['Practice List Size']}</p>
            </div>
          </div>
          
          {/* Disease Prevalence and Chart Section */}
          <div className="bg-white p-6 rounded-lg border border-[#D7D1CC]">
            <div className="flex-1">
              <h2 className="text-xl mb-4">Disease Prevalence Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={getPrevalenceData(selectedPractice)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={0}
                    height={50}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: 'Prevalence %', angle: -90, position: 'insideLeft', offset: 0 }}
                    domain={[0, 16]}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Prevalence']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                  />
                  <Bar 
                    dataKey="Practice" 
                    name="Your Practice" 
                    fill="#7e22ce"
                    radius={[4, 4, 0, 0]}
                    barSize={35}
                  />
                  <Bar
                    dataKey="SubICB" 
                    name="Sub Icb Average" 
                    fill="#1d4ed8"
                    radius={[4, 4, 0, 0]}
                    barSize={35}
                  />
                  <Bar 
                    dataKey="National" 
                    name="National Average" 
                    fill="#047857"
                    radius={[4, 4, 0, 0]}
                    barSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Financial Analysis */}
          <FinancialAnalysis selectedPractice={selectedPractice} />
            
            {/* Call to Action */}
          <div className="bg-[#f8f3f0] text-black p-6 rounded-lg shadow-lg border border-[#D7D1CC]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <h2 className="text-2xl mb-4">Suvera can help you maximise your QOF earnings</h2>
                <p className="mb-6">
                  Suvera is an award-winning CQC proactive healthcare service that helps practices and PCNs achieve QOF targets. We support both with a clinical service and coding software to enhance practice income. See how we've helped organisations similar to yourselves and get in touch to see how we can improve your outcomes.
                </p>
              </div>
              <div className="flex flex-col gap-4 items-center justify-end md:col-span-1">
                <button 
                  onClick={() => window.location.href = 'mailto:sales@suvera.co.uk'}
                  className="w-full bg-[#a43400] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a43400] transition-colors"
                >
                  Speak to Partnerships
                </button>
                <div className="relative inline-block w-full">
                  <button
                    onClick={() => setShowShareOptions(prev => !prev)}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Share with Colleague</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1 bg-white rounded-lg" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setShowCopySuccess(true);
                            setTimeout(() => setShowCopySuccess(false), 2000);
                            setShowShareOptions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => {
                            const subject = encodeURIComponent('QOF Analysis Tool Results');
                            const body = encodeURIComponent(`Check out these QOF analysis results: ${window.location.href}`);
                            window.location.href = `mailto:?subject=${subject}&body=${body}`;
                            setShowShareOptions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          Email Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {showCopySuccess && (
                  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    Link copied successfully!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
