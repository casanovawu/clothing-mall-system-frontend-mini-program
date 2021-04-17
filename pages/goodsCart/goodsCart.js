// pages/cart/cart.js
import {
  getCartList,
  modifyCartGoodsNum,
  removeCartGoods,
  removeAllCartGoods
} from '../../services/cart'

import {
  TOKEN,
  SELECTED_CART_LIST
} from '../../common/const'

import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginPanel: false,
    // 单靠 cartList 无法完成处理页面的显示逻辑（比如当购物车列表为空时），所以加了isNoLogin
    isLogin: false,
    cartList: [],
    // 用于解决快速点击【+】或者【-】按钮出现的购物车数量数据不同步的问题
    isStepperButtonDisabled: false,
    allIsSelected: false,
    totalPrice: 0,
    // 用于编辑模式的切换
    isEdit: false,
    // 用于处理【去结算】按钮的禁止与否状态
    isSettleButtonDisabled: true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('cart onLoad ...', options);
    const token = wx.getStorageSync(TOKEN)
    if (token) {
      this._getCartList()
    } else {
      // 说明 token 不存在
      this.setData({
        showLoginPanel: true
      })
    }

  },

  // 页面展示时执行
  onShow(options) {
    console.log('cart onShow---', options)

    const token = wx.getStorageSync(TOKEN)
    const {
      isLogin
    } = this.data
    // console.log('onshow isLogin---', isLogin)
    // 当前登录了，但是购物车页面可能并没有更新
    if (token && isLogin) {
      this._getCartList(false)
    }
  },

  onHide() {
    console.log('cart onHide---', this.data.isEdit)
    // 每次关闭购物车页面，都处于非编辑模式就行了
    if(this.data.isEdit) {
      this.setData({
        isEdit: false
      })
    }
  },


  // 页面刷新，更改购物车数据
  onPullDownRefresh() {
    this._getCartList()

  },

  _initCartData() {
    const {
      cartList
    } = this.data

    // 给请求到的购物车列表添加 checked 标志位，用于确认当前购物车商品是否选中
    let oldList = cartList.map(item => {
      item.checked = false
      // 商品名称截取处理
      let strPos = 33
      item.goodsObj.goodsName = item.goodsObj.goodsName.substr(0, strPos) + (item.goodsObj.goodsName[strPos + 1] ? '...' : '')
      return item
    })

    this.setData({
      cartList: oldList
    })

    // 【空间换时间】的措施
    const selectedCartList = wx.getStorageSync(SELECTED_CART_LIST) || []
    // 更新 cartList 中每项的选择状态
    for (let i = 0; i < selectedCartList.length; i++) {
      const selectedCartGoods = selectedCartList[i]
      const selectedCartId = selectedCartList[i].cartId
      const selectedNum = selectedCartList[i].num
      // console.log('selectedCartId---', selectedCartId)
      for (let j = 0; j < cartList.length; j++) {
        // 如果 cartList 中有购买项存在 selectedCartList 中
        if (cartList[j].cartId === selectedCartId) {
          this.setData({
            [`cartList[${j}].checked`]: true
          })

          // 在购物车商品被选中的情况下，点击进入商品详情修改了当前同一件商品数量之后，
          // 下拉刷新，应该让本地存储中的 selectedCartList 对应的商品数量发生变化
          if (cartList[j].num !== selectedNum) {
            // 这种方式的修改直接作用于本地存储中的 selectedCartList
            selectedCartGoods.num = cartList[j].num
          }
        }
      }
    }

    // 根据本地存储中的 selectedCartList 算出总价格，同时确认是否为全选状态
    let totalPrice = this._calculatetotalPrice(selectedCartList)
    let allIsSelected = selectedCartList.length === cartList.length

    // selectedCartList 中有数据，则【去结算】按钮就处于非禁止状态
    let isSettleButtonDisabled = !selectedCartList.length
    this.setData({
      totalPrice,
      allIsSelected,
      isSettleButtonDisabled
    })

    // 最后要更新本地存储中的 selectedCartList
    wx.setStorageSync(SELECTED_CART_LIST, selectedCartList)


  },

  _calculatetotalPrice(selectedCartList) {
    // 计算出总价格
    let totalPrice = 0
    for (let item of selectedCartList) {
      // 真正价格
      totalPrice += item.num * item.goodsObj.newPrice
      // 模拟价格
      // totalPrice += item.num * 0.1
    }

    return totalPrice
  },

  // ==================网络请求相关==================
  async _getCartList(isShowLoading) {
    const ret = await getCartList(isShowLoading)
    const cartList = ret.data.data

    // 注意：我们必须等到 cartList 列表被添加上 checked 属性后，才能进行之后的_initCartData操作
    // 将 isLogin 状态的改变放在这里是为了减少1次初始打开购物车页面时的网络请求
    this.setData({
      cartList,
      isLogin: true
    })

    this._initCartData()

    wx.stopPullDownRefresh()

  },

  async _modifyCartGoodsNum(cartIndex, operator, num) {
    // 点击按钮后，使按钮处于禁用状态（等数据处理完之后，再将禁用状态解除）
    this.setData({
      isStepperButtonDisabled: true
    })

    const {
      cartList
    } = this.data

    const cartId = cartList[cartIndex].cartId
    // 调用该接口后会返回修改后的对应的购物车对象
    const ret = await modifyCartGoodsNum(cartId, operator, num)
    // console.log('_modifyCartGoodsNum ret---', ret)

    const numRes = ret.data.data.num
    this.setData({
      [`cartList[${cartIndex}].num`]: numRes
    })

    // 如果 selectedCartList 有对应的购物车商品，则一并修改
    let selectedCartList = wx.getStorageSync(SELECTED_CART_LIST) || []
    let selectCartListIndex = selectedCartList.findIndex((item) => {
      return item.cartId === cartId
    })

    if (selectCartListIndex !== -1) {
      console.log('selectCartListIndex---', selectCartListIndex)

      // 本地存储中的对应商品的数量也需要更新
      selectedCartList[selectCartListIndex].num = numRes

      // 等 selectedCartList 列表数据更新后，再更新 totalPrice 
      let totalPrice = this._calculatetotalPrice(selectedCartList)
      this.setData({
        totalPrice,
      })

      wx.setStorageSync(SELECTED_CART_LIST, selectedCartList)
    }

    // 网络请求部分，禁止增加或者减少按钮的点击
    // 后续项目上线可以去掉这里的延时操作！
    setTimeout(() => {
      // console.log('setTimeout---')
      this.setData({
        isStepperButtonDisabled: false
      })
    }, 500)

  },

  async _removeCartGoods(cartId) {
    const ret = await removeCartGoods(cartId)
    console.log('removeCartGoods ret ---', ret)

    if (ret.data.returnCode === 200) {
      const {
        cartList
      } = this.data
      const oldCartList = cartList.slice(0)
      const oldSelectedCartList = wx.getStorageSync(SELECTED_CART_LIST).slice(0)

      // 找到 cartList 和 selectedCartList 中对应的购物车商品的索引值，
      // 然后根据该索引值删除对应购物车商品
      const goodsCartIndex = oldCartList.findIndex(item => item.cartId === cartId)
      const selectedGoodsCartIndex = oldSelectedCartList.findIndex(item => item.cartId === cartId)

      oldCartList.splice(goodsCartIndex, 1)
      oldSelectedCartList.splice(selectedGoodsCartIndex, 1)

      // 同时别忘了再次统计总价格
      let totalPrice = this._calculatetotalPrice(oldSelectedCartList)

      this.setData({
        cartList: oldCartList,
        totalPrice
      })

      wx.setStorageSync(SELECTED_CART_LIST, oldSelectedCartList)

      wx.showToast({
        title: '已删除选中商品',
      })

    }

  },

  async _removeAllCartGoods() {
    const ret = await removeAllCartGoods()
    console.log('removeAllCartGoods ret ---', ret)

    if (ret.data.returnCode === 200) {

      // 置空本地存储的 selectedCartList 列表
      const oldSelectedCartList = wx.getStorageSync(SELECTED_CART_LIST)
      oldSelectedCartList.length = 0

      // 同时别忘了再次统计总价格
      let totalPrice = this._calculatetotalPrice(oldSelectedCartList)

      this.setData({
        cartList: [],
        totalPrice
      })

      wx.setStorageSync(SELECTED_CART_LIST, oldSelectedCartList)

      wx.showToast({
        title: '已清空购物车所有商品~',
      })

    }

  },

  // ==================事件处理相关==================
  handleLoginButtonClick() {
    this._getCartList()
  },

  goToGoodsDetail(event) {
    const goodsId = event.currentTarget.dataset.goodsId

    const that = this
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + goodsId
    })
  },


  onCountOverlimit(event) {
    // console.log('onCountOverlimit---', event);
    const {
      stock,
      num
    } = event.currentTarget.dataset
    if (num <= 1) {
      Toast('该商品1件起售哦~')
    } else if (num >= stock) {
      Toast('该商品不能购买更多了哦~')
    }
  },

  onStepperBlur(event) {
    console.log('onStepperBlur---', event)
    const {
      cartIndex
    } = event.currentTarget.dataset

    const num = event.detail.value

    this._modifyCartGoodsNum(cartIndex, '', num)
  },

  // onStepperFocus(event) {
  //   console.log('onStepperFocus---', event)
  // },

  onCountPlus(event) {
    // console.log('onCountPlus---', event)
    const {
      cartIndex
    } = event.currentTarget.dataset

    this._modifyCartGoodsNum(cartIndex, '+', 1)

  },

  onCountMinus(event) {
    console.log('onCountMinus---', event)
    const {
      cartIndex
    } = event.currentTarget.dataset

    this._modifyCartGoodsNum(cartIndex, '-', 1)
  },

  onAllSelectButtonChange(event) {
    const {
      allIsSelected,
      cartList
    } = this.data

    let oldSelectedCartList = wx.getStorageSync(SELECTED_CART_LIST) || []
    let oldCartList = []
    // 表示当前是全选状态，现在应该清空
    if (allIsSelected) {
      oldCartList = cartList.map(item => {
        item.checked = false
        return item
      })

      oldSelectedCartList.length = 0

    } else {

      oldCartList = cartList.map(item => {
        item.checked = true
        return item
      })

      oldSelectedCartList = [...oldCartList]
    }

    const totalPrice = this._calculatetotalPrice(oldSelectedCartList)
    let isSettleButtonDisabled = !oldSelectedCartList.length
    this.setData({
      allIsSelected: !allIsSelected,
      cartList: oldCartList,
      totalPrice,
      isSettleButtonDisabled
    })

    wx.setStorageSync(SELECTED_CART_LIST, oldSelectedCartList)

  },

  onCartGoodsSelectButtonChange(event) {
    // console.log('onCartGoodsSelectButtonChange---', event)

    const {
      cartList
    } = this.data
    const {
      cartIndex
    } = event.currentTarget.dataset
    const {
      cartId
    } = cartList[cartIndex]

    const selectedCartList = wx.getStorageSync(SELECTED_CART_LIST) || []

    const isExistedIndex = selectedCartList.findIndex((item) => {
      return item.cartId === cartId
    })

    if (isExistedIndex !== -1) {
      // 如果当前购物车商品已经选择，则取消选中
      this.setData({
        [`cartList[${cartIndex}].checked`]: false
      })
      selectedCartList.splice(isExistedIndex, 1)
    } else {
      // 通过一个标志位 checked 控制复选框按钮的显示与不显示
      this.setData({
        [`cartList[${cartIndex}].checked`]: true
      })
      selectedCartList.push(cartList[cartIndex])
    }

    // 计算所选商品的总价格
    let totalPrice = this._calculatetotalPrice(selectedCartList)

    // 最后判断是否全选了
    let allIsSelected = this.data.cartList.every((item) => {
      return item.checked === true
    })

    let isSettleButtonDisabled = !selectedCartList.length
    // 最后统一更新保存选择购物车商品的列表
    this.setData({
      totalPrice,
      allIsSelected,
      isSettleButtonDisabled
    })

    // 并将selectedCartList保存到本地存储中
    wx.setStorageSync(SELECTED_CART_LIST, selectedCartList)

  },

  handleEdit(event) {
    const {
      isEdit
    } = event.detail
    this.setData({
      isEdit
    })
  },

  onDeleteClickButton() {
    console.log('onDeleteClickButton---')

    const selectCartList = wx.getStorageSync(SELECTED_CART_LIST) || []
    const selectedCartListLength = selectCartList.length
    const {
      cartList
    } = this.data

    const that = this

    if (selectedCartListLength === 0) {
      Toast('请选择要删除的商品~')
    } else if (selectedCartListLength < cartList.length) {
      // 表示用户选择了要删除某件或者某几件购物车商品（非全选）
      wx.showModal({
        title: '提示',
        content: `您确定要将已选中的${selectedCartListLength}件商品删除吗？`,
        confirmColor: "#ff0c46",
        success(res) {
          if (res.confirm) {
            for (let item of selectCartList) {
              that._removeCartGoods(item.cartId)
            }
          }
        }
      })

    } else {
      // 表示用户选择了要删除所有购物车商品
      wx.showModal({
        title: '提示',
        content: '您确定要清空购物车列表吗？',
        confirmColor: "#ff0c46",
        success(res) {
          if (res.confirm) {
            that._removeAllCartGoods()
          }
        }
      })
    }

  },

  goToSettle() {
    const selectedList = wx.getStorageSync(SELECTED_CART_LIST)
    // 用于标识结算的来源
    const settleFrom = 'cart'

    const {
      totalPrice
    } = this.data

    // 通过 eventChannel 实现页面通信
    wx.navigateTo({
      url: '/pages/confirmOrder/confirmOrder',
      success: (res) => {
        res.eventChannel.emit('confirmList', {
          selectedList,
          totalPrice,
          settleFrom
        })

        res.eventChannel.on('refreshCartList', () => {
          this._getCartList()
        })
      }
    })

  },

  handleLoginSuccess() {
    console.log('handleLoginSuccess---')
    this._getCartList()
  }

})