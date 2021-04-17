import {request} from './request'

export const getCategoryList = () => {
  return request({
    url: '/category'
  })
}


export const getCategoryDetail = (categoryId) => {
  return request({
    url: '/category/' + categoryId
  })
}