<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=200&section=header&text=AutoBench&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=No-Code%20AutoML%20Platform&descAlignY=55&descSize=20" width="100%"/>

<br/>

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-latest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-latest-189AB4?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)

<br/>

> **Upload any CSV dataset → select ML algorithms → get real accuracy scores compared side-by-side.**
> No code. No setup. No waiting.

<br/>

[🚀 Live Demo](#) · [📖 Documentation](#api-documentation) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

<br/>

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Supported Algorithms](#-supported-algorithms)
- [Preprocessing Pipeline](#-preprocessing-pipeline)
- [API Documentation](#-api-documentation)
- [How It Works](#-how-it-works)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🧠 About the Project

**AutoBench** is a full-stack AutoML platform that automates the entire machine learning workflow from raw data to a ranked leaderboard — without writing a single line of ML code.

Tools like **H2O.ai**, **DataRobot**, and **PyCaret** solve this problem commercially. AutoBench is an open-source alternative built from scratch with a modern tech stack.

### The Problem

Every ML project has the same repetitive steps:
- Handle missing values
- Encode categorical columns
- Scale numeric features
- Try 5-6 models
- Compare their scores

This takes hours and produces messy notebooks. AutoBench does all of it in seconds.

### The Solution

```
You upload a CSV  →  AutoBench preprocesses it  →  Trains your selected models  →  Shows a real leaderboard
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗂️ **Smart Upload** | Drag & drop CSV with instant preview table and column detection |
| 🔧 **Auto Preprocessing** | Missing values, encoding, scaling — all automatic |
| 🧠 **12 Algorithms** | 6 classifiers + 6 regressors ready to compare |
| 📊 **Real Leaderboard** | Actual scores from sklearn — not fake or hardcoded |
| ⚡ **Live Training Log** | Watch models train in real time with animated progress |
| 🏆 **Smart Insights** | Auto-generated analysis of why the best model won |
| 📱 **Responsive UI** | Works on desktop and mobile |
| 🎨 **Dark Theme** | Professional dark UI built from scratch — no UI library |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **Custom CSS** | Full design system with CSS variables |
| **JetBrains Mono** | Monospace font for terminal aesthetic |
| **Plus Jakarta Sans** | Clean sans-serif for body text |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python API framework |
| **Uvicorn** | ASGI server — like Nodemon for Python |
| **pandas** | Data manipulation and preprocessing |
| **scikit-learn** | ML algorithms + preprocessing utilities |
| **XGBoost** | Gradient boosting — often the top performer |

### Architecture
```
Next.js (Port 3000)  ──POST /train──▶  FastAPI (Port 8000)  ──▶  scikit-learn
        ◀──────────── JSON results ──────────────────────────────────────────
```

---

## 📁 Project Structure

```
automl-workbench/
│
├── 📂 backend/                    # FastAPI Python backend
│   ├── main.py                    # API routes + CORS config
│   ├── preprocessor.py            # Auto preprocessing pipeline
│   ├── runner.py                  # Model training + evaluation loop
│   └── requirements.txt           # Python dependencies
│
└── 📂 frontend/                   # Next.js frontend
    ├── 📂 app/
    │   ├── layout.jsx             # Root layout + metadata
    │   ├── page.jsx               # Main page — all state management
    │   └── globals.css            # Full design system CSS
    │
    ├── 📂 components/
    │   ├── Topbar.jsx             # Navigation header
    │   ├── Stepper.jsx            # Step progress indicator
    │   └── 📂 steps/
    │       ├── UploadStep.jsx     # Drag & drop file upload
    │       ├── ConfigureStep.jsx  # Target column + task type
    │       ├── AlgorithmsStep.jsx # Algorithm selection cards
    │       ├── TrainingStep.jsx   # Live training log + progress
    │       └── ResultsStep.jsx    # Leaderboard + insights
    │
    └── 📂 lib/
        ├── api.js                 # All FastAPI calls in one place
        ├── constants.js           # Model definitions + step config
        └── parseCSV.js            # CSV parsing utilities
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
node --version    # v18 or higher
python --version  # 3.9 or higher
git --version     # any recent version
```

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/automl-workbench.git
cd automl-workbench
```

### 2. Set up the Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

✅ Backend running at `http://localhost:8000`
✅ API docs available at `http://localhost:8000/docs`

### 3. Set up the Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

✅ Frontend running at `http://localhost:3000`

### 4. Try it out

1. Open `http://localhost:3000`
2. Upload any `.csv` file
3. Select your target column
4. Pick 2-3 algorithms
5. Click **Run** and watch the leaderboard build

---

## 🤖 Supported Algorithms

### Classification

| ID | Algorithm | Best For |
|---|---|---|
| `lr` | Logistic Regression | Linear boundaries, fast baseline |
| `dt` | Decision Tree | Explainable rules, small datasets |
| `rf` | Random Forest | General purpose, handles noise well |
| `xgb` | XGBoost | Tabular data, competition winner |
| `knn` | K-Nearest Neighbors | Small datasets, no training phase |
| `svm` | Support Vector Machine | High-dimensional data |

### Regression

| ID | Algorithm | Best For |
|---|---|---|
| `lr` | Linear Regression | Linear relationships, fastest |
| `ridge` | Ridge Regression | Multicollinearity, L2 regularized |
| `dt` | Decision Tree | Non-linear patterns |
| `rf` | Random Forest | Robust, handles outliers |
| `xgb` | XGBoost | Complex patterns, large datasets |
| `svr` | Support Vector Regression | Small-medium datasets |

---

## ⚙️ Preprocessing Pipeline

Every dataset goes through this pipeline **automatically** before any model sees it:

```
📂 Raw CSV uploaded
        │
        ▼
🗑️  Drop ID columns
    (columns where every value is unique — useless for ML)
        │
        ▼
🔧  Fix whitespace → NaN
    (empty strings like " " converted to proper null values)
        │
        ▼
📊  Impute missing values
    ├── Numeric columns  → fill with MEDIAN (resistant to outliers)
    └── Categorical cols → fill with MODE (most frequent value)
        │
        ▼
🏷️  Encode categorical features
    (text like "Male"/"Female" → numbers like 0/1)
        │
        ▼
📐  Normalize numeric features
    (StandardScaler → mean=0, std=1 — fair comparison between features)
        │
        ▼
✂️  Train / Test split
    (80% training · 20% testing · stratified for classification)
        │
        ▼
🚀  Ready for ML models
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### `GET /`
Health check — verify the backend is running.

**Response:**
```json
{
  "message": "AutoML backend is running"
}
```

---

#### `POST /train`
Upload a dataset and train selected models. Returns a real accuracy leaderboard.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `.csv` file | ✅ | Dataset to train on |
| `target` | `string` | ✅ | Column name to predict |
| `task` | `string` | ✅ | `classification` or `regression` |
| `models` | JSON string | ✅ | e.g. `["lr","rf","xgb"]` |

**Response — Classification:**
```json
{
  "results": [
    {
      "id": "lr",
      "accuracy": 0.8155,
      "f1": 0.8106,
      "precision": 0.8086,
      "recall": 0.8155,
      "time": 0.02
    },
    {
      "id": "xgb",
      "accuracy": 0.7942,
      "f1": 0.7871,
      "precision": 0.7844,
      "recall": 0.7942,
      "time": 2.25
    }
  ],
  "rows": 7043,
  "features": ["gender", "tenure", "MonthlyCharges", "TotalCharges"]
}
```

**Response — Regression:**
```json
{
  "results": [
    {
      "id": "rf",
      "r2": 0.8923,
      "rmse": 4.231,
      "mae": 3.102,
      "time": 0.88
    }
  ],
  "rows": 1000,
  "features": ["feature1", "feature2"]
}
```

**Error Response:**
```json
{
  "detail": "Column 'target' not found in dataset"
}
```

---

## 🔄 How It Works

### Frontend Flow

```
User uploads CSV
      │
      ▼
JavaScript reads headers client-side (no server needed)
      │
      ▼
User selects target column + task type
      │
      ▼
User selects algorithms
      │
      ▼
fetch() → POST /train → FastAPI
      │
      ▼
Display leaderboard from real scores
```

### Backend Flow

```python
# 1. Receive file + config
contents = await file.read()
df = pd.read_csv(io.BytesIO(contents))

# 2. Preprocess
X_train, X_test, y_train, y_test = preprocess(df, target)

# 3. Train each model and measure
for model_id in selected_models:
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    accuracy = accuracy_score(y_test, preds)

# 4. Return sorted leaderboard
return sorted(results, key=lambda x: x["accuracy"], reverse=True)
```

---

## 🗺️ Roadmap

### ✅ Phase 1 — Core AutoML (Complete)
- [x] CSV upload with drag & drop
- [x] Auto preprocessing pipeline
- [x] Multi-model training + comparison
- [x] Real leaderboard with metrics
- [x] Classification + Regression support
- [x] Professional Next.js frontend

### 🔄 Phase 2 — Data Intelligence (In Progress)
- [ ] Data profiling report per column
- [ ] Feature correlation heatmap
- [ ] Class imbalance detection + SMOTE
- [ ] Outlier detection visualization
- [ ] Distribution plots per feature
- [ ] Auto feature suggestions

### 📋 Phase 3 — Advanced ML
- [ ] Feature importance chart
- [ ] Confusion matrix visualization
- [ ] ROC / AUC curve comparison
- [ ] Hyperparameter tuning (Optuna)
- [ ] K-Fold cross validation
- [ ] Model explainability (SHAP values)
- [ ] Download trained model (.pkl)
- [ ] Predict on new data

### 🏗️ Phase 4 — Platform Features
- [ ] Experiment history (SQLite)
- [ ] Dataset management page
- [ ] Model registry page
- [ ] Export results as CSV / PDF
- [ ] Compare experiments side by side
- [ ] Working navbar pages

### 🚀 Phase 5 — Production
- [ ] User authentication (NextAuth.js)
- [ ] PostgreSQL database
- [ ] Background training jobs (Celery + Redis)
- [ ] Real-time WebSocket updates
- [ ] REST prediction API
- [ ] Docker containerization
- [ ] Deploy on Render + Vercel

---

## 🤝 Contributing

Contributions are welcome. Here's how:

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/AmazingFeature

# Commit your changes
git commit -m "feat: add AmazingFeature"

# Push to the branch
git push origin feature/AmazingFeature

# Open a Pull Request
```

### Commit Convention

```
feat:     new feature
fix:      bug fix
docs:     documentation only
style:    formatting, no logic change
refactor: code restructure, no feature change
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

<div align="center">

**Anshu**

B.Tech CSE (IoT Specialization) · IEM Kolkata · Batch 2024–2028

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourusername)

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=100&section=footer" width="100%"/>

⭐ **Star this repo if you found it useful!**

</div>
