import {
  requestWithToken
} from './request'

import {
  BASE_URL,
  TIMEOUT
} from './config'

import wxp from '../utils/wxp'

import {
  TOKEN
} from '../common/const'

const _request = (options) => {

  // 获取本地token
  let token = wx.getStorageSync(TOKEN)
  if (token) {
    if (!options.header) options.header = {}
    options.header['Authorization'] = `Bearer ${token}`
  }

  return wxp.request({
      url: BASE_URL + options.url,
      method: options.method || 'get',
      data: options.data || {},
      timout: TIMEOUT,
      header: options.header
    })
    .catch(err => {
      console.log('发生网络请求错误---', err)
    })
}

// 考虑到用户体验和业务需要，在购物车页面初始加载时显示loading提示，其他情况不显示
export const getCartList = (isShowLoading = true) => {

  if (isShowLoading) {
    return requestWithToken({
      url: '/user/my/carts'
    })
  } else {
    return requestWithToken({
      url: '/user/my/carts'
    }, _request)
  }
}

export const getCartListWithoutToken = () => {
  return _request({
    url: '/user/my/carts'
  })
}

export const modifyCartGoodsNum = (cartId, operator, num) => {
  return requestWithToken({
    url: `/user/my/carts/${cartId}`,
    method: 'put',
    data: {
      operator,
      num
    }
  })
}

export const removeCartGoods = (cartId) => {
  return requestWithToken({
    url: `/user/my/carts/${cartId}`,
    method: 'delete'
  })
}


export const removeAllCartGoods = () => {
  return requestWithToken({
    url: `/user/my/carts`,
    method: 'delete'
  })
}