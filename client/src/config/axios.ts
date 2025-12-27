import axios from "axios"
const PORT = 8000
const SERVER_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost"
    : "https://nuon.iubns.net"
export const SERVER_FULL_PATH = `${SERVER_URL}:${PORT}`

const isBrowser = typeof window !== "undefined"

axios.defaults.baseURL = SERVER_FULL_PATH
if (isBrowser) {
  axios.defaults.headers.common["token"] = localStorage.getItem("token") || ""
}

axios.defaults.withCredentials = true

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
