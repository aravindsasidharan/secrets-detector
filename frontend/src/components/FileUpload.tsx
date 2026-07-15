import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Loader } from 'lucide-react';

interface FileUploadProps {
  onScanComplete: (results: any) => void;
  onError: (error: string) => void;
}

function FileUpload({ onScanComplete, onError }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      onError('No file selected');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onError(`File too large. Maximum size is 10MB`);
      return;
    }

    setSelectedFile(file);

    const extension = file.name.split('.').pop()?.toLowerCase();
    const detectedLanguage = detectLanguageFromExtension(extension);
    setLanguage(detectedLanguage);
  };

  const detectLanguageFromExtension = (
    extension: string | undefined,
  ): string => {
    if (!extension) return 'unknown';

    const languageMap: { [key: string]: string } = {
      java: 'java',
      py: 'python',
      js: 'javascript',
      ts: 'typescript',
      go: 'go',
      cpp: 'cpp',
      cs: 'csharp',
      php: 'php',
    };

    return languageMap[extension] || 'unknown';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      const syntheticEvent = {
        target: {
          files: [file],
        },
      } as any;

      handleFileChange(syntheticEvent);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      onError('Please select a file');
      return;
    }

    if (!language || language === 'unknown') {
      onError('Please select or verify the programming language');
      return;
    }

    try {
      setIsScanning(true);
      setProgressMessage('Preparing file...');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', language);

      setProgressMessage('Uploading file...');

      const response = await axios.post(
        'http://localhost:8080/api/secrets/scan/file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setProgressMessage('Scanning for secrets...');

      if (response.status === 200 && response.data) {
        const { data, scanId } = response.data;

        onScanComplete({
          scanId,
          ...data,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to scan file';

      onError(errorMessage);
    } finally {
      setIsScanning(false);
      setProgressMessage('');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLanguage('');
    setProgressMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='space-y-6'>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className='border-2 border-dashed border-slate-500 rounded-lg p-12 text-center transition-colors duration-200 hover:border-blue-500 hover:bg-blue-900/10 cursor-pointer'
      >
        <Upload className='mx-auto mb-4 text-blue-400' size={40} />

        <p className='text-lg font-medium text-white mb-2'>
          Drag and drop your code file here
        </p>
        <p className='text-gray-400 mb-4'>
          or click below to select a file (Max 10MB)
        </p>

        <input
          ref={fileInputRef}
          type='file'
          onChange={handleFileChange}
          className='hidden'
          id='file-input'
          disabled={isScanning}
        />

        <label
          htmlFor='file-input'
          className='inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer'
        >
          Browse Files
        </label>
      </div>

      {selectedFile && (
        <div className='bg-slate-700/50 border border-slate-600 rounded-lg p-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <p className='text-sm text-gray-400 mb-1'>File Name</p>
              <p className='text-white font-medium truncate'>
                {selectedFile.name}
              </p>
            </div>

            <div>
              <p className='text-sm text-gray-400 mb-1'>File Size</p>
              <p className='text-white font-medium'>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>

            <div>
              <p className='text-sm text-gray-400 mb-1'>Language</p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isScanning}
                className='w-full px-3 py-1 bg-slate-800 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500'
              >
                <option value='unknown'>Unknown</option>
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
        </div>
      )}

      <div className='flex gap-4 justify-center'>
        <button
          onClick={handleScan}
          disabled={!selectedFile || isScanning}
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
          disabled={!selectedFile || isScanning}
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

export default FileUpload;
