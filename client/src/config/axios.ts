import axios from "axios"

export const GetUrl = () => {
  const target = process.env.NEXT_PUBLIC_API_TARGET

  let SERVER_PORT = 8000
  let CLIENT_PORT = 8080
  switch (target) {
    case "prod":
      SERVER_PORT = 8000
      CLIENT_PORT = 8080
      return {
        host: process.env.NEXT_PUBLIC_PROD_SERVER,
        serverPort: SERVER_PORT,
        clientPort: CLIENT_PORT,
      }
    case "dev":
      SERVER_PORT = 8001
      CLIENT_PORT = 80
      return {
        host: process.env.NEXT_PUBLIC_DEV_SERVER,
        serverPort: SERVER_PORT,
        clientPort: CLIENT_PORT,
      }
    case "local":
    default:
      SERVER_PORT = 8000
      CLIENT_PORT = 80
      return {
        host: process.env.NEXT_PUBLIC_LOCAL_SERVER,
        serverPort: SERVER_PORT,
        clientPort: CLIENT_PORT,
      }
  }
}

const URL = GetUrl()

export const SERVER_FULL_PATH = `${URL.host}:${URL.serverPort}`

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
