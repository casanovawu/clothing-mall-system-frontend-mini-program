// app.js
import Event from './utils/event'

App({
  onLaunch() {
    // const token = wx.getStorageSync(TOKEN)
    // console.log('app token---', token)
    // if (token) {
    //   this.globalData.token = token
    // }

  },
  globalData: {
    // token: ''
  },
  globalEvent: new Event()
})

