// pages/category/category.js

import {
  getCategoryList,
  getCategoryDetail
} from '../../services/category'

import {
  TOP_INSTANCE
} from '../../common/const'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeKey: 0,
    categoryMenu: [],
    selectedCategoryInfo: {},
    isBackTopShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getCategoryList()

    // 页面加载时去获取 activeKey 对应的分类项下的数据
    this._getCategoryDetail(this.data.activeKey)
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 该方法中避免频繁调用 setData 方法
  onPageScroll(options) {
    const ret = options.scrollTop >= TOP_INSTANCE
    if (this.data.isBackTopShow !== ret) {
      // console.log(options);
      this.setData({
        isBackTopShow: ret
      })
    }
  },

  // ==================网络请求相关==================
  async _getCategoryList() {
    const ret = await getCategoryList()
    this.setData({
      categoryMenu: ret.data.data
    })
  },

  async _getCategoryDetail(activeKey) {
    const categoryId = activeKey + 1
    const ret = await getCategoryDetail(categoryId)
    // console.log('category ret---', ret);
    this.setData({
      selectedCategoryInfo: ret.data.data
    })
  },

  // ==================事件处理相关==================
  onChange(event) {
    const activeKey = event.detail
    this.setData({
      activeKey
    })

    this._getCategoryDetail(activeKey)
  },
})