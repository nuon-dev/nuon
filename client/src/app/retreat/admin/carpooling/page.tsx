"use client"

import { get, post } from "@/config/api"
import { useEffect, useState } from "react"
import { Box, MenuItem, Select, Stack } from "@mui/material"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { Days, HowToMove, InOutType } from "@server/entity/types"
import Header from "@/components/retreat/admin/Header"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"

function Carpooling() {
  const router = useRouter()
  const { error } = useNotification()
  const [carList, setCarList] = useState([] as InOutInfo[])
  const [rideUserList, setRideUserList] = useState([] as InOutInfo[])
  const [selectedInfo, setSelectedInfo] = useState<InOutInfo>()

  const [selectedDay, setSelectedDay] = useState<Number>(Days.firstDay)
  const [selectedInOut, setSelectedInOut] = useState<string>(InOutType.IN)
  const [mousePoint, setMousePoint] = useState([0, 0])
  const [shiftPosition, setShiftPosition] = useState({ x: 0, y: 0 })
  const [isShowUserInfo, setIsShowUserInfo] = useState(false)
  const [showRetreatAttendInfo, setShowRetreatAttendInfo] = useState(
    {} as RetreatAttend,
  )

  function onMouseMove(event: MouseEvent) {
    setMousePoint([event.pageX, event.pageY])
  }

  useEffect(() => {
    fetchData()
    addEventListener("mousemove", onMouseMove)

    return () => {
      removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  function modal() {
    if (!isShowUserInfo) {
      return <Stack />
    }
    return (
      <Stack
        style={{
          position: "absolute",
          top: mousePoint[1] + 10,
          left: mousePoint[0] + 10,
          border: "1px solid #CCC",
          borderRadius: "12px",
          padding: "4px",
          backgroundColor: "white",
        }}
      >
        접수자: {showRetreatAttendInfo.etc}
        <Stack height="1px" bgcolor="#DDD" my="4px" />
        준비팀: {showRetreatAttendInfo.memo}
        <Stack height="1px" bgcolor="#DDD" my="4px" />
        {showRetreatAttendInfo.user.phone}
      </Stack>
    )
  }

  async function setCar(car: InOutInfo) {
    if (!selectedInfo) return
    selectedInfo.rideCarInfo = car
    await post("/retreat/admin/set-car", {
      inOutInfo: selectedInfo,
    })
    setSelectedInfo(undefined)
    fetchData()
  }

  async function setEmptyCar() {
    if (!selectedInfo) return
    selectedInfo.rideCarInfo = null
    await post("/retreat/admin/set-car", {
      inOutInfo: selectedInfo,
    })
    setSelectedInfo(undefined)
    fetchData()
  }

  function fetchData() {
    get("/retreat/admin/get-car-info")
      .then((data: InOutInfo[]) => {
        data.sort(
          (a, b) =>
            Number.parseFloat(a.time.replace(":", ".")) -
            Number.parseFloat(b.time.replace(":", ".")),
        )
        const cars = data.filter(
          (info) => info.howToMove === HowToMove.driveCarWithPerson,
        )
        setCarList(cars)
        const rideUsers = data.filter(
          (info) =>
            (info.howToMove === HowToMove.rideCar && !info.rideCarInfo) ||
            (info.howToMove === HowToMove.goAlone && !info.rideCarInfo),
        )
        setRideUserList(rideUsers)
      })
      .catch(() => {
        router.push("/retreat/admin")
        error("권한이 없습니다.")
        return
      })
  }

  function setModal(retreatAttend: RetreatAttend) {
    setIsShowUserInfo(true)
    setShowRetreatAttendInfo(retreatAttend)
  }

  function getRowOfInfo(info: InOutInfo) {
    return (
      <Stack
        bgcolor="white"
        minWidth="230px"
        borderRadius="4px"
        direction="column"
        border="1px solid #ACACAC"
        key={info.id}
        onMouseEnter={() => {
          setModal(info.retreatAttend)
        }}
        onMouseLeave={() => {
          setIsShowUserInfo(false)
        }}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement
          const shiftX = e.clientX - target.getBoundingClientRect().left
          const shiftY = e.clientY - target.getBoundingClientRect().top
          setSelectedInfo(info)
          setShiftPosition({ x: shiftX, y: shiftY })
        }}
        onDoubleClick={() => {
          router.push(
            `/retreat/admin/edit-user-data?retreadAttendId=${info.retreatAttend.id}`,
          )
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-evenly"
        >
          <Box>
            {info.retreatAttend?.user?.name}(
            {info.retreatAttend.user.yearOfBirth})
          </Box>{" "}
          <Box textAlign="center">{info.time}시</Box>{" "}
          <Box>
            {info.howToMove === HowToMove.goAlone ? "여주역" : info.position}
          </Box>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack>
      <Header />
      <Stack direction="row">
        <Stack
          style={{
            margin: "12px",
          }}
        >
          <Select
            style={{
              marginBottom: "8px",
            }}
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as number)}
          >
            <MenuItem value={Days.firstDay}>첫째날</MenuItem>
            <MenuItem value={Days.secondDay}>둘째날</MenuItem>
            <MenuItem value={Days.thirdDay}>셋째날</MenuItem>
          </Select>
          <Select
            value={selectedInOut}
            onChange={(e) => setSelectedInOut(e.target.value as string)}
          >
            <MenuItem value={InOutType.IN}>들어가는 차</MenuItem>
            <MenuItem value={InOutType.OUT}>나가는 차</MenuItem>
          </Select>
        </Stack>
        {modal()}
        <Stack
          style={{
            margin: "8px",
            padding: "4px",
            minWidth: "240px",
            borderRadius: "8px",
            paddingBottom: "20px",
            border: "1px solid #ACACAC",
            boxShadow: "2px 2px 5px 3px #ACACAC;",
          }}
          gap="4px"
          onMouseUp={setEmptyCar}
        >
          <Stack textAlign="center">탑승 예정자</Stack>
          {rideUserList
            .filter(
              (info) =>
                info.day === selectedDay && info.inOutType === selectedInOut,
            )
            .map((info) => getRowOfInfo(info))}
        </Stack>
        <Stack
          style={{
            margin: "4px",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
            width: "calc(100% - 200px)",
          }}
          direction="row"
        >
          {carList
            .filter(
              (info) =>
                info.day === selectedDay && info.inOutType === selectedInOut,
            )
            .map((car) => (
              <Stack
                sx={{
                  margin: "8px",
                  padding: "4px",
                  minWidth: "240px",
                  borderRadius: "8px",
                  border: "1px solid #ACACAC",
                  boxShadow: "2px 2px 5px 3px #ACACAC;",
                }}
                key={car.id}
                onMouseUp={() => setCar(car)}
              >
                <Stack
                  textAlign="center"
                  direction="column"
                  justifyContent="space-evenly"
                  onMouseEnter={() => {
                    setModal(car.retreatAttend)
                  }}
                  onMouseLeave={() => {
                    setIsShowUserInfo(false)
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-evenly"
                    onDoubleClick={() => {
                      router.push(
                        `/retreat/admin/edit-user-data?retreadAttendId=${car.retreatAttend.id}`,
                      )
                    }}
                  >
                    <Box>
                      {car.retreatAttend.user.name}(
                      {car.retreatAttend.user.yearOfBirth})의 차
                    </Box>
                    <Box>{car.time}시</Box>
                    <Box>{car.position}</Box>
                  </Stack>
                </Stack>
                <Box height="1px" bgcolor="#DDD" my="4px" />
                <Stack gap="4px">
                  {car.userInTheCar
                    .filter((user) => !user.retreatAttend.isCanceled)
                    .map((info) => getRowOfInfo(info))}
                </Stack>
              </Stack>
            ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default Carpooling
