import axios from 'axios';

// api base url
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// analysis response
export interface AnalysisResponse {
  rawSequence: string;
  windowScores: { position: number; score: number }[];
  highHydrophobicityRegions: { start: number; end: number }[];
  patternMatches: { start: number; end: number; sequence: string }[];
  ncbiLink: string | null;
}

// analyze the sequence
export const analyzeSequence = async (
  inputType: 'accession' | 'sequence', 
  inputValue: string,
  windowSize: number = 19,
  threshold: number = 1.6,
  patternRegex: string = 'AL[AVILMPFYWSTNCQHG]{3}LW'

  // return the analysis response
): Promise<AnalysisResponse> => {
  const response = await axios.post(`${API_BASE_URL}/api/analyze`, { 
    inputType, 
    inputValue,
    windowSize,
    threshold,
    patternRegex
  });
  return response.data;

};

// create the url for the export data
export const exportDataUrl = (
  accession: string,
  windowSize: number = 19,
  threshold: number = 1.6,
  patternRegex: string = 'AL[AVILMPFYWSTNCQHG]{3}LW'
) => {
  const params = new URLSearchParams({
    windowSize: windowSize.toString(),
    threshold: threshold.toString(),
    patternRegex
  });
  return `${API_BASE_URL}/api/export/${accession}?${params.toString()}`;
};

// download the export file
export const downloadExportFile = async (
  inputType: 'accession' | 'sequence',
  inputValue: string,
  windowSize: number,
  threshold: number,
  patternRegex: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/export`,
    { inputType, inputValue, windowSize, threshold, patternRegex },
    { responseType: 'blob' }
  );

  // create the filename
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const savedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const defaultName = inputType === 'accession'
    ? `bioinformatics_${inputValue}_${savedAt}.csv`
    : `bioinformatics_sequence_${savedAt}.csv`;

  
  const disposition = response.headers['content-disposition'];
  let filename = defaultName;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }
// create the url
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
