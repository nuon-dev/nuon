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
# 영유아 건강 발달 프로그램(IHDP) 치료 효과 예측
# 목표: y값(치료 효과)을 최대한 정확하게 예측하기
# =============================================================

import warnings
warnings.filterwarnings('ignore')  # 경고 메시지 너무 많이 뜨면 지저분해서 꺼둠

from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error
import lightgbm as lgb
import xgboost as xgb


# ── 1. 데이터 불러오기 ────────────────────────────────────────
# 캐글 환경에서 실제 파일 경로를 자동으로 찾아줌
# 위에서 출력된 파일 목록 보고 경로 확인 가능
import glob

# train.csv, test.csv, sample_submission.csv 파일을 어디 있든 자동으로 찾음
train_path = glob.glob('/kaggle/input/**/train.csv', recursive=True)[0]
test_path  = glob.glob('/kaggle/input/**/test.csv',  recursive=True)[0]
sub_path   = glob.glob('/kaggle/input/**/sample_submission.csv', recursive=True)[0]

print("찾은 파일 경로:")
print(f"  train: {train_path}")
print(f"  test:  {test_path}")
print(f"  sub:   {sub_path}")

train = pd.read_csv(train_path)
test  = pd.read_csv(test_path)
sub   = pd.read_csv(sub_path)

TARGET = 'y'   # 우리가 맞춰야 할 정답값
ID     = 'id'  # 그냥 식별자라 학습엔 안 씀


# ── 2. 피처 엔지니어링 ────────────────────────────────────────
# 원래 있는 컬럼만 쓰면 아깝고, 컬럼끼리 조합하면 성능이 오르는 경우가 많음
def make_features(df):
    df = df.copy()

    # dadage(아빠 나이)는 빈칸이 엄청 많음
    # 빈칸인지 아닌지 자체도 정보가 될 수 있어서 플래그 컬럼을 따로 만들어줌
    # 그리고 빈칸은 -1로 채워서 "모름"이라고 표시
    df['dadage_missing'] = df['dadage'].isna().astype(int)
    df['dadage']         = df['dadage'].fillna(-1)

    # mom.edu(엄마 학력)랑 site(병원 위치)는 빈칸이 조금 있음
    # 범주형이라 가장 많이 나온 값으로 채워줌 (최빈값)
    for col in ['mom.edu', 'site']:
        df[col] = df[col].fillna(df[col].mode()[0])

    # 그 외 숫자형 컬럼에 빈칸 남아있으면 중간값으로 채움
    for col in df.select_dtypes(include=np.number).columns:
        if df[col].isna().sum() > 0:
            df[col] = df[col].fillna(df[col].median())

    # 새로운 컬럼 만들기
    # 몇 주 일찍 태어났는지 대비 출생 체중 → 미숙 정도를 더 잘 나타냄
    df['bw_per_preterm'] = df['bw'] / (df['preterm'] + 1)

    # 출생 체중 대비 머리 둘레 비율 → 발달 균형 느낌
    df['bw_head_ratio'] = df['bw'] / (df['b.head'] + 1)

    # 부모 합산 나이 → 양육 환경이랑 관련 있을 것 같아서
    # dadage가 -1이면 계산에서 빼야 하니까 0 이상인 것만 더함
    df['parent_age_sum'] = df['momage'] + df['dadage'].clip(lower=0)

    # 신생아 건강 점수 × 출생 체중 → 건강 상태 종합 느낌
    df['health_bw'] = df['nnhealth'] * df['bw'] / 1000

    # 엄마가 담배/술/약물을 얼마나 했는지 합산 → 위험 요소 점수
    df['risk_score'] = df['cig'] + df['booze'] + df['drugs']

    # 결혼 여부 + 산전 관리 + 취업 여부 합산 → 지원 환경 점수
    df['support_score'] = df['b.marr'] + df['prenatal'] + df['work.dur']

    return df

# train이랑 test를 한번에 처리해야 컬럼이 안 어긋남
all_data = pd.concat([train, test], axis=0).reset_index(drop=True)
all_data = make_features(all_data)

# 다시 train이랑 test로 분리
train_fe = all_data[all_data[ID].isin(train[ID])].copy()
test_fe  = all_data[all_data[ID].isin(test[ID])].copy()

# id랑 y는 학습에 넣으면 안 되니까 제외
FEATURES = [c for c in train_fe.columns if c not in [ID, TARGET]]
X        = train_fe[FEATURES].values
y        = train_fe[TARGET].values
X_test   = test_fe[FEATURES].values


# ── 3. 모델 설정 ──────────────────────────────────────────────
# LightGBM이랑 XGBoost 둘 다 써서 나중에 평균 낼 예정
# learning_rate 낮추고 n_estimators 높게 → 천천히 꼼꼼하게 학습

lgb_params = dict(
    objective='regression', metric='rmse',
    n_estimators=2000, learning_rate=0.02,  # 조금씩 2000번 학습
    num_leaves=31, max_depth=6,             # 트리 너무 복잡하면 과적합 남
    subsample=0.8, colsample_bytree=0.8,    # 데이터/컬럼 80%만 랜덤하게 써서 다양성 확보
    reg_alpha=0.1, reg_lambda=1.0,          # 과적합 방지용 정규화
    min_child_samples=10,
    random_state=42, verbose=-1, n_jobs=-1,
)

xgb_params = dict(
    objective='reg:squarederror', eval_metric='rmse',
    n_estimators=2000, learning_rate=0.02,
    max_depth=5, subsample=0.8, colsample_bytree=0.8,
    reg_alpha=0.1, reg_lambda=1.0,
    early_stopping_rounds=100,  # 100번 동안 성능 안 오르면 그냥 멈춤 (시간 절약)
    random_state=42, n_jobs=-1,
)


# ── 4. K-Fold 교차검증으로 학습 ───────────────────────────────
# 데이터를 5등분해서 4개로 학습, 1개로 검증 → 5번 반복
# 이렇게 하면 데이터를 최대한 활용하면서 성능도 안정적으로 측정됨

N_SPLITS = 5
kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=42)

# 나중에 예측값 저장할 공간 미리 만들어둠
oof_lgb  = np.zeros(len(X))       # train 전체에 대한 검증 예측값
oof_xgb  = np.zeros(len(X))
pred_lgb = np.zeros(len(X_test))  # test에 대한 최종 예측값
pred_xgb = np.zeros(len(X_test))

for fold, (tr_idx, val_idx) in enumerate(kf.split(X)):
    X_tr, X_val = X[tr_idx], X[val_idx]
    y_tr, y_val = y[tr_idx], y[val_idx]

    # LightGBM 학습
    m_lgb = lgb.LGBMRegressor(**lgb_params)
    m_lgb.fit(X_tr, y_tr,
              eval_set=[(X_val, y_val)],
              callbacks=[lgb.early_stopping(100, verbose=False),
                         lgb.log_evaluation(period=-1)])
    oof_lgb[val_idx]  = m_lgb.predict(X_val)
    pred_lgb         += m_lgb.predict(X_test) / N_SPLITS  # 5번 평균 낼 거라 나눔

    # XGBoost 학습
    m_xgb = xgb.XGBRegressor(**xgb_params)
    m_xgb.fit(X_tr, y_tr,
              eval_set=[(X_val, y_val)],
              verbose=False)
    oof_xgb[val_idx]  = m_xgb.predict(X_val)
    pred_xgb         += m_xgb.predict(X_test) / N_SPLITS

    # 이번 폴드 성능 출력 (낮을수록 좋음)
    rmse_lgb = mean_squared_error(y_val, oof_lgb[val_idx], squared=False)
    rmse_xgb = mean_squared_error(y_val, oof_xgb[val_idx], squared=False)
    print(f"Fold {fold+1}  LGB={rmse_lgb:.4f}  XGB={rmse_xgb:.4f}")

# 전체 교차검증 최종 점수
cv_lgb = mean_squared_error(y, oof_lgb, squared=False)
cv_xgb = mean_squared_error(y, oof_xgb, squared=False)
print(f"\n전체 CV RMSE  LGB={cv_lgb:.4f}  XGB={cv_xgb:.4f}")


# ── 5. 앙상블 (두 모델 합치기) ───────────────────────────────
# 성능 좋은 모델한테 가중치를 더 줌
# RMSE 역수를 가중치로 쓰면 점수 낮은(=좋은) 모델이 더 많이 반영됨

w_lgb = (1/cv_lgb) / (1/cv_lgb + 1/cv_xgb)
w_xgb = 1 - w_lgb
print(f"앙상블 가중치  LGB={w_lgb:.3f}  XGB={w_xgb:.3f}")

final_pred = w_lgb * pred_lgb + w_xgb * pred_xgb


# ── 6. 제출 파일 저장 ─────────────────────────────────────────
sub[TARGET] = final_pred
sub.to_csv('submission.csv', index=False)
print("\nsubmission.csv 저장 완료!")
print(sub.head())
