// pages/cart/childCpns/x-cart-heading/x-cart-heading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isEdit: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToIndex() {
      wx.switchTab({
        url: '/pages/home/home',
      })
    },

    onEdit() {
      console.log('点击了【编辑】')
      let {
        isEdit
      } = this.data

      if (isEdit) {
        // 表示点击时是【编辑】状态
        this.setData({
          isEdit: false
        })

      } else {
        // 表示点击时是【删除】状态
        this.setData({
          isEdit: true
        })
      }

      isEdit = this.data.isEdit
      this.triggerEvent('onEdit', {
        isEdit
      })
    }
  }
})