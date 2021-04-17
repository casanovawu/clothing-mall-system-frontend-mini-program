import {request} from './request'

export const searchGoodsByKeyword = (keyword) => {
  return request({
    url: '/goods?keyword=' + keyword
  })
}
