import axios from "axios"

import { ESocialProvider } from "src/constants/enum"
import { REQUEST_ACCEPT_HEADER } from "src/constants/variables"
import useAuth from "src/store/auth"

const igAxiosInstance = axios.create({
  baseURL: "https://www.instagram.com/graphql/query"
})

const threadsAxiosInstance = axios.create({
  baseURL: "https://www.threads.net/graphql/query"
})

const fbAxiosInstance = axios.create({
  baseURL: "https://www.facebook.com/api/graphql"
})

const xAxiosInstance = axios.create({
  baseURL: "https://x.com/i/api/graphql"
})

const weiboAxiosInstance = axios.create({
  baseURL: "https://weibo.com/ajax/statuses"
})

threadsAxiosInstance.interceptors.request.use((config) => {
  const { accounts } = useAuth.getState()
  const igAppId = accounts[ESocialProvider.THREADS]?.igAppId

  if (igAppId) {
    config.headers["x-ig-app-id"] = igAppId
  }
  config.headers["Accept"] = REQUEST_ACCEPT_HEADER
  return config
})

fbAxiosInstance.interceptors.request.use((config) => {
  config.headers["Accept"] = REQUEST_ACCEPT_HEADER

  return config
})

igAxiosInstance.interceptors.request.use((config) => {
  config.headers["Accept"] = REQUEST_ACCEPT_HEADER

  return config
})

xAxiosInstance.interceptors.request.use((config) => {
  const { accounts } = useAuth.getState()
  const xAccount = accounts[ESocialProvider.X]
  if (xAccount) {
    config.headers["authorization"] = xAccount.accessToken
    config.headers["x-csrf-token"] = xAccount.csrfToken
  }
  return config
})

export {
  threadsAxiosInstance,
  igAxiosInstance,
  fbAxiosInstance,
  xAxiosInstance,
  weiboAxiosInstance
}
