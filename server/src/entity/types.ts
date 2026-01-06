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
  superUser,
  admin,
  userList,
  carpooling,
  permissionManage,
  showRoomAssignment,
  roomManage,
  showGroupAssignment,
  groupManage,
  communityManage,
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
