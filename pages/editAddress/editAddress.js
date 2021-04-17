// pages/editAddress/editAddress.js

import {
  updateAddress,
  removeAddress
} from '../../services/address'

import areaList from '../../common/area'

import Toast from '@vant/weapp/toast/toast'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressId: 0,
    userName: '',
    telNumber: '',
    region: '',
    detailInfo: '',
    isShowRegionPopup: false,
    areaList: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('editAddress', (res) => {
      const {
        addressId,
        userName,
        telNumber,
        region,
        detailInfo
      } = res.selectedEditAddressInfo
      this.setData({
        addressId,
        userName,
        telNumber,
        region,
        detailInfo,
        areaList
      })
    })
  },

  // ==================网络请求相关==================
  async _updateAddress(addressId, userName, telNumber, region, detailInfo) {
    const ret = await updateAddress(addressId, userName, telNumber, region, detailInfo)
    return ret
  },

  async _removeAddress(addressId) {
    const ret = await removeAddress(addressId)
    return ret
  },


  // ==================事件处理相关==================
  async onSaveAndUseButtonClick() {
    const {
      addressId,
      userName,
      telNumber,
      region,
      detailInfo
    } = this.data

    const ret = await this._updateAddress(addressId, userName, telNumber, region, detailInfo)

    if (ret.data.returnCode === 200) {
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('updateAddressList')
      wx.navigateBack()
    }

  },

  onDeleteAddressButtonClick() {
    const {
      addressId
    } = this.data

    wx.showModal({
      title: '提示',
      content: `您确定要删除该地址？`,
      confirmColor: "#ff0c46",
      success: async (res) => {
        if (res.confirm) {
          const ret = await this._removeAddress(addressId)
          // 表示删除地址成功
          if (ret.data.returnCode === 200) {
            const eventChannel = this.getOpenerEventChannel()
            eventChannel.emit('deleteSelectedAddress')
            wx.navigateBack()
          }

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },

  handleRegionItemClick() {
    this.setData({
      isShowRegionPopup: true
    })
  },

  onRegionPopupClose() {
    this.setData({
      isShowRegionPopup: false
    })
  },

  onRegionCancel() {
    this.setData({
      isShowRegionPopup: false
    })

  },

  onRegionConfirm(event) {
    console.log('onRegionConfirm---', event);
    // 对应列中选中某一项，则 index 数组中对应的元素为1，否则为0
    const indexs = event.detail.index
    const isAllRegionItemSelected = indexs.every(item => item !== 0)

    // 处理未完全选中省市区的情况
    if (!isAllRegionItemSelected) {
      Toast('请选择地区')
      return
    }

    const values = event.detail.values
    const temRegionList = []
    values.forEach(item => {
      temRegionList.push(item.name)
    })

    this.setData({
      isShowRegionPopup: false,
      region: temRegionList.join('')
    })

  },

})