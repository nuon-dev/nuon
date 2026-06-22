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
# IHDP 치료 효과 예측
# 전략: Optuna로 하이퍼파라미터 탐색 + 다중 모델 스태킹
# 이상치가 RMSE를 크게 올리므로 Huber loss 계열 모델 포함
# =============================================================

import warnings
warnings.filterwarnings('ignore')
import glob

import optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)  # optuna 진행 로그는 progress bar로만 확인

from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error
from sklearn.linear_model import HuberRegressor, Ridge
from sklearn.ensemble import ExtraTreesRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
from catboost import CatBoostRegressor

SEED     = 42
N_SPLITS = 5
TARGET   = 'y'
ID       = 'id'


# ── 1. 데이터 로드 ────────────────────────────────────────────
# 경로 하드코딩하면 환경 바뀔 때마다 수정해야 하니까 glob으로 동적 탐색
train_path = glob.glob('/kaggle/input/**/train.csv',             recursive=True)[0]
test_path  = glob.glob('/kaggle/input/**/test.csv',              recursive=True)[0]
sub_path   = glob.glob('/kaggle/input/**/sample_submission.csv', recursive=True)[0]

train = pd.read_csv(train_path)
test  = pd.read_csv(test_path)
sub   = pd.read_csv(sub_path)
print(f"train: {train.shape}, test: {test.shape}")

# y 분포 확인 - 이상치 범위 파악이 핵심
# RMSE는 이상치에 민감하기 때문에 극단값이 몇 개만 있어도 점수가 크게 떨어짐
print(f"\ny 기초 통계:")
print(train[TARGET].describe())
print(f"극단값 (상위 5개): {sorted(train[TARGET].values)[-5:]}")
print(f"극단값 (하위 5개): {sorted(train[TARGET].values)[:5]}")


# ── 2. 피처 엔지니어링 ────────────────────────────────────────
def make_features(df):
    df = df.copy()

    # dadage는 결측률이 높아서 단순 imputation보다
    # 결측 여부 자체를 별도 feature로 모델에 알려주는 게 더 효과적
    df['dadage_missing'] = df['dadage'].isna().astype(int)
    df['dadage']         = df['dadage'].fillna(-1)

    # 명목형 변수 결측은 최빈값으로 대체 (분포 왜곡 최소화)
    for col in ['mom.edu', 'site']:
        df[col] = df[col].fillna(df[col].mode()[0])

    # 연속형 변수 결측은 중앙값으로 대체 (평균보다 이상치 영향 덜 받음)
    for col in df.select_dtypes(include=np.number).columns:
        if df[col].isna().sum() > 0:
            df[col] = df[col].fillna(df[col].median())

    # 조산 주수 대비 출생 체중 → 미숙아 건강 상태를 더 정밀하게 표현
    df['bw_per_preterm']  = df['bw'] / (df['preterm'] + 1)
    # 출생 체중 / 머리 둘레 → 신체 발달 균형 지표
    df['bw_head_ratio']   = df['bw'] / (df['b.head'] + 1)
    # 부모 나이 합산 (dadage 결측이면 momage만 반영)
    df['parent_age_sum']  = df['momage'] + df['dadage'].clip(lower=0)
    # nnhealth × bw → 건강 점수와 체중의 복합 지표
    df['health_bw']       = df['nnhealth'] * df['bw'] / 1000
    # 산모 위험 행동 합산 - 담배/술/약물은 태아 발달에 직접 영향
    df['risk_score']      = df['cig'] + df['booze'] + df['drugs']
    # 사회적 지지 환경 점수 - 결혼 여부, 산전 관리, 취업 여부
    df['support_score']   = df['b.marr'] + df['prenatal'] + df['work.dur']

    # 10대 산모는 의학적으로 고위험군으로 분류됨
    df['young_mom']       = (df['momage'] < 20).astype(int)
    # 출생 체중 구간화 - 초극소(~1000g) / 극소(~1500g) / 저체중(~2500g) / 정상
    df['bw_category']     = pd.cut(df['bw'],
                                   bins=[0, 1000, 1500, 2500, 9999],
                                   labels=[0, 1, 2, 3]).astype(int)
    # 비선형 관계 캡처용 polynomial feature
    df['bhead_sq']        = df['b.head'] ** 2
    df['nnhealth_sq']     = df['nnhealth'] ** 2
    # 건강 점수와 조산 주수의 interaction term
    df['health_preterm']  = df['nnhealth'] * df['preterm']
    # 위험 요소 있는데 지지 환경 없는 경우 → 가장 취약한 케이스
    df['risk_no_support'] = df['risk_score'] * (df['support_score'] == 0).astype(int)
    # 부모 나이 차이 (dadage 모르면 0으로 처리)
    df['parent_age_diff'] = np.where(df['dadage'] > 0,
                                     np.abs(df['dadage'] - df['momage']), 0)
    # 첫째 × 조산 interaction - 첫 아이인데 조산이면 추가 리스크
    df['first_preterm']   = (df['first'] == 1).astype(int) * df['preterm']
    # 쌍둥이 × 저체중 interaction - 쌍둥이는 원래 체중이 낮은 경향
    df['twin_low_bw']     = df['twin'] * (df['bw'] < 1500).astype(int)

    # site별 평균 출생 체중 → 병원/지역별 환자 특성 차이를 반영한 그룹 통계 피처
    site_bw_mean         = df.groupby('site')['bw'].transform('mean')
    df['site_bw_mean']   = site_bw_mean
    # 개인 체중 - 해당 site 평균 → 같은 병원 내에서 상대적 위치
    df['bw_vs_site']     = df['bw'] - site_bw_mean

    return df


# train/test를 concat해서 한번에 처리 - 따로 하면 site_bw_mean 같은 그룹 통계가 달라짐
all_data = pd.concat([train, test], axis=0).reset_index(drop=True)
all_data = make_features(all_data)

train_fe = all_data[all_data[ID].isin(train[ID])].copy()
test_fe  = all_data[all_data[ID].isin(test[ID])].copy()

FEATURES = [c for c in train_fe.columns if c not in [ID, TARGET]]
X        = train_fe[FEATURES].values
y        = train_fe[TARGET].values
X_test   = test_fe[FEATURES].values

print(f"\n사용 피처 수: {len(FEATURES)}개")


# ── 3. Optuna로 XGBoost 하이퍼파라미터 탐색 ──────────────────
# 수동 grid search는 비효율적 - TPE 기반 베이지안 최적화로 자동 탐색
# 1등이 7시간 동안 140번 제출한 걸 이걸로 대체하는 거임

print("\n▶ Optuna XGBoost 튜닝 시작 (50 trials, 약 3~5분)")

kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=SEED)

def xgb_objective(trial):
    params = {
        'objective':        'reg:squarederror',
        'n_estimators':     trial.suggest_int('n_estimators', 500, 3000),
        'learning_rate':    trial.suggest_float('learning_rate', 0.005, 0.05, log=True),
        'max_depth':        trial.suggest_int('max_depth', 3, 7),
        'subsample':        trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),
        'reg_alpha':        trial.suggest_float('reg_alpha', 0.01, 5.0, log=True),
        'reg_lambda':       trial.suggest_float('reg_lambda', 0.01, 5.0, log=True),
        'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
        'random_state': SEED, 'n_jobs': -1, 'verbosity': 0,
    }
    scores = []
    for tr_idx, val_idx in kf.split(X):
        m = xgb.XGBRegressor(**params, early_stopping_rounds=50)
        m.fit(X[tr_idx], y[tr_idx],
              eval_set=[(X[val_idx], y[val_idx])],
              verbose=False)
        pred = m.predict(X[val_idx])
        scores.append(np.sqrt(mean_squared_error(y[val_idx], pred)))
    return np.mean(scores)

study_xgb = optuna.create_study(direction='minimize')
study_xgb.optimize(xgb_objective, n_trials=50, show_progress_bar=True)
best_xgb = study_xgb.best_params
print(f"XGBoost 최적 CV RMSE: {study_xgb.best_value:.4f}")
print(f"최적 파라미터: {best_xgb}")


# ── 4. Optuna로 CatBoost 튜닝 ────────────────────────────────
print("\n▶ Optuna CatBoost 튜닝 시작 (30 trials)")

def cat_objective(trial):
    params = {
        'iterations':    trial.suggest_int('iterations', 500, 3000),
        'learning_rate': trial.suggest_float('learning_rate', 0.005, 0.05, log=True),
        'depth':         trial.suggest_int('depth', 4, 8),
        'l2_leaf_reg':   trial.suggest_float('l2_leaf_reg', 1.0, 10.0),
        'subsample':     trial.suggest_float('subsample', 0.6, 1.0),
        'random_seed': SEED, 'verbose': 0,
    }
    scores = []
    for tr_idx, val_idx in kf.split(X):
        m = CatBoostRegressor(**params, early_stopping_rounds=50)
        m.fit(X[tr_idx], y[tr_idx],
              eval_set=(X[val_idx], y[val_idx]),
              verbose=False)
        pred = m.predict(X[val_idx])
        scores.append(np.sqrt(mean_squared_error(y[val_idx], pred)))
    return np.mean(scores)

study_cat = optuna.create_study(direction='minimize')
study_cat.optimize(cat_objective, n_trials=30, show_progress_bar=True)
best_cat = study_cat.best_params
print(f"CatBoost 최적 CV RMSE: {study_cat.best_value:.4f}")


# ── 5. 튜닝된 파라미터로 OOF 학습 ────────────────────────────
# OOF(Out-Of-Fold): 각 샘플이 validation에 있을 때의 예측값만 모아둔 것
# 이걸 스태킹 2단계 입력으로 쓰면 leakage 없이 메타 학습 가능

print("\n▶ 최적 파라미터로 전체 모델 학습")

xgb_final = xgb.XGBRegressor(**best_xgb,
                               objective='reg:squarederror',
                               early_stopping_rounds=100,
                               random_state=SEED, n_jobs=-1, verbosity=0)

cat_final = CatBoostRegressor(**best_cat, random_seed=SEED, verbose=0)

# Ridge는 스케일에 민감하므로 StandardScaler 적용
scaler       = StandardScaler()
X_scaled     = scaler.fit_transform(X)
Xtest_scaled = scaler.transform(X_test)

# HuberRegressor: squared loss 대신 Huber loss 사용
# 이상치에 대해 L1처럼 동작해서 RMSE 기반 평가에서도 간접적으로 도움됨
# epsilon이 낮을수록 이상치 영향을 더 강하게 억제
models = {
    'xgb':   (xgb_final,  X,        X_test),
    'cat':   (cat_final,  X,        X_test),
    'et':    (ExtraTreesRegressor(n_estimators=500, max_depth=8,
                                  min_samples_leaf=3, max_features=0.7,
                                  random_state=SEED, n_jobs=-1),
              X, X_test),
    'gbm':   (GradientBoostingRegressor(n_estimators=500, learning_rate=0.02,
                                        max_depth=4, subsample=0.8,
                                        random_state=SEED),
              X, X_test),
    'huber': (HuberRegressor(epsilon=1.5, max_iter=500),
              X_scaled, Xtest_scaled),
}

oof_preds  = {name: np.zeros(len(X))      for name in models}
test_preds = {name: np.zeros(len(X_test)) for name in models}

for name, (model, X_use, Xtest_use) in models.items():
    fold_scores = []
    for fold, (tr_idx, val_idx) in enumerate(kf.split(X)):
        X_tr  = X_use[tr_idx]
        X_val = X_use[val_idx]
        y_tr, y_val = y[tr_idx], y[val_idx]

        if name == 'xgb':
            model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)
        elif name == 'cat':
            model.fit(X_tr, y_tr, eval_set=(X_val, y_val),
                      early_stopping_rounds=100, verbose=False)
        else:
            model.fit(X_tr, y_tr)

        oof_preds[name][val_idx]  = model.predict(X_val)
        test_preds[name]         += model.predict(Xtest_use) / N_SPLITS

        rmse = np.sqrt(mean_squared_error(y_val, oof_preds[name][val_idx]))
        fold_scores.append(rmse)

    print(f"  {name} 평균 RMSE: {np.mean(fold_scores):.4f}")


# ── 6. 스태킹 앙상블 ─────────────────────────────────────────
# 각 모델의 OOF 예측값을 새로운 feature matrix로 구성
# Ridge meta-learner가 각 모델에 최적 가중치를 부여
# 단순 weighted average보다 성능이 높은 이유:
# 모델 간 예측 오차의 상관관계를 학습해서 complementary한 부분을 활용

print("\n▶ 스태킹 메타 모델 학습")

S_train = np.column_stack([oof_preds[name]  for name in models])
S_test  = np.column_stack([test_preds[name] for name in models])

# 메타 모델도 CV로 학습해야 train set에 대한 과적합 방지
meta_oof   = np.zeros(len(X))
meta_preds = np.zeros(len(X_test))

for tr_idx, val_idx in kf.split(S_train):
    meta = Ridge(alpha=1.0)
    meta.fit(S_train[tr_idx], y[tr_idx])
    meta_oof[val_idx]  = meta.predict(S_train[val_idx])
    meta_preds        += meta.predict(S_test) / N_SPLITS

final_rmse = np.sqrt(mean_squared_error(y, meta_oof))
print(f"스태킹 최종 OOF RMSE: {final_rmse:.4f}")

# meta.coef_가 각 모델의 기여도 (음수면 해당 모델이 오히려 방해)
print("\n각 모델 기여도 (Ridge 계수):")
for name, coef in zip(models.keys(), meta.coef_):
    print(f"  {name}: {coef:.4f}")


# ── 7. 제출 파일 저장 ─────────────────────────────────────────
sub[TARGET] = meta_preds
sub.to_csv('submission.csv', index=False)
print("\nsubmission.csv 저장 완료!")
print(sub.head(10))
