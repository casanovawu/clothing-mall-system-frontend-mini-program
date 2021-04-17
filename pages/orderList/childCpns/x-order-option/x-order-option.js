// pages/orderList/childCpns/x-order-option.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderOptions: {
      type: Array,
      value: []
    },

    selectedOrderOptionIndex: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    itemClick(event) {
      const {index} = event.currentTarget.dataset

      this.setData({
        currentIndex: index
      })

      this.triggerEvent('onOrderOptionButtonClick', {
        index
      })
    }
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      const {selectedOrderOptionIndex} = this.properties
      this.setData({
        currentIndex: selectedOrderOptionIndex
      })
    },
  },
})
