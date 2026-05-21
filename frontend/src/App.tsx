import { useState } from 'react';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import { analyzeSequence, AnalysisResponse } from './api/analyze';

function App() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [lastInput, setLastInput] = useState<{ type: 'accession' | 'sequence'; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    windowSize: 19,
    threshold: 1.6,
    patternRegex: 'AL[AVILMPFYWSTNCQHG]{3}LW'
  });
  const [clearInputsTrigger, setClearInputsTrigger] = useState(0);

   // handle the analysis
  const handleAnalyze = async (
    type: 'accession' | 'sequence', 
    value: string,
    settings: { windowSize: number, threshold: number, patternRegex: string }
  ) => {
    setIsLoading(true);
    setError(null);
    setAdvancedSettings(settings);
    setLastInput({ type, value });

    // try to analyze the sequence
    try {
      const result = await analyzeSequence(type, value, settings.windowSize, settings.threshold, settings.patternRegex);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // clear the inputs
  const handleClear = () => {
    setData(null);
    setLastInput(null);
    setError(null);
    setClearInputsTrigger((n) => n + 1);
  };

  return (
    <div className="min-h-screen w-full min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto box-border">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight break-words">
          Bioinformatics Project 1 - Parth Patel
        </h1>
      </header>
      
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg break-words">
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        <div className="lg:col-span-1 min-w-0 w-full">
          <div className="lg:sticky lg:top-6">
            <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} clearInputsTrigger={clearInputsTrigger} />
          </div>
        </div>
        
        <div className="lg:col-span-2 min-w-0 w-full">
          <ResultsPanel data={data} lastInput={lastInput} settings={advancedSettings} onClear={handleClear} />
        </div>
      </main>
    </div>
  )
}

export default App;
