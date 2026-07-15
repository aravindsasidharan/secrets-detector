import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import CodePaste from './components/CodePaste';
import Results from './components/Results';
import History from './components/History';
import { AlertCircle, UploadCloud, Copy, Clock } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<string>('upload');
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanComplete = (results: any) => {
    setScanResults(results);
    setCurrentView('results');
    setError(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <header className='bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='text-3xl'>🔒</div>
            <div>
              <h1 className='text-3xl font-bold text-white'>
                Secrets Detector
              </h1>
              <p className='text-sm text-gray-400'>
                Find exposed secrets in your code
              </p>
            </div>
          </div>

          <nav className='flex gap-4 flex-wrap'>
            <button
              onClick={() => setCurrentView('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <UploadCloud size={20} /> Upload File
            </button>

            <button
              onClick={() => setCurrentView('paste')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'paste'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <Copy size={20} /> Paste Code
            </button>

            <button
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <Clock size={20} /> History
            </button>
          </nav>
        </div>
      </header>

      {error && (
        <div className='max-w-7xl mx-auto px-4 py-3 mt-4'>
          <div className='bg-red-900 border border-red-700 rounded-lg p-4 flex items-start gap-3'>
            <AlertCircle className='text-red-400 flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <p className='text-red-200'>{error}</p>
            </div>
            <button
              onClick={clearError}
              className='text-red-400 hover:text-red-300'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {currentView === 'upload' && (
          <FileUpload
            onScanComplete={handleScanComplete}
            onError={handleError}
          />
        )}
        {currentView === 'paste' && (
          <CodePaste
            onScanComplete={handleScanComplete}
            onError={handleError}
          />
        )}
        {currentView === 'results' && scanResults && (
          <Results data={scanResults} />
        )}
        {currentView === 'history' && (
          <History
            onScanClick={(scan) => {
              setScanResults(scan);
              setCurrentView('results');
            }}
          />
        )}
      </main>

      <footer className='bg-slate-900 border-t border-slate-800 py-8 mt-16'>
        <div className='max-w-7xl mx-auto px-4 text-center text-gray-400'>
          <p className='mb-2'>
            Secrets Detector - Find and fix exposed secrets in your code
          </p>
          <p className='text-sm'>
            Built with Spring Boot, React, and TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
