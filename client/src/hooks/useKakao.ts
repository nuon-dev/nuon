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

  function getKakaoToken(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!Kakao) {
        alert("카카오 SDK가 로딩되지 않았습니다.\n잠시후 다시 눌러주세요.")
        if (globalValue.Kakao) {
          alert("globalValue.Kakao는 불러와짐")
        }
        return
      }
      Kakao.Auth.login({
        success: function (response: Response) {
          Kakao.API.request({
            url: "/v2/user/me",
            success: function (response: { id: number }) {
              resolve(response.id)
            },
            fail: function (error: any) {
              reject(error)
            },
          })
        },
        fail: function (error: any) {
          reject(error)
        },
      })
    })
  }

  return {
    getKakaoToken,
  }
}
