import { useEffect, useState } from "react"
import useUserData, { UserInformationAtom } from "./useUserData"
import { useAtomValue, useSetAtom } from "jotai"
import useRetreatData from "./useRetreatData"
import { Days, Deposit, HowToMove, InOutType } from "@server/entity/types"
import { ChatContent } from "@/types/retreat"
import {
  InOutInformationAtom,
  RetreatAttendAtom,
  ShowInOutInfoComponentAtom,
} from "@/state/retreat"
import { post } from "@/config/api"
import { useRouter } from "next/navigation"

interface IPops {
  addChat: (chat: ChatContent) => void
}

export enum EditContent {
  none,
  name,
  yearOfBirth,
  gender,
  phone,
  darak,
  howToGo,
  howToBack,
  etc,
  inOutInfo,
  inOutInfoEnd,
}

let sayBotAutoText = false
let lastUpdateCheckSetTimer: NodeJS.Timeout | undefined = undefined

export default function useBotChatLogic({ addChat }: IPops) {
  const [editContent, setEditContent] = useState<EditContent>(EditContent.none)
  const {
    getUserDataFromToken,
    getUserDataFromKakaoLogin,
    editUserInformation,
    checkMissedUserInformation,
    saveUserInformation,
  } = useUserData()

  const {
    checkMissedRetreatAttendInformation,
    editRetreatAttendInformation,
    saveRetreatAttendInformation,
    fetchRetreatAttendInformation,
    fetchInOutInfo,
  } = useRetreatData()

  const userInformation = useAtomValue(UserInformationAtom)
  const retreatAttend = useAtomValue(RetreatAttendAtom)
  const inOutInfos = useAtomValue(InOutInformationAtom)
  const setShowInOutInfoForm = useSetAtom(ShowInOutInfoComponentAtom)

  const router = useRouter()

  useEffect(() => {
    init()
  }, [])

  async function init() {
    let userData = await getUserDataFromToken()
    if (!userData) {
      addChat({
        type: "bot",
        content: "안녕하세요! 수련회에 관련하여 당신을 도와줄거에요!",
      })
      addChat({
        type: "bot",
        content: "제가 당신을 기억할 수 있도록 카카오 로그인을 해주세요!",
        buttons: [
          {
            content: "카카오톡 로그인",
            onClick: login,
          },
        ],
      })
      return
    }
    if (!userData.name) {
      addChat({
        type: "bot",
        content: "안녕하세요! 수련회에 관련하여 당신을 도와줄거에요!",
      })
      firstTime()
    } else if (userData.yearOfBirth === 1997) {
      addChat({
        type: "bot",
        content: `최강 제육제육 멤버 ${userData.name}! 반가워요~`,
      })
    } else {
      addChat({
        type: "bot",
        content: `${userData.name}님 다시 만나서 반가워요!`,
      })
    }
  }

  async function saveAllInformation() {
    await saveUserInformation()
    await saveRetreatAttendInformation()
  }

  async function firstTime() {
    addChat({
      type: "bot",
      content: "처음 오셨군요! 당신에 대해 더 알아보고 싶어요.",
    })
  }

  async function login() {
    addChat({
      type: "my",
      content: "카카오톡 로그인",
    })

    const userData = await getUserDataFromKakaoLogin()
    if (!userData) {
      addChat({
        content: "카카오 로그인을 실패했어요. (ㅠ.ㅠ) 관리자에게 문의 하세요!",
        type: "bot",
      })
      return
    }
    if (userData.name) {
      addChat({
        type: "bot",
        content: `${userData.name}님 환영합니다!`,
      })
    }
  }

  useEffect(() => {
    if (!userInformation || !retreatAttend || !inOutInfos) {
      return
    }
    if (lastUpdateCheckSetTimer) {
      clearTimeout(lastUpdateCheckSetTimer)
    }
    lastUpdateCheckSetTimer = setTimeout(() => {
      lastUpdateCheckSetTimer = undefined
      checkAllDataFromUpdate()
    }, 500)
  }, [userInformation, retreatAttend, inOutInfos])

  async function checkAllDataFromUpdate() {
    // 카풀은 정보 수정이 오래 걸림으로 수정중엔 처리하지 안음
    if (editContent === EditContent.inOutInfo) {
      return
    }
    if (sayBotAutoText) {
      return
    }
    sayBotAutoText = true
    setTimeout(() => {
      sayBotAutoText = false
    }, 1000)
    setTimeout(checkMissedUserInformationAndEdit, 100)
    if (editContent !== EditContent.none) {
      setEditContent(EditContent.none)
      saveAllInformation().then(() => {
        fetchRetreatAttendInformation(true)
      })
    }
  }

  async function checkMissedUserInformationAndEdit() {
    const missedContent = checkMissedUserInformation()
    const missedRetreatAttendContent = checkMissedRetreatAttendInformation()
    const allIsOkay =
      missedContent === EditContent.none &&
      missedRetreatAttendContent === EditContent.none
    if (allIsOkay) {
      // 취소가 사실상 없을 것으로 예상, 아직 접수가 완료되지 않았다면으로 사용
      if (retreatAttend?.isCanceled) {
        await confirmUserData()
        return
      }
      if (editContent !== EditContent.none) {
        if (editContent !== EditContent.inOutInfoEnd) {
          await saveAllInformation()
          addChat({
            type: "bot",
            content: `내용이 저장 되었어요!`,
          })
        }
      }
      whatDoYouWantToDo()
      return false
    }
    switch (missedContent) {
      case EditContent.name:
        editUserName()
        return true
      case EditContent.yearOfBirth:
        editUserYearOfBirth()
        return true
      case EditContent.gender:
        editUserGender()
        return true
      case EditContent.phone:
        editUserPhone()
        return true
      case EditContent.darak:
        editDarak()
        return true
    }
    switch (missedRetreatAttendContent) {
      case EditContent.howToGo:
        howToGo()
        return true
      case EditContent.howToBack:
        howToBack()
        return true
      case EditContent.inOutInfo:
        addChat({
          type: "bot",
          content: `이동 정보 등록이 필요해요!`,
          buttons: [
            {
              content: "이동 정보 입력창 열기",
              onClick: () => {
                addChat({
                  type: "my",
                  content: "이동 정보 입력창 열기",
                })
                setShowInOutInfoForm(true)
                setEditContent(EditContent.inOutInfo)
              },
            },
          ],
        })
        return true
      case EditContent.etc:
        editEtc()
        return true
    }

    addChat({
      type: "bot",
      content: `엇! 개발자의 실수가 있어요. 관리자에게 문의하세요!`,
    })
    return true
  }

  function editEtc() {
    addChat({
      type: "bot",
      content: `기타 사항을 입력해주세요.`,
      buttons: [
        {
          content: "없어요.",
          onClick: () => {
            addChat({
              type: "my",
              content: "없어요.",
            })
            editRetreatAttendInformation("etc", "")
          },
        },
      ],
    })
    setEditContent(EditContent.etc)
  }

  function howToGo() {
    setEditContent(EditContent.howToGo)
    addChat({
      type: "bot",
      content: `수련회장으로 어떻게 오실건가요?`,
      buttons: [
        {
          content: "목요일 교회 버스",
          onClick: () => {
            addChat({
              type: "my",
              content: "목요일 교회 버스",
            })
            editRetreatAttendInformation("howToGo", HowToMove.together)
          },
        },
        {
          content: "금요일 교회 버스",
          onClick: () => {
            addChat({
              type: "my",
              content: "금요일 교회 버스",
            })
            editRetreatAttendInformation("howToGo", HowToMove.rideCar)
          },
        },
        /*
        {
          content: "자가용 (카풀 가능)",
          onClick: () => {
            addChat({
              type: "my",
              content: "자가용 (카풀 가능)",
            })
            editRetreatAttendInformation(
              "howToGo",
              HowToMove.driveCarWithPerson
            )
          },
        },*/
        {
          content: "자차",
          onClick: () => {
            addChat({
              type: "my",
              content: "자차",
            })
            editRetreatAttendInformation("howToGo", HowToMove.driveCarAlone)
          },
        },
        /*
        {
          content: "대중교통",
          onClick: () => {
            addChat({
              type: "my",
              content: "대중교통",
            })
            editRetreatAttendInformation("howToGo", HowToMove.goAlone)
          },
        },
        */
      ],
    })
  }

  function howToBack() {
    setEditContent(EditContent.howToBack)
    addChat({
      type: "bot",
      content: `수련회장에서 어떻게 교회로 돌아가실건가요?`,
      buttons: [
        {
          content: "교회 버스",
          onClick: () => {
            addChat({
              type: "my",
              content: "교회 버스",
            })
            editRetreatAttendInformation("howToBack", HowToMove.together)
          },
        },
        /*
        {
          content: "자가용 (카풀 가능)",
          onClick: () => {
            addChat({
              type: "my",
              content: "자가용 (카풀 가능)",
            })
            editRetreatAttendInformation(
              "howToBack",
              HowToMove.driveCarWithPerson
            )
          },
        },
        */
        {
          content: "자차",
          onClick: () => {
            addChat({
              type: "my",
              content: "자차",
            })
            editRetreatAttendInformation("howToBack", HowToMove.driveCarAlone)
          },
        },
        /*
        {
          content: "카풀 필요",
          onClick: () => {
            addChat({
              type: "my",
              content: "카풀 필요",
            })
            editRetreatAttendInformation("howToBack", HowToMove.rideCar)
          },
        },
        {
          content: "대중교통",
          onClick: () => {
            addChat({
              type: "my",
              content: "대중교통",
            })
            editRetreatAttendInformation("howToBack", HowToMove.goAlone)
          },
        },*/
      ],
    })
    setEditContent(EditContent.howToBack)
  }

  function editUserName() {
    addChat({
      type: "bot",
      content: `이름을 알려주세요.`,
    })
    setEditContent(EditContent.name)
  }

  function editUserYearOfBirth() {
    addChat({
      type: "bot",
      content: `몇년생이신가요?. 빠른은 동기기준입니다.`,
    })
    setEditContent(EditContent.yearOfBirth)
  }

  function getKrFromHowToMove(howToMove: HowToMove) {
    switch (howToMove) {
      case HowToMove.together:
        return "교회 버스"
      case HowToMove.driveCarWithPerson:
        return "자가용 (카풀 가능)"
      case HowToMove.driveCarAlone:
        return "자차"
      case HowToMove.rideCar:
        return "교회 버스"
      case HowToMove.goAlone:
        return "대중교통"
    }
    return ""
  }

  async function confirmUserData() {
    const inOutInfos = await fetchInOutInfo(true)
    const userData = userInformation
    if (!retreatAttend || !userData || !inOutInfos) {
      return
    }

    function dayToString(day: Days) {
      if (day === Days.firstDay) {
        return "금요일"
      } else if (day === Days.secondDay) {
        return "토요일"
      } else {
        return "일요일"
      }
    }

    if (retreatAttend.isCanceled) {
      // addChat({
      //   type: "bot",
      //   content: `${userInformation.name}님의 수련회 신청 내역은 취소되었어요.`,
      // })
      // return
    }
    sayBotAutoText = true
    setTimeout(() => {
      sayBotAutoText = false
    }, 2000)
    addChat({
      type: "bot",
      content: `[2025 여름 수련회 접수 확인]

${
  retreatAttend.attendanceNumber
    ? "■ 접수 번호 : " + retreatAttend.attendanceNumber
    : ""
}
■ 접수자 : ${userData.name}
■ 출생년도 : ${userData.yearOfBirth}
■ 성별 : ${userData.gender === "man" ? "남성" : "여성"}
■ 연락처 : ${userData.phone}
■ 순장님 : ${userData.community?.name}
■ 수련회장 가는 방법 : ${getKrFromHowToMove(retreatAttend.howToGo)}
■ 수련회장에서 나오는 방법 : ${getKrFromHowToMove(retreatAttend.howToBack)}
■ 회비 입금 확인: ${
        retreatAttend.isDeposited === Deposit.none ? "대기중" : "입금 확인 완료"
      }
■ 기타 사항 : ${retreatAttend.etc ? retreatAttend.etc : "없음"}
${inOutInfos.length > 0 ? "\n■ 이동 정보\n" : ""}
${inOutInfos
  .map((inOutInfo) => {
    let position = inOutInfo.position

    if (inOutInfo.howToMove === HowToMove.goAlone) {
      position = "여주역"
    }
    return `${dayToString(inOutInfo.day)} ${inOutInfo.time} 시\n${
      inOutInfo.inOutType === InOutType.IN
        ? `${position} → 수련회장 `
        : `수련회장 → ${position}`
    } / ${getKrFromHowToMove(inOutInfo.howToMove)}\n`
  })
  .join("\n")}`,
      buttons: [
        {
          content: "엇.. 틀린게 있어요.",
          onClick: () => {
            addChat({
              type: "my",
              content: "엇.. 틀린게 있어요.",
            })
            selectEditContent()
          },
        },
        {
          content: "네! 좋아요.",
          onClick: async () => {
            addChat({
              type: "my",
              content: "네! 좋아요.",
            })
            await saveAllInformation()
            post("/retreat/complete", {})
            savedUserInformation()
            //ShowPostcard()
            whatDoYouWantToDo()
          },
        },
      ],
    })
  }

  function ShowPostcard() {
    addChat({
      type: "bot",
      content: `수련회 접수가 완료되었어요.\n${userInformation?.name}님에게 편지가 한 장 도착했어요!`,
      buttons: [
        {
          content: "편지 보기",
          onClick: () => {
            addChat({
              type: "my",
              content: "편지 보기",
            })
            whatDoYouWantToDo()
            global.open("/retreat/postcard", "_blank")
          },
        },
      ],
    })
  }

  function selectEditContent() {
    addChat({
      type: "bot",
      content: `무엇을 바꾸고 싶으신가요?`,
      buttons: [
        {
          content: "이름",
          onClick: () => {
            addChat({
              type: "my",
              content: "이름",
            })
            editUserName()
          },
        },
        {
          content: "출생년도",
          onClick: () => {
            addChat({
              type: "my",
              content: "출생년도",
            })
            editUserYearOfBirth()
          },
        },
        {
          content: "성별",
          onClick: () => {
            addChat({
              type: "my",
              content: "성별",
            })
            editUserGender()
          },
        },
        {
          content: "연락처",
          onClick: () => {
            addChat({
              type: "my",
              content: "연락처",
            })
            editUserPhone()
          },
        },
        {
          content: "순장님",
          onClick: () => {
            addChat({
              type: "my",
              content: "순장님",
            })
            editDarak()
          },
        },
        {
          content: "기타 사항",
          onClick: () => {
            addChat({
              type: "my",
              content: "기타 사항",
            })
            editEtc()
          },
        },
        {
          content: "수련회장 가는 방법",
          onClick: () => {
            addChat({
              type: "my",
              content: "수련회장 가는 방법",
            })
            howToGo()
          },
        },
        {
          content: "수련회장에서 나오는 방법",
          onClick: () => {
            addChat({
              type: "my",
              content: "수련회장에서 나오는 방법",
            })
            howToBack()
          },
        },
      ],
    })
  }

  function editUserGender() {
    addChat({
      type: "bot",
      content: `성별은 어떻게 되시나요?`,
      buttons: [
        {
          content: "남자",
          onClick: () => {
            addChat({
              type: "my",
              content: "남자",
            })
            editUserInformation("gender", "man")
          },
        },
        {
          content: "여자",
          onClick: () => {
            addChat({
              type: "my",
              content: "여자",
            })
            editUserInformation("gender", "woman")
          },
        },
      ],
    })
    setEditContent(EditContent.gender)
  }

  function editUserPhone() {
    addChat({
      type: "bot",
      content: `무슨 일이 있으면 연락드릴게요! 연락처를 알려주세요.`,
    })
    setEditContent(EditContent.phone)
  }

  function savedUserInformation() {
    addChat({
      type: "bot",
      content: `말씀하신 대로 저장했어요!`,
    })
    setEditContent(EditContent.none)
  }

  async function editDarak() {
    addChat({
      type: "bot",
      content: "순장님은 누구인가요? 성까지 입력해주세요!",
    })
    setEditContent(EditContent.darak)
  }

  function whatDoYouWantToDo() {
    addChat({
      type: "bot",
      content: `무엇을 도와드릴까요?`,
      buttons: [
        {
          content: "접수 정보 확인",
          onClick: () => {
            addChat({
              type: "my",
              content: "접수 정보 확인",
            })
            confirmUserData()
          },
        },
        {
          content: "접수 정보 수정",
          onClick: () => {
            addChat({
              type: "my",
              content: "접수 정보 수정",
            })
            selectEditContent()
          },
        },
        {
          content: "안내 사항",
          onClick: () => {
            addChat({
              type: "my",
              content: "안내 사항",
            })
            addChat({
              type: "bot",
              content: `수련회 장소는 구세군 백화산 수련원 입니다.\n8월 14일 목요일부터 8월 17일 주일까지 진행됩니다.\n회비 : 12만원 (직장인), 10만원 (그외)`,
            })
          },
        },
        /*
        {
          content: "이동 정보 수정",
          onClick: () => {
            addChat({
              type: "my",
              content: "이동 정보 수정",
            })
            setShowInOutInfoForm(true)
            setEditContent(EditContent.inOutInfo)
          },
        },
        */
      ],
    })
  }

  return {
    editContent,
    setEditContent,
  }
}
