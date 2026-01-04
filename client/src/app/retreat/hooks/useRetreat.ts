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

  const { login, isLogin, authUserData } = useAuth()

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
      return axios.post("/auth/edit-my-information", {
        ...request,
        id: authUserData?.id,
      })
    }
    return
  }

  async function saveRetreatAttend() {
    return await axios.post("/retreat/attend", {
      isHalf,
      isWorker,
    })
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
    saveRetreatAttend,
    getMyInfo,
  }
}
