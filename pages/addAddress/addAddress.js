// pages/add-address/add-address.js

import areaList from '../../common/area'

import Toast from '@vant/weapp/toast/toast';

import {
  createAddress
} from '../../services/address'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDefaultAddressChecked: false,
    isIntellectContentShow: false,
    isShowRegionPopup: false,
    // 省市区选择的初始数据
    areaList: {},
    // 以下数据的操作使用【双向绑定】
    userName: '',
    telNumber: '',
    region: '',
    detailInfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      areaList
    })
  },


  // ==================网络请求相关==================
  async _createAddress(userName, telNumber, region, detailInfo) {
    const ret = await createAddress(userName, telNumber, region, detailInfo)
    console.log('_createAddress ret--', ret)
    return ret
  },


  // ==================事件处理相关==================
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

  handleLocationClick() {
    console.log('handleLocationClick');
    wx.showModal({
      title: '提示',
      content: `该功能暂未实现，请手动输入哦~`,
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

  },

  onCancelButtonClick() {
    this.setData({
      isIntellectContentShow: false
    })
  },

  onIntellectButtonClick() {
    this.setData({
      isIntellectContentShow: true
    })
  },

  onDefaultAddressChange(event) {
    console.log('onDefaultAddressChange---', event);
    // 需要手动对 checked 状态进行更新
    const {
      detail
    } = event

    this.setData({
      isDefaultAddressChecked: detail
    });
  },

  handleWeixinShippingAddressButtonClick() {
    // 验证当前设备是否可以使用 chooseAddress 这个API 
    if (wx.canIUse('chooseAddress.success.userName')) {
      wx.chooseAddress({
        success: async (result) => {
          console.log('chooseAddress---', result)
          const userName = result.userName
          const telNumber = result.telNumber
          const region = result.provinceName + result.cityName + result.countyName
          const detailInfo = result.detailInfo

          const ret = await this._createAddress(userName, telNumber, region, detailInfo)
          const selectedAddressInfo = ret.data.addressInfo

          // 不管地址存不存在，不提示，直接返回
          const eventChannel = this.getOpenerEventChannel()
          eventChannel.emit('addAddress', {
            selectedAddressInfo
          })
          wx.navigateBack()
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

  async onSaveAndUseButtonClick() {
    const {
      userName,
      telNumber,
      region,
      detailInfo,
    } = this.data

    // 数据的验证
    if (userName.trim().length === 0) {
      Toast('请输入收货人姓名~')
      return

    } else if (!((/^0\d{2,3}-?\d{7,8}$/).test(telNumber) || (/^1[3|4|5|8][0-9]\d{8}$/).test(telNumber))) {
      // 有一个验证通过，则不会进入该 if 分支
      Toast('请填写正确的电话或者手机号码~')
      return

    } else if (region.trim().length === 0) {
      Toast('请输入省市区信息~')
      return

    } else if (detailInfo.trim().length === 0) {
      Toast('请输入详细地址信息~')
      return

    }

    const ret = await this._createAddress(userName, telNumber, region, detailInfo)

    if (ret.data.returnCode === 60002) {
      // 说明地址已经存在 
      Toast('当前地址已经存在~')

    } else if (ret.data.returnCode === 200) {
      const selectedAddressInfo = ret.data.addressInfo
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('addAddress', {
        selectedAddressInfo
      })

      // 点击完按钮后，返回【确认订单页】
      wx.navigateBack()
    }
  }
})