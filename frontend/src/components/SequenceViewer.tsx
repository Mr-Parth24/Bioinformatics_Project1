
import { AnalysisResponse } from '../api/analyze';

// sequence viewer 
interface SequenceViewerProps {
  data: AnalysisResponse;
  threshold: number;
  windowSize: number;
}

// count the highlighted amino acids
function countHighlightedAminoAcids(regions: { start: number; end: number }[]) {
  const covered = new Set<number>();
  regions.forEach((region) => {
    for (let i = region.start; i <= region.end; i++) {
      covered.add(i);
    }
  });
  return covered.size;
}

// format the pattern positions
function formatPatternPositions(matches: { start: number; end: number }[]) {
  if (matches.length === 0) {
    return '0 found';
  }
  const parts = matches.map((match) => {
    const length = match.end - match.start + 1;
    const startPos = match.start + 1;
    const endPos = match.end + 1;
    return `${startPos}-${endPos} (${length} aa)`;
  });
  return `${matches.length} found: ${parts.join(', ')}`;
}

// format the hydrophobic regions
function formatHydrophobicRegions(regions: { start: number; end: number }[]) {
  if (regions.length === 0) {
    return '0 regions';
  }
  const parts = regions.map((region) => {
    const length = region.end - region.start + 1;
    const startPos = region.start + 1;
    const endPos = region.end + 1;
    return `${startPos}-${endPos} (${length} aa)`;
  });
  return `${regions.length} region(s): ${parts.join(', ')}`;
}

// Sequence Viewer  
export default function SequenceViewer({ data, threshold, windowSize }: SequenceViewerProps) {
  const { rawSequence, highHydrophobicityRegions, patternMatches, windowScores } = data;

  const charStyles = new Array(rawSequence.length).fill('text-gray-600');

  highHydrophobicityRegions.forEach((region) => {
    for (let i = region.start; i <= region.end; i++) {
      if (i < charStyles.length) {
        charStyles[i] = 'text-red-600 font-semibold bg-red-50';
      }
    }
  });

  // highlight the pattern matches
  patternMatches.forEach((match) => {
    for (let i = match.start; i <= match.end; i++) {
      if (i < charStyles.length) {
        charStyles[i] = 'text-blue-700 font-bold bg-blue-100 px-[1px]';
      }
    }
  });

  // count the highlighted amino acids
  const highlightedAaCount = countHighlightedAminoAcids(highHydrophobicityRegions);
  // count the windows above the threshold
  const windowsAboveThreshold = windowScores.filter((point) => point.score >= threshold).length;
  // format the pattern positions
  const patternSummary = formatPatternPositions(patternMatches);
  // format the hydrophobic regions
  const hydrophobicSummary = formatHydrophobicRegions(highHydrophobicityRegions);

  const renderSequence = () => {
    const lines = [];
    const CHUNK_SIZE = 60;
    
    for (let i = 0; i < rawSequence.length; i += CHUNK_SIZE) {
      const lineChars = [];
      const lineEnd = Math.min(i + CHUNK_SIZE, rawSequence.length);
      
      for (let j = i; j < lineEnd; j++) {
        if (j > i && j % 10 === 0) {
          lineChars.push(<span key={`space-${j}`} className="mr-2"></span>);
        }
        lineChars.push(
          <span key={`char-${j}`} className={charStyles[j]}>
            {rawSequence[j]}
          </span>
        );
      }
      
      lines.push(
        <div key={`line-${i}`} className="flex mb-1 min-w-0 gap-2 sm:gap-0">
          <span className="text-gray-400 w-9 sm:w-12 shrink-0 text-right sm:mr-4 select-none text-xs sm:text-sm">
            {i + 1}
          </span>
          <span className="break-all min-w-0 flex-1 text-xs sm:text-sm">{lineChars}</span>
        </div>
      );
    }
    return lines;
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 -mx-0">
      <div className="font-mono min-w-0">
        {renderSequence()}
      </div>
      
      <div className="mt-4 sm:mt-6 space-y-3 text-xs sm:text-sm bg-white p-3 sm:p-4 border border-gray-200 rounded-md">
        <div className="flex items-start gap-2 min-w-0">
          <span className="w-4 h-4 mt-0.5 shrink-0 bg-red-50 border border-red-200 rounded text-red-600 font-bold text-center leading-none inline-flex justify-center items-center text-[10px] sm:text-xs">A</span>
          <div className="min-w-0 flex-1 break-words">
            <p className="text-gray-700 font-medium">High Hydrophobicity (≥{threshold})</p>
            <p className="text-gray-500 mt-0.5 break-words">
              {hydrophobicSummary} · {highlightedAaCount} amino acids highlighted
            </p>
            <p className="text-gray-500 mt-0.5 break-words">
              {windowsAboveThreshold} window(s) of size {windowSize} scored ≥ {threshold}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <span className="w-4 h-4 mt-0.5 shrink-0 bg-blue-100 border border-blue-200 rounded text-blue-700 font-bold text-center leading-none inline-flex justify-center items-center text-[10px] sm:text-xs">A</span>
          <div className="min-w-0 flex-1 break-words">
            <p className="text-gray-700 font-medium">Pattern Match</p>
            <p className="text-gray-500 mt-0.5 break-words">{patternSummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
