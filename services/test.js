import wxp from '../utils/wxp'
import {
  baseUrl
} from './config'

export const getTestData = () => {
  return wxp.request({
    url: baseUrl + '/test?name=kai&age=23',
    method: 'get',
  })
}

export const postTestData = (data) => {
  return wxp.request({
    url: baseUrl + '/test',
    method: 'post',
    data
  })
}