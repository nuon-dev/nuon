import { useAtom, useAtomValue } from "jotai"
import { RetreatAttend } from "@server/entity/retreat/retreatAttend"
import { useEffect, useState } from "react"
import { get, post } from "@/config/api"
import { UserInformationAtom } from "./useUserData"
import { EditContent } from "./useBotChatLogic"
import { InOutInfo } from "@server/entity/retreat/inOutInfo"
import { Days, HowToMove, InOutType } from "@server/entity/types"
import { InOutInformationAtom, RetreatAttendAtom } from "@/state/retreat"

export default function useRetreatData() {
  const userInformation = useAtomValue(UserInformationAtom)
  const [retreatAttend, setRetreatAttend] = useAtom(RetreatAttendAtom)
  const [inOutInfoList, setInOutInfo] = useAtom(InOutInformationAtom)

  useEffect(() => {
    if (!userInformation) {
      return
    }
    if (!retreatAttend) {
      fetchRetreatAttendInformation()
      fetchInOutInfo()
    }
  }, [userInformation])

  async function fetchRetreatAttendInformation(isForce = false) {
    const retreatAttendData = await get("/retreat")
    if (!retreatAttend || isForce) {
      setRetreatAttend(retreatAttendData)
    }
  }

  async function fetchInOutInfo(
    isForce = false
  ): Promise<InOutInfo[] | undefined> {
    const inOutInfo = await get("/in-out-info")
    if (!inOutInfoList || isForce) {
      setInOutInfo(inOutInfo)
    }
    return inOutInfo
  }

  function checkMissedRetreatAttendInformation() {
    if (!retreatAttend || !inOutInfoList) {
      return EditContent.none
    }
    if (!retreatAttend.howToGo) {
      return EditContent.howToGo
    }

    if (!retreatAttend.howToBack) {
      return EditContent.howToBack
    }

    let needEditInOutInfo = false

    /*
    if (
      retreatAttend.howToGo === HowToMove.driveCarWithPerson ||
      retreatAttend.howToGo === HowToMove.rideCar ||
      retreatAttend.howToGo === HowToMove.goAlone
    ) {
      const inInfos = inOutInfoList.filter(
        (info) => info.inOutType === InOutType.IN
      )
      if (inInfos.length === 0) {
        addInfo(InOutType.IN, retreatAttend.howToGo)
        needEditInOutInfo = true
      }
    }

    if (
      retreatAttend.howToBack === HowToMove.driveCarWithPerson ||
      retreatAttend.howToBack === HowToMove.rideCar ||
      retreatAttend.howToBack === HowToMove.goAlone
    ) {
      const outInfos = inOutInfoList.filter(
        (info) => info.inOutType === InOutType.OUT
      )
      if (outInfos.length === 0) {
        addInfo(InOutType.OUT, retreatAttend.howToBack)
        needEditInOutInfo = true
      }
    }

    if (needEditInOutInfo) {
      return EditContent.inOutInfo
    }
      */

    //etc는 빈 값일 수 있음.
    if (retreatAttend.etc === null) {
      return EditContent.etc
    }

    for (const inOut of inOutInfoList) {
      if (inOut.inOutType === InOutType.none) {
        return EditContent.inOutInfo
      }
      if (inOut.howToMove === HowToMove.none) {
        return EditContent.inOutInfo
      }
      if (inOut.howToMove !== HowToMove.goAlone && !inOut.position) {
        return EditContent.inOutInfo
      }
      if (!inOut.time) {
        return EditContent.inOutInfo
      }
    }
    return EditContent.none
  }

  function editRetreatAttendInformation(
    key: keyof RetreatAttend,
    value: RetreatAttend[keyof RetreatAttend]
  ) {
    if (!retreatAttend) {
      return
    }

    setRetreatAttend({
      ...retreatAttend,
      [key]: value,
    })
  }

  async function saveRetreatAttendInformation() {
    if (!retreatAttend) {
      return
    }
    await post("/retreat/edit-information", {
      ...retreatAttend,
    })
  }

  function addInfo(inOutType: InOutType, howToMove?: HowToMove) {
    if (!inOutInfoList) {
      return
    }
    setInOutInfo((pre) => {
      if (!pre) return undefined
      return [
        ...pre,
        {
          id: 0,
          inOutType: inOutType,
          day: Days.firstDay,
          time: "",
          position: "",
          howToMove,
          autoCreated: howToMove !== HowToMove.none,
        } as InOutInfo,
      ]
    })
  }

  function setInOutData(data: InOutInfo[]) {
    setInOutInfo(data)
  }

  return {
    fetchInOutInfo,
    fetchRetreatAttendInformation,
    checkMissedRetreatAttendInformation,
    editRetreatAttendInformation,
    saveRetreatAttendInformation,
    addInfo,
    inOutInfoList,
    setInOutData,
  }
}
