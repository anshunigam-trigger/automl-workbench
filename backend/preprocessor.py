import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

def preprocess(df: pd.DataFrame, target: str):

    for col in df.columns:
        if df[col].nunique() == len(df):
            df = df.drop(columns=[col])

    X = df.drop(columns=[target])
    y = df[target]

    # encode target if it contains strings
    try:
        y = y.astype(float)
    except:
        le_target = LabelEncoder()
        y = le_target.fit_transform(y.astype(str))

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

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    return X_train, X_test, y_train, y_test