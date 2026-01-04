"use client"

import { Stack, Box } from "@mui/material"
import useRetreat from "../hooks/useRetreat"
import RetreatButton from "../components/Button"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"

export default function FifthStep() {
  const { isWorker, isHalf } = useRetreat()
  const setNotificationMessage = useSetAtom(NotificationMessage)

  function calculateRetreatFee() {
    if (isHalf) {
      return "10만원"
    }
    if (isWorker) {
      return "15만원"
    } else {
      return "12만원"
    }
  }

  return (
    <Stack justifyContent="center" alignItems="center" px="10%">
      <Stack color="white" textAlign="center" my="30px" gap="16px">
        <Box fontSize="14px" color="#999">
          수련회 신청이 완료 되었습니다.
        </Box>
        <Box fontSize="24px">
          수련회비는 <br />
          아래 계좌로 입금해 주세요.
        </Box>
        <Box>
          3333342703455 <br />
          카카오뱅크 성은비
        </Box>
        <Box>수련회비 {calculateRetreatFee()}</Box>
      </Stack>
      <Stack
        gap="3vh"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          gap="12px"
          width="60%"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <RetreatButton
            label={"계좌 복사하기"}
            onClick={() => {
              navigator.clipboard.writeText(
                "3333342703455 성은비 " + calculateRetreatFee()
              )
              setNotificationMessage("계좌 정보가 복사되었습니다.")
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
