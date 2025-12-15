import { useEffect, useState } from "react"

import { jwtDecode } from "jwt-decode"
import { post } from "@/config/api"
import UserInformationForm from "@/components/form/UserInformationForm"
import ReceiptResult from "@/components/form/ReceiptResult"
import { Stack } from "@mui/material"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { Deposit } from "@server/entity/types"

export default function Receipt() {
  const [retreatAttend, setRetreatAttend] = useState<RetreatAttend | undefined>(
    undefined
  )
  const [isEditMode, setEditMode] = useState(true)
  const [inOutData, setInOutData] = useState<Array<InOutInfo>>([])

  useEffect(() => {
    checkToken()
  }, [])

  const checkToken = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }
    const userData = jwtDecode(token)
    console.log(userData)
    if (!token) {
      return
    }
    post("/auth/check-token", {
      token,
    }).then((response) => {
      if (response.result !== "true") {
        return
      }
      if (response.userData.isCancel) {
        const id = response.userData.id as number
        const kakaoId = response.userData.kakaoId as string
        const token = response.userData.token as string
        setRetreatAttend({ kakaoId, id, token } as any)
        setEditMode(true)
        return
      }
      if (response.userData.name) {
        setEditMode(false)
      }
      setRetreatAttend(response.userData)
      setInOutData(response.inoutInfoList)
    })
  }

  return (
    <Stack padding="12px" bgcolor="#1d321a" gap="12px" pb="72px">
      {retreatAttend?.isDeposited &&
      retreatAttend.isDeposited !== Deposit.none ? (
        <Stack
          px="24px"
          py="12px"
          fontWeight="500"
          textAlign="center"
          border="1px solid grey"
          borderRadius="12px"
          color="white"
        >
          입금 확인이 완료 되었습니다.
        </Stack>
      ) : (
        <Stack
          padding="5px"
          marginTop="10px"
          borderRadius="40px"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          border="1px solid grey"
          color="white"
        >
          <Stack fontSize="20px" fontWeight="bold">
            수련회비 안내
          </Stack>
          <Stack
            mt="6px"
            lineHeight="24px"
            style={{
              userSelect: "text",
            }}
          >
            <Stack>
              <span>
                3333342703455 카카오뱅크 (조영래)
                <br />
                회비 : 12만원 (직장인), 10만원 (그외)
              </span>
            </Stack>
          </Stack>
        </Stack>
      )}

      <Stack
        p="12px"
        alignItems="center"
        justifyContent="center"
        borderRadius="24px"
        bgcolor="#2d422a"
      >
        {isEditMode && (
          <UserInformationForm
            retreatAttend={retreatAttend}
            reloadFunction={checkToken}
            setEditMode={setEditMode}
          />
        )}
        {!isEditMode && (
          <ReceiptResult
            retreatAttend={retreatAttend}
            inOutData={inOutData}
            reloadFunction={checkToken}
            setEditMode={setEditMode}
          />
        )}
      </Stack>
    </Stack>
  )
}
