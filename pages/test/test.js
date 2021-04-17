// pages/test/test.js

import {
  getTestData,
  postTestData
} from '../../services/test'

import {
  requestWithToken
} from '../../services/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginPanel: false
  },

  async _getTestData() {
    const ret = await getTestData()
    console.log('_getTestData---', ret);
  },

  async _postTestData(data) {
    const ret = await postTestData(data)
    console.log('_postTestData---', ret);
  },

  // ============ 事件处理相关 ============
  handleLoginButtonClick() {
    this.setData({
      showLoginPanel: true
    })
  },

  async handleRequstHomeApi() {
    const ret = await requestWithToken({
      url: '/user/home'
    })

    console.log('handleRequstHomeApi ret---', ret)
  },

  backToIndex() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  }

})