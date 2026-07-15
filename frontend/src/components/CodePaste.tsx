import React, { useState } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';

interface CodePasteProps {
  onScanComplete: (results: any) => void;
  onError: (error: string) => void;
}

function CodePaste({ onScanComplete, onError }: CodePasteProps) {
  const [fileName, setFileName] = useState<string>('untitled');
  const [language, setLanguage] = useState<string>('java');
  const [code, setCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleScan = async () => {
    if (!code.trim()) {
      onError('Please paste some code to scan');
      return;
    }

    if (!language) {
      onError('Please select a programming language');
      return;
    }

    try {
      setIsScanning(true);
      setProgressMessage('Scanning code...');

      const response = await axios.post(
        'http://localhost:8080/api/secrets/scan/text',
        {
          fileName: fileName || 'untitled',
          language: language,
          code: code,
        },
      );

      if (response.status === 200 && response.data) {
        const { data, scanId } = response.data;

        onScanComplete({
          scanId,
          ...data,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to scan code';

      onError(errorMessage);
    } finally {
      setIsScanning(false);
      setProgressMessage('');
    }
  };

  const handleClear = () => {
    setFileName('untitled');
    setLanguage('java');
    setCode('');
    setProgressMessage('');
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>
            File Name
          </label>
          <input
            type='text'
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isScanning}
            placeholder='e.g., LoginService.java'
            className='w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isScanning}
            className='w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500'
          >
            <option value='java'>Java</option>
            <option value='python'>Python</option>
            <option value='javascript'>JavaScript</option>
            <option value='typescript'>TypeScript</option>
            <option value='go'>Go</option>
            <option value='cpp'>C++</option>
            <option value='csharp'>C#</option>
            <option value='php'>PHP</option>
          </select>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          Code to Scan
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isScanning}
          placeholder='Paste your code here...'
          rows={15}
          className='w-full px-4 py-3 bg-slate-700 text-gray-100 font-mono rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 resize-none'
        />
        <p className='text-sm text-gray-400 mt-2'>{code.length} characters</p>
      </div>

      <div className='flex gap-4 justify-center'>
        <button
          onClick={handleScan}
          disabled={!code.trim() || isScanning}
          className='flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200'
        >
          {isScanning ? (
            <>
              <Loader className='animate-spin' size={20} />
              Scanning...
            </>
          ) : (
            <>🔍 Scan for Secrets</>
          )}
        </button>

        <button
          onClick={handleClear}
          disabled={isScanning}
          className='px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200'
        >
          Clear
        </button>
      </div>

      {isScanning && (
        <div className='text-center text-blue-400 font-medium'>
          {progressMessage}
        </div>
      )}
    </div>
  );
}

export default CodePaste;
