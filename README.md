# Bioinformatics Project 1


## Option 1 — Use the live website

Open this link in your browser

https://bioinformatics-project1.pages.dev/

---

## Option 2 — Run on your own computer

You need **Python** and **Node.js** installed. Use **two terminals**.

### Terminal 1 — Backend

```powershell
cd path\to\your\Project1\backend
pip install -r requirements.txt
python -m uvicorn main:project --reload --host 127.0.0.1 --port 8000
```

Replace `path\to\your\Project1` with where you saved the project.

Check: http://127.0.0.1:8000/ should say the server is running.

### Terminal 2 — Frontend

```powershell
cd path\to\your\Project1\frontend
npm install
npm run dev
```

Open the URL Vite prints

The frontend uses `http://localhost:8000` for the API by default

### Use the app

1. Enter an accession or paste a protein sequence or load example
2. Click **Run Analysis**.
3. Click **Export Data** to download a CSV file

---
## What you can do in the app

### Input (left side)

- **Accession number** — type an NCBI ID (example `NP_001193600.1`) The app fetches the protein from NCBI
- **Raw sequence** — paste your own amino acid sequence instead
- **Load Example** — fills in a sample accession or sequence to check
  
- **Advanced Settings** 
  - **Window size** (default 19)
  - **Threshold** (default 1.6)
  - **Pattern** (default AL[AVILMPFYWSTNCQHG]{3}LW)
    
- **Run Analysis** — sends input to the backend and shows results on the right

### Results (right side)

- **Hydropathy chart** — line graph of scores along the sequence. The red dashed line is threshold
- **Save Chart as PNG** — downloads the chart as an image file
- **View on NCBI** — open the protein page on NCBI only when used an accession
- **Export Data** — download a **CSV** file with scores, pattern matches and other info
- **Clear Data** — wipes results and the input box so we can start a new run

### Sequence Viewer

- Shows the full sequence with **position numbers** on the left 60 letter per line)
- **Red** — amino acids in high-hydrophobicity regions at or above your threshold
- **Blue** — pattern matches
  
- Shows **how many amino acids** are in the sequence
- Summary text below the sequence
  - how many hydrophobic regions and where they are
  - how many pattern matches and their positions
  - how many window scored above the threshold
- **Copy** — copy the whole sequence to clipboard

---
