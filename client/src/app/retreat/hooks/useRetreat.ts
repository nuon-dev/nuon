import axios from "@/config/axios"
import useAuth from "@/hooks/useAuth"
import { atom, useAtom } from "jotai"

const stepAtom = atom(2)
const isHalfAtom = atom<boolean | null>(null)
const isWorkerAtom = atom<boolean | null>(null)

export default function useRetreat() {
  const [step, setStep] = useAtom(stepAtom)
  const [isHalf, setIsHalf] = useAtom(isHalfAtom)
  const [isWorker, setIsWorker] = useAtom(isWorkerAtom)

  const { login, isLogin } = useAuth()

  interface JoinNuonRequest {
    kakaoId: number
    name: string
    yearOfBirth: number
    gender: "man" | "woman"
    phone: string
  }

  async function updateNuon(request: JoinNuonRequest) {
    if (!isLogin) {
      await axios.post("/retreat/join", request)
      await login(request.kakaoId)
    } else {
      return axios.post("/auth/edit-my-information", request)
    }
    return
  }

  async function fetchRetreatAttend() {
    const response = await axios.get("/retreat/attend")
    return response.data
  }

  async function getMyInfo() {
    const { data } = await axios.get("/soon/my-info")
    return data
  }

  return {
    step,
    setStep,
    isHalf,
    setIsHalf,
    isWorker,
    setIsWorker,
    updateNuon,
    fetchRetreatAttend,
    getMyInfo,
  }
}
