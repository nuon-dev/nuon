import { GetUrl } from "@/config/axios"
import { useEffect } from "react"

export default function useKakaoHook() {
  const globalValue: any = global
  var Kakao: any = globalValue.Kakao
  useEffect(() => {
    loadKakao().then((loaded) => {
      if (!loaded) {
        const script = document.createElement("script")
        script.src = "https://developers.kakao.com/sdk/js/kakao.js"
        script.async = true
        document.head.appendChild(script)
        loadKakao().then((loaded) => {
          if (!loaded) {
            alert(
              "네트워크 문제로 카카오 SDK 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.",
            )
          }
        })
      }
    })
  }, [])

  async function loadKakao() {
    // 로딩이 안되었으면 조금 기다려 보기
    for (let index = 0; index < 50; index++) {
      if (globalValue.Kakao) {
        Kakao = globalValue.Kakao
        if (!Kakao.isInitialized()) {
          Kakao.init("24c68e47fc07af3735433d60a3c4f4b3") // 발급받은 키 중 javascript키를 사용해준다.
        }
        return true
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return false
  }

  async function executeKakaoLogin(redirectUri: string = "") {
    const URL = GetUrl()
    await Kakao.Auth.authorize({
      redirectUri: `${URL.host}:${URL.clientPort}/common/login`,
      state: redirectUri,
    })
    return
  }

  return {
    executeKakaoLogin,
  }
}
