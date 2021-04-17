// pages/profile/profile.js
import {
  getUserInfo
} from '../../services/profile'

import {
  TOKEN
} from '../../common/const'

const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginPanel: false,
    userInfo: {},
    orderOptions: [{
        id: 1,
        option: '待付款',
        imgUrl: '/assets/profile/unpaid.jpg'
      },
      {
        id: 2,
        option: '待发货',
        imgUrl: '/assets/profile/unsent.jpg'
      },
      {
        id: 3,
        option: '待收货',
        imgUrl: '/assets/profile/unreceived.jpg'
      },
      {
        id: 4,
        option: '评价',
        imgUrl: '/assets/profile/comment.jpg'
      },
      {
        id: 5,
        option: '退款/售后',
        imgUrl: '/assets/profile/return-and-service.jpg'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    console.log('profile onLoad...');
    const token = wx.getStorageSync(TOKEN)
    if (token) {
      this._getUserInfo()
    } else {
      this.setData({
        showLoginPanel: true
      })
    }
  },

  // 页面展示时执行
  onShow() {
    console.log('profile onShow...');
    const token = wx.getStorageSync(TOKEN)
    const {
      userInfo
    } = this.data

    // 当前登录了，但是个人页面并没有更改内容显示
    if (token && !userInfo.uid) {
      this._getUserInfo()
    }
  },

  onPullDownRefresh() {
    if (this.data.userInfo.uid) {
      wx.stopPullDownRefresh()
      return
    }

    // 未登录状态下执行下来刷新操作
    this._getUserInfo()
    wx.stopPullDownRefresh()

  },

  // ==================网络请求相关==================
  async _getUserInfo() {
    const ret = await getUserInfo()
    const userInfo = ret.data.data

    this.setData({
      userInfo
    })
  },

  // ==================事件处理相关==================

  onUserInfoButtonClick() {
    console.log('onUserInfoButtonClick---')
    // 这里必须使用 getStorageSync 从存储中获取最新的 token 数据
    // 避免拿到没有更新的 token 数据
    const token = wx.getStorageSync(TOKEN)

    if (token) return
    this._getUserInfo()
  },

  handleItemClick(event) {
    const itemName = event.currentTarget.dataset.itemName.trim()

    switch (itemName) {
      case '任务中心':
        wx.showModal({
          title: '提示',
          content: `${itemName}功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        break;

      case '购物车':
        wx.switchTab({
          url: '/pages/cart/cart',
        })
        break;

      case '返现':
        wx.showModal({
          title: '提示',
          content: `${itemName}功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        break;

      case '课程':
        wx.showModal({
          title: '提示',
          content: `${itemName}功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        break;

        // case '客服聊天':
        //   break;

      case '收货地址':
        console.log('用户点击了“收货地址”');
        const token = wx.getStorageSync(TOKEN)
        if (token) {
          wx.navigateTo({
            url: '/pages/shippingAddress/shippingAddress'
          })

        } else {
          this.setData({
            showLoginPanel: true
          })
        }
        break;

      case '个人信息':
        wx.showModal({
          title: '提示',
          content: `${itemName}功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        break;

      case '账号设置':
        wx.showModal({
          title: '提示',
          content: `${itemName}功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        break;

    }
  },

  handleContact(event) {
    console.log('e.detail.path--', event.detail.path)
    console.log('e.detail.query--', event.detail.query)
  },

  handleLoginSuccess() {
    console.log('handleLoginSuccess---')
    this._getUserInfo()
  },

  onAllOrderClick() {
    const token = wx.getStorageSync(TOKEN)
    if (token) {
      wx.navigateTo({
        url: '/pages/orderList/orderList?id=0',
      })
    } else {
      this.setData({
        showLoginPanel: true
      })
    }

  },

  handleOrderOptionButttonClick(event) {
    const {
      id
    } = event.currentTarget.dataset

    const token = wx.getStorageSync(TOKEN)
    if (token) {

      if(id === 3 || id === 4 || id === 5) {
        wx.showModal({
          title: '提示',
          content: `该功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
  
        return
      }

      wx.navigateTo({
        url: '/pages/orderList/orderList?id=' + id,
      })

    } else {
      this.setData({
        showLoginPanel: true
      })
    }

    


    


  }


})