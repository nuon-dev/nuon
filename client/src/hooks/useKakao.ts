import { useEffect } from "react"

export default function useKakaoHook() {
  const globalValue: any = global
  var Kakao: any = globalValue.Kakao
  useEffect(() => {
    loadKakao()
  }, [])

  async function loadKakao() {
    // 로딩이 안되었으면 조금 기다려 보기
    for (let index = 0; index < 50; index++) {
      if (globalValue.Kakao) {
        Kakao = globalValue.Kakao
        if (!Kakao.isInitialized()) {
          Kakao.init("24c68e47fc07af3735433d60a3c4f4b3") // 발급받은 키 중 javascript키를 사용해준다.
        }
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    alert("필수 라이브러리 로딩 실패, 다른 브라우저를 이용해주세요.")
  }

  function getKakaoToken(): Promise<number> {
    return new Promise((resolve, reject) => {
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
