# Skill Gap Analysis Agent

AI-powered full-stack app that compares a Job Description against a candidate Resume,
extracts skills with Groq, computes a match score, and generates a learning roadmap.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, Recharts, jsPDF
- **Backend:** FastAPI, Uvicorn, Pydantic, pdfplumber, PyMongo, Groq SDK
- **Database:** MongoDB
- **AI:** Groq API (Llama 3.3 70B by default)

---

## Project Structure

```
skill-gap-agent/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entrypoint, CORS, error handlers
│   │   ├── database.py      # MongoDB connection
│   │   ├── config.py        # Env var loading
│   │   ├── models/          # Pydantic schemas
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic (Groq calls, DB ops)
│   │   └── utils/           # PDF parsing, helpers
│   ├── requirements.txt
│   ├── .env                 # placeholders only
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Toast, Spinner, FileDropzone
    │   ├── pages/           # Home, UploadJobDescription, UploadResume, Dashboard
    │   ├── services/api.js  # Axios client
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── tailwind.config.js
    ├── .env                 # placeholders only
    └── .gitignore
```

---

## 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Edit `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
GROQ_API_KEY=gsk_your_groq_key_here
DATABASE_NAME=skill_gap_agent
FRONTEND_URL=http://localhost:5173
GROQ_MODEL=llama-3.3-70b-versatile
```

- Get a free Groq API key at https://console.groq.com
- Get a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas (or run MongoDB locally)

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

---

## 2. Frontend Setup

```bash
cd frontend
npm install
```

Edit `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Run the frontend:

```bash
npm run dev
```

App available at `http://localhost:5173`.

---

## 3. Usage Flow

1. Go to **Upload JD** → enter role, company, and paste/upload the job description.
2. Go to **Upload Resume** → enter candidate name, email, and upload the resume PDF.
   This automatically triggers `/analyze` against the most recently uploaded job.
3. You're redirected to the **Dashboard**, showing match score, matched/missing skills,
   strengths, weaknesses, recommendations, and a learning roadmap. Download it as a PDF report.

---

## 4. API Reference

| Method | Endpoint                        | Description                              |
|--------|----------------------------------|-------------------------------------------|
| POST   | `/api/upload-job-description`   | Upload JD (PDF or text), extracts skills |
| GET    | `/api/jobs`                     | List all jobs                             |
| GET    | `/api/jobs/{job_id}`            | Get a single job                          |
| POST   | `/api/upload-resume`            | Upload resume PDF, extracts skills       |
| GET    | `/api/candidates`               | List all candidates                       |
| GET    | `/api/candidates/{candidate_id}`| Get a single candidate                    |
| POST   | `/api/analyze`                  | Run AI gap analysis (`job_id`, `candidate_id`) |
| GET    | `/api/analysis/{analysis_id}`   | Get a saved analysis                      |

Match classification:
- **80–100%** → Strong Match
- **60–79%** → Moderate Match
- **Below 60%** → High Skill Gap

---

## 5. Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo.
2. Create a new **Web Service** on Render, connect the repo.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (`MONGO_URI`, `GROQ_API_KEY`, `DATABASE_NAME`, `FRONTEND_URL`, `GROQ_MODEL`) in Render's dashboard.

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo.
2. Import the project in Vercel, framework preset: **Vite**.
3. Set environment variable `VITE_API_BASE_URL` to your deployed Render backend URL + `/api`.
4. Deploy.

Once both are live, update `FRONTEND_URL` in the backend's Render env vars to your Vercel domain
so CORS allows requests from production.

---

## 6. Error Handling Covered

- Invalid/non-PDF uploads
- Empty or unreadable PDFs (e.g. scanned images)
- Missing required form fields
- Groq API failures or malformed AI responses (auto-repaired JSON parsing)
- MongoDB connection/query failures
- Invalid MongoDB ObjectIds
- Global FastAPI exception handlers return clean JSON errors (no stack traces leaked)
- Frontend surfaces every backend error via toast notifications
