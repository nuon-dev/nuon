"use client"

import { Button, Stack } from "@mui/material"
import { SharingImage } from "@server/entity/retreat/sharing"
import dayjs from "dayjs"
import useUserData from "@/app/retreat/hooks/useUserData"
import { useRouter } from "next/navigation"
import { get, post } from "@/config/api"
import { useEffect, useState } from "react"
import { useSetAtom } from "jotai"
import { NotificationMessage } from "@/state/notification"
import DeleteIcon from "@mui/icons-material/Delete"
import { User } from "@server/entity/user"
import { SERVER_FULL_PATH } from "@/config/axios"

const tags = [
  "Day1",
  "Day2",
  "Day3",
  "Day4",
  "찬양",
  "집회",
  "바베큐파티",
  "단체사진",
  "최강다락방",
  "포토존",
  "Like_Jesus",
  "느징어개임",
  "성벽의_여정",
]

export default function Images() {
  const { push } = useRouter()
  const setNotificationMessage = useSetAtom(NotificationMessage)
  const [openUploadModal, setOpenUploadModal] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [sharingImageList, setSharingImageList] = useState<SharingImage[]>([])
  const [selectedTag, setSelectedTag] = useState<string[]>([])
  const { getUserDataFromToken, getUserDataFromKakaoLogin } = useUserData()
  const [userData, setUserData] = useState<User>()
  const [isManager, setIsManager] = useState(false)

  useEffect(() => {
    getImages()
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

  useEffect(() => {
    if (openUploadModal) {
      checkUserLogin()
      return
    }
    if (!openUploadModal) {
      setImage(null)
      setSelectedTag([])
    }
  }, [openUploadModal])

  const onChangeImg = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      const file = event.target.files[0]
      if (file && file.type.startsWith("image/")) {
        setImage(file)
      }
    }
  }

  async function saveImage() {
    if (!image) {
      return
    }
    const form = new FormData()
    form.append("image", image)
    form.append("tags", selectedTag.join(","))
    const result = await fetch(`${SERVER_FULL_PATH}/retreat/sharing/image`, {
      method: "PUT",
      body: form,
      headers: {
        token: localStorage.getItem("token") || "",
      },
    })

    if (result.status === 200) {
      setNotificationMessage("등록 되었습니다.")
      setOpenUploadModal(false)
      await getImages()
    }
  }

  async function getImages() {
    const data = await get("/retreat/sharing/images")
    setSharingImageList(data)
  }

  function goToSharing() {
    push("/retreat/sharing")
  }

  async function deleteImage(id: number) {
    await post("/retreat/sharing/image-delete", { id })
    setNotificationMessage("삭제 되었습니다.")
    getImages()
  }

  return (
    <Stack width="100%">
      <Stack
        px="12px"
        width="100%"
        height="60px"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        borderBottom="1px solid #ccc"
        position="fixed"
        zIndex="100"
        bgcolor="white"
      >
        <img
          src="/icon/free-icon-arrow-down.png"
          width="30px"
          onClick={goToSharing}
          style={{
            transform: "rotate(90deg)",
          }}
        />
        <img src="/retreat/logo.jpeg" height="50spx" />
      </Stack>
      <Stack
        p="10px"
        width="40px"
        height="40px"
        textAlign="center"
        alignItems="center"
        justifyContent="center"
        zIndex="100"
        position="fixed"
        bottom="0"
        right="0"
        m="20px"
        border="1px solid #ccc"
        borderRadius="30px"
        bgcolor="white"
        onClick={(e) => {
          e.stopPropagation()
          setOpenUploadModal(true)
        }}
      >
        +
      </Stack>
      {openUploadModal && (
        <Stack
          width="100%"
          height="100%"
          zIndex="5000"
          position="fixed"
          alignItems="center"
          justifyContent="center"
          onClick={() => setOpenUploadModal(false)}
        >
          <Stack
            width="300px"
            minHeight="500px"
            bgcolor="white"
            borderRadius="10px"
            border="1px solid #ccc"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <label htmlFor="imgInput">
              <Stack
                textAlign="center"
                padding="4px"
                margin="12px"
                borderRadius="4px"
                border="1px solid #ccc"
              >
                사진 선택
              </Stack>
            </label>
            <input type="file" hidden id="imgInput" onChange={onChangeImg} />
            <Stack flex="1">
              {image ? (
                <img
                  style={{
                    maxHeight: "280px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                  className="img"
                  src={URL.createObjectURL(image)}
                  alt="image"
                />
              ) : (
                <Stack
                  width="100%"
                  height="100%"
                  textAlign="center"
                  alignItems="center"
                  justifyContent="center"
                >
                  사진을 선택해주세요
                </Stack>
              )}
            </Stack>
            <Stack
              p="8px"
              gap="8px"
              fontSize="13px"
              direction="row"
              flexWrap="wrap"
            >
              {tags.map((tag) => (
                <Stack
                  key={tag}
                  p="4px"
                  px="8px"
                  borderRadius="20px"
                  border="1px solid #ccc"
                  bgcolor={selectedTag.includes(tag) ? "#eee" : "white"}
                  color={selectedTag.includes(tag) ? "#47a" : "black"}
                  onClick={() => {
                    if (selectedTag.includes(tag)) {
                      setSelectedTag(selectedTag.filter((t) => t !== tag))
                      return
                    }
                    if (selectedTag.length >= 3) {
                      setNotificationMessage("태그는 3개까지 선택 가능합니다.")
                      return
                    }
                    setSelectedTag([...selectedTag, tag])
                  }}
                >
                  #{tag}
                </Stack>
              ))}
            </Stack>
            <Button
              variant="contained"
              style={{
                margin: "10px",
                backgroundColor: "#AF3E3E",
              }}
              onClick={saveImage}
            >
              저장하기
            </Button>
          </Stack>
        </Stack>
      )}
      <Stack
        mt="70px"
        gap="12px"
        width="100%"
        zIndex="10"
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="start"
      >
        {sharingImageList.map((image) => (
          <Stack
            width="100%"
            gap="12px"
            key={image.id}
            borderBottom="1px solid #ccc"
          >
            <Stack px="12px" direction="row" alignItems="center" gap="12px">
              <Stack>
                <img
                  src={`/retreat/profile${image.writer.profile}.png`}
                  width="30px"
                  height="30px"
                  style={{
                    borderRadius: "50%",
                  }}
                />
              </Stack>
              <Stack>{image.writer.name}</Stack>
              <Stack fontSize="12px" color="#888">
                {dayjs(image.writer.createAt).format("YY.MM.DD HH:mm")}
              </Stack>
              <Stack flex="1" />
              {(userData?.id === image.writer.id || isManager) && (
                <DeleteIcon
                  fontSize="small"
                  onClick={() => deleteImage(image.id)}
                />
              )}
            </Stack>
            <img
              width="100%"
              src={`${SERVER_FULL_PATH}/sharing/image/${image.url}`}
            />
            <Stack direction="row" gap="12px" p="12px" pt="4px">
              {image.tags &&
                image.tags.split(",").map((tag) => (
                  <Stack
                    key={tag}
                    bgcolor="#eee"
                    padding="4px"
                    borderRadius="4px"
                    fontSize="12px"
                  >
                    #{tag}
                  </Stack>
                ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
