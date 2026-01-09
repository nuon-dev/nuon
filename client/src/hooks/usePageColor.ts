import { useEffect } from "react"

const usePageColor = (color: string) => {
  useEffect(() => {
    // body background color 변경
    const originalBodyColor = document.body.style.backgroundColor
    document.body.style.backgroundColor = color

    // meta theme-color 변경
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    let originalThemeColor: string | null = null

    if (metaThemeColor) {
      originalThemeColor = metaThemeColor.getAttribute("content")
      metaThemeColor.setAttribute("content", color)
    } else {
      metaThemeColor = document.createElement("meta")
      metaThemeColor.setAttribute("name", "theme-color")
      metaThemeColor.setAttribute("content", color)
      document.head.appendChild(metaThemeColor)
    }

    return () => {
      document.body.style.backgroundColor = originalBodyColor
      if (metaThemeColor) {
        if (originalThemeColor) {
          metaThemeColor.setAttribute("content", originalThemeColor)
        } else {
          // 원래 없었으면 삭제
          document.head.removeChild(metaThemeColor)
        }
      }
    }
  }, [color])
}

export default usePageColor
