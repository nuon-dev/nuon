import { post } from "@/config/api"
import { Ref, useEffect, useRef, useState } from "react"
import styles from "./index.module.css"
import useRetreatData from "@/app/retreat/hooks/useRetreatData"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { NotificationMessage } from "@/state/notification"
import { useAtom, useSetAtom } from "jotai"
import { InOutType, HowToMove, Days } from "@server/entity/types"
import { Button, FormControl, MenuItem, Select, Stack } from "@mui/material"
import { ShowInOutInfoComponentAtom } from "@/state/retreat"
import { every } from "lodash"
import { ChatContent } from "@/types/retreat"
import { EditContent } from "@/app/retreat/hooks/useBotChatLogic"

interface IPops {
  addChat: (chat: ChatContent) => void
  setEditContent: (content: EditContent) => void
}

export default function InOutInfoForm({ addChat, setEditContent }: IPops) {
  const [showInOutInfo, setShowInOutInfo] = useAtom(ShowInOutInfoComponentAtom)
  const { addInfo, inOutInfoList, setInOutData, fetchInOutInfo } =
    useRetreatData()
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    if (showInOutInfo) {
      if (inOutInfoList && inOutInfoList.length === 0) {
        addInfo(InOutType.IN, HowToMove.none)
      }
    }
  }, [showInOutInfo])

  function onClickRemove(targetInfoIndex: number) {
    if (!inOutInfoList) {
      return
    }
    const deleteInfo = inOutInfoList[targetInfoIndex]
    if (deleteInfo && deleteInfo.id) {
      post("/in-out-info/delete-attend-time", deleteInfo)
    }
    const newInOutInfoList = [...inOutInfoList]
    newInOutInfoList.splice(targetInfoIndex, 1)
    setInOutData([...newInOutInfoList])
  }

  function onChangeInformation(type: string, data: string, index: number) {
    if (!inOutInfoList) {
      return
    }
    const newInOutInfoList = [...inOutInfoList]
    newInOutInfoList[index] = {
      ...newInOutInfoList[index],
      [type]: data,
    }
    setInOutData([...newInOutInfoList])
  }

  async function onSaveInOutInfoToServer() {
    if (!inOutInfoList) {
      return
    }

    const isOkay = inOutInfoList.map((inOutInfo, index) => {
      if (!inOutInfo.time) {
        setNotificationMessage(
          `${index + 1}번째 일정의 출발 시간을 선택해주세요`
        )
        return false
      }
      if (inOutInfo.howToMove === HowToMove.none) {
        setNotificationMessage(
          `${index + 1}번째 일정의 이동 방법을 선택해주세요`
        )
        return false
      }
      if (
        (inOutInfo.howToMove === HowToMove.driveCarWithPerson ||
          inOutInfo.howToMove === HowToMove.rideCar) &&
        !inOutInfo.position
      ) {
        setNotificationMessage(
          `${index + 1}번째 일정의 출발 장소를 선택해주세요`
        )
        return false
      }
      return true
    })

    if (!every(isOkay, (value) => value)) {
      return
    }

    const requestMap = inOutInfoList.map((inOutInfo) => {
      return post("/in-out-info/edit-information", inOutInfo)
    })
    await Promise.all(requestMap)
    setShowInOutInfo(false)
    addChat({
      type: "bot",
      content: "이동 정보가 저장되었어요.",
    })
    setEditContent(EditContent.inOutInfoEnd)
    fetchInOutInfo(true)
  }

  function getRow(data: InOutInfo, index: number) {
    return (
      <Stack
        gap="8px"
        marginTop="10px"
        width="calc(100vw - 30px)"
        color="black"
        style={{
          boxShadow: "0px 0px 10px 0px #AAA",
          border: "1px solid #AAA",
          borderRadius: "8px",
          padding: "12px",
          scrollSnapAlign: "start",
        }}
      >
        <Stack>
          <Stack fontSize="12px" py="6px" px="12px">
            날짜 선택
          </Stack>
          <Select
            value={data.day}
            className="Select"
            onChange={(e) =>
              onChangeInformation("day", e.target.value.toString(), index)
            }
          >
            <MenuItem value={Days.secondDay}>금요일</MenuItem>
          </Select>
          <Stack fontSize="12px" py="6px" px="12px">
            이동 방향
          </Stack>
          <Select
            value={data.inOutType}
            className="Select"
            onChange={(e) =>
              onChangeInformation("inOutType", e.target.value.toString(), index)
            }
            disabled={data.autoCreated}
          >
            <MenuItem value={InOutType.IN}>수련회장 들어가기</MenuItem>
            <MenuItem value={InOutType.OUT}>수련회장에서 나오기</MenuItem>
          </Select>
          <Stack fontSize="12px" py="6px" px="12px">
            출발 시간
          </Stack>
          <Select
            fullWidth={true}
            className="Select"
            value={data.time}
            onChange={(e) =>
              onChangeInformation("time", e.target.value.toString(), index)
            }
          >
            <MenuItem value={`07:00`}>오전 07시 00분</MenuItem>
          </Select>
        </Stack>
        <Stack>
          <Stack fontSize="12px" pb="3px" px="12px">
            이동 방법
          </Stack>
          <FormControl>
            <Select
              fullWidth={true}
              className="Select"
              value={data.howToMove}
              disabled={data.autoCreated}
              onChange={(e) =>
                onChangeInformation(
                  "howToMove",
                  e.target.value.toString(),
                  index
                )
              }
            >
              {/*
              <MenuItem value={HowToMove.driveCarWithPerson}>
                자차 이동(카풀 가능)
              </MenuItem>
              <MenuItem value={HowToMove.goAlone}>대중교통 (여주역)</MenuItem>
              */}
              <MenuItem value={HowToMove.rideCar}>
                카풀 요청 (교회 버스)
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
        {(data.howToMove == HowToMove.driveCarWithPerson ||
          data.howToMove == HowToMove.rideCar) && (
          <Stack>
            <Stack fontSize="12px" pb="3px" px="12px">
              {data.inOutType === InOutType.IN ? "출발 장소" : "도착 장소"}
            </Stack>
            <Select
              value={data.position}
              className="Select"
              onChange={(e) =>
                onChangeInformation(
                  "position",
                  e.target.value.toString(),
                  index
                )
              }
            >
              <MenuItem value={"교회"}>교회</MenuItem>
            </Select>
          </Stack>
        )}
        {!data.autoCreated && (
          <Stack marginTop="10px">
            <Button
              variant="contained"
              onClick={() => onClickRemove(index)}
              style={{ backgroundColor: "#3d524a" }}
            >
              이동 정보 삭제
            </Button>
          </Stack>
        )}
      </Stack>
    )
  }

  const infoListsElementRef = useRef<HTMLDivElement[]>([])
  const [currentView, setCurrentView] = useState(0)

  useEffect(() => {
    if (!inOutInfoList) {
      return
    }
    infoListsElementRef.current = infoListsElementRef.current.slice(
      0,
      inOutInfoList.length
    )
  }, [inOutInfoList])

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    infoListsElementRef.current.forEach((infoElement, index) => {
      const diff =
        e.currentTarget.getBoundingClientRect().left -
        infoElement.getBoundingClientRect().left
      if (Math.abs(diff) < 10) {
        setCurrentView(index)
      }
    })
  }

  return (
    <Stack
      position="fixed"
      bgcolor="white"
      bottom="0"
      width="100%"
      zIndex="300"
      height="100vh"
      alignSelf="center"
      className={
        showInOutInfo
          ? styles["in-out-info-show-bg"]
          : styles["in-out-info-hide-bg"]
      }
      style={{
        pointerEvents: "none",
      }}
    >
      <Stack flex={1} />
      <Stack
        gap="12px"
        bottom="0"
        pt="20px"
        px="12px"
        height="600px"
        position="relative"
        border="1px solid #AAA"
        className={
          showInOutInfo === undefined
            ? styles["in-out-info-start"]
            : showInOutInfo
            ? styles["in-out-info-show"]
            : styles["in-out-info-hide"]
        }
        style={{
          borderTopLeftRadius: "16px",
          backgroundColor: "rgba(255,255,255, 1)",
          borderTopRightRadius: "16px",
          pointerEvents: "auto",
        }}
        boxShadow="0px 0px 10px 0px #AAA"
      >
        <Stack borderRadius="24px" bgcolor="grey.200" p="12px" px="16px">
          # 이동 정보 관리 등록
        </Stack>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#5D4431",
            color: "#F2E8DE",
          }}
          onClick={() => addInfo(InOutType.IN, HowToMove.none)}
        >
          이동 정보 추가
        </Button>
        <Stack direction="row" gap="12px">
          {inOutInfoList &&
            inOutInfoList.map((_, index) => (
              <Stack
                key={index}
                padding="6px"
                borderRadius="4px"
                fontSize="12px"
                border="1px solid #5D4431"
                color={currentView === index ? "white" : "#5D4431"}
                bgcolor={currentView === index ? "#5D4431" : "white"}
                onClick={() => {
                  if (infoListsElementRef.current[index]) {
                    infoListsElementRef.current[index].scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "center",
                    })
                  }
                }}
              >
                {index + 1}번째 일정
              </Stack>
            ))}
        </Stack>
        <Stack
          gap="12px"
          width="100%"
          direction="row"
          overflow="auto"
          position="static"
          onScroll={onScroll}
          style={{
            scrollSnapType: "x mandatory",
            msOverflowStyle: "none",
          }}
        >
          {inOutInfoList &&
            inOutInfoList.map((inOutInfo, index) => (
              <Stack
                key={index}
                component="div"
                /*Todo: Fix this ref assignment
                ref={(el: HTMLDivElement | undefined) =>
                  (infoListsElementRef.current[index] = el as HTMLDivElement)
                }
                */
                m="0"
                style={{
                  scrollSnapAlign: "start",
                }}
              >
                {getRow(inOutInfo, index)}
              </Stack>
            ))}
        </Stack>
        <Button
          variant="outlined"
          onClick={onSaveInOutInfoToServer}
          style={{
            borderColor: "#5D4431",
            color: "#5D4431",
          }}
        >
          {inOutInfoList && inOutInfoList.length > 0 ? "저장" : "닫기"}
        </Button>
      </Stack>
    </Stack>
  )
}
