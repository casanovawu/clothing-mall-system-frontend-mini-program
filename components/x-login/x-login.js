// components/x-login/x-login.js
import {
  authLogin,
  checkSession,
  login
} from '../../services/login'

import {
  TOKEN
} from '../../common/const'

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
    async login(e, retryNum = 0) {
      console.log('login e', e)

      // 如果用户点击了【拒绝】按钮
      if(e.detail.errMsg === 'getUserInfo:fail auth deny') return

      let {
        userInfo,
        encryptedData,
        iv,
      } = e.detail

      
      // 本地token与微信服务器上的session要分别对待
      let tokenIsValid = false,
        sessionIsValid = false
      // 调用 checkSession 向微信服务器验证 session_key 是否失效（默认有效期为3天）
      // 如果进入 catch 方法中，则说明 session_key 已经失效，需要重新执行登录流程，即，
      // 此时，不管本地的 token 实际上是否无效，都设置 token 为无效。然后后续都要重新调用 wx.login 拿到最新的 code，
      // 并且调用开发者服务器对应接口（本例是/user/wexin-login2）拿到最新的 token，并替换到旧的 token 
      let res0 = await checkSession().catch(err => {
        // 手动清理登陆状态，会触发该错误
        // checkSession:fail 系统错误，错误码：-13001,session time out…d relogin
        console.log("checkSession error---", err);
        // tokenIsValid = false   // 这里加不加应该都可以
      })

      // 如果调用 checkSession 方法不发生错误，则说明 session_key 依然有效（session_key有效性的检测由微信服务器进行）
      // 此时，我们需要复用旧的有效的 sesson_key，避免后端发生“解密”错误，错误信息为：
      // "error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt"
      // console.log("res0", res0);
      if (res0 && res0.errMsg === "checkSession:ok") sessionIsValid = true

      // 因为 session_key 和本地 token 要分开看待，所以这里还要验证 token 是否存在
      let token = wx.getStorageSync(TOKEN)
      if (token) tokenIsValid = true

      // 但凡 token 或者 session_key 失效，都需要重新请求 code 
      // 服务端设置 session_key 和 jwt 的有效时间均为 3 天 
      if (!tokenIsValid || !sessionIsValid) {
        let res1 = await login()
        let code = res1.code
        // console.log('res1---', res1)
        // console.log("code", code);

        // 获取微信登录用户信息
        let res = await authLogin(token, code, userInfo, encryptedData, iv, sessionIsValid)

        // 前端允许3次的重试
        if (res.statusCode == 500) {
          if (retryNum < 3) {
            this.login.apply(this, [e, ++retryNum])
          } else {
            wx.showModal({
              title: '登录失败',
              content: '请退出小程序，清空授权记录并重试',
            })
          }
          return
        }

        // Error: Illegal Buffer at WXBizDataCrypt.decryptData
        console.log('登录接口请求成功----', res.data)
        token = res.data.data.authorizationToken
        wx.setStorageSync(TOKEN, token)
        console.log('authorization token---', token)
      }

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

    }

  }
})