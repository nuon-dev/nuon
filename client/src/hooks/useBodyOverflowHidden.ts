import { useEffect } from "react"

const useBodyOverflowHidden = (enable: boolean = true) => {
  useEffect(() => {
    if (!enable) return

    // 기존 overflow 스타일 저장
    const originalOverflow = document.body.style.overflow

    // overflow: hidden 적용
    document.body.style.overflow = "hidden"

    // 컴포넌트 언마운트 시 복구
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [enable])
}

export default useBodyOverflowHidden
