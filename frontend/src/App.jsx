import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3002/api';

const SimpleQofTool = () => {
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [practiceData, setPracticeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nationalAverages, setNationalAverages] = useState(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [financialSummary, setFinancialSummary] = useState(null);
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/practices`);
        if (!response.ok) {
          throw new Error('Failed to fetch practice data');
        }
        const data = await response.json();
        setCsvData(data);
        setFilteredData(data);
        
        // Calculate national averages
        const averages = calculateNationalAverages(data);
        setNationalAverages(averages);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Process data
  const processData = (rawData) => {
    // Process and prepare data
    const processedData = rawData.map(practice => {
      return {
        practiceCode: practice.PRACTICE_CODE,
        postCode: practice.POST_CODE,
        practiceName: practice.PRACTICE_NAME,
        pcnName: practice.PCN_NAME,
        icbName: practice.ICB_NAME,
        listSize: practice['Practice List Size'],
        prevalence: {
          hyp: practice['HYP Prevalence'],
          chol: practice['CHOL Prevalence'],
          dm: practice['DM Prevalence'],
          stia: practice['STIA Prevalence'],
          chd: practice['CHD Prevalence']
        },
        subIcbPrevalence: {
          hyp: practice['SUB ICB HYP Prevalence'],
          chol: practice['SUB ICB CHOL Prevalence '],
          dm: practice['SUB ICB DM Prevalence '],
          stia: practice['SUB ICB STIA Prevalence '],
          chd: practice['SUB ICB CHD Prevalence ']
        },
        indicators: {
          hyp008: {
            achievement: practice['HYP008 2023/24 Achievement'],
            earnings2023: practice['Earnings in 2023/24 HYP008'],
            earnings2025: practice['Earnings in 2025/26 for same achievement'],
            potential: practice['Potential Earnings achievable if same outcomes']
          },
          hyp009: {
            achievement: practice['HYP009 2023/24 Achievement'],
            earnings2023: practice['Earnings in 2023/24 HYP008_1'],
            earnings2025: practice['Earnings in 2025/26 for same achievement_1'],
            potential: practice['Potential Earnings achievable if same outcomes_1']
          },
          chol003: {
            achievement: practice['CHOL003 2023/24 Achievement'],
            earnings2023: practice['Earnings in 2023/24 CHOL003'],
            earnings2025: practice['Earnings in 2025/26 for same achievement_2'],
            potential: practice['Potential Earnings achievable if same outcomes_2']
          },
          dm033: {
            achievement: practice['DM033 2023/24 Achievement'],
            earnings2023: practice['Earnings in 2023/24 CHOL003_2'],
            earnings2025: practice['Earnings in 2025/26 for same achievement_4'],
            potential: practice['Potential Earnings achievable if same outcomes_4']
          },
          stia14: {
            achievement: practice['STIA14 2023/24 Achievement'],
            earnings2023: practice['Earnings in 2023/24 CHOL003_3'],
            earnings2025: practice['Earnings in 2025/26 for same achievement_5'],
            potential: practice['Potential Earnings achievable if same outcomes_5']
          },
          chd015: {
            achievement: practice['CHD015 2023/24 Achievement'],
            earnings2023: practice['Earnings in 2023/24 CHOL003_5'],
            earnings2025: practice['Earnings in 2025/26 for same achievement_7'],
            potential: practice['Potential Earnings achievable if same outcomes_7']
          }
        }
      };
    });

    setPracticeData(processedData);
  };

  // Handle search input change
  const handleSearchChange = async (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(searchValue)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const results = await response.json();
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Handle practice selection
  const handlePracticeSelect = async (practice) => {
    try {
      const response = await fetch(`${API_BASE_URL}/practice/${practice.PRACTICE_CODE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch practice details');
      }
      const practiceData = await response.json();
      setSelectedPractice(practiceData);
      setSearchTerm(`${practiceData.PRACTICE_NAME} (${practiceData.PRACTICE_CODE})`);
      setSearchResults([]);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error fetching practice details:', error);
      setError('Failed to load practice details');
    }
  };

  // Calculate financial summary
  useEffect(() => {
    if (!selectedPractice) return;
    
    const extractNumber = (str) => {
      if (!str) return 0;
      const match = str.match(/£([\d,]+(\.\d+)?)/);
      return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
    };

    let totalEarnings2023 = 0;
    let totalEarnings2025 = 0;
    let totalPotential = 0;
    
    // Sum totals
    Object.values(selectedPractice.indicators).forEach(indicator => {
      totalEarnings2023 += extractNumber(indicator.earnings2023);
      totalEarnings2025 += extractNumber(indicator.earnings2025);
      totalPotential += extractNumber(indicator.potential);
    });
    
    // Calculate prevalence uplift (2%)
    const prevalenceUplift = totalEarnings2025 * 0.02;
    
    setFinancialSummary({
      earnings2023: totalEarnings2023,
      earnings2025: totalEarnings2025,
      potential: totalPotential,
      prevalenceUplift: prevalenceUplift,
      totalOpportunity: totalPotential + prevalenceUplift
    });
  }, [selectedPractice]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '£0.00';
    if (typeof value === 'string') {
      return value.startsWith('£') ? value : `£${value}`;
    }
    return `£${value.toFixed(2)}`;
  };

  // Parse percentage
  const parsePercentage = (value) => {
    if (!value) return 0;
    if (typeof value === 'string') {
      return parseFloat(value.replace('%', '').trim());
    }
    return value;
  };

  // Prepare prevalence chart data
  const getPrevalenceChartData = () => {
    if (!selectedPractice) return [];
    
    return [
      {
        name: 'Hypertension',
        practice: parsePercentage(selectedPractice.prevalence.hyp),
        subIcb: parsePercentage(selectedPractice.subIcbPrevalence.hyp)
      },
      {
        name: 'Cholesterol',
        practice: parsePercentage(selectedPractice.prevalence.chol),
        subIcb: parsePercentage(selectedPractice.subIcbPrevalence.chol)
      },
      {
        name: 'Diabetes',
        practice: parsePercentage(selectedPractice.prevalence.dm),
        subIcb: parsePercentage(selectedPractice.subIcbPrevalence.dm)
      },
      {
        name: 'Stroke/TIA',
        practice: parsePercentage(selectedPractice.prevalence.stia),
        subIcb: parsePercentage(selectedPractice.subIcbPrevalence.stia)
      },
      {
        name: 'CHD',
        practice: parsePercentage(selectedPractice.prevalence.chd),
        subIcb: parsePercentage(selectedPractice.subIcbPrevalence.chd)
      }
    ];
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
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">GP Practice QOF Indicator Analysis Tool</h1>
        <p className="text-blue-100 mb-4">
          Search for a practice by ODS code, name, or postcode to view QOF indicators and financial impact
        </p>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by Practice Name, ODS Code or Postcode..."
            className="w-full p-4 rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:outline-none"
          />
          
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((practice) => (
                <div
                  key={practice.practiceCode}
                  className="p-3 border-b hover:bg-blue-50 cursor-pointer"
                  onClick={() => handlePracticeSelect(practice)}
                >
                  <div className="font-medium">{practice.practiceName}</div>
                  <div className="text-sm text-gray-600">
                    ODS: {practice.practiceCode} | {practice.postCode}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPractice && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Practice Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedPractice.practiceName} <span className="text-blue-600">({selectedPractice.practiceCode})</span>
            </h2>
            <p className="text-gray-600 mb-1">
              ICB: {selectedPractice.icbName}
            </p>
            <p className="text-gray-600 mb-1">
              PCN: {selectedPractice.pcnName}
            </p>
            <p className="text-gray-600">
              List Size: <span className="font-medium">{selectedPractice.listSize}</span>
            </p>
          </div>
          
          {/* Financial Summary */}
          {financialSummary && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Financial Opportunity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-600">2025/26 vs 2023/24:</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(financialSummary.earnings2025 - financialSummary.earnings2023)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-600">Better Outcomes:</p>
                  <p className="text-lg font-bold text-green-600">
                    +{formatCurrency(financialSummary.potential)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-600">2% Prevalence Uplift:</p>
                  <p className="text-lg font-bold text-indigo-600">
                    +{formatCurrency(financialSummary.prevalenceUplift)}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
                <p className="text-sm text-gray-700">Total Opportunity:</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(financialSummary.totalOpportunity)}
                </p>
              </div>
            </div>
          )}
          
          {/* Prevalence Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Prevalence Comparison</h3>
            <div className="bg-white rounded-lg shadow-md p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getPrevalenceChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toFixed(2) + '%'} />
                  <Legend />
                  <Bar dataKey="practice" name="Practice" fill="#4f46e5" />
                  <Bar dataKey="subIcb" name="Sub ICB" fill="#64748b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Indicators by Category */}
          <div>
            <h3 className="text-lg font-bold text-blue-800 mb-3">QOF Indicators</h3>
            
            {/* HYP Indicators */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2 pb-1 border-b">Hypertension (HYP) Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HYP008 */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h5 className="font-semibold text-blue-700">HYP008: BP Target in Hypertension</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    Achievement: <span className="font-medium">{selectedPractice.indicators.hyp008.achievement}%</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">2023/24</p>
                      <p className="font-medium">{selectedPractice.indicators.hyp008.earnings2023}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">2025/26</p>
                      <p className="font-medium text-blue-700">{selectedPractice.indicators.hyp008.earnings2025}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Potential</p>
                      <p className="font-medium text-green-600">{selectedPractice.indicators.hyp008.potential}</p>
                    </div>
                  </div>
                </div>
                
                {/* HYP009 */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h5 className="font-semibold text-blue-700">HYP009: BP Review in Hypertension</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    Achievement: <span className="font-medium">{selectedPractice.indicators.hyp009.achievement}%</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">2023/24</p>
                      <p className="font-medium">{selectedPractice.indicators.hyp009.earnings2023}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">2025/26</p>
                      <p className="font-medium text-blue-700">{selectedPractice.indicators.hyp009.earnings2025}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Potential</p>
                      <p className="font-medium text-green-600">{selectedPractice.indicators.hyp009.potential}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CHOL Indicators */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2 pb-1 border-b">Cholesterol (CHOL) Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CHOL003 */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h5 className="font-semibold text-blue-700">CHOL003: Cholesterol Management</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    Achievement: <span className="font-medium">{selectedPractice.indicators.chol003.achievement}%</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">2023/24</p>
                      <p className="font-medium">{selectedPractice.indicators.chol003.earnings2023}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">2025/26</p>
                      <p className="font-medium text-blue-700">{selectedPractice.indicators.chol003.earnings2025}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Potential</p>
                      <p className="font-medium text-green-600">{selectedPractice.indicators.chol003.potential}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-lg text-white">
              <h3 className="font-bold text-xl mb-3">How Suvera Can Help</h3>
              <p className="mb-3">
                Our platform can help increase disease prevalence and improve QOF achievement, potentially adding 
                <span className="font-bold text-white ml-1">{financialSummary ? formatCurrency(financialSummary.totalOpportunity) : '£0.00'}</span> to your practice income.
              </p>
              <a 
                href="mailto:sales@suvera.co.uk?subject=QOF%20Analysis%20Request"
                className="block w-full md:w-auto text-center bg-white text-blue-700 font-bold py-2 px-4 rounded hover:bg-blue-50 transition-colors mt-2"
              >
                Book a Demo with Suvera
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleQofTool;
