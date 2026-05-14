import { ChildEntity } from "typeorm"
import { Post, PostType } from "./post"

@ChildEntity(PostType.FREE)
export class FreePost extends Post {
  // FreePost 특화 필드 추가 가능 (현재는 공통 필드만 사용)
}
