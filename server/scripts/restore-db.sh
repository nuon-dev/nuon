#!/bin/bash

# 데이터베이스 복원 스크립트
# Usage: ./scripts/restore-db.sh backup_file.sql.gz


# 스크립트가 있는 디렉토리의 상위 디렉토리로 이동 (server 디렉토리)
cd "$(dirname "$0")/.."

# .env 파일이 있으면 환경변수로 불러오기
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

if [ $# -eq 0 ]; then
    echo "사용법: $0 <backup_file.sql.gz>"
    echo "예시: DB_PASSWORD=your_password $0 ./backups/nuon_backup_20250128_143000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
# 환경변수에서 설정 읽기
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME}"

# 필수 환경변수 확인
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 오류: DB_PASSWORD 환경변수가 설정되지 않았습니다."
    echo "사용법: DB_PASSWORD=your_password $0 <backup_file>"
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

# 백업 파일 존재 확인
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
    exit 1
fi

echo "=== 데이터베이스 복원 시작 ==="
echo "백업 파일: $BACKUP_FILE"
echo "시작 시간: $(date)"

# 확인 메시지
read -p "⚠️  이 작업은 현재 데이터베이스를 완전히 덮어씁니다. 계속하시겠습니까? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "복원이 취소되었습니다."
    exit 1
fi

# 데이터베이스 드롭 및 재생성
echo "데이터베이스 재생성 중..."
MYSQL_PWD="$DB_PASSWORD" mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -e "DROP DATABASE IF EXISTS $DB_NAME;"
MYSQL_PWD="$DB_PASSWORD" mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 백업 파일 복원
echo "데이터 복원 중..."
if [[ $BACKUP_FILE == *.gz ]]; then
    # 압축된 파일인 경우
    gunzip -c $BACKUP_FILE | MYSQL_PWD="$DB_PASSWORD" mysql -h$DB_HOST -P$DB_PORT -u$DB_USER $DB_NAME
else
    # 일반 SQL 파일인 경우
    MYSQL_PWD="$DB_PASSWORD" mysql -h$DB_HOST -P$DB_PORT -u$DB_USER $DB_NAME < $BACKUP_FILE
fi

# 복원 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ 복원 성공!"
    echo "완료 시간: $(date)"
else
    echo "❌ 복원 실패!"
    exit 1
fi

echo "=== 복원 완료 ==="
