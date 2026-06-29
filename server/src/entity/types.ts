export const enum HowToMove {
  none = 0,
  together = 1,
  driveCarAlone,
  driveCarWithPerson,
  rideCar,
  goAlone,
  etc,
}

export const enum CurrentStatus {
  null,
  arriveChurch,
  arriveAuditorium,
}

export enum PermissionType {
  admin = "admin",
  permissionManage = "permissionManage",
  communityManage = "communityManage", // 마을, 다락방 권한

  // 수련회 관련 권한
  retreatAdmin = "retreatAdmin",
  retreatUserList = "retreatUserList",
  carpooling = "carpooling",
  showRoomAssignment = "showRoomAssignment",
  retreatRoomManage = "retreatRoomManage",
  showGroupAssignment = "showGroupAssignment",
  retreatGroupManage = "retreatGroupManage",
  retreatDashBoard = "retreatDashBoard",
  retreatDeposit = "retreatDeposit",
  retreatEditUserData = "retreatEditUserData",
  retreatEditTeamScore = "retreatEditTeamScore",
  retreatDeleteUser = "retreatDeleteUser",
  retreatMediaManage = "retreatMediaManage",
}

export function permissionTypeToString(
  permissionType: PermissionType | string,
) {
  switch (permissionType) {
    case PermissionType.admin:
      return "관리자"
    case PermissionType.permissionManage:
      return "권한 관리"
    case PermissionType.communityManage:
      return "마을/다락방 관리"
    case PermissionType.retreatAdmin:
      return "수련회 관리자"
    case PermissionType.retreatUserList:
      return "수련회 참가자 명단"
    case PermissionType.carpooling:
      return "수련회 카풀링"
    case PermissionType.showRoomAssignment:
      return "수련회 방배정 조회"
    case PermissionType.retreatRoomManage:
      return "수련회 방배정 관리"
    case PermissionType.showGroupAssignment:
      return "수련회 조 배정표 보기"
    case PermissionType.retreatGroupManage:
      return "수련회 조 관리"
    case PermissionType.retreatDashBoard:
      return "수련회 대시보드"
    case PermissionType.retreatDeposit:
      return "수련회 입금 확인"
    case PermissionType.retreatEditUserData:
      return "수련회 참가자 정보 수정"
    case PermissionType.retreatEditTeamScore:
      return "수련회 팀 점수 수정"
    case PermissionType.retreatDeleteUser:
      return "수련회 참가자 삭제"
    case PermissionType.retreatMediaManage:
      return "수련회 미디어 관리"
    default:
      return "기타"
  }
}

export enum Days {
  firstDay = 1,
  secondDay,
  thirdDay,
}

export enum InOutType {
  none = "none",
  IN = "in",
  OUT = "out",
}

export enum Deposit {
  none = "none",
  student = "student",
  business = "business",
  half = "half",
}

export enum AttendStatus {
  ATTEND = "ATTEND",
  ABSENT = "ABSENT",
  ETC = "ETC",
}

export enum EducationLecture {
  OT = "OT",
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
  L5 = "L5",
}

export enum NewcomerStatus {
  NORMAL = "NORMAL",
  PROMOTED = "PROMOTED",
  DELETED = "DELETED",
  PENDING = "PENDING",
}

export enum FaithLevel {
  BEGINNER = "초신자",
  BAPTIZED = "세례",
  CONFIRMED = "입교",
  LEARNING = "학습",
}
