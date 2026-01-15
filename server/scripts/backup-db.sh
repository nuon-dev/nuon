#!/bin/bash

# 데이터베이스 백업 스크립트
# Usage: ./scripts/backup-db.sh


# 스크립트가 있는 디렉토리의 상위 디렉토리로 이동 (server 디렉토리)
cd "$(dirname "$0")/.."

# .env 파일이 있으면 환경변수로 불러오기
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# 환경변수에서 설정 읽기
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nuon_backup_${TIMESTAMP}.sql"

# 필수 환경변수 확인
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 오류: DB_PASSWORD 환경변수가 설정되지 않았습니다."
    echo "사용법: DB_PASSWORD=your_password ./scripts/backup-db.sh"
    exit 1
fi

if [ -z "$DB_HOST" ]; then
    echo "❌ 오류: DB_HOST 환경변수가 설정되지 않았습니다."
    exit 1
fi

if [ -z "$DB_PORT" ]; then
    echo "❌ 오류: DB_PORT 환경변수가 설정되지 않았습니다."
    exit 1
fi

if [ -z "$DB_USER" ]; then
    echo "❌ 오류: DB_USER 환경변수가 설정되지 않았습니다."
    exit 1
fi

if [ -z "$DB_NAME" ]; then
    echo "❌ 오류: DB_NAME 환경변수가 설정되지 않았습니다."
    exit 1
fi

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

echo "=== 데이터베이스 백업 시작 ==="
echo "백업 파일: $BACKUP_FILE"
echo "시작 시간: $(date)"

# mysqldump를 사용한 전체 데이터베이스 백업
MYSQL_PWD="$DB_PASSWORD" mysqldump \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --user=$DB_USER \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --quick \
  --lock-tables=false \
  $DB_NAME > $BACKUP_FILE

# 백업 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ 백업 성공!"
    echo "백업 파일 크기: $(du -h $BACKUP_FILE | cut -f1)"
    echo "완료 시간: $(date)"
    
    # 백업 파일 압축
    #gzip $BACKUP_FILE
    #echo "✅ 압축 완료: ${BACKUP_FILE}.gz"
    
    # 7일 이상 된 백업 파일 삭제
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    echo "✅ 오래된 백업 파일 정리 완료"
else
    echo "❌ 백업 실패!"
    exit 1
fi

echo "=== 백업 완료 ==="
