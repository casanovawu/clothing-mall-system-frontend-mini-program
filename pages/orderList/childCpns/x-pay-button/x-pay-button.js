// pages/orderList/childCpns/x-pay/x-pay.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    time: {
      type: Number,
      value: 0
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
    cancelButtonClick() {
      this.triggerEvent('onCancelButtonClick')
    },
    
    confirmButtonClick() {
      this.triggerEvent('onConfirmButtonClick')
    }
  }
})