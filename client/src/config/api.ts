import axios from "./axios"

/**
 * @deprecated use axios in config/axios.ts instead
 */
export async function post(path: string, data: any) {
  const header = new Headers()
  const token = localStorage.getItem("token") || ""
  header.append("Content-Type", "application/json")
  header.append("token", token)

  const response = await axios.post(path, data)
  return response.data
}

/**
 * @deprecated use axios in config/axios.ts instead
 */
export async function get(path: string) {
  const response = await axios.get(path)
  return response.data
}

/**
 * @deprecated use axios in config/axios.ts instead
 */
export async function put(path: string, data: any) {
  const token = localStorage.getItem("token") || ""
  const response = await axios.put(path, data)
  return response.data
}

/**
 * @deprecated use axios in config/axios.ts instead
 */
export async function dele(path: string, data: any) {
  const response = await axios.delete(path, { data: data })
  return response.data
}
