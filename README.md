<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=AutoBench&fontSize=72&fontColor=ffffff&animation=twinkling&fontAlignY=32&desc=No-Code%20AutoML%20Platform&descAlignY=55&descSize=22&descColor=ffffff" width="100%"/>

<br/>

<a href="https://github.com/anshunigam-trigger/automl-workbench">
  <img src="https://img.shields.io/github/stars/anshunigam-trigger/automl-workbench?style=for-the-badge&logo=github&color=6366F1&labelColor=0F1120" alt="Stars"/>
</a>
<a href="https://github.com/anshunigam-trigger/automl-workbench/issues">
  <img src="https://img.shields.io/github/issues/anshunigam-trigger/automl-workbench?style=for-the-badge&logo=github&color=EF4444&labelColor=0F1120" alt="Issues"/>
</a>
<img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=0F1120" alt="Python"/>
<img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0F1120" alt="FastAPI"/>
<img src="https://img.shields.io/badge/Next.js-14-ffffff?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0F1120" alt="Next.js"/>
<img src="https://img.shields.io/badge/scikit--learn-latest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white&labelColor=0F1120" alt="scikit-learn"/>
<img src="https://img.shields.io/badge/XGBoost-latest-189AB4?style=for-the-badge&logoColor=white&labelColor=0F1120" alt="XGBoost"/>
<img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge&labelColor=0F1120" alt="License"/>

<br/><br/>

### 🚀 Upload any CSV → Select ML algorithms → Get real accuracy scores. No code required.

<br/>

[**View Demo**](#-demo) · [**Quick Start**](#-getting-started) · [**API Docs**](#-api-documentation) · [**Report Bug**](../../issues) · [**Request Feature**](../../issues)

<br/>

</div>

---

<div align="center">

## 📸 Demo

> **Telecom Customer Churn Dataset** · 7,043 rows · 19 features · Classification task

![AutoBench Leaderboard](https://i.imgur.com/placeholder.png)

*Real accuracy scores from scikit-learn — not hardcoded. Logistic Regression won with **81.55%** accuracy, outperforming XGBoost by **2.13%**.*

</div>

---

## 📋 Table of Contents

| Section | Description |
|---|---|
| [🧠 About](#-about-the-project) | What is AutoBench and why it exists |
| [✨ Features](#-key-features) | Full list of capabilities |
| [🛠️ Tech Stack](#️-tech-stack) | Technologies used |
| [📁 Structure](#-project-structure) | Folder and file organization |
| [🚀 Getting Started](#-getting-started) | Setup and run locally |
| [🤖 Algorithms](#-supported-algorithms) | All 12 supported ML models |
| [⚙️ Pipeline](#️-preprocessing-pipeline) | Auto preprocessing steps |
| [📡 API](#-api-documentation) | Endpoint reference |
| [🗺️ Roadmap](#️-roadmap) | What's coming next |
| [👨‍💻 Author](#-author) | About me |

---

## 🧠 About the Project

**AutoBench** is a full-stack AutoML platform that automates the complete machine learning workflow — from raw CSV data to a ranked model leaderboard — without writing a single line of ML code.

### The Problem

Every ML project has the same painful, repetitive setup:

```
Handle missing values → Encode categoricals → Scale features →
Try 5-6 models → Tune each one → Compare results
```

This takes hours and results in messy, unreadable notebooks. **AutoBench does all of it in seconds.**

### The Solution

```
You upload a CSV
      ↓
AutoBench auto-preprocesses it
      ↓
Trains your selected models on real data
      ↓
Returns a leaderboard with real accuracy scores
```

### Why this matters

Tools like **H2O.ai**, **DataRobot**, and **Google AutoML** solve this commercially — charging thousands of dollars. AutoBench is an open-source alternative built from scratch with a modern full-stack architecture.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🗂️ Smart Upload
Drag & drop any CSV file with instant column detection, type inference, and data preview table

### 🔧 Auto Preprocessing
Missing value imputation, categorical encoding, feature scaling — all handled automatically without configuration

### 🧠 12 Algorithms
6 classification + 6 regression algorithms ready to compare in a single run

</td>
<td width="50%">

### 📊 Real Leaderboard
Actual scores computed by scikit-learn on your data — Accuracy, F1, Precision, Recall, R², RMSE

### ⚡ Live Training Log
Watch models train in real time with an animated terminal-style progress log

### 🏆 Smart Insights
Auto-generated analysis explaining which model won and by how much

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<th>Layer</th>
<th>Technology</th>
<th>Why</th>
</tr>
<tr>
<td><b>Frontend</b></td>
<td>Next.js 14 · App Router · Custom CSS</td>
<td>Component-based, file-based routing, production-ready</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>FastAPI · Uvicorn · Python 3.11</td>
<td>Fastest Python framework, async, auto API docs</td>
</tr>
<tr>
<td><b>ML</b></td>
<td>scikit-learn · XGBoost · pandas</td>
<td>Industry standard ML libraries</td>
</tr>
<tr>
<td><b>Preprocessing</b></td>
<td>StandardScaler · LabelEncoder · train_test_split</td>
<td>Reliable, production-grade sklearn utilities</td>
</tr>
<tr>
<td><b>Design</b></td>
<td>Custom CSS · JetBrains Mono · Plus Jakarta Sans</td>
<td>No UI library — full design control</td>
</tr>
</table>

### Architecture

```
┌─────────────────────────────────────────────────────┐
│              Next.js (Port 3000)                     │
│  Upload → Configure → Algorithms → Training → Results│
└───────────────────┬─────────────────────────────────┘
                    │ POST /train (multipart/form-data)
                    ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI (Port 8000)                     │
│  main.py → preprocessor.py → runner.py              │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              scikit-learn + XGBoost                  │
│  LR · DT · RF · XGB · KNN · SVM                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
automl-workbench/
│
├── 📂 backend/                     # FastAPI Python backend
│   ├── 📄 main.py                  # API routes + CORS middleware
│   ├── 📄 preprocessor.py          # Auto preprocessing pipeline
│   ├── 📄 runner.py                # Model training + evaluation loop
│   └── 📄 requirements.txt         # Python dependencies
│
├── 📂 frontend/                    # Next.js 14 frontend
│   ├── 📂 app/
│   │   ├── 📄 layout.jsx           # Root layout + metadata
│   │   ├── 📄 page.jsx             # Main page — state orchestration
│   │   └── 📄 globals.css          # Full design system (CSS variables)
│   │
│   ├── 📂 components/
│   │   ├── 📄 Topbar.jsx           # Navigation header
│   │   ├── 📄 Stepper.jsx          # Step progress indicator
│   │   └── 📂 steps/
│   │       ├── 📄 UploadStep.jsx   # Drag & drop file upload
│   │       ├── 📄 ConfigureStep.jsx# Target column + task selection
│   │       ├── 📄 AlgorithmsStep.jsx # Algorithm selection cards
│   │       ├── 📄 TrainingStep.jsx # Live training log + progress bar
│   │       └── 📄 ResultsStep.jsx  # Leaderboard + insights
│   │
│   └── 📂 lib/
│       ├── 📄 api.js               # All FastAPI calls centralized
│       ├── 📄 constants.js         # Model definitions + config
│       └── 📄 parseCSV.js          # CSV parsing utilities
│
├── 📄 .gitignore                   # Excludes venv, node_modules, etc.
└── 📄 README.md                    # You are here
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node --version    # v18 or higher
python --version  # 3.9 or higher
git --version     # any version
```

### 1️⃣ Clone the repository

```bash
git clone https://github.com/anshunigam-trigger/automl-workbench.git
cd automl-workbench
```

### 2️⃣ Start the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

> ✅ Backend running at `http://localhost:8000`  
> ✅ Interactive API docs at `http://localhost:8000/docs`

### 3️⃣ Start the Frontend

```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

> ✅ Frontend running at `http://localhost:3000`

### 4️⃣ Run your first experiment

1. Open `http://localhost:3000`
2. Drop any `.csv` file onto the upload zone
3. Select your target column
4. Pick 2–4 algorithms
5. Click **Run** and watch the leaderboard build in real time

---

## 🤖 Supported Algorithms

### Classification

| ID | Algorithm | Complexity | Best For |
|---|---|---|---|
| `lr` | Logistic Regression | O(n) | Linear data, fast baseline |
| `dt` | Decision Tree | O(n log n) | Explainable rules |
| `rf` | Random Forest | O(n log n · k) | General purpose, handles noise |
| `xgb` | XGBoost | O(n log n · k) | Tabular data, competitions |
| `knn` | K-Nearest Neighbors | O(nk) | Small datasets |
| `svm` | Support Vector Machine | O(n²–n³) | High-dimensional data |

### Regression

| ID | Algorithm | Complexity | Best For |
|---|---|---|---|
| `lr` | Linear Regression | O(n) | Linear relationships |
| `ridge` | Ridge Regression | O(n) | Multicollinearity, L2 |
| `dt` | Decision Tree | O(n log n) | Non-linear patterns |
| `rf` | Random Forest | O(n log n · k) | Robust, handles outliers |
| `xgb` | XGBoost | O(n log n · k) | Complex patterns |
| `svr` | Support Vector Regression | O(n²–n³) | Small-medium datasets |

---

## ⚙️ Preprocessing Pipeline

Every uploaded dataset passes through this pipeline **automatically** before any model sees it:

```
📂 Raw CSV
    │
    ├─ 🗑️  Drop ID columns
    │       Any column where every value is unique is useless for ML
    │
    ├─ 🔧  Fix whitespace → NaN
    │       Empty strings like " " become proper null values
    │
    ├─ 📊  Impute missing values
    │       Numeric  → MEDIAN  (resistant to outliers)
    │       Categorical → MODE (most frequent value)
    │
    ├─ 🏷️  Encode categorical features
    │       "Male"/"Female" → 0/1  (LabelEncoder)
    │
    ├─ 📐  Normalize numeric features
    │       StandardScaler → mean=0, std=1
    │       (ensures no feature dominates due to scale)
    │
    └─ ✂️  Train / Test split
            80% training · 20% testing
            Stratified for classification tasks
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### `GET /`
Health check.

**Response:**
```json
{ "message": "AutoML backend is running" }
```

---

### `POST /train`
Train selected models on uploaded dataset. Returns a ranked leaderboard.

**Request** · `multipart/form-data`

| Field | Type | Required | Example |
|---|---|---|---|
| `file` | `.csv` file | ✅ | `telecom.csv` |
| `target` | `string` | ✅ | `"Churn"` |
| `task` | `string` | ✅ | `"classification"` |
| `models` | JSON string | ✅ | `["lr","rf","xgb"]` |

**Response · Classification**
```json
{
  "results": [
    { "id": "lr",  "accuracy": 0.8155, "f1": 0.8106, "precision": 0.8086, "recall": 0.8155, "time": 0.02 },
    { "id": "xgb", "accuracy": 0.7942, "f1": 0.7871, "precision": 0.7844, "recall": 0.7942, "time": 3.68 },
    { "id": "rf",  "accuracy": 0.7899, "f1": 0.7776, "precision": 0.7764, "recall": 0.7899, "time": 3.0  }
  ],
  "rows": 7043,
  "features": ["gender", "tenure", "MonthlyCharges", "TotalCharges"]
}
```

**Response · Regression**
```json
{
  "results": [
    { "id": "rf", "r2": 0.8923, "rmse": 4.231, "mae": 3.102, "time": 0.88 }
  ],
  "rows": 1000,
  "features": ["feature1", "feature2"]
}
```

---

## 🗺️ Roadmap

```
✅ Phase 1 — Core AutoML
   ✅ CSV upload with drag & drop
   ✅ Auto preprocessing pipeline
   ✅ 12 algorithm comparison
   ✅ Real leaderboard with metrics
   ✅ Professional Next.js frontend
   ✅ Component-based architecture

🔄 Phase 2 — Data Intelligence (in progress)
   ⬜ Data profiling report per column
   ⬜ Feature correlation heatmap
   ⬜ Class imbalance detection + SMOTE
   ⬜ Outlier detection visualization
   ⬜ Distribution plots per feature

📋 Phase 3 — Advanced ML
   ⬜ Feature importance chart
   ⬜ Confusion matrix visualization
   ⬜ ROC / AUC curve comparison
   ⬜ Hyperparameter tuning (Optuna)
   ⬜ K-Fold cross validation
   ⬜ SHAP model explainability
   ⬜ Download trained model (.pkl)

🏗️ Phase 4 — Platform
   ⬜ Experiment history (SQLite)
   ⬜ Dataset management page
   ⬜ Model registry
   ⬜ Export results as CSV / PDF

🚀 Phase 5 — Production
   ⬜ User authentication (NextAuth.js)
   ⬜ PostgreSQL + SQLAlchemy
   ⬜ Background jobs (Celery + Redis)
   ⬜ Docker containerization
   ⬜ Deploy on Render + Vercel
```

---

## 🤝 Contributing

Contributions are welcome.

```bash
# Fork → Clone → Branch
git checkout -b feature/your-feature

# Make changes → Commit
git commit -m "feat: your feature description"

# Push → Pull Request
git push origin feature/your-feature
```

### Commit Convention
```
feat:     new feature
fix:      bug fix
docs:     documentation only
refactor: code restructure
style:    formatting, no logic change
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

## 👨‍💻 Author

<img src="https://github.com/anshunigam-trigger.png" width="100" style="border-radius: 50%"/>

### Anshu Nigam

**B.Tech CSE (IoT Specialization)**  
IEM Kolkata · Batch 2024–2028

*Building at the intersection of AI/ML and Full-Stack Development*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-anshunigam--trigger-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/anshunigam-trigger)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Anshu%20Nigam-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anshu-nigam/)

<br/>

**If this project helped you, please consider giving it a ⭐**

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

</div>
