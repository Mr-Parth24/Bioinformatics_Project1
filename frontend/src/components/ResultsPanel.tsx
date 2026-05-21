import { useState } from 'react';
import HydropathyChart from './HydropathyChart';
import SequenceViewer from './SequenceViewer';
import { AnalysisResponse, downloadExportFile } from '../api/analyze';

// results panel 
interface ResultsPanelProps {
  data: AnalysisResponse | null;
  lastInput: { type: 'accession' | 'sequence'; value: string } | null;
  settings: { windowSize: number, threshold: number, patternRegex: string };
  onClear: () => void;
}

export default function ResultsPanel({ data, lastInput, settings, onClear }: ResultsPanelProps) {
  const [exporting, setExporting] = useState(false);

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 min-h-[280px] sm:min-h-[400px] w-full min-w-0">
        <p className="text-base sm:text-lg font-medium text-gray-500 text-center px-2">No data to display</p>
        <p className="text-sm mt-1 text-center px-2">Run an analysis to view results here</p>
      </div>
    );
  }

  // download the export file
  const handleDownload = async () => {
    if (!lastInput) return;

    setExporting(true);
    try {
      await downloadExportFile(
        lastInput.type,
        lastInput.value,
        settings.windowSize,
        settings.threshold,
        settings.patternRegex
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(data.rawSequence);
      alert('Sequence copied!');
    }
  };

  // return the results panel
  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 min-w-0 w-full box-border">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Analysis Results</h2>
            <button
              type="button"
              onClick={onClear}
              className="w-full sm:w-auto order-first sm:order-last inline-flex items-center justify-center px-4 py-2.5 border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold text-sm rounded-lg transition-colors shrink-0"
            >
              Clear Data
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full">
            {data.ncbiLink && (
              <a 
                href={data.ncbiLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                View on NCBI
              </a>
            )}
            
            <button
              onClick={handleDownload}
              disabled={!lastInput || exporting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-brand-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exporting...' : '↓ Export Data'}
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 break-words">
          Window size: {settings.windowSize} · Threshold: {settings.threshold}
        </p>
        <div className="mb-2 min-w-0 w-full overflow-hidden">
          <HydropathyChart data={data.windowScores} threshold={settings.threshold} />
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 min-w-0 w-full box-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sequence Viewer</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="text-sm text-gray-500">
              {data.rawSequence.length} Amino Acids
            </div>
            <button 
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors"
            >
              Copy Sequence
            </button>
          </div>
        </div>
        <SequenceViewer
          data={data}
          threshold={settings.threshold}
          windowSize={settings.windowSize}
        />
      </div>
    </div>
  );
}
