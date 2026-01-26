import axios from "axios"

export const GetServerUrl = () => {
  const target = process.env.NEXT_PUBLIC_API_TARGET

  let PORT = 8000
  switch (target) {
    case "prod":
      PORT = 8000
      return `${process.env.NEXT_PUBLIC_PROD_SERVER}:${PORT}`
    case "dev":
      PORT = 8001
      return `${process.env.NEXT_PUBLIC_DEV_SERVER}:${PORT}`
    case "local":
    default:
      PORT = 8000
      return `${process.env.NEXT_PUBLIC_LOCAL_SERVER}:${PORT}`
  }
}

const SERVER_URL = GetServerUrl()

export const SERVER_FULL_PATH = `${SERVER_URL}`

const isBrowser = typeof window !== "undefined"

axios.defaults.baseURL = SERVER_FULL_PATH
axios.defaults.withCredentials = true

axios.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = localStorage.getItem("token") || ""
      config.headers["token"] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (isBrowser) {
        window.location.href = `/common/login?redirect=${encodeURIComponent(
          window.location.pathname,
        )}`
      }
    }
    return Promise.reject(error)
  },
)
export default axios
