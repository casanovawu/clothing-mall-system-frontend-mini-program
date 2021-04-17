// pages/goodsDetail/childCpns/x-detail-desc/x-detail-desc.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsDetail: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 分享面板
    showShare: false,
    options: [{
        name: '微信',
        icon: 'wechat',
        openType: 'share'
      },
      {
        name: '微博',
        icon: 'weibo'
      },
      {
        name: '复制链接',
        icon: 'link'
      },
      {
        name: '分享海报',
        icon: 'poster'
      },
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShareButtonClick(event) {
      this.setData({
        showShare: true
      });
    },

    onShareSheetSelect(event) {
      console.log('onShareSheetSelect---', event);
      this.setData({
        showShare: false
      });

      // 除了微信好友分享外，其他功能暂不实现
      const shareIndex = event.detail.index
      const shareType = event.detail.name
      if (shareIndex !== 0) {

        wx.showModal({
          title: '提示',
          content: `通过【${shareType}】分享的功能暂未实现，请再等等哦~`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: "#ff0c46",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })

      }

    },

    onShareSheetClose() {
      this.setData({
        showShare: false
      });
    },
  }
})