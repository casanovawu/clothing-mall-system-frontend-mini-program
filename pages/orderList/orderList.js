// pages/order-list/order-list.js

import {
  getOrderList,
  updateOrderPayState
} from '../../services/order'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedOrderOptionIndex: 0,
    orderOptions: ['全部', '待付款', '待发货', '待收货', '待评价'],
    isDeveloping: false,
    initialOrderList: [],
    selectedOrderList: [],
    time: 1 * 60 * 60 * 1000, // 1小时（单位：毫秒）
    isPayActionPopupShow: false,
    // 用于支持取消和付款功能的实现
    selectedOrderNo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      selectedOrderOptionIndex: Number(options.id)
    })

    this._getOrderList(this.data.selectedOrderOptionIndex)
  },


  // ==================网络请求相关==================
  async _getOrderList(selectedOrderOptionIndex) {
    // selectedOrderOptionIndex：暂时是 0（点击了“全部”）或 1（点击了“待付款”）或 2（点击了“待发货”）
    // payState：0表示未支付；1表示已支付；2表示取消付款或其它
    const ret = await getOrderList()
    this.setData({
      initialOrderList: ret.data.data
    })
    this._resetOrderList(selectedOrderOptionIndex)
  },

  async _updateOrderPayState(orderNo, payState) {
    const ret = await updateOrderPayState(orderNo, payState)
    return ret
  },

  _resetOrderList(selectedOrderOptionIndex) {
    const {
      initialOrderList
    } = this.data

    let tempList = null
    switch (selectedOrderOptionIndex) {
      case 0:
        tempList = initialOrderList
        break

      case 1:
        tempList = initialOrderList.filter(order => order.payState === 0)
        break

      case 2:
        tempList = initialOrderList.filter(order => order.payState === 1)
        break
    }

    this.setData({
      selectedOrderList: tempList
    })
  },


  // ==================事件处理相关==================
  handleOrderOptionButtonClick(event) {
    const optionIndex = event.detail.index
    // console.log('optionIndex---', optionIndex)

    if (optionIndex === 3 || optionIndex === 4) {
      // 待开发功能...
      this.setData({
        isDeveloping: true,
        selectedOrderList: []
      })

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
    } else {
      this.setData({
        isDeveloping: false,
        selectedOrderOptionIndex: optionIndex
      })

      this.setData({
        isPayActionPopupShow: false
      })

      this._resetOrderList(optionIndex)

    }

  },

  onOrderItemClick(event) {
    const {
      orderNo,
      payState
    } = event.currentTarget.dataset


    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?orderNo=${orderNo}&payState=${payState}&from=order-list`
    })

  },

  // async onCountDownFinish(event) {
  //   const {
  //     orderNo
  //   } = event.currentTarget.dataset

  //   const {
  //     selectedOrderOptionIndex
  //   } = this.data

  //   try {
  //     await this._updateOrderPayState(orderNo, 2)
  //     await this._getOrderList(selectedOrderOptionIndex)
  //   } catch (error) {
  //     console.log('error---', error)
  //   }

  // },

  handleConfirmButtonClick(event) {
    const {orderNo} = event.currentTarget.dataset
    this.setData({
      isPayActionPopupShow: true,
      selectedOrderNo: orderNo
    })
  },

  handleCancelButtonClick(event) {
    const {
      orderNo
    } = event.currentTarget.dataset

    const {
      selectedOrderOptionIndex
    } = this.data

    wx.showModal({
      title: '提示',
      content: `您确定要取消付款吗？`,
      confirmColor: "#ff0c46",
      success: async (res) => {
        if (res.confirm) {
          
          await this._updateOrderPayState(orderNo, 2)
          await this._getOrderList(selectedOrderOptionIndex)

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },

  async handlePaySuccess(event) {
    const {
      selectedOrderOptionIndex,
      selectedOrderNo
    } = this.data

    try {
      await this._updateOrderPayState(selectedOrderNo, 1) 
      await this._getOrderList(selectedOrderOptionIndex)

      this.setData({
        isPayActionPopupShow: false
      })

      wx.showToast({
        title: '支付成功~'
      })
    } catch (error) {
      console.log('error---', error)
    }

  },

  handlePayCancel() {
    this.setData({
      isPayActionPopupShow: false
    })
  },

})