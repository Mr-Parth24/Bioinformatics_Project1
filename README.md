# Bioinformatics Project 1


## Option 1 — Use the live website

Open this link in your browser


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
