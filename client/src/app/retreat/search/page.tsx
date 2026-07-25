"use client"

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material"
import { keyframes } from "@mui/material/styles"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotification } from "@/hooks/useNotification"
import usePageColor from "@/hooks/usePageColor"
import axios from "@/config/axios"
import useAuth from "@/hooks/useAuth"
import useRetreat from "../hooks/useRetreat"

const revealField = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    height: "50px",
    bgcolor: "#FCFAFA",
    borderRadius: "10px",
    fontFamily: "Pretendard",
    fontSize: "16px",
    "& fieldset": {
      borderColor: "#F0E4E4",
    },
    "&:hover fieldset": {
      borderColor: "#E9D4D4",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#EAAFAF",
      borderWidth: "1px",
    },
  },
}

const YOUNGEST_BIRTH_YEAR = 2007
const OLDEST_BIRTH_YEAR = 1940
const BIRTH_YEARS = Array.from(
  { length: YOUNGEST_BIRTH_YEAR - OLDEST_BIRTH_YEAR + 1 },
  (_, index) => YOUNGEST_BIRTH_YEAR - index,
)

function getRevealSx(delay: number) {
  return {
    opacity: 0,
    animation: `${revealField} 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
    animationDelay: `${delay}ms`,
    "@media (prefers-reduced-motion: reduce)": {
      opacity: 1,
      animation: "none",
    },
  }
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  return digits.replace(
    /^(\d{3})(\d{0,4})(\d{0,4})$/,
    (_, first, middle, last) => [first, middle, last].filter(Boolean).join("-"),
  )
}

export default function RetreatSearch() {
  const { push } = useRouter()
  const { warning } = useNotification()
  const [phone, setPhone] = useState("")
  const [isLookupComplete, setIsLookupComplete] = useState(false)
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"남성" | "여성" | "">("")
  const [birthYear, setBirthYear] = useState("")
  const { kakaoToken, login } = useAuth()
  const { updateNuon } = useRetreat()

  usePageColor("#FFFFFF")

  function handleGoToBack() {
    push("/retreat")
  }

  async function handlePhoneLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phone.replace(/\D/g, "").length !== 11) {
      warning("전화번호 11자리를 입력해주세요.")
      return
    }

    // TODO: 전화번호 조회 API가 연결되면 성공 응답을 받은 경우에만 true로 변경해주세요.
    // 현재는 올바른 길이의 전화번호로 폼을 제출하면 조회가 완료된 것으로 처리합니다.
    try {
      const purePhone = phone.replace(/\D/g, "")
      await axios.get("/retreat/isRegistered", { params: { phone: purePhone } })
      setIsLookupComplete(false)
      if (!kakaoToken) {
        warning("카카오 로그인 정보가 없습니다. 다시 시도해주세요. (1)")
        return
      }
      await axios.post("/retreat/bind", {
        phone: purePhone,
        kakaoToken,
      })
      await login(kakaoToken)
      push("/retreat/register")
    } catch (error) {
      setIsLookupComplete(true)
    }
  }

  async function handleNextStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (phone.replace(/\D/g, "").length !== 11) {
      warning("전화번호 11자리를 입력해주세요.")
      return
    }

    if (!name.trim() || !gender || !birthYear) {
      warning("필수 정보를 모두 입력해주세요.")
      return
    }

    if (!kakaoToken) {
      warning("카카오 로그인 정보가 없습니다. 다시 시도해주세요. (2)")
      return
    }

    await updateNuon({
      kakaoToken,
      name,
      yearOfBirth: parseInt(birthYear),
      gender: gender === "남성" ? "man" : "woman",
      phone: phone.replace(/\D/g, ""),
    })

    push("/retreat/register")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isLookupComplete) {
      return handleNextStep(event)
    }

    return handlePhoneLookup(event)
  }

  return (
    <Stack
      component="main"
      width="100%"
      minHeight="100dvh"
      bgcolor="white"
      color="#171717"
      fontFamily="Pretendard"
      px="24px"
      pt="calc(18px + env(safe-area-inset-top))"
      pb="calc(32px + env(safe-area-inset-bottom))"
      boxSizing="border-box"
    >
      <Stack direction="row" alignItems="center" ml="-10px">
        <IconButton
          onClick={handleGoToBack}
          aria-label="뒤로가기"
          sx={{ color: "#171717" }}
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
        <Box component="h1" m={0} fontSize="24px" fontWeight={700}>
          수련회 신청 조회
        </Box>
      </Stack>

      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        gap="35px"
        mt="35px"
      >
        <Box component="h2" m={0} mb={1} fontSize="20px" fontWeight={700}>
          기본 정보를 입력해주세요!
        </Box>

        <Stack gap="10px">
          <Box component="label" htmlFor="phone" fontSize="16px">
            전화번호{" "}
            <Box component="span" color="#E57373" aria-hidden="true">
              *
            </Box>
          </Box>
          <TextField
            id="phone"
            name="phone"
            value={phone}
            onChange={(event) => {
              setPhone(formatPhoneNumber(event.target.value))
              setIsLookupComplete(false)
            }}
            placeholder="010-0000-0000"
            type="tel"
            autoComplete="tel"
            required
            fullWidth
            inputProps={{
              inputMode: "numeric",
              maxLength: 13,
              "aria-label": "전화번호",
            }}
            sx={{
              ...fieldSx,
            }}
          />
        </Stack>

        {isLookupComplete && (
          <Stack gap="24px" mt="-5px">
            <Stack gap="10px" sx={getRevealSx(40)}>
              <Box component="label" htmlFor="name" fontSize="16px">
                이름{" "}
                <Box component="span" color="#E57373" aria-hidden="true">
                  *
                </Box>
              </Box>
              <TextField
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력해주세요"
                autoComplete="name"
                required
                fullWidth
                sx={fieldSx}
              />
            </Stack>

            <FormControl required sx={getRevealSx(170)}>
              <FormLabel
                id="gender-label"
                sx={{
                  mb: "10px",
                  color: "#171717",
                  fontFamily: "Pretendard",
                  fontSize: "16px",
                  "&.Mui-focused": { color: "#171717" },
                  "& .MuiFormLabel-asterisk": { color: "#E57373" },
                }}
              >
                성별
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="gender-label"
                name="gender"
                value={gender}
                onChange={(event) =>
                  setGender(event.target.value as "남성" | "여성")
                }
                sx={{ gap: "10px", flexWrap: "nowrap" }}
              >
                {(["남성", "여성"] as const).map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={
                      <Radio
                        sx={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          opacity: 0,
                          pointerEvents: "none",
                        }}
                      />
                    }
                    label={option}
                    sx={{
                      m: 0,
                      flex: 1,
                      height: "50px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: gender === option ? "#EAAFAF" : "#F0E4E4",
                      bgcolor: gender === option ? "#FFF1F1" : "#FCFAFA",
                      color: gender === option ? "#C87575" : "#555",
                      fontFamily: "Pretendard",
                      fontSize: "16px",
                      textTransform: "none",
                      justifyContent: "center",
                      "& .MuiFormControlLabel-label": {
                        fontFamily: "Pretendard",
                        fontSize: "16px",
                      },
                      "&:hover": {
                        borderColor: "#EAAFAF",
                        bgcolor: "#FFF6F6",
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Stack gap="10px" sx={getRevealSx(300)}>
              <Box component="label" htmlFor="birthYear" fontSize="16px">
                출생연도{" "}
                <Box component="span" color="#E57373" aria-hidden="true">
                  *
                </Box>
              </Box>
              <TextField
                id="birthYear"
                name="birthYear"
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                autoComplete="bday-year"
                required
                fullWidth
                select
                SelectProps={{
                  native: true,
                }}
                sx={fieldSx}
              >
                <option value="" disabled>
                  출생연도를 선택해주세요
                </option>
                {BIRTH_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </TextField>
            </Stack>
          </Stack>
        )}

        <Button
          type="submit"
          variant="contained"
          disableElevation
          sx={{
            height: "50px",
            borderRadius: "10px",
            bgcolor: "#EAAFAF",
            color: "white",
            fontFamily: "Pretendard",
            fontSize: "16px",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#DF9F9F",
            },
            "&.Mui-disabled": {
              bgcolor: "#F1D8D8",
              color: "white",
            },
          }}
        >
          {isLookupComplete ? "다음으로" : "조회하기"}
        </Button>
      </Stack>
    </Stack>
  )
}
