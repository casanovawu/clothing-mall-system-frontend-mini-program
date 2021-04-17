// pages/goodsDetail/goodsDetail.js
import {
  getGoodsDetail,
  getGoodsSkuAndAttrDetail,
  addToCart,
} from '../../services/goods-detail'

// 在商品详情页显示购物车商品条数
import {
  getCartListWithoutToken
} from '../../services/cart'

import {
  TOP_INSTANCE,
  BRAND,
  SLOGAN
} from '../../common/const'

import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId: 0,
    goodsDetail: {},
    goodsBanners: [],
    goodsDetailImgs: [],
    goodsSkus: [],
    goodsAttrKeys: [],
    isBackTopShow: false,
    // 传递给 x-sku-service 组件用
    confirmContent: '',
    showLoginPanel: false,
    cartLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // 通过 wx.navigateTo 携带过来的数据，可以在该生命函数中拿到
  onLoad: function (options) {

    const goodsId = options.goodsId
    // console.log('options---', options);
    this.setData({
      goodsId
    })

    // 以下请求并不要求顺序，所以没有使用“async/await”
    this._getGoodsDetail(goodsId)
    this._getGoodsSkuAndAttrDetail(goodsId)
    this._getCartListLength()

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

  async onPullDownRefresh() {
    const {
      goodsId
    } = this.data
    this._getGoodsDetail(goodsId)
    this._getGoodsSkuAndAttrDetail(goodsId)
    this._getCartListLength()

    wx.stopPullDownRefresh()
  },

  /**
   * 监听用户点击页面内转发按钮（button 组件 open-type="share"）
   * 或右上角菜单“转发”按钮的行为，并自定义转发内容。
   */
  onShareAppMessage(event) {
    console.log('shareAPp--', event);
    return {
      title: this.data.goodsDetail.goodsName,
      path: '/pages/goodsDetail/goodsDetail?goodsId=' + this.data.goodsId
    }
  },

  /**
   * 监听右上角菜单“分享到朋友圈”按钮的行为，并自定义分享内容。
   * */
  onShareTimeline(event) {
    console.log('shareTime event---', event);
    return {
      title: BRAND + '·' + SLOGAN,
      query: 'goodsId=' + this.data.goodsId
    }
  },

  // ==================网络请求相关==================
  async _getGoodsDetail(goodsId) {
    const ret = await getGoodsDetail(goodsId)
    const goodsDetail = ret.data.data

    // 0：表示轮播图；1：表示商品详情图片
    const goodsInfo = goodsDetail.goodsInfo
    const goodsBanners = goodsInfo.filter((item) => item.kind === 0)
    const goodsDetailImgs = goodsInfo.filter((item) => item.kind === 1)
    this.setData({
      goodsDetail,
      goodsBanners,
      goodsDetailImgs
    })
  },

  async _getGoodsSkuAndAttrDetail(goodsId) {
    const ret = await getGoodsSkuAndAttrDetail(goodsId)
    const {
      goodsSkus,
      goodsAttrKeys
    } = ret.data.data
    this.setData({
      goodsSkus,
      goodsAttrKeys
    })
  },

  async _addToCart(goodsId, goodsSkuId, goodsSkuDesc, num) {
    const ret = await addToCart(goodsId, goodsSkuId, goodsSkuDesc, num)
    return ret
  },

  async _getCartListLength() {
    const ret = await getCartListWithoutToken()
    this.setData({
      cartLength: ret.data.data.length
    })
  },

  async _getGoodsStock(goodsId, skuId) {
    const ret = await getGoodsStock(goodsId, skuId)
    return ret
  },

  // ==================事件处理相关==================
  onActionShopButtonClick() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },

  onActionCartButtonClick() {
    wx.navigateTo({
      url: '/pages/goodsCart/goodsCart',
    })
  },

  // 详细见：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/customer-message/customer-message.html
  // 消息推送见：https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push.html
  handleContact(e) {
    console.log('e.detail.path--', e.detail.path)
    console.log('e.detail.query--', e.detail.query)
  },

  onAddCart(event) {
    this.setData({
      confirmContent: '加入购物车'
    })

    const skuServiceCpn = this.selectComponent('.x-sku-service')
    skuServiceCpn.showSelectionPopup2()

  },

  onBuyNow() {
    this.setData({
      confirmContent: '立即购买'
    })

    const skuServiceCpn = this.selectComponent('.x-sku-service')
    skuServiceCpn.showSelectionPopup2()

  },

  async handleAddCartConfirmButtonClick(event) {
    console.log('handleAddCartConfirmButtonClick---', event)
    const {
      selectedGoodsSkuId,
      selectedSkuContentList,
      purchaseCount
    } = event.detail

    const {
      goodsId,
      goodsSkus
    } = this.data
    
    // 如果商品库存为0，则不能进行后续加入购物车或者立即购买的操作
    const selectedSkuInfo = goodsSkus.find(item => item.id === selectedGoodsSkuId)
    if(selectedSkuInfo.stock === 0) {
      Toast('当前商品库存为0，无法购买~')
      return
    }

    const goodsSkuDesc = selectedSkuContentList[0].selectedContent + '；' + selectedSkuContentList[1].selectedContent

    const ret2 = await this._addToCart(goodsId, selectedGoodsSkuId, goodsSkuDesc, purchaseCount)
    const {
      message
    } = ret2.data

    if (message === '加入购物车成功') {
      // 更新购物车info显示
      await this._getCartListLength()

      // showLoading和showToast同时只能存在一个
      wx.showToast({
        title: message,
      })

      const skuServiceCpn = this.selectComponent('.x-sku-service')
      skuServiceCpn.onSelectionPopupClose()

    }

  },

  async handleBuyNowConfirmButtonClick(event) {
    console.log('handleBuyNowConfirmButtonClick---', event)
    const {
      goodsId,
      goodsDetail,
      goodsSkus
    } = this.data
    const {
      purchaseCount,
      selectedGoodsSkuId,
      selectedSkuContentList
    } = event.detail

     // 如果商品库存为0，则不能进行后续加入购物车或者立即购买的操作
    const selectedSkuInfo = goodsSkus.find(item => item.id === selectedGoodsSkuId)
    if(selectedSkuInfo.stock === 0) {
      Toast('当前商品库存为0，无法购买~')
      return
    }

    const goodsSkuObj = goodsSkus.find(item => item.id === selectedGoodsSkuId)
    const goodsSkuDesc = selectedSkuContentList[0].selectedContent + '；' + selectedSkuContentList[1].selectedContent

    // 构造对象
    const selectedGoodsObj = {}
    selectedGoodsObj.goodsId = goodsId
    selectedGoodsObj.goodsObj = goodsDetail
    selectedGoodsObj.goodsSkuId = selectedGoodsSkuId
    selectedGoodsObj.num = purchaseCount
    selectedGoodsObj.stock = goodsSkuObj.stock
    selectedGoodsObj.goodsSkuDesc = goodsSkuDesc

    // 用于标识结算的来源（跟购物车进行区别）
    const settleFrom = 'goods-detail'

    // 真实价格
    const totalPrice = goodsDetail.newPrice * purchaseCount
    // 模拟价格
    // const totalPrice = 0.1 * purchaseCount
    const selectedList = [selectedGoodsObj]

    wx.navigateTo({
      url: '/pages/confirmOrder/confirmOrder',
      success: (res) => {
        const eventChannel = res.eventChannel
        eventChannel.emit('confirmList', {
          totalPrice,
          selectedList,
          settleFrom
        })

        // 触发则说明商品库存需要刷新
        eventChannel.on('refreshGoodsSku', () => {
          this._getGoodsSkuAndAttrDetail(this.data.goodsId)
        })

        const skuServiceCpn = this.selectComponent('.x-sku-service')
        skuServiceCpn.onSelectionPopupClose()
      }
    })
  }
})