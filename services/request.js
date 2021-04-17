import {
  BASE_URL,
  TIMEOUT
} from './config'

import wxp from '../utils/wxp'

import {
  TOKEN
} from '../common/const'

const app = getApp()

// 不用鉴权的接口使用的方法
// 为了提高用户体验，加了一个loading提示
export const request = (options) => {
  // console.log('options--', options);

  // 获取本地token
  let token = wx.getStorageSync(TOKEN)
  if (token) {
    if (!options.header) options.header = {}
    options.header['Authorization'] = `Bearer ${token}`
  }

  wx.showLoading({
    title: '数据加载中...',
  })

  // 兼容ios真机环境下Promise对象不存在finally方法
  if (!Promise.prototype.finally) {
    console.log('不支持Promise.prototype.finally~')
    Promise.prototype.finally = function (callback) {
      return this.then(res => {
        console.log('Promise.prototype.finally---', res)
        callback && callback(res)
        return Promise.resolve(res)
      }, error => {
        callback && callback(error)
        return Promise.reject(res)
      })
    }
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
    // 测试发现，Promise.finally()在实际使用中ios真机上不生效，安卓及模拟器正常
    .finally(() => {
      wx.hideLoading()
    })

}

// 需要鉴权的接口使用的方法
export const requestWithToken = (options, requestMethod = request) => {
  let token = wx.getStorageSync(TOKEN)
  // 如果 token 不存在，则先进行登录鉴权的操作，然后再向开发者服务器请求相应接口
  if (!token) {
    _showLoginPanel(options)
  }

  // 如果 token 存在，则进一步验证服务器的 token 是否失效
  return requestMethod(options).then((res) => {
    // console.log('requestMethod---', res)
    // 10002 则说明 token 失效
    return res.data.returnCode === 10002 ? _showLoginPanel(options) : Promise.resolve(res)
  })
}


const _showLoginPanel = (options) => {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  // 展示登陆浮窗（当前是那个页面，currentPage指向的就是那个页面实例）
  currentPage.setData({
    showLoginPanel: true
  })
  return new Promise((resolve, reject) => {
    app.globalEvent.on('loginSuccess', function (e) {
      request(options).then(function (result) {
        resolve(result)
      })
    })
  })
}