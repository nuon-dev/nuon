# This Python 3 environment comes with many helpful analytics libraries installed
# It is defined by the kaggle/python Docker image: https://github.com/kaggle/docker-python
# For example, here's several helpful packages to load

import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)

# Input data files are available in the read-only "../input/" directory
# For example, running this (by clicking run or pressing Shift+Enter) will list all files under the input directory

import os
for dirname, _, filenames in os.walk('/kaggle/input'):
    for filename in filenames:
        print(os.path.join(dirname, filename))

# You can write up to 20GB to the current directory (/kaggle/working/) that gets preserved as output when you create a version using "Save & Run All"
# You can also write temporary files to /kaggle/temp/, but they won't be saved outside of the current session

# Use the kagglehub client library to attach Kaggle resources like competitions, datasets, and models to your session
# Learn more about kagglehub: https://github.com/Kaggle/kagglehub/blob/main/README.md

import kagglehub
# kagglehub.dataset_download('<owner>/<dataset-slug>')

# =============================================================
# IHDP Treatment Effect Prediction
# =============================================================
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error
import lightgbm as lgb
import xgboost as xgb

# ── 1. Load ──────────────────────────────────────────────────
train = pd.read_csv('/kaggle/input/2026-1-004/train.csv')
test  = pd.read_csv('/kaggle/input/2026-1-004/test.csv')
sub   = pd.read_csv('/kaggle/input/2026-1-004/sample_submission.csv')

TARGET = 'y'
ID     = 'id'

# ── 2. Feature Engineering ───────────────────────────────────
def make_features(df):
    df = df.copy()

    # dadage: 결측이 많으므로 -1로 채우고 결측 여부 플래그 추가
    df['dadage_missing'] = df['dadage'].isna().astype(int)
    df['dadage']         = df['dadage'].fillna(-1)

    # mom.edu, site: 결측을 최빈값으로 채움
    for col in ['mom.edu', 'site']:
        df[col] = df[col].fillna(df[col].mode()[0])

    # 나머지 수치형 결측 → 중앙값
    for col in df.select_dtypes(include=np.number).columns:
        if df[col].isna().sum() > 0:
            df[col] = df[col].fillna(df[col].median())

    # 파생 피처
    df['bw_per_preterm']   = df['bw']     / (df['preterm'] + 1)
    df['bw_head_ratio']    = df['bw']     / (df['b.head']  + 1)
    df['parent_age_sum']   = df['momage'] + df['dadage'].clip(lower=0)
    df['health_bw']        = df['nnhealth'] * df['bw'] / 1000
    df['risk_score']       = df['cig'] + df['booze'] + df['drugs']
    df['support_score']    = df['b.marr'] + df['prenatal'] + df['work.dur']

    return df

all_data  = pd.concat([train, test], axis=0).reset_index(drop=True)
all_data  = make_features(all_data)
train_fe  = all_data[all_data[ID].isin(train[ID])].copy()
test_fe   = all_data[all_data[ID].isin(test[ID])].copy()

FEATURES = [c for c in train_fe.columns if c not in [ID, TARGET]]
X        = train_fe[FEATURES].values
y        = train_fe[TARGET].values
X_test   = test_fe[FEATURES].values

# ── 3. Models ────────────────────────────────────────────────
lgb_params = dict(
    objective='regression', metric='rmse',
    n_estimators=2000, learning_rate=0.02,
    num_leaves=31, max_depth=6,
    subsample=0.8, colsample_bytree=0.8,
    reg_alpha=0.1, reg_lambda=1.0,
    min_child_samples=10,
    random_state=42, verbose=-1, n_jobs=-1,
)

xgb_params = dict(
    objective='reg:squarederror', eval_metric='rmse',
    n_estimators=2000, learning_rate=0.02,
    max_depth=5, subsample=0.8, colsample_bytree=0.8,
    reg_alpha=0.1, reg_lambda=1.0,
    early_stopping_rounds=100,
    random_state=42, n_jobs=-1,
)

# ── 4. K-Fold OOF Training ───────────────────────────────────
N_SPLITS = 5
kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=42)

oof_lgb  = np.zeros(len(X))
oof_xgb  = np.zeros(len(X))
pred_lgb = np.zeros(len(X_test))
pred_xgb = np.zeros(len(X_test))

for fold, (tr_idx, val_idx) in enumerate(kf.split(X)):
    X_tr, X_val = X[tr_idx], X[val_idx]
    y_tr, y_val = y[tr_idx], y[val_idx]

    # LightGBM
    m_lgb = lgb.LGBMRegressor(**lgb_params)
    m_lgb.fit(X_tr, y_tr,
              eval_set=[(X_val, y_val)],
              callbacks=[lgb.early_stopping(100, verbose=False),
                         lgb.log_evaluation(period=-1)])
    oof_lgb[val_idx]  = m_lgb.predict(X_val)
    pred_lgb         += m_lgb.predict(X_test) / N_SPLITS

    # XGBoost
    m_xgb = xgb.XGBRegressor(**xgb_params)
    m_xgb.fit(X_tr, y_tr,
              eval_set=[(X_val, y_val)],
              verbose=False)
    oof_xgb[val_idx]  = m_xgb.predict(X_val)
    pred_xgb         += m_xgb.predict(X_test) / N_SPLITS

    rmse_lgb = mean_squared_error(y_val, oof_lgb[val_idx], squared=False)
    rmse_xgb = mean_squared_error(y_val, oof_xgb[val_idx], squared=False)
    print(f"Fold {fold+1}  LGB={rmse_lgb:.4f}  XGB={rmse_xgb:.4f}")

cv_lgb = mean_squared_error(y, oof_lgb, squared=False)
cv_xgb = mean_squared_error(y, oof_xgb, squared=False)
print(f"\nCV RMSE  LGB={cv_lgb:.4f}  XGB={cv_xgb:.4f}")

# ── 5. Weighted Ensemble ─────────────────────────────────────
w_lgb = (1/cv_lgb) / (1/cv_lgb + 1/cv_xgb)
w_xgb = 1 - w_lgb
print(f"Ensemble weights  LGB={w_lgb:.3f}  XGB={w_xgb:.3f}")

final_pred = w_lgb * pred_lgb + w_xgb * pred_xgb

# ── 6. Submission ─────────────────────────────────────────────
sub[TARGET] = final_pred
sub.to_csv('submission.csv', index=False)
print("\nsubmission.csv saved")
print(sub.head())
