import {requestWithToken} from './request'

export const getUserInfo = () => {
  return requestWithToken({
    url: '/user/my'
  })
}

