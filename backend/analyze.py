from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ncbi_fetcher import fetch_sequence_by_accession
from hydrophobic import calculate_sliding_window
from pattern_matcher import find_pattern_in_regions

router = APIRouter()

class UserInput(BaseModel):
    inputType: str
    inputValue: str
    windowSize: int = 19
    threshold: float = 1.6
    patternRegex: str = r'AL[AVILMPFYWSTNCQHG]{3}LW'

@router.post("/analyze")
async def analyze_sequence(request: UserInput):
    if request.inputType not in ["accession", "sequence"]:
        raise HTTPException(status_code=400, detail="inputType must be 'accession' or 'sequence'")

    sequence = ""
    ncbi_link = None

    if request.inputType == "accession":
        try:
            sequence, ncbi_link = fetch_sequence_by_accession(request.inputValue)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raw = request.inputValue.upper()
        sequence = "".join(c for c in raw if c.isalpha())

    if not sequence:
        raise HTTPException(status_code=400, detail="Sequence is empty")

    window_scores, high_hydrophobicity_regions = calculate_sliding_window(
        sequence, window_size=request.windowSize, threshold=request.threshold
    )
    pattern_matches = find_pattern_in_regions(
        sequence, high_hydrophobicity_regions, pattern_str=request.patternRegex
    )
    

    return {
        "rawSequence": sequence,
        "windowScores": window_scores,
        "highHydrophobicityRegions": [{"start": s, "end": e - 1} for s, e in high_hydrophobicity_regions],
        "patternMatches": pattern_matches,
        "ncbiLink": ncbi_link
    }
