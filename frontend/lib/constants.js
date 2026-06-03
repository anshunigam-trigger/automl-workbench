export const CLS_MODELS = [
  { id: 'lr',  name: 'Logistic Regression',    desc: 'Linear decision boundary. Fast and interpretable.',         tag: 'LINEAR · O(n)'    },
  { id: 'dt',  name: 'Decision Tree',           desc: 'Rule-based splits. Highly explainable output.',            tag: 'TREE · O(n log n)' },
  { id: 'rf',  name: 'Random Forest',           desc: '100-tree ensemble. Robust to noise and overfitting.',      tag: 'ENSEMBLE'          },
  { id: 'xgb', name: 'XGBoost',                 desc: 'Gradient boosting. Top performer on tabular data.',        tag: 'BOOSTING'          },
  { id: 'knn', name: 'K-Nearest Neighbors',     desc: 'Distance-based lazy learner. No training phase needed.',   tag: 'INSTANCE · O(nk)'  },
  { id: 'svm', name: 'Support Vector Machine',  desc: 'Kernel-based max-margin classifier. Strong on small data.',tag: 'KERNEL'            },
]

export const REG_MODELS = [
  { id: 'lr',    name: 'Linear Regression',   desc: 'Assumes linear relationship. Fastest baseline available.', tag: 'LINEAR'      },
  { id: 'ridge', name: 'Ridge Regression',    desc: 'L2-regularized linear. Handles multicollinearity well.',   tag: 'LINEAR · L2' },
  { id: 'dt',    name: 'Decision Tree',        desc: 'Non-linear splits on features. Easy to visualize.',        tag: 'TREE'        },
  { id: 'rf',    name: 'Random Forest',        desc: '100-tree ensemble regressor. Very reliable.',              tag: 'ENSEMBLE'    },
  { id: 'xgb',   name: 'XGBoost',              desc: 'Gradient boosting regressor. State-of-the-art on tabular.',tag: 'BOOSTING'   },
  { id: 'svr',   name: 'Support Vector Reg',   desc: 'Kernel-based regression. Works well on small datasets.',  tag: 'KERNEL'      },
]

export const STEPS = [
  { n: 1, label: 'Dataset',    desc: 'Upload CSV'      },
  { n: 2, label: 'Target',     desc: 'Set objective'   },
  { n: 3, label: 'Algorithms', desc: 'Pick models'     },
  { n: 4, label: 'Results',    desc: 'Leaderboard'     },
]

export const LOG_LINES = [
  { text: '[INFO] Initializing AutoBench engine...',                tag: 'info' },
  { text: '[INFO] Reading dataset and inferring schema...',         tag: 'info' },
  { text: '[OK]   Dataset validated — no critical issues found',   tag: 'ok'   },
  { text: '[INFO] Applying preprocessing pipeline...',             tag: 'info' },
  { text: '[OK]   Missing values imputed (median/mode strategy)',  tag: 'ok'   },
  { text: '[OK]   Categorical features encoded (LabelEncoder)',    tag: 'ok'   },
  { text: '[OK]   Numeric features normalized (StandardScaler)',   tag: 'ok'   },
  { text: '[OK]   Train/test split complete (80% / 20%)',          tag: 'ok'   },
  { text: '[RUN]  Starting model training loop...',                tag: 'run'  },
]
