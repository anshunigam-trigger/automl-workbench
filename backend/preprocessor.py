import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split


def preprocess(df: pd.DataFrame, target: str, task: str):

    # 1. Drop ID-like columns (every value unique), but never the target
    for col in df.columns:
        if col != target and df[col].nunique() == len(df):
            df = df.drop(columns=[col])

    # 2. A row with no target value cannot be used for training
    df = df.dropna(subset=[target])

    X = df.drop(columns=[target])
    y = df[target]

    # 3. Prepare the target according to the task
    if task == "classification":
        # A class with a single row cannot be split between train and test
        counts  = y.value_counts()
        singles = counts[counts < 2].index
        if len(singles):
            keep = ~y.isin(singles)
            X, y = X[keep], y[keep]

        # ALWAYS encode labels as 0..n-1. XGBoost requires it, and it also
        # handles numeric labels that skip numbers (15, 20, 25 ...).
        y = LabelEncoder().fit_transform(y.astype(str))
    else:
        y = pd.to_numeric(y, errors="coerce")
        if y.isna().any():
            raise ValueError(
                f'The target column "{target}" contains text, so regression cannot '
                f'predict it. Choose a numeric column, or switch the task to classification.'
            )

    # 4. Clean the features (unchanged)
    X = X.replace(r'^\s*$', float('nan'), regex=True)
    for col in X.select_dtypes(include='object').columns:
        converted = pd.to_numeric(X[col], errors='coerce')
        if converted.notna().sum() >= len(X) * 0.5:
            X[col] = converted

    num_cols = X.select_dtypes(include=['number']).columns
    cat_cols = X.select_dtypes(exclude=['number']).columns

    for col in num_cols:
        X[col] = X[col].fillna(X[col].median())
    for col in cat_cols:
        X[col] = X[col].fillna(X[col].mode()[0])

    le = LabelEncoder()
    for col in X.select_dtypes(include='object').columns:
        X[col] = le.fit_transform(X[col].astype(str))

    scaler = StandardScaler()
    X = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

    # 5. Split, keeping class proportions equal in train and test
    stratify = y if task == "classification" else None
    try:
        return train_test_split(X, y, test_size=0.2, random_state=42, stratify=stratify)
    except ValueError:
        return train_test_split(X, y, test_size=0.2, random_state=42)