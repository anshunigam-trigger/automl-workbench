from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import io
import json

from preprocessor import preprocess
from runner import run_models
from database import get_db, Experiment, ModelResult

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helper: turn a ModelResult row into a plain dict (JSON-friendly) ──
def result_to_dict(r: ModelResult):
    return {
        "id":        r.model_id,
        "accuracy":  r.accuracy,
        "f1":        r.f1_score,
        "precision": r.precision,
        "recall":    r.recall,
        "r2":        r.r2,
        "rmse":      r.rmse,
        "mae":       r.mae,
        "time":      r.training_time,
    }


# ── Helper: turn an Experiment row into a dict, including its results ──
def experiment_to_dict(exp: Experiment):
    results = [result_to_dict(r) for r in exp.results]
    key = "accuracy" if exp.task_type == "classification" else "r2"
    results.sort(key=lambda x: x[key] or 0, reverse=True)
    return {
        "id":         exp.id,
        "dataset":    exp.dataset_name,
        "target":     exp.target_column,
        "task":       exp.task_type,
        "rows":       exp.rows,
        "created_at": exp.created_at.isoformat(),
        "best":       results[0] if results else None,
        "results":    results,
    }


@app.get("/")
def home():
    return {"message": "AutoML backend is running"}


@app.post("/train")
async def train(
    file: UploadFile = File(...),
    target: str = Form(...),
    task: str = Form(...),
    models: str = Form(default='["lr","rf","xgb"]'),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    if target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{target}' not found in dataset")

    try:
        selected_models = json.loads(models)
    except Exception:
        selected_models = ["lr", "rf", "xgb"]

    try:
        X_train, X_test, y_train, y_test = preprocess(df, target, task)
        results = run_models(X_train, X_test, y_train, y_test, selected_models, task)
    except ValueError as err:
        # Becomes a readable error in the UI instead of "Failed to fetch"
        raise HTTPException(status_code=400, detail=str(err))

    experiment = Experiment(
        dataset_name=file.filename,
        target_column=target,
        task_type=task,
        rows=len(df),
    )
    db.add(experiment)
    db.flush()

    for r in results:
        db.add(ModelResult(
            experiment_id=experiment.id,
            model_id=r["id"],
            accuracy=r.get("accuracy"),
            f1_score=r.get("f1"),
            precision=r.get("precision"),
            recall=r.get("recall"),
            r2=r.get("r2"),
            rmse=r.get("rmse"),
            mae=r.get("mae"),
            training_time=r.get("time"),
        ))
    db.commit()

    return {
        "experiment_id": experiment.id,
        "results":       results,
        "rows":          len(df),
        "features":      list(X_train.columns),
    }


@app.get("/experiments")
def list_experiments(db: Session = Depends(get_db)):
    experiments = db.query(Experiment).order_by(Experiment.created_at.desc()).all()
    return [experiment_to_dict(e) for e in experiments]


@app.get("/experiments/{experiment_id}")
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment_to_dict(exp) 