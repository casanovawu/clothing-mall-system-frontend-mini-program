// pages/goodsSearch/goodsSearch.js
import {
  searchGoodsByKeyword
} from '../../services/goods-search'

import {
  SERACH_HISTORY
} from '../../common/const'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    goodsResultList: [],
    searchHistories: [],
    // 用于切换【搜索历史】和【搜索结果】
    isShowSearchHistory: true,
    // 用于切换【取消】文字的显示与否
    isShowAtion: true,
    // 用于价格升降序
    isAsc: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    const ret = wx.getStorageSync(SERACH_HISTORY)
    // console.log(`${SERACH_HISTORY} ---`, ret);
    if (ret) {
      this.setData({
        searchHistories: ret
      })
    }

  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // ==================网络请求相关==================
  async _searchGoodsByKeyword(keyword) {
    const ret = await searchGoodsByKeyword(keyword)
    return ret
  },

  // ==================事件处理相关==================
  async onSearch(event) {
    // console.log('onSearch---', event);
    const keyword = event.detail

    // 当搜索框中未输入任何内容时，提示未输入内容！
    if (!keyword) {

      wx.showModal({
        title: '提示',
        content: '您未输入任何内容哦~',
        confirmText: '我知道了',
        confirmColor: "#ff0c46",
        showCancel: false
      })

      return
    }

    const ret = await this._searchGoodsByKeyword(keyword)
    console.log('onSearch ret---', ret);
    const goodsResultList = ret.data.data.goodsList

    // 将搜索历史存入到本地缓存中
    const oldList = this.data.searchHistories
    // console.log('onSearch oldList---', oldList);

    // 关于 搜索历史列表 的处理细节
    // 如果搜索历史列表中存在相同的搜索关键词，则将先前的关键词从列表中删除
    oldList.unshift(keyword)
    const lastIndex = oldList.lastIndexOf(keyword)
    if (lastIndex) {
      oldList.splice(lastIndex, 1)
    }
    // 搜索历史只保存最新的7次搜索
    if (oldList.length === 8) {
      oldList.pop()
    }
    wx.setStorageSync(SERACH_HISTORY, oldList)

    this.setData({
      keyword,
      goodsResultList,
      searchHistories: oldList,
      isShowSearchHistory: false,
      isShowAtion: false
    })
  },

  // 点击取消按钮后，如果搜索了商品，则显示搜索结果列表，并把右侧“取消”2字删除
  // 否则，返回首页
  onCancel(event) {
    const {
      keyword,
      goodsResultList
    } = this.data
    // console.log('onCancel---', event);

    // 处理未进行搜索
    if (goodsResultList.length === 0) {
      
      // 因为是返回 tabbar 页面，所以这里不能使用 navigateBack
      wx.switchTab({
        url: '/pages/home/home'
      })

      return
    }

    this.setData({
      isShowSearchHistory: false,
      isShowAtion: false,
      keyword
    })
  },

  onClear(event) {
    // console.log('onClear---', event);
    this.setData({
      keyword: ''
    })
  },

  // 聚焦时，显示搜索历史列表，并显示右侧“取消”2字
  onFocus(event) {
    // console.log('onFocus---', event);
    this.setData({
      isShowSearchHistory: true,
      isShowAtion: true,
    })
  },

  removeSearchHistories() {
    this.setData({
      searchHistories: [],
      keyword: ''
    })
  },

  handleSearchItemClick(event) {
    const keyword = event.detail.keyword
    this.setData({
      keyword
    })

    // 手动模拟点击确认按钮
    this.onSearch({
      detail: keyword,
    })
  },

  // 点击按照商品的goodsId改变 goodsResultList（升序）
  handleDefaultItemClick() {
    // console.log('handleDefaultItemClick--');
    const oldList = this.data.goodsResultList
    oldList.sort((a, b) => a.goodsId - b.goodsId)
    this.setData({
      goodsResultList: oldList,
      isAsc: true
    })
  },

  // 点击按照商品的newPrice改变 goodsResultList（升序或降序）
  handlePriceItemClick() {
    const {
      isAsc
    } = this.data

    // console.log('priceItemClick');
    const oldList = this.data.goodsResultList

    if (isAsc) {
      // 数据升序
      oldList.sort((a, b) => {
        const price1 = Number(a.newPrice)
        const price2 = Number(b.newPrice)
        return price1 - price2
      })

    } else {
      // 数据降序
      oldList.sort((a, b) => {
        const price1 = Number(a.newPrice)
        const price2 = Number(b.newPrice)
        return price2 - price1
      })

    }

    this.setData({
      goodsResultList: oldList,
      isAsc: !isAsc
    })

  },

  // 点击按照商品的updateTime改变 goodsResultList（最新更新的放在前边，即降序）
  handleNewItemClick() {
    // console.log('newItemClick');
    const oldList = this.data.goodsResultList
    oldList.sort((a, b) => {
      const time1 = new Date(a.updateTime).getTime()
      const time2 = new Date(b.updateTime).getTime()
      return time2 - time1
    })

    this.setData({
      goodsResultList: oldList,
      isAsc: true
    })

  }

})