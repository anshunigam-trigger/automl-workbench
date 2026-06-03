from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import json
from preprocessor import preprocess
from runner import run_models

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AutoML backend is running"}

@app.post("/train")
async def train(
    file: UploadFile = File(...),
    target: str = Form(...),
    task: str = Form(...),
    models: str = Form(...)
):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    X_train, X_test, y_train, y_test = preprocess(df, target)
    
    try:
        selected_models = json.loads(models)
    except:
        selected_models = ["lr", "rf", "xgb"]
     
    results = run_models(X_train, X_test, y_train, y_test, selected_models, task)

    return {
        "results": results,
        "rows": len(df),
        "features": list(X_train.columns)
    }