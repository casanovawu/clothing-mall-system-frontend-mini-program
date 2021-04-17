// components/x-pay-action-popup/x-pay-action-popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isPayActionPopupShow: {
      type: Boolean,
      value: false
    }
  },

  
  /**
   * 组件的方法列表
   */
  methods: {
    onPaySuccess() {
      this.triggerEvent('onPaySuccess')
    },

    onPayCancel() {
      this.triggerEvent('onPayCancel')
    }
  }
})
