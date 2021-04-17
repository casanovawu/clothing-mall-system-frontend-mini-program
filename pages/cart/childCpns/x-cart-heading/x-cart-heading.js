// pages/cart/childCpns/x-cart-heading/x-cart-heading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isEdit: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dIsEdit: false
  },

  pageLifetimes: {
    // 确保每次打开购物车页面，都处于非编辑模式。。。
    show() {
      console.log('pageLifetimes show', this.properties.isEdit)
      this.setData({
        dIsEdit: this.properties.isEdit
      })
    }
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
        dIsEdit
      } = this.data

      if (dIsEdit) {
        // 表示点击时显示的是“完成”
        this.setData({
          dIsEdit: false
        })

      } else {
        // 表示点击时显示的是“编辑”
        this.setData({
          dIsEdit: true
        })
      }

      let isEdit = this.data.dIsEdit
      this.triggerEvent('onEdit', {
        isEdit
      })
    }
  }
})