from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

# ── Connection ──
DATABASE_URL = "sqlite:///./autobench.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Table 1: one row per experiment ──
class Experiment(Base):
    __tablename__ = "experiments"

    id            = Column(Integer, primary_key=True, index=True)
    dataset_name  = Column(String, nullable=False)
    target_column = Column(String, nullable=False)
    task_type     = Column(String, nullable=False)   # "classification" or "regression"
    rows          = Column(Integer)
    created_at    = Column(DateTime, default=datetime.utcnow)

    results = relationship("ModelResult", back_populates="experiment",
                           cascade="all, delete-orphan")


# ── Table 2: one row per model trained inside an experiment ──
class ModelResult(Base):
    __tablename__ = "model_results"

    id            = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    model_id      = Column(String, nullable=False)   # "lr", "rf", "xgb"...

    # Classification metrics (empty for regression runs)
    accuracy  = Column(Float)
    f1_score  = Column(Float)
    precision = Column(Float)
    recall    = Column(Float)

    # Regression metrics (empty for classification runs)
    r2   = Column(Float)
    rmse = Column(Float)
    mae  = Column(Float)

    training_time = Column(Float)

    experiment = relationship("Experiment", back_populates="results")


# ── Create the tables if they don't exist yet ──
Base.metadata.create_all(bind=engine)


# ── Gives each API request its own database session ──
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()