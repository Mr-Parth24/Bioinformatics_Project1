from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import csv
import io
from datetime import datetime
from ncbi_fetcher import fetch_sequence_by_accession, fetch_genbank_record
from hydrophobic import calculate_sliding_window
from pattern_matcher import find_pattern_in_regions
from analyze import UserInput

router = APIRouter()


def make_export_filename(accession):
    saved_at = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    if accession:
        return "bioinformatics_" + accession + "_" + saved_at + ".csv"
    return "bioinformatics_sequence_" + saved_at + ".csv"


def get_sequence_for_export(input_type, input_value):
    sequence = ""
    accession = ""
    ncbi_link = ""
    genbank_text = ""

    if input_type == "accession":
        sequence, ncbi_link = fetch_sequence_by_accession(input_value)
        genbank_text = fetch_genbank_record(input_value)
        accession = input_value
    else:
        raw = input_value.upper()
        sequence = "".join([c for c in raw if c.isalpha()])

    if not sequence:
        raise HTTPException(status_code=400, detail="Sequence is empty")

    return sequence, accession, ncbi_link, genbank_text


def build_csv_bytes(sequence, accession, ncbi_link, genbank_text, window_scores, pattern_matches, window_size, threshold):
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Metadata"])
    writer.writerow(["Key", "Value"])
    writer.writerow(["Accession", accession if accession else ""])
    writer.writerow(["NCBI Link", ncbi_link if ncbi_link else ""])
    writer.writerow(["Sequence Length", len(sequence)])
    writer.writerow(["Window Size", window_size])
    writer.writerow(["Threshold", threshold])
    writer.writerow([])

    writer.writerow(["Hydropathy Scores"])
    writer.writerow(["position", "score"])
    for row in window_scores:
        writer.writerow([row["position"], row["score"]])
    writer.writerow([])

    writer.writerow(["Pattern Matches"])
    if pattern_matches:
        writer.writerow(["start", "end", "sequence"])
        for match in pattern_matches:
            writer.writerow([match["start"], match["end"], match["sequence"]])
    else:
        writer.writerow(["Message", "No patterns found"])
    writer.writerow([])

    if genbank_text:
        writer.writerow(["NCBI Record"])
        for line in genbank_text.split("\n"):
            writer.writerow([line])

    return output.getvalue().encode("utf-8")


def run_export(input_type, input_value, window_size, threshold, pattern_regex):
    sequence, accession, ncbi_link, genbank_text = get_sequence_for_export(input_type, input_value)

    window_scores, high_hydrophobicity_regions = calculate_sliding_window(
        sequence, window_size=window_size, threshold=threshold
    )
    pattern_matches = find_pattern_in_regions(
        sequence, high_hydrophobicity_regions, pattern_str=pattern_regex
    )

    file_bytes = build_csv_bytes(
        sequence, accession, ncbi_link, genbank_text,
        window_scores, pattern_matches, window_size, threshold
    )

    filename = make_export_filename(accession)

    return file_bytes, filename


@router.post("/export")
async def export_from_input(request: UserInput):
    if request.inputType not in ["accession", "sequence"]:
        raise HTTPException(status_code=400, detail="inputType must be 'accession' or 'sequence'")

    try:
        file_bytes, filename = run_export(
            request.inputType,
            request.inputValue,
            request.windowSize,
            request.threshold,
            request.patternRegex
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    headers = {
        'Content-Disposition': 'attachment; filename="' + filename + '"'
    }

    return Response(
        content=file_bytes,
        media_type="text/csv",
        headers=headers
    )


@router.get("/export/{accession}")
async def export_data(
    accession: str,
    windowSize: int = 19,
    threshold: float = 1.6,
    patternRegex: str = r'AL[AVILMPFYWSTNCQHG]{3}LW'
):
    try:
        file_bytes, filename = run_export("accession", accession, windowSize, threshold, patternRegex)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    headers = {
        'Content-Disposition': 'attachment; filename="' + filename + '"'
    }

    return Response(
        content=file_bytes,
        media_type="text/csv",
        headers=headers
    )
