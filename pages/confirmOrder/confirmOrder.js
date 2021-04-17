// pages/confirm-order/confirm-order.js

import {
  getAddressList,
  createAddress
} from '../../services/address'

import {
  generateOrder,
  updateOrderPayState
} from '../../services/order'

import {
  removeCartGoods
} from '../../services/cart'

import {
  SELECTED_ADDRESS_INFO,
  SELECTED_CART_LIST
} from '../../common/const'

const ADDRESS_TOP = 110

import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    confirmedList: [],
    totalPrice: 0,
    totalNum: 0,
    settleFrom: '',
    isPromisePopupShow: false,
    // 用于处理地址tip
    isAddressTip: false,
    addressList: [],
    selectedAddressInfo: {},
    isPayActionPopupShow: false,
    showLoginPanel: false,
    leaveMessage: '',
    orderNo: ''
  },

  /**
   * 生命周期函数--监听页面加载（每次通过 navigateTo 都会触发）
   */
  onLoad: function (options) {
    this._getAddressList()

    // 获取本地存储的 selectedAddressId
    const selectedAddressInfo = wx.getStorageSync(SELECTED_ADDRESS_INFO) || {}

    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('confirmList', (res) => {
      // console.log('confirmList res---', res)
      const totalPrice = res.totalPrice
      const confirmedList = res.selectedList
      const settleFrom = res.settleFrom

      let totalNum = 0
      confirmedList.forEach(item => {
        totalNum += item.num
      })

      this.setData({
        confirmedList,
        totalPrice,
        totalNum,
        settleFrom,
        selectedAddressInfo
      })
    })
  },

  // 页面隐藏，比如点击小程序右上角的返回按钮
  // async onHide() {
  //   console.log('confirmOrder onHide---')
  //   // 支付操作弹出框出现时，点击返回，会导致支付失败
  //   if (this.data.isPayActionPopupShow) {
  //     await this._updateOrderPayState(2)
  //     if (this.data.settleFrom === 'cart') {
  //       await this._removeCartGoods()
  //     }
  //   }
  // },

  // 点击顶部导航栏返回按钮时，页面会被卸载
  async onUnload() {
    const eventChannel = this.getOpenerEventChannel()
    // 支付操作弹出框出现时，点击返回，会导致支付失败
    if (this.data.isPayActionPopupShow) {
      await this._updateOrderPayState(0)
      if (this.data.settleFrom === 'cart') {
        await this._removeCartGoods()
        eventChannel.emit('refreshCartList')
      }
    }
  },


  // 避免频繁调用 this.setData
  onPageScroll(options) {
    const {
      isAddressTip,
      selectedAddressInfo
    } = this.data
    let ret = options.scrollTop >= ADDRESS_TOP
    // selectedAddressInfo.addressId是为了避免出现“NaN”的情况
    if (ret !== isAddressTip && selectedAddressInfo.addressId) {
      this.setData({
        isAddressTip: ret
      })
    }
  },

  // ==================网络请求相关==================
  async _getAddressList() {
    const ret = await getAddressList()
    // console.log('_getAddressList ret---', ret)
    const addressList = ret.data.data
    this.setData({
      addressList
    })
  },

  async _createAddress(userName, telNumber, region, detailInfo) {
    const ret = await createAddress(userName, telNumber, region, detailInfo)
    // console.log('_createAddress ret--', ret)
    const addressInfo = ret.data.addressInfo

    if (ret.data.returnCode === 200) {
      // 说明地址创建成功
      const oldList = this.data.addressList
      oldList.push(addressInfo)

      this.setData({
        addressList: oldList,
        selectedAddressInfo: addressInfo
      })

    } else if (ret.data.returnCode === 60002) {
      // 说明地址已经存在
      this.setData({
        selectedAddressInfo: addressInfo
      })
    }

    wx.setStorageSync(SELECTED_ADDRESS_INFO, addressInfo)

  },

  async _generateOrder(totalFee, addressId, preOrderGoodsList, goodsNameDesc, leaveMessage) {
    const ret = await generateOrder(totalFee, addressId, preOrderGoodsList, goodsNameDesc, leaveMessage)
    return ret
  },

  async _updateOrderPayState(payState) {
    const ret = await updateOrderPayState(this.data.orderNo, payState)
    return ret
  },

  async _removeCartGoods() {
    const {
      confirmedList
    } = this.data
    for (let i = 0; i < confirmedList.length; i++) {
      await removeCartGoods(confirmedList[i].cartId)
    }

    // 同时清空本地缓存
    wx.removeStorageSync(SELECTED_CART_LIST)

  },

  // ==================事件处理相关==================

  chooseShippingAddress() {
    this.setData({
      isChooseAddressPopupShow: true
    })
  },

  onChooseAddressPopupClose() {
    this.setData({
      isChooseAddressPopupShow: false
    })
  },

  onCouponButtonClick() {
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
  },

  showPromisePopup() {
    this.setData({
      isPromisePopupShow: true
    });
  },

  onPromisePopupClose() {
    this.setData({
      isPromisePopupShow: false
    });
  },

  onPromisePopupConfirm() {
    this.setData({
      isPromisePopupShow: false
    });
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

          const {
            selectedAddressInfo
          } = ret
          this.setData({
            selectedAddressInfo
          })

          wx.setStorageSync(SELECTED_ADDRESS_INFO, selectedAddressInfo)
        })

        // 跳转过去后，隐藏【选择收货地址】
        this.setData({
          isChooseAddressPopupShow: false
        })

      }
    })

  },

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

          this.setData({
            isChooseAddressPopupShow: false
          })

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

  // 考虑到用户交互！
  onAddressItemClick(event) {
    console.log('onAddressItemClick---')
    const selectedAddressId = event.currentTarget.dataset.name
    const {
      addressList
    } = this.data
    const selectedAddressInfo = addressList.find((item) => item.addressId === selectedAddressId)

    this.setData({
      selectedAddressId,
      selectedAddressInfo,
      isChooseAddressPopupShow: false
    })

    wx.setStorageSync(SELECTED_ADDRESS_INFO, selectedAddressInfo)
  },

  editSelectedAddress(event) {
    const {
      addressList,
      selectedAddressInfo
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

          // 如果更新的是当前选择的收货地址
          if (selectedAddressInfo.addressId === selectedEditAddressId) {
            const {
              addressList
            } = this.data
            const updatedEditAddressInfo = addressList.find(item => item.addressId === selectedEditAddressId)
            this.setData({
              selectedAddressInfo: updatedEditAddressInfo
            })

            wx.setStorageSync(SELECTED_ADDRESS_INFO, updatedEditAddressInfo)

          }
        })

        // 监听用户删除了收货地址
        eventChannel.on('deleteSelectedAddress', async () => {
          await this._getAddressList()

          // 如果删除的不是当前选择的收货地址
          if (selectedAddressInfo.addressId !== selectedEditAddressId) return

          // 否则，将地址列表的第一个收货地址设置为选中的地址（地址列表可能为空）
          const {
            addressList
          } = this.data
          const updatedSelectedAddressInfo = addressList[0] || {}
          this.setData({
            selectedAddressInfo: updatedSelectedAddressInfo
          })
          wx.setStorageSync(SELECTED_ADDRESS_INFO, updatedSelectedAddressInfo)

        })

        this.setData({
          isChooseAddressPopupShow: false
        })
      }
    })

  },

  // 涉及微信支付
  async onOrderSubmit() {
    const {
      totalPrice,
      selectedAddressInfo,
      confirmedList,
      leaveMessage
    } = this.data
    if (!selectedAddressInfo.addressId) {
      Toast('您当前未选择任何收货地址哦~')
      return
    }

    // 构建API需要的参数数据
    const addressId = selectedAddressInfo.addressId

    const preOrderGoodsList = []
    confirmedList.forEach(item => {
      const obj = {}
      obj.cartId = item.cartId
      obj.goodsSkuId = item.goodsSkuId
      obj.goodsId = item.goodsId
      obj.num = item.num
      obj.goodsSkuDesc = item.goodsSkuDesc
      preOrderGoodsList.push(obj)
    })

    const goodsSkuIds = confirmedList.map(item => item.goodsSkuId)
    let goodsNameDesc = confirmedList.map(item => `${item.goodsObj.goodsName}（${item.goodsSkuDesc}）x ${item.num}`).join('；')
    if (goodsNameDesc.length > 200) goodsNameDesc = goodsNameDesc.substr(0, 200) + "..."

    const result = await this._generateOrder(totalPrice, addressId, preOrderGoodsList, goodsNameDesc, leaveMessage)
    console.log('result---', result)

    if (result.data.message === '商品库存不足') {
      // 订单中有1件商品的库存不足，则该订单无法生成
      Toast({
        message: '商品库存不足，请返回重新选择~',
        forbidClick: true
      })

      // 隔1500ms后返回上一级页面
      setTimeout(() => {
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.emit('refreshGoodsSku')
        wx.navigateBack({
          delta: 0,
        })
      }, 1500)

    } else {

      this.setData({
        isPayActionPopupShow: true,
        orderNo: result.data.data.orderNo
      })
    }

  },

  async onPaySuccess() {
    const {orderNo} = this.data
    const payState = 1
    await this._updateOrderPayState(payState)
    if (this.data.settleFrom === 'cart') {
      // 如果是通过【购物车页面】跳转到【确认订单页面】，则在提交订单并能够成功唤出支付界面的情况下，
      // 不管用户最终（complete）是否支付，都要将对应的确认的购物车列表清空（包括数据表中的数据）
      this._removeCartGoods()
    }

    this.setData({
      isPayActionPopupShow: false
    })

    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?payState=${payState}&orderNo=${orderNo}&from=confirm-order`,
    })
  },

  async onPayCancel() {
    const {orderNo} = this.data
    const payState = 0
    await this._updateOrderPayState(payState)
    if (this.data.settleFrom === 'cart') {
      this._removeCartGoods()
    }
    this.setData({
      isPayActionPopupShow: false
    })

    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?payState=${payState}&orderNo=${orderNo}&from=confirm-order`,
    })
  },

})