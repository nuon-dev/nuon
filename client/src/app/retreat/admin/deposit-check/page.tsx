"use client"

import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { get, post } from "@/config/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NotificationMessage } from "@/state/notification"
import { useSetAtom } from "jotai"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { Deposit } from "@server/entity/types"
import Header from "@/components/retreat/admin/Header"

function DepositCheck() {
  const { push } = useRouter()
  const [allUserCount, setAllUserCount] = useState(0)
  const [allDepositCount, setAllDepositCount] = useState(0)
  const [isShowUnpaid, setIsShowUnpaid] = useState(false)
  const [depositSum, setDepositSum] = useState(0)
  const [allUserList, setAllUserList] = useState([] as Array<RetreatAttend>)
  const setNotificationMessage = useSetAtom(NotificationMessage)

  useEffect(() => {
    fetchData()
  }, [])

  async function DepositProcessing(
    retreatAttendId: string,
    isDeposited: Deposit
  ) {
    const result = await post("/retreat/admin/deposit-processing", {
      retreatAttendId,
      isDeposited,
    })

    if (result.result === "error") {
      alert("오류 발생!")
      return
    }

    fetchData()
  }

  function fetchData() {
    get("/retreat/admin/get-all-user")
      .then((data: RetreatAttend[]) => {
        setAllUserCount(data.length)
        setAllDepositCount(
          data.filter(
            (retreatAttend) => retreatAttend.isDeposited !== Deposit.none
          ).length
        )

        const halfSum =
          100_000 *
          data.filter(
            (retreatAttend) => retreatAttend.isDeposited === Deposit.half
          ).length

        const workerSum =
          150_0000 *
          data.filter(
            (retreatAttend) => retreatAttend.isDeposited === Deposit.business
          ).length

        const studentSum =
          120_000 *
          data.filter(
            (retreatAttend) => retreatAttend.isDeposited === Deposit.student
          ).length

        setDepositSum(halfSum + workerSum + studentSum)
        if (isShowUnpaid) {
          setAllUserList(data)
          return
        }
        setAllUserList(
          data.filter(
            (retreatAttend) => retreatAttend.isDeposited === Deposit.none
          )
        )
      })
      .catch(() => {
        push("/retreat/admin")
        setNotificationMessage("권한이 없습니다.")
        return
      })
  }

  function clickFilter() {
    setIsShowUnpaid(!isShowUnpaid)
  }

  function DepositStatus({ retreatAttend }: { retreatAttend: RetreatAttend }) {
    {
      if (retreatAttend.isDeposited !== Deposit.none) {
        return (
          <Button
            onClick={() => DepositProcessing(retreatAttend.id, Deposit.none)}
            variant="contained"
            color="error"
          >
            입금 취소 처리
          </Button>
        )
      }
      if (retreatAttend.isHalf) {
        return (
          <Button
            onClick={() => DepositProcessing(retreatAttend.id, Deposit.half)}
            variant="contained"
            color="success"
          >
            부분참석
          </Button>
        )
      }
      if (retreatAttend.isWorker) {
        return (
          <Button
            onClick={() =>
              DepositProcessing(retreatAttend.id, Deposit.business)
            }
            variant="contained"
            color="success"
          >
            직장인
          </Button>
        )
      }
      return (
        <Button
          onClick={() => DepositProcessing(retreatAttend.id, Deposit.student)}
          variant="contained"
          color="success"
        >
          학생
        </Button>
      )
    }
  }

  useEffect(() => {
    fetchData()
  }, [isShowUnpaid])

  return (
    <Stack alignItems="center">
      <Header />
      <Stack
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
        style={{
          margin: "24px",
        }}
      >
        <Stack fontWeight="600" fontSize="20px">
          전체 / 납부자 ({allUserCount} / {allDepositCount})
        </Stack>
        <Stack fontWeight="500" fontSize="18px">
          예상 납부 금액 -{" "}
          {depositSum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원 (
          {depositSum / 10000}만원)
        </Stack>

        <Button
          onClick={clickFilter}
          variant="contained"
          style={{
            width: "150px",
          }}
        >
          {isShowUnpaid ? "미납부자만 보기" : "전체보기"}
        </Button>
      </Stack>
      <Table
        style={{
          maxWidth: "800px",
          border: "1px solid #ccc",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell style={{ paddingLeft: "8px" }}>이름</TableCell>
            <TableCell style={{ padding: 0 }}>접수 일자</TableCell>
            <TableCell style={{ padding: 0 }}>전화번호</TableCell>
            <TableCell style={{ padding: 0 }}>입금 처리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allUserList.map((retreatAttend) => {
            const createDate = new Date(retreatAttend.createAt.toString())
            return (
              <TableRow key={retreatAttend.id}>
                <TableCell
                  style={{
                    padding: 0,
                    paddingTop: "24px",
                    paddingBottom: "24px",
                  }}
                >
                  {retreatAttend.user.name}
                </TableCell>
                <TableCell style={{ padding: 0 }}>
                  {`${createDate.getFullYear() - 2000}.${
                    createDate.getMonth() + 1
                  }.${createDate.getDate()} 
                  ${createDate.getHours()}:${createDate.getMinutes()}`}
                </TableCell>
                <TableCell style={{ padding: 0 }}>
                  {retreatAttend.user.phone}
                </TableCell>
                <TableCell style={{ padding: "12px" }}>
                  <DepositStatus retreatAttend={retreatAttend} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Stack>
  )
}

export default DepositCheck
