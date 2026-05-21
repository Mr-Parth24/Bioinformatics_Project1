import { useState, useEffect } from 'react';
import { getRandomExampleAccession, getRandomExampleSequence } from './examples';

// input panel
interface InputPanelProps {
  onAnalyze: (type: 'accession' | 'sequence', value: string, settings: any) => void;
  isLoading: boolean;
  clearInputsTrigger: number;
}

export default function InputPanel({ onAnalyze, isLoading, clearInputsTrigger }: InputPanelProps) {
  const [inputType, setInputType] = useState<'accession' | 'sequence'>('accession');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (clearInputsTrigger > 0) {
      setInputValue('');
    }
  }, [clearInputsTrigger]);
  
  // Advanced Settings  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [windowSize, setWindowSize] = useState<number>(19);
  const [threshold, setThreshold] = useState<number>(1.6);
  const [patternRegex, setPatternRegex] = useState('AL[AVILMPFYWSTNCQHG]{3}LW');
  const handleLoadExample = () => {
    if (inputType === 'accession') {
      setInputValue(getRandomExampleAccession());
    } else {
      setInputValue(getRandomExampleSequence());
    }
  };

  // Submitting the form
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent the default form submission
    e.preventDefault();
    // If the input value is not empty, analyze the sequence
    if (inputValue.trim()) {
      // Send the data to our Python backend to do the math
      onAnalyze(inputType, inputValue.trim(), { windowSize, threshold, patternRegex });
    }
  };

  // Returning the input panel
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 w-full min-w-0 box-border">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">New Analysis</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">Input Type</label>
          <div className="flex flex-col sm:flex-row bg-gray-100 p-1 rounded-lg gap-1 sm:gap-0">
            <button
              type="button"
              className={`flex-1 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${inputType === 'accession' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => { setInputType('accession'); setInputValue(''); }}
            >
              Accession Number
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${inputType === 'sequence' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => { setInputType('sequence'); setInputValue(''); }}
            >
              Raw Sequence
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">
            {inputType === 'accession' ? 'NCBI Accession' : 'FASTA Sequence'}
          </label>
          {inputType === 'accession' ? (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. NP_001193600.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              required
            />
          ) : (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter amino acid sequence..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-mono text-sm"
              required
            />
          )}
          <button
            type="button"
            onClick={handleLoadExample}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-sm rounded-lg transition-colors"
          >
            Load Example
          </button>
        </div>

        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
            <span className="text-gray-500 text-sm">{showAdvanced ? '▲' : '▼'}</span>
          </button>
          
          {showAdvanced && (
            <div className="p-4 space-y-4 bg-white border-t border-gray-200">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Window Size</label>
                <input
                  type="number"
                  value={windowSize}
                  onChange={(e) => setWindowSize(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Threshold (≥)</label>
                <input
                  type="number"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Target Pattern (Regex)</label>
                <input
                  type="text"
                  value={patternRegex}
                  onChange={(e) => setPatternRegex(e.target.value)}
                  className="w-full min-w-0 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-mono focus:ring-1 focus:ring-brand-500 outline-none break-all"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </form>
    </div>
  );
}
