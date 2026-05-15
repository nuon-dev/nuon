import { DataSource } from "typeorm"
import { InOutInfo } from "../entity/retreat/inOutInfo"
import { Permission } from "../entity/permission"
import { RetreatAttend } from "../entity/retreat/retreatAttend"
import { User } from "../entity/user"
import { Community } from "../entity/community"
import {
  SharingImage,
  SharingText,
  SharingVideo,
} from "../entity/retreat/sharing"
import { WorshipSchedule } from "../entity/worshipSchedule"
import { AttendData } from "../entity/attendData"
import { WorshipContest } from "../entity/event/worshipContest"
import { Newcomer } from "../entity/newcomer/newcomer"
import { NewcomerEducation } from "../entity/newcomer/newcomerEducation"
import { NewcomerManager } from "../entity/newcomer/newcomerManager"
import { Link } from "../entity/link"
import { LinkClick } from "../entity/linkClick"
import { Post } from "../entity/community/post"
import { FreePost } from "../entity/community/freePost"
import { QnaPost } from "../entity/community/qnaPost"
import { Comment } from "../entity/community/comment"
import { Reaction } from "../entity/community/reaction"
import { Board } from "../entity/community/board"

const dataSource = new DataSource(require("../../ormconfig.js"))

export const userDatabase = dataSource.getRepository(User)
export const communityDatabase = dataSource.getRepository(Community)
export const permissionDatabase = dataSource.getRepository(Permission)
export const attendDataDatabase = dataSource.getRepository(AttendData)
export const worshipScheduleDatabase = dataSource.getRepository(WorshipSchedule)

export const inOutInfoDatabase = dataSource.getRepository(InOutInfo)
export const retreatAttendDatabase = dataSource.getRepository(RetreatAttend)

export const sharingTextDatabase = dataSource.getRepository(SharingText)
export const sharingImageDatabase = dataSource.getRepository(SharingImage)
export const sharingVideoDatabase = dataSource.getRepository(SharingVideo)

export const worshipContestDatabase = dataSource.getRepository(WorshipContest)
export const newcomerDatabase = dataSource.getRepository(Newcomer)
export const newcomerEducationDatabase =
  dataSource.getRepository(NewcomerEducation)
export const newcomerManagerDatabase = dataSource.getRepository(NewcomerManager)

export const linkDatabase = dataSource.getRepository(Link)
export const linkClickDatabase = dataSource.getRepository(LinkClick)

export const freePostDatabase = dataSource.getRepository(FreePost)
export const qnaPostDatabase = dataSource.getRepository(QnaPost)
export const postDatabase = dataSource.getRepository(Post)
export const commentDatabase = dataSource.getRepository(Comment)
export const reactionDatabase = dataSource.getRepository(Reaction)
export const boardDatabase = dataSource.getRepository(Board)

export default dataSource
