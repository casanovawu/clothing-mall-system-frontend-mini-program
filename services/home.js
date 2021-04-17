
import {request} from './request'

export const getBanners = () => {
  return request({
    url: '/banner',
  })
}

export const getThemeInfo = (type, page) => {
  const queryInfo = `type=${type}&page=${page}`
  return request({
    url: '/theme?' + queryInfo
  })
}
