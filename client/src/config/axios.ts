import axios from "axios"
const PORT = 8000

const getBaseUrl = () => {
  const target = process.env.NEXT_PUBLIC_API_TARGET

  switch (target) {
    case "prod":
      return process.env.NEXT_PUBLIC_PROD_SERVER
    case "dev":
      return process.env.NEXT_PUBLIC_DEV_SERVER
    case "local":
    default:
      return process.env.NEXT_PUBLIC_LOCAL_SERVER
  }
}

const SERVER_URL = getBaseUrl()

export const SERVER_FULL_PATH = `${SERVER_URL}:${PORT}`

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
  }
)

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (isBrowser) {
        window.location.href = `/common/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`
      }
    }
    return Promise.reject(error)
  }
)
export default axios
