import { Box, Button, MenuItem, Stack, TextField } from "@mui/material"

interface Manager {
  id: string
  user: { id: string; name: string }
}

interface Newcomer {
  id: string
  name: string
  yearOfBirth: number | null
  birthday?: string | null
  registrationDate?: string | null
  phone: string | null
  gender: "man" | "woman" | "" | null
  status?: "NORMAL" | "PROMOTED" | "PENDING" | "DELETED"
  address?: string | null
  occupation?: string | null
  visitPath?: string | null
  registrationMotivation?: string | null
  faithLevel?: "초신자" | "세례" | "입교" | "학습" | null
  previousChurch?: string | null
  carNumber?: string | null
  newcomerManager?: {
    id: string
    user: { id: string; name: string }
  } | null
}

interface NewcomerFormProps {
  selectedNewcomer: Newcomer
  onDataChange: (key: string, value: any) => void
  onSave: () => void
  onDelete: () => void
  onPending: () => void
  onPromote: () => void
  onClear: () => void
  managerList: Manager[]
}

export default function NewcomerForm({
  selectedNewcomer,
  onDataChange,
  onSave,
  onDelete,
  onPending,
  onPromote,
  onClear,
  managerList,
}: NewcomerFormProps) {
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "NORMAL":
        return "활동중"
      case "PROMOTED":
        return "등반"
      case "PENDING":
        return "보류"
      case "DELETED":
        return "삭제"
      default:
        return "활동중"
    }
  }

  return (
    <Stack
      flex={1}
      gap="12px"
      p="16px"
      m="12px"
      border="1px solid #e0e0e0"
      borderRadius="12px"
      bgcolor="#ffffff"
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          onClick={onClear}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            px: 2,
          }}
        >
          새로 입력
        </Button>
        <Box fontSize="14px" color="#666" fontWeight="500">
          {selectedNewcomer.id ? "정보 수정 중.." : "새로 입력 중.."}
        </Box>
        <Stack direction="row" gap="8px">
          {selectedNewcomer.id && selectedNewcomer.status !== "DELETED" && (
            <>
              <Button
                variant="outlined"
                color="warning"
                onClick={onPending}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 2,
                }}
              >
                보류
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={onPromote}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 2,
                }}
              >
                등반
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={onDelete}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 2,
                }}
              >
                삭제
              </Button>
            </>
          )}
          <Button
            variant="contained"
            onClick={onSave}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              px: 2,
              bgcolor: "#1976d2",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            저장
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          이름 :{" "}
        </Box>
        <TextField
          value={selectedNewcomer.name}
          onChange={(e) => onDataChange("name", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          생년 :{" "}
        </Box>
        <TextField
          value={
            selectedNewcomer.yearOfBirth === null
              ? ""
              : selectedNewcomer.yearOfBirth
          }
          onChange={(e) =>
            onDataChange(
              "yearOfBirth",
              e.target.value ? parseInt(e.target.value) : null,
            )
          }
          variant="outlined"
          size="small"
          type="number"
          placeholder="예: 1990"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          생일 :
        </Box>
        <TextField
          value={selectedNewcomer.birthday || ""}
          onChange={(e) => onDataChange("birthday", e.target.value || null)}
          variant="outlined"
          size="small"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          등록일 :
        </Box>
        <TextField
          value={selectedNewcomer.registrationDate || ""}
          onChange={(e) =>
            onDataChange("registrationDate", e.target.value || null)
          }
          variant="outlined"
          size="small"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          연락처 :{" "}
        </Box>
        <TextField
          value={selectedNewcomer.phone || ""}
          onChange={(e) => onDataChange("phone", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          성별 :
        </Box>
        <TextField
          select
          value={selectedNewcomer.gender || "man"}
          onChange={(e) => onDataChange("gender", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        >
          <MenuItem value="man">남</MenuItem>
          <MenuItem value="woman">여</MenuItem>
        </TextField>
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          주소 :
        </Box>
        <TextField
          value={selectedNewcomer.address || ""}
          onChange={(e) => onDataChange("address", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          신분 :
        </Box>
        <TextField
          value={selectedNewcomer.occupation || ""}
          onChange={(e) => onDataChange("occupation", e.target.value)}
          variant="outlined"
          size="small"
          placeholder="학생-학교/전공, 직장인-계열/분야 등"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          방문경로 :
        </Box>
        <TextField
          value={selectedNewcomer.visitPath || ""}
          onChange={(e) => onDataChange("visitPath", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          등록계기 :
        </Box>
        <TextField
          value={selectedNewcomer.registrationMotivation || ""}
          onChange={(e) =>
            onDataChange("registrationMotivation", e.target.value)
          }
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          신앙생활 :
        </Box>
        <TextField
          select
          value={selectedNewcomer.faithLevel || ""}
          onChange={(e) => onDataChange("faithLevel", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        >
          <MenuItem value="">선택</MenuItem>
          <MenuItem value="초신자">초신자</MenuItem>
          <MenuItem value="학습">학습</MenuItem>
          <MenuItem value="세례">세례</MenuItem>
          <MenuItem value="입교">입교</MenuItem>
        </TextField>
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          전 출석교회 :
        </Box>
        <TextField
          value={selectedNewcomer.previousChurch || ""}
          onChange={(e) => onDataChange("previousChurch", e.target.value)}
          variant="outlined"
          size="small"
          placeholder="교회명 / 담임목사님 성함"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          차량번호 :
        </Box>
        <TextField
          value={selectedNewcomer.carNumber || ""}
          onChange={(e) => onDataChange("carNumber", e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          담당자 :
        </Box>
        <TextField
          select
          value={selectedNewcomer.newcomerManager?.id || ""}
          onChange={(e) => {
            const managerId = e.target.value
            if (!managerId) {
              onDataChange("newcomerManager", null)
            } else {
              const manager = managerList.find((m) => m.id === managerId)
              onDataChange("newcomerManager", manager || null)
            }
          }}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        >
          <MenuItem value="">없음</MenuItem>
          {managerList.map((manager) => (
            <MenuItem key={manager.id} value={manager.id}>
              {manager.user.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" alignItems="center" gap="12px">
        <Box width="80px" textAlign="right">
          상태 :
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 1,
            fontSize: "14px",
            color: "#666",
          }}
        >
          {getStatusLabel(selectedNewcomer.status)}
        </Box>
      </Stack>
    </Stack>
  )
}
