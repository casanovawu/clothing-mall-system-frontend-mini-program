// pages/shipping-address/shipping-address.js

import {
  getAddressList,
  createAddress
} from '../../services/address'

import {
  SELECTED_ADDRESS_INFO
} from '../../common/const'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getAddressList()
  },

  // ==================网络请求相关==================
  async _getAddressList() {
    const ret = await getAddressList()
    const addressList = ret.data.data
    this.setData({
      addressList
    })
  },

  async _createAddress(userName, telNumber, region, detailInfo) {
    const ret = await createAddress(userName, telNumber, region, detailInfo)
    console.log('_createAddress ret--', ret)
    const addressInfo = ret.data.addressInfo

    if (ret.data.returnCode === 200) {
      // 说明地址创建成功
      const oldList = this.data.addressList
      oldList.push(addressInfo)

      this.setData({
        addressList: oldList
      })
    } 
    wx.setStorageSync(SELECTED_ADDRESS_INFO, addressInfo)
  },

  // ==================事件处理相关==================
  handleWeixinShippingAddressButtonClick() {
    if (wx.canIUse('chooseAddress.success.userName')) {
      wx.chooseAddress({
        success: async (result) => {
          // 构建创建地址接口需要的数据
          const userName = result.userName
          const telNumber = result.telNumber
          const region = result.provinceName + result.cityName + result.countyName
          const detailInfo = result.detailInfo

          await this._createAddress(userName, telNumber, region, detailInfo)

        },
      })
    } else {
      wx.showModal({
        title: '提示',
        content: `当前设备不支持从微信获取收货地址`,
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
    }
  },

  editSelectedAddress(event) {
    const {
      addressList
    } = this.data
    const selectedEditAddressId = event.currentTarget.dataset.id
    const selectedEditAddressInfo = addressList.find(item => item.addressId === selectedEditAddressId)

    wx.navigateTo({
      url: '/pages/editAddress/editAddress',
      success: (res) => {
        const eventChannel = res.eventChannel
        // 将需要进行编辑的地址信息传递过去
        eventChannel.emit('editAddress', {
          selectedEditAddressInfo
        })

        // 用于返回确认订单页面时更新地址列表（针对修改地址信息的情况）
        eventChannel.on('updateAddressList', async () => {
          await this._getAddressList()

          const selectedAddressInfo = wx.getStorageSync(SELECTED_ADDRESS_INFO) || {}
          // 如果更新的是当前选择的收货地址
          if (selectedAddressInfo.addressId === selectedEditAddressId) {
            // 这里必须通过“this.data.addressList”拿到更新后的addressList，否则会出现BUG
            const {addressList} = this.data
            const updatedEditAddressInfo = addressList.find(item => item.addressId === selectedEditAddressId)
            wx.setStorageSync(SELECTED_ADDRESS_INFO, updatedEditAddressInfo)
          }
        })

        // 监听用户删除了收货地址
        eventChannel.on('deleteSelectedAddress', async () => {
          await this._getAddressList()

          const selectedAddressInfo = wx.getStorageSync(SELECTED_ADDRESS_INFO) || {}
          // 如果删除的不是当前选择的收货地址
          if (selectedAddressInfo.addressId !== selectedEditAddressId) return

          // 否则，将地址列表的第一个收货地址设置为选中的地址（地址列表可能为空）
          const {addressList} = this.data
          const updatedSelectedAddressInfo = addressList[0] || {}
          wx.setStorageSync(SELECTED_ADDRESS_INFO, updatedSelectedAddressInfo)
        })
      }
    })

  },

  goToAddAddress() {
    wx.navigateTo({
      url: '/pages/addAddress/addAddress',
      success: (res) => {
        const eventChannel = res.eventChannel
        eventChannel.on('addAddress', (ret) => {
          console.log('confirmOrder ret---', ret)
          // 获取新的地址列表
          this._getAddressList()
        })
      }
    })

  },

})