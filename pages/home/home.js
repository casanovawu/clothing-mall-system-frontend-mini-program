// pages/home/home.js
import {
  getBanners,
  getThemeInfo
} from '../../services/home'

import {
  POP,
  NEW,
  SELL,
  TOP_INSTANCE,
  BRAND,
  SLOGAN,
} from '../../common/const'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    themeList: [POP, NEW, SELL],
    // 为了提升用户体验，这里选择将主题的名字提前保存在前端
    themeObj: {
      [POP]: '流行主题',
      [NEW]: '新款上架',
      [SELL]: '店家精选',
    },
    themeInfo: {
      [POP]: {
        page: 1,
        themeName: '',
        goodsList: [],
        hasNext: true,
        totalNum: 0
      },
      [NEW]: {
        page: 1,
        themeName: '',
        goodsList: [],
        hasNext: true,
        totalNum: 0
      },
      [SELL]: {
        page: 1,
        themeName: '',
        goodsList: [],
        hasNext: true,
        totalNum: 0
      },
    },
    isBackTopShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this._getBanners()

    this._getThemeInfo(POP)

  },

  async onPullDownRefresh() {
    await this._getBanners()

    wx.stopPullDownRefresh()
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

  /**
   * 页面上拉触底事件的处理函数
   * BUG：快速滑动至底部时，会导致后续的主题商品不能加载出来
   * FIXEDBUG: 商品数据过少导致，当每个主题的商品个数能够达到 15 以及以上时，不会存在这个问题
   */
  onReachBottom: function () {
    console.log('onReachBottom---');
    const themeList = this.data.themeList
    const themeInfo = this.data.themeInfo
    if (themeInfo[themeList[0]].hasNext) {
      this._getThemeInfo(POP)
    } else if (themeInfo[themeList[1]].hasNext) {
      this._getThemeInfo(NEW)
    } else if (themeInfo[themeList[2]].hasNext) {
      this._getThemeInfo(SELL)
    }
  },

  /**
   * 监听用户点击页面内转发按钮（button 组件 open-type="share"）
   * 或右上角菜单“转发”按钮的行为，并自定义转发内容。
   */
  onShareAppMessage(event) {
    console.log('shareAPp--', event);
    return {
      title: BRAND + '·' + SLOGAN,
      path: '/pages/home/home'
    }
  },

  /**
   * 监听右上角菜单“分享到朋友圈”按钮的行为，并自定义分享内容。
   * */
  onShareTimeline(event) {
    console.log('shareTime event---', event);
    return {
      title: BRAND + '·' + SLOGAN
    }
  },

  // ==================网络请求相关==================
  async _getBanners() {
    const ret = await getBanners()
    this.setData({
      banners: ret.data.data
    })
  },

  async _getThemeInfo(type) {
    const page = this.data.themeInfo[type].page

    // 构造可传入 setData 中作为 key 的数据
    const pageKey = `themeInfo.${type}.page`
    const themeNameKey = `themeInfo.${type}.themeName`
    const goodsListKey = `themeInfo.${type}.goodsList`
    const totalNumKey = `themeInfo.${type}.totalNum`
    const hasNextKey = `themeInfo.${type}.hasNext`

    try {
      const ret = await getThemeInfo(type, page)
      // console.log('theme ret---', ret);

      // 获取目前已经保存的商品列表
      const oldList = this.data.themeInfo[type].goodsList
      oldList.push(...ret.data.data.goodsList)

      const themeName = ret.data.data.themeFullName
      // 与主题展示数据的顺序相关
      const totalNum = ret.data.data.goodsListLength

      // 更新对应主题的数据
      this.setData({
        [pageKey]: page + 1,
        [themeNameKey]: themeName,
        [goodsListKey]: oldList,
        [totalNumKey]: totalNum,
      })

      // 判断是否具有下一页
      const isHadNext = this.data.themeInfo[type].goodsList.length >= this.data.themeInfo[type].totalNum ? false : true

      this.setData({
        [hasNextKey]: isHadNext
      })

    } catch (error) {
      console.log('error', error)
    }

  },


  // ==================事件处理相关==================
  onSearchTap() {
    wx.navigateTo({
      url: '/pages/goodsSearch/goodsSearch',
    })
  },

  onItemClick(event) {
    const index = event.detail.index
    const goodsId = this.data.banners[index].goodsInfo.goodsId
    console.log('goodsId---', goodsId);
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + goodsId
    })
  }
})