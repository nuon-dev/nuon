export type BulkAttendanceStatus = "ok" | "forbidden" | "invalid" | "error"

export type BulkAttendanceResultItem = {
  index: number
  userId: string
  status: BulkAttendanceStatus
  error?: string
}

export type BulkAttendanceResponse = {
  results: BulkAttendanceResultItem[]
}

const SERVER_ERROR_MAP: Record<string, string> = {
  Unauthorized: "로그인이 필요합니다.",
  Forbidden: "해당 유저의 출석을 편집할 권한이 없습니다.",
  "Missing required fields": "필수 정보가 누락되었습니다.",
  "Invalid isAttend value": "잘못된 출석 값입니다.",
  "Invalid memo type": "메모 형식이 올바르지 않습니다.",
  "Memo too long": "메모는 500자 이내로 작성해주세요.",
}

const BULK_STATUS_MAP: Record<BulkAttendanceStatus, string> = {
  ok: "",
  forbidden: "해당 유저의 출석을 편집할 권한이 없습니다.",
  invalid: "잘못된 입력입니다.",
  error: "저장에 실패했습니다.",
}

export function toAttendanceErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { error?: string } } }
  const code = err?.response?.data?.error
  if (code && SERVER_ERROR_MAP[code]) return SERVER_ERROR_MAP[code]
  return "저장에 실패했습니다."
}

export function toBulkResultMessage(item: BulkAttendanceResultItem): string {
  if (item.error && SERVER_ERROR_MAP[item.error]) {
    return SERVER_ERROR_MAP[item.error]
  }
  return BULK_STATUS_MAP[item.status] || "저장에 실패했습니다."
}
