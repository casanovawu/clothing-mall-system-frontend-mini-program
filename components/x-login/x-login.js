// components/x-login/x-login.js
import {
  authLogin,
  login
} from '../../services/login'

import {
  TOKEN
} from '../../common/const'

import wxp from '../../utils/wxp'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLoginShow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false
  },

  observers: {
    'isLoginShow': function (newVal) {
      this.setData({
        visible: newVal
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showPopup() {
      this.setData({
        visible: true
      });
    },

    onClose() {
      this.setData({
        visible: false
      });
    },

    // 微信登录授权
    async userLogin() {
      try {
        let userInfo = null
        let encryptedData = ''
        let iv = ''
        let code = ''
        // 2021年4月13日后发布新版本的小程序，无法通过wx.getUserInfo与<button open-type="getUserInfo"/>获取用户个人信息（头像、昵称、性别与地区）
        const userRes = await wxp.getUserProfile({
          desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        })

        console.log('getUserProfile---', userRes)
        userInfo = userRes.userInfo
        encryptedData = userRes.encryptedData
        iv = userRes.iv

        // 重新获取 code 
        let codeRes = await login()
        code = codeRes.code
        // 获取微信登录用户信息
        let loginRes = await authLogin(code, userInfo, encryptedData, iv)

        console.log('登录接口请求成功----', loginRes)
        let token = loginRes.data.data.authorizationToken
        wx.setStorageSync(TOKEN, token)
        app.globalData.token = token
        wx.showToast({
          title: '登陆成功了',
        })
        this.onClose()
        this.triggerEvent('loginSuccess')
        // 当我们请求一个需要登录鉴权的接口时，当处于登录状态（即token和session_key均有效）或者非登录状态时，
        // 都会触发这里的 loginSuccess，进而使得 wxp.request4（详细见 wxp.js 文件代码）中监听的 loginSuccess 方法得到触发，然后才是
        // 向开发者服务器请求相对应的接口
        app.globalEvent.emit('loginSuccess')

      } catch (err) {
        console.log('login err---', err)
      }
    }
  }
})