// pages/goodsSearch/childCpns/x-search-histroy/x-search-history.js
import {
  SERACH_HISTORY
} from '../../../../common/const'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 搜索历史列表中只保留最新的7次搜索历史
    searchHistories: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isSearchHistoryShow: false
  },

  lifetimes: {
    attached() {
      const ret = wx.getStorageSync(SERACH_HISTORY)
      if (ret && ret.length !== 0) {
        this.setData({
          isSearchHistoryShow: true
        })
      }

    },

  },

  // 监听器
  // 解决清空搜索列表后，后续输入关键词产生的搜索列表无法显示在页面中
  observers: {
    searchHistories: function (newSearchHistories) {
      if (newSearchHistories.length !== 0) {
        this.setData({
          isSearchHistoryShow: true
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTrashClick() {
      const that = this
      wx.showModal({
        title: '提示',
        content: '您确定要清空搜索历史列表吗？',
        confirmColor: "#ff0c46",
        success(res) {
          if (res.confirm) {
            wx.removeStorageSync(SERACH_HISTORY)

            that.setData({
              isSearchHistoryShow: false
            })

            that.triggerEvent('removeSearchHistories')
          }
        }
      })
    },

    onSearchItemClick(event) {
      const { searchHistories } = this.properties
      // console.log('handleSearchItemClick event---', event);
      const keyWordIndex = event.currentTarget.dataset.index
      const keyword = searchHistories[keyWordIndex]
      this.triggerEvent('SearchItemClick', {keyword})
    }
  }
})