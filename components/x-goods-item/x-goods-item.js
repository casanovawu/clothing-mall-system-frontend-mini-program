// components/x-goods-item/x-goods-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goodsClick(event) {
      console.log('goods-item event---', event);
      const goodsId = event.currentTarget.dataset.goodsId
      // this.triggerEvent('goodsClick', {goodsId})

      wx.navigateTo({
        url: '/pages/goodsDetail/goodsDetail?goodsId=' + goodsId,
      })
    }
  }
})
