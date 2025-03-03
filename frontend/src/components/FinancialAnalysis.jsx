import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Add InfoIcon component at the top of the file
const InfoIcon = ({ tooltip }) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  return (
    <div className="group relative inline-block ml-1">
      <svg 
        className="w-5 h-5 text-gray-500 hover:text-gray-700 inline-block cursor-help" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        onMouseEnter={handleMouseEnter}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <div 
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out fixed"
        style={{
          zIndex: 9999,
          minWidth: '200px',
          maxWidth: '300px',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          transform: 'translate(-50%, -100%)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          whiteSpace: 'normal',
          lineHeight: '1.4',
          pointerEvents: 'none',
          left: position.x,
          top: position.y
        }}
      >
        {tooltip.split('\n\n').map((paragraph, index) => (
          <p key={index} className={index < tooltip.split('\n\n').length - 1 ? 'mb-3' : ''}>
            {paragraph}
          </p>
        ))}
        <div 
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            marginLeft: '-8px',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #1f2937'
          }}
        />
      </div>
    </div>
  );
};

// Helper function to parse currency values - moved outside components to be accessible to both
const parseCurrency = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[£,]/g, '')) || 0;
};

// Add a new helper function for consistent currency formatting
const formatCurrency = (value) => {
  return `£${value.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const ConditionSection = ({ title, data, prevalence }) => {
  if (!data || !data.indicator1 || !data.indicator2) {
    console.log(`No data for ${title}:`, data);
    return null;
  }

  // Helper function to get display names
  const getDisplayName = (title, indicator) => {
    if (title === 'CHOL') {
      return indicator === 'First' ? 'CHOL003' : 'CHOL004';
    }
    if (title === 'HYP') {
      return indicator === 'First' ? 'HYP008' : 'HYP009';
    }
    if (title === 'STIA') {
      return indicator === 'First' ? 'STIA014' : 'STIA015';
    }
    if (title === 'CHD') {
      return indicator === 'First' ? 'CHD015' : 'CHD016';
    }
    if (title === 'DM') {
      return indicator === 'First' ? 'DM036' : '';
    }
    return `${title} ${indicator}`;
  };

  // Helper function to get section title
  const getSectionTitle = (title) => {
    if (title === 'CHOL') {
      return 'Cholesterol Indicators';
    }
    if (title === 'HYP') {
      return 'Hypertension Indicators';
    }
    if (title === 'STIA') {
      return 'Stroke/TIA Indicators';
    }
    if (title === 'CHD') {
      return 'Coronary Heart Disease Indicators';
    }
    if (title === 'DM') {
      return 'Diabetes Indicator';
    }
    return `${title} Analysis`;
  };

  const chartData = [
    {
      name: getDisplayName(title, 'First'),
      'Earnings 2023/24': parseCurrency(data.indicator1.earnings2324),
      'Earnings 2025/26': parseCurrency(data.indicator1.earnings2526),
      'Full Target': parseCurrency(data.indicator1.fullTarget),
      'Prevalence': parseCurrency(data.indicator1[`prevalence${prevalence}`])
    }
  ];

  // Only add second indicator if it has data and it's not DM
  if (title !== 'DM' && (data.indicator2.earnings2324 || data.indicator2.earnings2526)) {
    chartData.push({
      name: getDisplayName(title, 'Second'),
      'Earnings 2023/24': parseCurrency(data.indicator2.earnings2324),
      'Earnings 2025/26': parseCurrency(data.indicator2.earnings2526),
      'Full Target': parseCurrency(data.indicator2.fullTarget),
      'Prevalence': parseCurrency(data.indicator2[`prevalence${prevalence}`])
    });
  }

  console.log('Chart data:', chartData);

  return (
    <div className="mb-12 border-b pb-8">
      <h2 className="text-2xl font-bold mb-6">{getSectionTitle(title)}</h2>
      <div className="flex flex-wrap lg:flex-nowrap gap-6">
        {/* Chart */}
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                domain={[0, 'auto']}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), '']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar 
                dataKey="Earnings 2023/24" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                barSize={25}
              />
              <Bar 
                dataKey="Earnings 2025/26" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]} 
                barSize={25}
              />
              <Bar 
                dataKey="Full Target" 
                fill="#6366F1" 
                radius={[4, 4, 0, 0]} 
                barSize={25}
              />
              <Bar 
                dataKey="Prevalence" 
                fill="#F59E0B" 
                name={`${prevalence}% Prevalence`} 
                radius={[4, 4, 0, 0]} 
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Table */}
        <div className="w-full lg:w-1/2 overflow-x-auto pt-12">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Indicator</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center justify-center">
                    23/24
                    <InfoIcon tooltip="Your achievements in 2023/24" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center justify-center">
                    25/26
                    <InfoIcon tooltip="Expected 25/26 earnings with 23/24 achievement" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center justify-center">
                    Target
                    <InfoIcon tooltip="25/26 earnings with max achievement" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center justify-center">
                    {prevalence}%
                    <InfoIcon tooltip="Impact on earnings with prevalence increase" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-center">{getDisplayName(title, 'First')}</td>
                <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator1.earnings2324))}</td>
                <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator1.earnings2526))}</td>
                <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator1.fullTarget))}</td>
                <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator1[`prevalence${prevalence}`]))}</td>
              </tr>
              {title !== 'DM' && (data.indicator2.earnings2324 || data.indicator2.earnings2526) && (
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-center">{getDisplayName(title, 'Second')}</td>
                  <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator2.earnings2324))}</td>
                  <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator2.earnings2526))}</td>
                  <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator2.fullTarget))}</td>
                  <td className="px-4 py-3 text-center">{formatCurrency(parseCurrency(data.indicator2[`prevalence${prevalence}`]))}</td>
                </tr>
              )}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 whitespace-nowrap text-center">Total</td>
                <td className="px-4 py-3 text-center">
                  {formatCurrency(parseCurrency(data.indicator1.earnings2324) + (title !== 'DM' ? parseCurrency(data.indicator2.earnings2324) : 0))}
                </td>
                <td className="px-4 py-3 text-center">
                  {formatCurrency(parseCurrency(data.indicator1.earnings2526) + (title !== 'DM' ? parseCurrency(data.indicator2.earnings2526) : 0))}
                </td>
                <td className="px-4 py-3 text-center">
                  {formatCurrency(parseCurrency(data.indicator1.fullTarget) + (title !== 'DM' ? parseCurrency(data.indicator2.fullTarget) : 0))}
                </td>
                <td className="px-4 py-3 text-center">
                  {formatCurrency(parseCurrency(data.indicator1[`prevalence${prevalence}`]) + (title !== 'DM' ? parseCurrency(data.indicator2[`prevalence${prevalence}`]) : 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FinancialAnalysis = ({ selectedPractice }) => {
  const [prevalence, setPrevalence] = React.useState(1);

  const formatData = (practice) => {
    if (!practice) return null;

    console.log('Formatting practice data:', practice);

    return {
      CHOL: {
        indicator1: {
          earnings2324: practice['Earnings in 2023/24 CHOL003'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_2'],
          fullTarget: practice['Total Earnings with full target achievement_2'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_2'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_2'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_2']
        },
        indicator2: {
          earnings2324: practice['Earnings in 2023/24 CHOL003_1'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_3'],
          fullTarget: practice['Total Earnings with full target achievement_3'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_3'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_3'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_3']
        }
      },
      HYP: {
        indicator1: {
          earnings2324: practice['Earnings in 2023/24 HYP008'],
          earnings2526: practice['Earnings in 2025/26 for same achievement'],
          fullTarget: practice['Total Earnings with full target achievement'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement']
        },
        indicator2: {
          earnings2324: practice['Earnings in 2023/24 HYP008_1'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_1'],
          fullTarget: practice['Total Earnings with full target achievement_1'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_1'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_1'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_1']
        }
      },
      STIA: {
        indicator1: {
          earnings2324: practice['Earnings in 2023/24 CHOL003_3'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_5'],
          fullTarget: practice['Total Earnings with full target achievement_5'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_5'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_5'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_5']
        },
        indicator2: {
          earnings2324: practice['Earnings in 2023/24 CHOL003_4'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_6'],
          fullTarget: practice['Total Earnings with full target achievement_6'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_6'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_6'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_6']
        }
      },
      CHD: {
        indicator1: {
          earnings2324: practice['Earnings in 2023/24 CHD015'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_7'],
          fullTarget: practice['Total Earnings with full target achievement_7'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_7'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_7'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_7']
        },
        indicator2: {
          earnings2324: practice['Earnings in 2023/24 CHD016'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_8'],
          fullTarget: practice['Total Earnings with full target achievement_8'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_8'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_8'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_8']
        }
      },
      DM: {
        indicator1: {
          earnings2324: practice['Earnings in 2023/24 CHOL003_2'],
          earnings2526: practice['Earnings in 2025/26 for same achievement_4'],
          fullTarget: practice['Total Earnings with full target achievement_4'],
          prevalence1: practice['Total Earnings with 1% increase in disease prevalence & Max achievement_4'],
          prevalence2: practice['Total Earnings with 2% increase in disease prevalence & Max achievement_4'],
          prevalence3: practice['Total Earnings with 3% increase in disease prevalence & Max achievement_4']
        },
        indicator2: {
          earnings2324: null,
          earnings2526: null,
          fullTarget: null,
          prevalence1: null,
          prevalence2: null,
          prevalence3: null
        }
      }
    };
  };

  const data = formatData(selectedPractice);
  console.log('Formatted data:', data);

  if (!data) return null;

  // Calculate total earnings across all conditions
  const calculateTotalEarnings = () => {
    const totals = {
      earnings2324: 0,
      earnings2526: 0,
      fullTarget: 0,
      prevalenceTarget: 0
    };

    Object.values(data).forEach(condition => {
      // Add indicator1 earnings
      if (condition.indicator1) {
        totals.earnings2324 += parseCurrency(condition.indicator1.earnings2324);
        totals.earnings2526 += parseCurrency(condition.indicator1.earnings2526);
        totals.fullTarget += parseCurrency(condition.indicator1.fullTarget);
        totals.prevalenceTarget += parseCurrency(condition.indicator1[`prevalence${prevalence}`]);
      }
      // Add indicator2 earnings if they exist
      if (condition.indicator2 && condition.indicator2.earnings2324) {
        totals.earnings2324 += parseCurrency(condition.indicator2.earnings2324);
        totals.earnings2526 += parseCurrency(condition.indicator2.earnings2526);
        totals.fullTarget += parseCurrency(condition.indicator2.fullTarget);
        totals.prevalenceTarget += parseCurrency(condition.indicator2[`prevalence${prevalence}`]);
      }
    });

    return totals;
  };

  const totalEarnings = calculateTotalEarnings();

  // Define chartData for the main chart
  const mainChartData = [
    {
      name: 'CHOL003',
      'Earnings 2023/24': parseCurrency(data.CHOL.indicator1.earnings2324),
      'Earnings 2025/26': parseCurrency(data.CHOL.indicator1.earnings2526),
      'Full Target': parseCurrency(data.CHOL.indicator1.fullTarget),
      'Prevalence': parseCurrency(data.CHOL.indicator1[`prevalence${prevalence}`])
    },
    {
      name: 'CHOL004',
      'Earnings 2023/24': parseCurrency(data.CHOL.indicator2.earnings2324),
      'Earnings 2025/26': parseCurrency(data.CHOL.indicator2.earnings2526),
      'Full Target': parseCurrency(data.CHOL.indicator2.fullTarget),
      'Prevalence': parseCurrency(data.CHOL.indicator2[`prevalence${prevalence}`])
    }
  ];

  return (
    <div className="w-full p-6 bg-white">
      <div className="bg-[#f8f3f0] p-6 rounded-lg mb-6">
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How the contract changes impact your CVD indicators</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Earnings 2023/24</span> = What your practice earned last year</p>
              <p><span className="font-medium">Earnings 2025/26</span> = What your practice will earn next year if you perform the same as last year</p>
              <p><span className="font-medium">Full Target</span> = What you could earn next year if you hit the maximum thresholds</p>
            </div>
          </div>

          <div className="w-[300px] flex-shrink-0">
            <h3 className="text-lg font-medium mb-4">See what you could earn with increased disease prevalence?</h3>
            <button
              onClick={() => setPrevalence(prevalence === 1 ? 0 : 1)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                prevalence > 0 
                  ? 'bg-[#a43400] text-white hover:bg-[#8a2b00]' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {prevalence > 0 ? 'Yes' : 'No'}
            </button>

            {prevalence > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Disease Prevalence: {prevalence}%</div>
                <div className="w-full">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={prevalence}
                    onChange={(e) => setPrevalence(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">1%</span>
                    <span className="text-xs text-gray-500">2%</span>
                    <span className="text-xs text-gray-500">3%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic mt-2">
                  Adjust the slider to see potential earnings with increased disease prevalence
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConditionSection title="CHOL" data={data.CHOL} prevalence={prevalence} />
      <ConditionSection title="HYP" data={data.HYP} prevalence={prevalence} />
      <ConditionSection title="STIA" data={data.STIA} prevalence={prevalence} />
      <ConditionSection title="CHD" data={data.CHD} prevalence={prevalence} />
      <ConditionSection title="DM" data={data.DM} prevalence={prevalence} />

      {/* Summary Box */}
      <div className="mt-8 bg-gray-50 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Total Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">2023/24 Total Earnings</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalEarnings.earnings2324)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">2025/26 Base Earnings</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEarnings.earnings2526)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((totalEarnings.earnings2526 / totalEarnings.earnings2324 - 1) * 100).toFixed(1)}% change
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">Full Target Potential</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalEarnings.fullTarget)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((totalEarnings.fullTarget / totalEarnings.earnings2526 - 1) * 100).toFixed(1)}% increase
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">With {prevalence}% Prevalence</h3>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(totalEarnings.prevalenceTarget)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((totalEarnings.prevalenceTarget / totalEarnings.fullTarget - 1) * 100).toFixed(1)}% increase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalysis; 