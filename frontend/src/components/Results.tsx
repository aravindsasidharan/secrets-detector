import React from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

interface ResultsProps {
  data: any;
}

function Results({ data }: ResultsProps) {
  const {
    scanId,
    fileName,
    language,
    createdAt,
    totalSecrets,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    findings = [],
  } = data;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900 text-red-200 border-red-700';
      case 'HIGH':
        return 'bg-orange-900 text-orange-200 border-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'LOW':
        return 'bg-blue-900 text-blue-200 border-blue-700';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon size={20} />;
      case 'HIGH':
        return <AlertTriangle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='bg-slate-700/50 border border-slate-600 rounded-lg p-6'>
        <h2 className='text-2xl font-bold text-white mb-4'>Scan Results</h2>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <p className='text-gray-400 mb-1'>File Name</p>
            <p className='text-white font-medium'>{fileName}</p>
          </div>

          <div>
            <p className='text-gray-400 mb-1'>Language</p>
            <p className='text-white font-medium capitalize'>{language}</p>
          </div>

          <div>
            <p className='text-gray-400 mb-1'>Scan Date</p>
            <p className='text-white font-medium'>
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className='text-gray-400 mb-1'>Scan ID</p>
            <p className='text-white font-mono text-xs truncate'>{scanId}</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-red-900/20 border border-red-700 rounded-lg p-4'>
          <p className='text-red-300 text-sm mb-2'>CRITICAL</p>
          <p className='text-3xl font-bold text-red-200'>{criticalCount}</p>
        </div>

        <div className='bg-orange-900/20 border border-orange-700 rounded-lg p-4'>
          <p className='text-orange-300 text-sm mb-2'>HIGH</p>
          <p className='text-3xl font-bold text-orange-200'>{highCount}</p>
        </div>

        <div className='bg-yellow-900/20 border border-yellow-700 rounded-lg p-4'>
          <p className='text-yellow-300 text-sm mb-2'>MEDIUM</p>
          <p className='text-3xl font-bold text-yellow-200'>{mediumCount}</p>
        </div>

        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <p className='text-blue-300 text-sm mb-2'>LOW</p>
          <p className='text-3xl font-bold text-blue-200'>{lowCount}</p>
        </div>
      </div>

      {findings.length === 0 && (
        <div className='bg-green-900/20 border border-green-700 rounded-lg p-8 text-center'>
          <p className='text-3xl mb-3'>✅</p>
          <p className='text-green-200 text-lg font-medium'>
            No secrets detected!
          </p>
          <p className='text-green-300 text-sm mt-2'>
            Your code looks clean. Keep up the good security practices!
          </p>
        </div>
      )}

      {findings.length > 0 && (
        <div>
          <h3 className='text-xl font-bold text-white mb-4'>
            {findings.length} Secret(s) Found
          </h3>

          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {findings.map((finding: any, index: number) => (
              <div
                key={index}
                className={`border rounded-lg p-4 space-y-2 ${getSeverityStyle(finding.severity)}`}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-center gap-2 flex-1'>
                    {getSeverityIcon(finding.severity)}
                    <div>
                      <p className='font-bold'>{finding.secretType}</p>
                      <p className='text-xs opacity-75 font-mono'>
                        Line {finding.lineNumber}:{finding.columnNumber}
                      </p>
                    </div>
                  </div>

                  <span className='text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap'>
                    {finding.severity}
                  </span>
                </div>

                <p className='text-sm opacity-90'>{finding.description}</p>

                {finding.maskedValue && (
                  <p className='text-xs font-mono bg-black/20 p-2 rounded'>
                    Found: {finding.maskedValue}
                  </p>
                )}

                {finding.contextCode && (
                  <p className='text-xs font-mono bg-black/20 p-2 rounded overflow-auto'>
                    {finding.contextCode}
                  </p>
                )}

                {finding.remediation && (
                  <div className='bg-black/20 p-3 rounded'>
                    <p className='text-xs font-bold mb-1'>💡 Fix:</p>
                    <p className='text-sm'>{finding.remediation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
