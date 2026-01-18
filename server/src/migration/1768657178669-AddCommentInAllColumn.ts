import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCommentInAllColumn1768657178669 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // FK Check 비활성화
    await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0")

    // ==========================================
    // 1. User Table (사용자)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`id\` varchar(36) NOT NULL COMMENT '사용자 고유 ID (UUID)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`kakaoId\` varchar(255) NULL COMMENT '카카오 계정 고유 ID (로그인 식별용)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`name\` varchar(255) NULL COMMENT '사용자 실명'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`yearOfBirth\` int NULL COMMENT '출생년도 (YYYY 형식)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`gender\` varchar(255) NULL COMMENT '성별 (man: 남성, woman: 여성)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`phone\` varchar(255) NULL COMMENT '전화번호 (하이픈 없이 숫자만 or 하이픈 포함)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`etc\` varchar(255) NULL COMMENT '사용자 관련 비고/특이사항'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`token\` varchar(255) NULL COMMENT '자체 인증 토큰'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`expire\` datetime NULL COMMENT '인증 토큰 만료 시간'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`isSuperUser\` tinyint NOT NULL DEFAULT 0 COMMENT '시스템 최고 관리자 권한 여부 (1: 관리자, 0: 일반)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`createAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '계정 생성 일시'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`deletedAt\` timestamp(6) NULL COMMENT '계정 삭제 일시 (Soft Delete, NULL이면 활성 계정)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`profile\` int NOT NULL DEFAULT 0 COMMENT '프로필 이미지 식별자 (ID)'`,
    )
    // await queryRunner.query(`ALTER TABLE \`user\` MODIFY COLUMN \`communityId\` int NULL COMMENT '현재 소속된 공동체/순 ID (FK)'`);

    // ==========================================
    // 2. Community Table (공동체/조직)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`community\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '공동체 고유 ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`community\` MODIFY COLUMN \`parentId\` int NULL COMMENT '상위 조직 ID (FK, NULL이면 최상위 조직)'`);
    await queryRunner.query(
      `ALTER TABLE \`community\` MODIFY COLUMN \`name\` varchar(255) NOT NULL COMMENT '공동체 이름 (예: 무슨무슨 마을, 무슨무슨 다락방, 다락방이 최하위 조직으로 상위는 마을임)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`community\` MODIFY COLUMN \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '생성 일시'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`community\` MODIFY COLUMN \`lastModifiedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 정보 수정 일시'`,
    )
    // await queryRunner.query(`ALTER TABLE \`community\` MODIFY COLUMN \`leaderId\` varchar(36) NULL COMMENT '리더(순장/조장) 사용자 ID (FK)'`);
    // await queryRunner.query(`ALTER TABLE \`community\` MODIFY COLUMN \`deputyLeaderId\` varchar(36) NULL COMMENT '부리더(부순장/부조장) 사용자 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`community\` MODIFY COLUMN \`x\` int NOT NULL DEFAULT 0 COMMENT '조직도 시각화용 X 좌표'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`community\` MODIFY COLUMN \`y\` int NOT NULL DEFAULT 0 COMMENT '조직도 시각화용 Y 좌표'`,
    )

    // ==========================================
    // 3. Permission Table (권한 관리)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`permission\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '권한 레코드 ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`permission\` MODIFY COLUMN \`userId\` varchar(36) NULL COMMENT '권한이 부여된 사용자 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`permission\` MODIFY COLUMN \`permissionType\` int NOT NULL COMMENT '부여된 권한 종류 (0: superUser, 1: admin, 2: userList 등 Enum 참조)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`permission\` MODIFY COLUMN \`have\` tinyint NOT NULL COMMENT '권한 보유 여부 (1: 있음, 0: 없음)'`,
    )

    // ==========================================
    // 4. WorshipSchedule Table (예배 일정)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '예배 일정 ID'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`kind\` int NOT NULL COMMENT '예배 종류 (1: 주일예배, 2: 금요예배, 3: 기타)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`date\` varchar(255) NOT NULL COMMENT '예배 날짜 (YYYY-MM-DD 문자열 형식)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`canEdit\` tinyint NOT NULL DEFAULT 1 COMMENT '리더의 출석 입력 가능 여부 (1: 가능, 0: 마감)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`isVisible\` tinyint NOT NULL DEFAULT 1 COMMENT '앱 내 일정 노출 여부 (1: 보임, 0: 숨김)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '일정 생성 일시'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_schedule\` MODIFY COLUMN \`lastModifiedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '마지막 수정 일시'`,
    )

    // ==========================================
    // 5. AttendData Table (출석 기록)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`attend_data\` MODIFY COLUMN \`id\` varchar(36) NOT NULL COMMENT '출석 기록 고유 ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`attend_data\` MODIFY COLUMN \`worshipScheduleId\` int NULL COMMENT '대상 예배 일정 ID (FK)'`);
    // await queryRunner.query(`ALTER TABLE \`attend_data\` MODIFY COLUMN \`userId\` varchar(36) NULL COMMENT '출석 대상 사용자 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`attend_data\` MODIFY COLUMN \`isAttend\` varchar(255) NOT NULL COMMENT '출석 상태 (ATTEND: 출석, ABSENT: 결석, ETC: 늦참/기타)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`attend_data\` MODIFY COLUMN \`memo\` varchar(255) NOT NULL DEFAULT '' COMMENT '사유 또는 비고 사항'`,
    )

    // ==========================================
    // 6. RetreatAttend Table (수련회 참가 정보)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`id\` varchar(36) NOT NULL COMMENT '수련회 참가 신청서 ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`userId\` varchar(36) NULL COMMENT '신청자 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`groupNumber\` int NOT NULL DEFAULT 0 COMMENT '배정된 조 번호 (0이면 미배정)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`roomNumber\` int NULL COMMENT '배정된 숙소/방 번호'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`memo\` text NULL COMMENT '관리자용 메모'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`isDeposited\` varchar(255) NOT NULL DEFAULT 'none' COMMENT '회비 입금 상태 (none: 미입금, student: 학생회비, business: 직장인회비, half: 부분참석회비)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`howToGo\` int NULL COMMENT '가는 편 이동 수단 (1: 같이가기, 2: 자차(단독), 3: 자차(동승), 4: 얻어타기, 5: 따로가기 등)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`howToBack\` int NULL COMMENT '오는 편 이동 수단 (옵션 위와 동일)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`isCanceled\` tinyint NOT NULL DEFAULT 0 COMMENT '참가 취소 여부 (1: 취소됨)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`etc\` varchar(255) NULL COMMENT '신청서 기타란 내용'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`currentStatus\` int NOT NULL DEFAULT 0 COMMENT '참가 현황 상태 (0: null, 1: 교회도착, 2: 수련회장도착 등)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`attendanceNumber\` int NOT NULL DEFAULT 0 COMMENT '접수 번호 (순서대로 발급)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`postcardContent\` text NULL COMMENT '수련회 엽서 내용'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`isWorker\` tinyint NOT NULL DEFAULT 1 COMMENT '직장인 여부 (1: 직장인, 0: 학생) - 회비 구분에 사용'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`isHalf\` tinyint NOT NULL DEFAULT 0 COMMENT '부분 참석 여부 (1: 토요일 저녁 이후 참석/부분참석, 0: 전체참석)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`retreat_attend\` MODIFY COLUMN \`createAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '신청서 작성 일시'`,
    )

    // ==========================================
    // 7. InOutInfo Table (입퇴실 상세 이동 정보)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '이동 정보 ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`in_out_info\` MODIFY COLUMN \`retreatAttendId\` varchar(36) NULL COMMENT '수련회 참가 신청 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`day\` int NOT NULL COMMENT '수련회 1, 2, 3일차 구분 (1=금, 2=토, 3=일)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`time\` varchar(255) NOT NULL COMMENT '예상 이동 시각 (HH:MM 문자열)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`inOutType\` varchar(255) NOT NULL COMMENT '이동 방향 (IN: 수련회장으로 감, OUT: 수련회장에서 나옴, none: 없음)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`position\` varchar(255) NOT NULL COMMENT '출발지 또는 목적지 상세 (예: 교회, 집 등)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`howToMove\` int NOT NULL COMMENT '상세 이동 수단 (Enum 참조)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`in_out_info\` MODIFY COLUMN \`autoCreated\` tinyint NOT NULL DEFAULT 0 COMMENT '시스템 자동 생성 여부'`,
    )
    // await queryRunner.query(`ALTER TABLE \`in_out_info\` MODIFY COLUMN \`rideCarInfoId\` int NULL COMMENT '카풀 시 탑승한 차량(운전자)의 이동 정보 ID (FK)'`);

    // ==========================================
    // 8. SharingText Table (나눔 - 텍스트)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`sharing_text\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '은혜 나눔(글) ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`sharing_text\` MODIFY COLUMN \`writerId\` varchar(36) NULL COMMENT '작성자 User ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`sharing_text\` MODIFY COLUMN \`content\` text NOT NULL COMMENT '나눔 본문 내용'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`sharing_text\` MODIFY COLUMN \`visible\` tinyint NOT NULL DEFAULT 1 COMMENT '공개 여부 (1: 공개, 0: 비공개)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`sharing_text\` MODIFY COLUMN \`createAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '작성 일시'`,
    )

    // ==========================================
    // 9. SharingImage Table (나눔 - 이미지)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`sharing_image\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '은혜 나눔(사진) ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`sharing_image\` MODIFY COLUMN \`writerId\` varchar(36) NULL COMMENT '업로더 User ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`sharing_image\` MODIFY COLUMN \`url\` text NOT NULL COMMENT 'S3 등 스토리지 이미지 경로'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`sharing_image\` MODIFY COLUMN \`visible\` tinyint NOT NULL DEFAULT 1 COMMENT '공개 여부'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`sharing_image\` MODIFY COLUMN \`tags\` text NULL COMMENT '이미지 태그 (콤마로 구분되거나 JSON)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`sharing_image\` MODIFY COLUMN \`createAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '업로드 일시'`,
    )

    // ==========================================
    // 10. WorshipContest Table (워십 콘테스트 투표)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`worship_contest\` MODIFY COLUMN \`id\` int NOT NULL AUTO_INCREMENT COMMENT '투표 기록 ID'`,
    )
    // await queryRunner.query(`ALTER TABLE \`worship_contest\` MODIFY COLUMN \`voteUserId\` varchar(36) NULL COMMENT '투표한 사용자 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`worship_contest\` MODIFY COLUMN \`firstCommunity\` varchar(255) NOT NULL COMMENT '1순위 투표 팀 이름'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_contest\` MODIFY COLUMN \`secondCommunity\` varchar(255) NOT NULL COMMENT '2순위 투표 팀 이름'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_contest\` MODIFY COLUMN \`thirdCommunity\` varchar(255) NOT NULL COMMENT '3순위 투표 팀 이름'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_contest\` MODIFY COLUMN \`term\` int NOT NULL COMMENT '투표 부문/회차 (예: 1부, 2부)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`worship_contest\` MODIFY COLUMN \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '투표 일시'`,
    )

    // ==========================================
    // 11. AIChatRoom Table (AI 챗봇 채팅방)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`ai_chat_room\` MODIFY COLUMN \`id\` varchar(36) NOT NULL COMMENT '채팅방 고유 ID (UUID)'`,
    )
    // await queryRunner.query(`ALTER TABLE \`ai_chat_room\` MODIFY COLUMN \`userId\` varchar(36) NULL COMMENT '채팅방 소유 사용자 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`ai_chat_room\` MODIFY COLUMN \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '채팅방 생성 일시'`,
    )

    // ==========================================
    // 12. AIChat Table (AI 챗봇 메시지)
    // ==========================================
    await queryRunner.query(
      `ALTER TABLE \`ai_chat\` MODIFY COLUMN \`id\` varchar(36) NOT NULL COMMENT '메시지 고유 ID (UUID)'`,
    )
    // await queryRunner.query(`ALTER TABLE \`ai_chat\` MODIFY COLUMN \`roomId\` varchar(36) NULL COMMENT '소속 채팅방 ID (FK)'`);
    await queryRunner.query(
      `ALTER TABLE \`ai_chat\` MODIFY COLUMN \`type\` enum('user', 'ai', 'system') NOT NULL COMMENT '발화자 구분 (user: 사용자, ai: 챗봇, system: 시스템 프롬프트)'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`ai_chat\` MODIFY COLUMN \`message\` text NOT NULL COMMENT '대화 내용'`,
    )
    await queryRunner.query(
      `ALTER TABLE \`ai_chat\` MODIFY COLUMN \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '메시지 생성 일시'`,
    )

    // FK Check 활성화
    await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1")
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 생략 (롤백 시 코멘트 제거 로직이 필요하지만, 여기서는 생략함)
  }
}
