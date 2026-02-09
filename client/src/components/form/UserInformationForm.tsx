"use client"

import { post } from "@/config/api"
import InOutFrom from "./InOutForm"
import { HowToMove } from "@server/entity/types"
import { useNotification } from "@/hooks/useNotification"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Button, MenuItem, Select, TextField, Stack } from "@mui/material"

interface IProps {
  retreatAttend: RetreatAttend | undefined
  reloadFunction: () => void
  setEditMode: Dispatch<SetStateAction<boolean>>
}

export default function UserInformationForm(props: IProps) {
  const [retreatAttend, setRetreatAttend] = useState<RetreatAttend | undefined>(
    undefined,
  )
  const [inOutData, setInOutData] = useState<Array<InOutInfo>>([])
  const { error, success } = useNotification()

  useEffect(() => {
    setRetreatAttend(props.retreatAttend)
    setInOutData(props.retreatAttend?.inOutInfos || [])
  }, [props.retreatAttend])

  const changeInformation = (type: string, data: string) => {
    if (!retreatAttend) {
      return
    }
    setRetreatAttend({ ...retreatAttend, [type]: data })
  }

  const submit = async () => {
    if (!retreatAttend) {
      error("수련회 접수 정보 없음.")
      return
    }
    if (!retreatAttend.howToGo) {
      error("이동 방법을 선택해주세요.")
      return
    }

    const url = "/retreat/admin/edit-retreat-attend"

    const saveResult = await post(url, retreatAttend)
    let attendTimeResult
    if (inOutData.length > 0) {
      attendTimeResult = await post("/retreat/admin/edit-in-out-info", {
        retreatAttendId: retreatAttend.id,
        inOutInfos: inOutData,
      })
    }

    if (saveResult.result !== "success") {
      error("접수중 오류가 발생하였습니다.\n다시 시도해주세요.")
      return
    }

    if (attendTimeResult && attendTimeResult.result !== "success") {
      error(
        "이동 정보 저장중에 문제가 발생하였습니다.\n시간, 장소. 이동 방법을 모두 입력해주세요.",
      )
      return
    }
    success(`신청 내역이 저장이 되었습니다.`)
    props.reloadFunction()
    props.setEditMode(false)
  }

  function getInputGap() {
    return <Stack margin="6px" />
  }

  function getLabelGap() {
    return <Stack margin="2px" />
  }

  if (!retreatAttend) {
    return <Stack p="12px">위에서 수정할 사람을 선택해 주세요.</Stack>
  }

  return (
    <Stack padding="6px" minWidth="340px" gap="12px">
      <Stack direction="row" gap="12px">
        <Stack width="200px">이름</Stack>
        <Stack>{retreatAttend?.user.name}</Stack>
      </Stack>
      <Stack direction="row" gap="12px">
        <Stack width="200px" justifyContent="center">
          전화번호
        </Stack>
        <Stack>{retreatAttend?.user.phone}</Stack>
      </Stack>
      <Stack direction="row" gap="12px">
        <Stack width="200px" justifyContent="center">
          출생년도 (빠른은 기수 기준)
        </Stack>
        <Stack>{retreatAttend?.user.yearOfBirth}</Stack>
      </Stack>
      <Stack direction="row" gap="12px">
        <Stack width="200px" justifyContent="center">
          성별
        </Stack>
        <Stack>{retreatAttend?.user.gender === "man" ? "남" : "여"}</Stack>
      </Stack>
      <Stack direction="row" gap="12px">
        <Stack width="200px" justifyContent="center">
          기타 사항
        </Stack>
        <Stack>{retreatAttend?.etc}</Stack>
      </Stack>
      {getInputGap()}
      <Stack>
        <Stack minWidth="100px" justifyContent="center">
          주일날 교회로 오는 방법
        </Stack>
        {getLabelGap()}
        <Select
          fullWidth={true}
          className="Select"
          key={retreatAttend?.howToBack}
          defaultValue={retreatAttend?.howToBack}
          value={retreatAttend?.howToBack}
          onChange={(e) =>
            changeInformation("howToBack", e.target.value.toString())
          }
        >
          <MenuItem value={HowToMove.together}>교회 버스로</MenuItem>
          <MenuItem value={HowToMove.driveCarWithPerson}>
            자차 (카풀 가능)
          </MenuItem>
          <MenuItem value={HowToMove.rideCar}>카풀 신청</MenuItem>
          <MenuItem value={HowToMove.goAlone}>대중교통 (여주역)</MenuItem>
          <MenuItem value={HowToMove.driveCarAlone}>자차 (카풀 불가)</MenuItem>
          <MenuItem value={HowToMove.etc}>기타</MenuItem>
        </Select>
      </Stack>
      <Stack>
        <Stack minWidth="100px" justifyContent="center">
          수련회장 이동 방법
        </Stack>
        {getLabelGap()}
        <Select
          fullWidth={true}
          className="Select"
          key={retreatAttend?.howToGo}
          defaultValue={retreatAttend?.howToGo}
          value={retreatAttend?.howToGo}
          onChange={(e) => {
            if (inOutData.length === 0) {
              setInOutData([])
            }
            changeInformation("howToGo", e.target.value.toString())
          }}
        >
          <MenuItem value={HowToMove.together}>교회 버스로</MenuItem>
          <MenuItem value={HowToMove.driveCarWithPerson}>
            자차 (카풀 가능)
          </MenuItem>
          <MenuItem value={HowToMove.rideCar}>카풀 신청</MenuItem>
          <MenuItem value={HowToMove.goAlone}>대중교통 (여주역)</MenuItem>
          <MenuItem value={HowToMove.driveCarAlone}>자차 (카풀 불가)</MenuItem>
          <MenuItem value={HowToMove.etc}>기타 (하단에 메모)</MenuItem>
        </Select>
        <Stack ml="10px">
          <InOutFrom setInOutData={setInOutData} inOutData={inOutData} />
        </Stack>
      </Stack>
      <Stack>
        <Stack width="200px" justifyContent="center">
          메모 (준비팀 전용)
        </Stack>
        {getLabelGap()}
        <TextField
          fullWidth={true}
          className="TextField"
          key={retreatAttend?.id}
          value={retreatAttend?.memo}
          placeholder="메모 사항이 있을 경우 입력하세요."
          onChange={(e) => changeInformation("memo", e.target.value)}
        />
      </Stack>
      <Stack marginTop="10px">
        <Button
          variant="contained"
          onClick={submit}
          style={{
            fontSize: "18px",
          }}
        >
          접수 내용 수정하기
        </Button>
      </Stack>
    </Stack>
  )
}
