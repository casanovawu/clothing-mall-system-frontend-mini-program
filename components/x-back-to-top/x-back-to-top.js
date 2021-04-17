// components/x-back-to-top/x-back-to-top.js
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    itemClick() {
      wx.pageScrollTo({
        duration: 300,
        scrollTop: 0
      })
    }
  }
})
