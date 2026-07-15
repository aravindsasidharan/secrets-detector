import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Eye, Loader } from 'lucide-react';

interface HistoryProps {
  onScanClick: (scan: any) => void;
}

function History({ onScanClick }: HistoryProps) {
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:8080/api/secrets/all');

      if (response.status === 200 && response.data) {
        setScans(response.data.scans || []);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load scans';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (scanId: string) => {
    if (!window.confirm('Delete this scan? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(scanId);

      await axios.delete(`http://localhost:8080/api/secrets/${scanId}`);

      setScans(scans.filter((s) => s.scanId !== scanId));
    } catch (err: any) {
      setError('Failed to delete scan');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRiskLevel = (critical: number, high: number) => {
    if (critical > 0) return { text: 'CRITICAL', color: 'bg-red-900' };
    if (high > 0) return { text: 'HIGH', color: 'bg-orange-900' };
    return { text: 'SAFE', color: 'bg-green-900' };
  };

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <Loader className='animate-spin inline-block mb-4' />
        <p className='text-gray-400'>Loading scan history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-900/20 border border-red-700 rounded-lg p-6 text-center'>
        <p className='text-red-200'>{error}</p>
        <button
          onClick={fetchScans}
          className='mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded'
        >
          Retry
        </button>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-lg'>No scans yet</p>
        <p className='text-gray-500 mt-2'>
          Upload or paste code to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className='text-2xl font-bold text-white mb-6'>Scan History</h2>

      <div className='space-y-3 max-h-96 overflow-y-auto'>
        {scans.map((scan: any) => {
          const risk = getRiskLevel(scan.criticalCount, scan.highCount);

          return (
            <div
              key={scan.scanId}
              className='bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-slate-700 transition-colors'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3 mb-2'>
                  <span
                    className={`
                    text-xs font-bold px-3 py-1 rounded-full
                    ${risk.color} ${
                      risk.text === 'CRITICAL'
                        ? 'text-red-200'
                        : risk.text === 'HIGH'
                          ? 'text-orange-200'
                          : 'text-green-200'
                    }
                  `}
                  >
                    {risk.text}
                  </span>

                  <p className='text-white font-medium truncate'>
                    {scan.fileName}
                  </p>

                  <span className='text-gray-400 text-sm'>
                    ({scan.language})
                  </span>
                </div>

                <p className='text-gray-400 text-sm'>
                  {formatDate(scan.createdAt)}
                </p>

                <p className='text-gray-500 text-xs mt-1'>
                  {scan.totalSecrets} secrets found ({scan.criticalCount}{' '}
                  critical, {scan.highCount} high)
                </p>
              </div>

              <div className='flex gap-2 ml-4'>
                <button
                  onClick={() => onScanClick(scan)}
                  className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
                  title='View details'
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => handleDelete(scan.scanId)}
                  disabled={deletingId === scan.scanId}
                  className='p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50'
                  title='Delete scan'
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default History;
