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
  admin,
  permissionManage,
  communityManage, // 마을, 다락방 권한

  // 수련회 관련 권한
  retreatAdmin = 100,
  userList,
  carpooling,
  showRoomAssignment,
  roomManage,
  showGroupAssignment,
  groupManage,
  dashBoard,
  deposit,
  editUserData,
  editTeamScore,
  deleteUser,
  mediaManage,
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
