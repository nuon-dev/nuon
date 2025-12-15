"use client"

import { Button, Stack } from "@mui/material"
import { useRouter } from "next/navigation"
import { get, post } from "@/config/api"
import { useEffect, useState } from "react"
import { SharingText } from "@server/entity/retreat/sharing"
import dayjs from "dayjs"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"
import useUserData from "@/app/retreat/hooks/useUserData"
import DeleteIcon from "@mui/icons-material/Delete"
import { User } from "@server/entity/user"

export default function Sharing() {
  const { push } = useRouter()
  const setNotificationMessage = useSetAtom(NotificationMessage)
  const [sharingMessage, setSharingMessage] = useState("")
  const [sharingTextList, setSharingTextList] = useState<SharingText[]>([])
  const { getUserDataFromToken, getUserDataFromKakaoLogin } = useUserData()
  const [userData, setUserData] = useState<User>()
  const [isManager, setIsManager] = useState(false)

  useEffect(() => {
    getSharing()
    checkUserLogin()
  }, [])

  async function checkUserLogin() {
    if (userData) {
      return
    }
    let userDataResponse = await getUserDataFromToken()
    if (!userDataResponse) {
      userDataResponse = await getUserDataFromKakaoLogin()
      if (!userDataResponse) {
        setNotificationMessage("등록을 하기 위해선 로그인이 필요합니다.")
        return
      }
    }
    const { result } = await get("/retreat/sharing/is-manager")
    setIsManager(result)
    setUserData(userDataResponse)
  }

  function goToImagesPage() {
    push("/retreat/sharing/images")
  }

  function goToYoutube() {
    globalThis.open("https://www.youtube.com/@SWJICH_YOUNG")
  }

  function goToVInstagram() {
    globalThis.open("https://www.instagram.com/suwonjeilch_youngpeople/")
  }

  function goToNotion() {
    globalThis.open(
      "https://past-carver-5b9.notion.site/2025-COME-LET-US-BUILD-20f37c3d354c803bad60faf7e4734e64?source=copy_link"
    )
  }

  async function registerSharing() {
    if (!sharingMessage) {
      setNotificationMessage("내용을 입력해주세요.")
      return
    }
    setNotificationMessage("등록 되었습니다.")
    await post("/retreat/sharing", { content: sharingMessage })
    setSharingMessage("")
    getSharing()
  }

  async function getSharing() {
    const sharing = await get("/retreat/sharing")
    setSharingTextList(sharing)
  }

  async function deleteSharingText(id: number) {
    await post("/retreat/sharing/delete", { id })
    getSharing()
    setNotificationMessage("삭제 되었습니다.")
  }

  function SelectProfile() {
    if (!userData) {
      return null
    }

    if (userData.profile) {
      return null
    }

    async function setProfile(profile: number) {
      await post("/retreat/sharing/set-profile", { profile })
      location.reload()
    }

    return (
      <Stack
        width="100vw"
        height="100vh"
        zIndex="1000"
        position="fixed"
        alignItems="center"
        justifyContent="center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Stack gap="60px">
          <Stack width="100%" color="white" fontWeight="600" fontSize="20px">
            프로필을 선택해 주세요!
          </Stack>

          <Stack direction="row" gap="12px" justifyContent="center">
            <img
              onClick={() => setProfile(1)}
              src="/retreat/profile1.png"
              width="40px"
            />
            <img
              onClick={() => setProfile(2)}
              src="/retreat/profile2.png"
              width="40px"
            />
          </Stack>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack alignItems="center" gap="24px" mb="40px">
      <img
        src="/retreat/sharing_bg.jpeg"
        width="100%"
        style={{
          zIndex: 1,
          position: "absolute",
        }}
      />
      <Stack direction="row" gap="24px" mt="60%" zIndex="10">
        {/*
        <Box
          onClick={goToYoutube}
          style={{
            backgroundImage: "url(/retreat/youtube.png)",
            backgroundSize: "cover",
            width: "65px",
            height: "65px",
          }}
        />
        <Box
          onClick={goToImagesPage}
          style={{
            backgroundImage: "url(/retreat/photo.png)",
            backgroundSize: "cover",
            width: "65px",
            height: "65px",
          }}
        />
        <Box
          onClick={goToNotion}
          style={{
            backgroundImage: "url(/retreat/notion.png)",
            backgroundSize: "cover",
            width: "65px",
            height: "65px",
          }}
        />
        <Box
          onClick={goToVInstagram}
          style={{
            backgroundImage: "url(/retreat/insta.png)",
            backgroundSize: "cover",
            width: "65px",
            height: "65px",
          }}
        />
        */}
      </Stack>

      <Stack
        p="24px"
        px="12px"
        borderRadius="12px"
        width="90%"
        gap="12px"
        zIndex="10"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <Stack fontWeight="600" fontSize="16px">
          어떤 은혜를 받으셨나요?
        </Stack>
        <Stack gap="12px">
          <textarea
            rows={4}
            placeholder="이번 수련회를 통해 받은 은혜를 나눠주세요"
            value={sharingMessage}
            onFocus={checkUserLogin}
            onChange={(e) => setSharingMessage(e.target.value)}
            style={{
              height: "20vh",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "12px",
              resize: "none",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          />
          <Button
            variant="contained"
            onClick={registerSharing}
            sx={{
              borderRadius: "4px",
              backgroundColor: "#AF3E3E",
            }}
          >
            등록하기
          </Button>
        </Stack>
      </Stack>
      <Stack
        width="90%"
        bgcolor="white"
        border="1px solid #ccc"
        borderRadius="12px"
        zIndex="10"
      >
        <Stack
          p="12px"
          direction="row"
          fontSize="18px"
          fontWeight="500"
          justifyContent="space-between"
        >
          <Stack>은혜 나눔 게시판</Stack>
          <Stack>{sharingTextList.length}</Stack>
        </Stack>
        <Stack
          p="4px"
          pt="10px"
          overflow="scroll"
          height="300px"
          maxHeight="300px"
          borderTop="1px solid #ccc"
        >
          <Stack px="12px" gap="12px" height="100px" borderRadius="4px">
            {sharingTextList.map((sharingText) => (
              <Stack pb="12px" gap="12px" direction="row" alignItems="start">
                <img
                  src={`/retreat/profile${sharingText.writer.profile}.png`}
                  width="40px"
                  height="40px"
                  style={{
                    borderRadius: "50%",
                    marginTop: "4px",
                  }}
                />
                <Stack direction="column" gap="4px">
                  <Stack direction="row" gap="8px" alignItems="center">
                    <Stack fontWeight="600">{sharingText.writer.name}</Stack>
                    <Stack fontSize="12px" color="grey">
                      {dayjs(sharingText.createAt).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </Stack>
                  </Stack>
                  <Stack
                    style={{
                      wordBreak: "break-all",
                    }}
                    width="100%"
                    flexWrap="wrap"
                    whiteSpace="pre-wrap"
                  >
                    {sharingText.content}
                  </Stack>
                </Stack>
                <Stack flex="1" />
                {(userData?.id === sharingText.writer.id || isManager) && (
                  <DeleteIcon
                    fontSize="small"
                    style={{
                      marginTop: "4px",
                    }}
                    onClick={() => deleteSharingText(sharingText.id)}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
      <SelectProfile />
    </Stack>
  )
}
