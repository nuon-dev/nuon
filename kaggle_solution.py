# =============================================================
# Infant Health Development Program - Treatment Effect Prediction
# =============================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingRegressor,
    ExtraTreesRegressor, VotingRegressor
)
from sklearn.metrics import mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# XGBoost / LightGBM (Kaggle 환경에 설치되어 있음)
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False

# ─────────────────────────────────────────
# 1. 데이터 로드
# ─────────────────────────────────────────
train = pd.read_csv('/kaggle/input/2026-1-004/train.csv')
test  = pd.read_csv('/kaggle/input/2026-1-004/test.csv')
sub   = pd.read_csv('/kaggle/input/2026-1-004/submission_sample.csv')

print("Train shape:", train.shape)
print("Test  shape:", test.shape)
print(train.head())
print(train.describe())
print("\nMissing values (train):\n", train.isnull().sum())
print("Missing values (test):\n",  test.isnull().sum())

# ─────────────────────────────────────────
# 2. 기본 EDA
# ─────────────────────────────────────────
plt.figure(figsize=(8, 4))
sns.histplot(train['y'], bins=40, kde=True)
plt.title('Target (y) Distribution')
plt.tight_layout()
plt.savefig('target_dist.png')
plt.show()

# ─────────────────────────────────────────
# 3. 전처리 & 피처 엔지니어링
# ─────────────────────────────────────────
TARGET = 'y'
DROP_COLS = ['id', TARGET]

# 컬럼명 통일 (한글 번역 전 원본 컬럼명 기준)
# 실제 CSV 컬럼명 확인 후 필요시 rename
print("Columns:", train.columns.tolist())


def preprocess(df, is_train=True):
    df = df.copy()

    # 결측값 처리: 연속형 → 중앙값, 범주형 → 최빈값
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in num_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)

    # 파생 피처
    if 'bw' in df.columns and 'b.head' in df.columns:
        df['bw_head_ratio'] = df['bw'] / (df['b.head'] + 1e-5)

    if 'mom.age' in df.columns and 'dad.age' in df.columns:
        df['parent_age_diff'] = df['dad.age'] - df['mom.age']
        df['parent_age_sum']  = df['dad.age'] + df['mom.age']

    if 'preterm' in df.columns and 'bw' in df.columns:
        df['bw_per_week'] = df['bw'] / (df['preterm'] + 40 + 1e-5)

    # site one-hot encoding
    if 'site' in df.columns:
        df = pd.get_dummies(df, columns=['site'], drop_first=False)

    # mom.edu one-hot
    if 'mom.edu' in df.columns:
        df = pd.get_dummies(df, columns=['mom.edu'], drop_first=False)

    return df


train_p = preprocess(train, is_train=True)
test_p  = preprocess(test,  is_train=False)

# train/test 컬럼 맞추기
train_cols = [c for c in train_p.columns if c not in DROP_COLS]
test_p = test_p.reindex(columns=train_cols, fill_value=0)

X = train_p[train_cols]
y = train_p[TARGET]
X_test = test_p[train_cols]

print("X shape:", X.shape)
print("X_test shape:", X_test.shape)

# ─────────────────────────────────────────
# 4. 모델 정의
# ─────────────────────────────────────────
models = {
    'ridge':  Ridge(alpha=10.0),
    'lasso':  Lasso(alpha=0.1, max_iter=5000),
    'rf':     RandomForestRegressor(n_estimators=500, max_depth=8,
                                    min_samples_leaf=3, random_state=42, n_jobs=-1),
    'et':     ExtraTreesRegressor(n_estimators=500, max_depth=8,
                                  min_samples_leaf=3, random_state=42, n_jobs=-1),
    'gbm':    GradientBoostingRegressor(n_estimators=500, learning_rate=0.05,
                                        max_depth=4, subsample=0.8, random_state=42),
}

if HAS_XGB:
    models['xgb'] = xgb.XGBRegressor(
        n_estimators=1000, learning_rate=0.03, max_depth=5,
        subsample=0.8, colsample_bytree=0.8,
        reg_alpha=0.1, reg_lambda=1.0,
        early_stopping_rounds=50, random_state=42, n_jobs=-1
    )

if HAS_LGB:
    models['lgb'] = lgb.LGBMRegressor(
        n_estimators=1000, learning_rate=0.03, max_depth=5,
        num_leaves=31, subsample=0.8, colsample_bytree=0.8,
        reg_alpha=0.1, reg_lambda=1.0,
        random_state=42, n_jobs=-1, verbose=-1
    )

# ─────────────────────────────────────────
# 5. K-Fold OOF + 앙상블
# ─────────────────────────────────────────
N_SPLITS = 5
kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=42)

oof_preds  = {name: np.zeros(len(X))       for name in models}
test_preds = {name: np.zeros(len(X_test))  for name in models}
cv_scores  = {name: []                      for name in models}

scaler = StandardScaler()
X_scaled      = scaler.fit_transform(X)
X_test_scaled = scaler.transform(X_test)

for name, model in models.items():
    print(f"\n▶ Training: {name}")
    for fold, (tr_idx, val_idx) in enumerate(kf.split(X)):
        X_tr, X_val = X_scaled[tr_idx], X_scaled[val_idx]
        y_tr, y_val = y.iloc[tr_idx], y.iloc[val_idx]

        # XGB/LGB는 early stopping 사용
        if name in ('xgb', 'lgb'):
            model.fit(X_tr, y_tr,
                      eval_set=[(X_val, y_val)],
                      verbose=False)
        else:
            model.fit(X_tr, y_tr)

        val_pred = model.predict(X_val)
        oof_preds[name][val_idx] = val_pred

        rmse = np.sqrt(mean_squared_error(y_val, val_pred))
        cv_scores[name].append(rmse)
        print(f"  Fold {fold+1} RMSE: {rmse:.4f}")

        test_preds[name] += model.predict(X_test_scaled) / N_SPLITS

    mean_rmse = np.mean(cv_scores[name])
    print(f"  → {name} CV RMSE: {mean_rmse:.4f}")

# ─────────────────────────────────────────
# 6. 최적 앙상블 가중치 (CV RMSE 역수 가중 평균)
# ─────────────────────────────────────────
mean_scores = {k: np.mean(v) for k, v in cv_scores.items()}
inv_scores  = {k: 1.0 / v    for k, v in mean_scores.items()}
total       = sum(inv_scores.values())
weights     = {k: v / total  for k, v in inv_scores.items()}

print("\n▶ Ensemble Weights:")
for k, w in sorted(weights.items(), key=lambda x: -x[1]):
    print(f"  {k}: {w:.4f}  (CV RMSE={mean_scores[k]:.4f})")

oof_ensemble  = sum(oof_preds[k]  * w for k, w in weights.items())
test_ensemble = sum(test_preds[k] * w for k, w in weights.items())

final_rmse = np.sqrt(mean_squared_error(y, oof_ensemble))
print(f"\n▶ Final Ensemble OOF RMSE: {final_rmse:.4f}")

# ─────────────────────────────────────────
# 7. 제출 파일 생성
# ─────────────────────────────────────────
sub['y'] = test_ensemble
sub.to_csv('submission.csv', index=False)
print("\n✓ submission.csv 저장 완료")
print(sub.head(10))
