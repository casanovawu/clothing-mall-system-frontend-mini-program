// pages/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payState: -1,
    orderId: 0,
    from: ''  // 用于表示订单详情页的跳转来源
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options---', options)
    this.setData({
      payState: Number(options.payState),
      orderNo: options.orderNo,
      from: options.from
    })

  },

 

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    const { from } = this.data

    // 从确认订单页面进来的话，点击返回则直接返回到购物车
    if(from === 'confirm-order') {
      wx.navigateBack({
        delta: 1
      })
    } 
    
  },

  
})