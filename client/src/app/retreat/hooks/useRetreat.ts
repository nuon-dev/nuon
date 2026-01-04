import useAuth from "@/hooks/useAuth"
import useKakaoHook from "@/hooks/useKakao"
import { UnfoldLess } from "@mui/icons-material"
import axios from "@/config/axios"
import { atom, useAtom } from "jotai"
import { useEffect } from "react"

const stepAtom = atom(2)
const isHalfAtom = atom<boolean | null>(null)
const isWorkerAtom = atom<boolean | null>(null)

export default function useRetreat() {
  const [step, setStep] = useAtom(stepAtom)
  const [isHalf, setIsHalf] = useAtom(isHalfAtom)
  const [isWorker, setIsWorker] = useAtom(isWorkerAtom)

  return {
    step,
    setStep,
    isHalf,
    setIsHalf,
    isWorker,
    setIsWorker,
  }
}
