import time
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC, SVR
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from xgboost import XGBClassifier, XGBRegressor
from sklearn.naive_bayes import GaussianNB

CLASSIFICATION_MODELS = {
    "lr": LogisticRegression(max_iter=1000),
    "dt": DecisionTreeClassifier(),
    "rf": RandomForestClassifier(n_estimators=100),
    "xgb": XGBClassifier(eval_metric="logloss", verbosity=0),
    "knn": KNeighborsClassifier(),
    "svm": SVC(),
}

REGRESSION_MODELS = {
    "lr":    LinearRegression(),
    "ridge": Ridge(),
    "dt":    DecisionTreeRegressor(),
    "rf":    RandomForestRegressor(n_estimators=100),
    "xgb":   XGBRegressor(verbosity=0),
    "svr":   SVR(),
}

def run_models(X_train, X_test, y_train, y_test, selected: list, task: str):
    catalog = CLASSIFICATION_MODELS if task == "classification" else REGRESSION_MODELS
    results = []

    for model_id in selected:
        if model_id not in catalog:
            continue

        model = catalog[model_id]
        start = time.time()
        model.fit(X_train, y_train)
        elapsed = round(time.time() - start, 2)
        preds = model.predict(X_test)

        if task == "classification":
            results.append({
                "id":        model_id,
                "accuracy":  round(accuracy_score(y_test, preds), 4),
                "f1":        round(f1_score(y_test, preds, average="weighted", zero_division=0), 4),
                "precision": round(precision_score(y_test, preds, average="weighted", zero_division=0), 4),
                "recall":    round(recall_score(y_test, preds, average="weighted", zero_division=0), 4),
                "time":      elapsed,
            })
        else:
            mse = mean_squared_error(y_test, preds)
            results.append({
                "id":   model_id,
                "r2":   round(r2_score(y_test, preds), 4),
                "rmse": round(np.sqrt(mse), 4),
                "mae":  round(mean_absolute_error(y_test, preds), 4),
                "time": elapsed,
            })

    sort_key = "accuracy" if task == "classification" else "r2"
    return sorted(results, key=lambda x: x[sort_key], reverse=True)
