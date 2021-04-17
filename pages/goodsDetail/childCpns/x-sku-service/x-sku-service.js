// pages/goodsDetail/childCpns/x-sku-service/x-sku-service.js

// 注意以下正确的路径：
import Toast from '@vant/weapp/toast/toast';
// 错误路径：
// import Toast from '@vant/weapp/dist/toast/toast';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 后期会更改为根据不同的规格匹配对应的价格
    goodsPrice: {
      type: Number,
      value: 0
    },
    goodsSkus: {
      type: Array,
      value: []
    },
    goodsAttrKeys: {
      type: Array,
      value: []
    },
    // 拿 goodsBanners 中的第一个数据作为规格选择的图片展示
    goodsBanners: {
      type: Array,
      value: []
    },

    // 用于处理点击goods-action的【加入购物车】和【立即购买】按钮
    confirmContent: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowDeliveryServicePopup: false,
    isShowSelectionPopup: false,
    // 用于sku规格选择
    currentIndex1: -1,
    currentIndex2: -1,
    // 用于显示选择的规格信息
    selectedSkuContentList: [],
    // 对应规格信息的库存数量
    selectedSkuStock: 0,
    // 具体规格信息对应的id
    selectedGoodsSkuId: 0,
    // 用于购买数量处理
    purchaseCount: 1,
    // 用于购物车支付用的价格
    fixedPrice: '0.10',
    // 用于存储具体的规格内容
    dConfirmContent: '',
  },

  observers: {
    'confirmContent': function (newVal) {
      // console.log('confirmContent:', newVal)
      this.setData({
        dConfirmContent: newVal
      })
    }

  },

  /**
   * 组件的方法列表
   */
  methods: {
    showServicePopup() {
      // console.log('showServicePopup------------------', this);
      this.setData({
        isShowDeliveryServicePopup: true
      });
    },

    onServicePopupClose() {
      this.setData({
        isShowDeliveryServicePopup: false
      });
    },

    onServicePopupConfirm() {
      this.setData({
        isShowDeliveryServicePopup: false
      });
    },

    showSelectionPopup1() {
      // console.log('showSelectionPopup1------------------');
      this.setData({
        isShowSelectionPopup: true,
        confirmContent: ''
      });
    },

    // 供父组件调用
    showSelectionPopup2() {
      // console.log('showSelectionPopup2------------------');
      this.setData({
        isShowSelectionPopup: true
      });
    },

    onSelectionPopupClose() {
      this.setData({
        isShowSelectionPopup: false
      });
    },

    onCountChange(event) {
      // console.log('onCountChange---', event)
      this.setData({
        purchaseCount: event.detail
      })

    },

    onCountOverlimit() {
      // 通过 attrValue 的 id 拿到对应的具体的 sku 数据，进而拿到 stock
      const {
        purchaseCount,
        selectedSkuStock
      } = this.data

      if (purchaseCount <= 1) {
        Toast('至少选择一件商品~')
      } else if (purchaseCount >= selectedSkuStock) {
        Toast('该商品库存不足~')
      }
    },

    skuButtonClick(event) {
      // console.log('skuButtonClick---', event);
      const {
        attrKey,
        attrValueIndex
      } = event.currentTarget.dataset
      let {
        selectedSkuStock,
        // 记录商品第一个规格维度的索引值
        currentIndex1,
        // 记录商品第个规格维度的索引值
        currentIndex2,
        goodsAttrKeys,
        selectedSkuContentList
      } = this.data
      // 处理点击按钮切换功能
      if (attrKey === '尺码') {
        const {
          goodsAttrValues
        } = goodsAttrKeys[0]

        // 点击已经被选中的按钮时的执行逻辑（切换同一个规格信息的显示与隐藏）
        if (currentIndex1 !== -1 && attrValueIndex === currentIndex1) {
          this.setData({
            currentIndex1: -1
          })

          // 取消选中时去除对应的内容
          const oldList = selectedSkuContentList
          oldList.shift()
          this.setData({
            selectedSkuContentList: oldList,
            selectedSkuStock: 0 // 规格未选完之前，将库存显示值设置为0
          })

          return
        }

        // 处理样式切换
        this.setData({
          currentIndex1: attrValueIndex
        })


        // 处理选择内容   
        const selectedContent = goodsAttrValues[attrValueIndex].attrValue
        const selectedSizeObj = {
          attrKey,
          selectedContent
        }
        // console.log('selectedContent---', selectedContent)
        const oldList = selectedSkuContentList
        // console.log('更新后的oldList---', selectedSkuContentList)
        // 先拿出尺码数据，再放入最新选择的尺码数据（如果先后放入数组中的项来自同一个规格维度）
        if (oldList[0] && oldList[0].attrKey === '尺码') {
          oldList.shift()
        }

        oldList.unshift(selectedSizeObj)
        this.setData({
          selectedSkuContentList: oldList
        })


      } else if (attrKey === '颜色') {
        const {
          goodsAttrValues
        } = goodsAttrKeys[1]


        // 点击已经被选中的按钮时的执行逻辑（切换同一个规格信息的显示与隐藏）
        if (currentIndex2 !== -1 && attrValueIndex === currentIndex2) {
          this.setData({
            currentIndex2: -1
          })

          // 取消选中时去除对应的内容
          const oldList = selectedSkuContentList
          oldList.pop()
          this.setData({
            selectedSkuContentList: oldList,
            selectedSkuStock: 0 // 规格未选完之前，将库存显示值设置为0
          })

          return
        }

        this.setData({
          currentIndex2: attrValueIndex
        })


        // 处理选择内容   
        const selectedContent = goodsAttrValues[attrValueIndex].attrValue
        const selectColorObj = {
          attrKey,
          selectedContent
        }
        // console.log('selectedContent---', selectedContent)
        const oldList = selectedSkuContentList
        // 先拿出颜色数据，再放入最新选择的颜色数据（如果先后放入数组中的项来自同一个规格维度）
        // 先拿出尺码数据，再放入最新选择的尺码数据（如果先后放入数组中的项来自同一个规格维度）
        if ((oldList[0] && oldList[0].attrKey === '颜色') ||
          ((oldList[1] && oldList[1].attrKey === '颜色'))) {
          oldList.pop()
        }

        oldList.push(selectColorObj)
        this.setData({
          selectedSkuContentList: oldList
        })
      }

      // 上边拿到的值都被更新了，所以这里选择再从data中拿到最新的数据
      // 每次都检测是否选完了规格信息，如果是，则将对应的规格的库存信息更新
      if (selectedSkuContentList.length === 2) {

        selectedSkuContentList = this.data.selectedSkuContentList
        currentIndex1 = this.data.currentIndex1
        currentIndex2 = this.data.currentIndex2

        const {
          goodsSkus
        } = this.properties

        // 根据对应的尺码index和颜色index拿到具体的 stock 值
        const selectedSizeId = goodsAttrKeys[0].goodsAttrValues[currentIndex1].id
        const selectedColorId = goodsAttrKeys[1].goodsAttrValues[currentIndex2].id
        const selectIds = [selectedSizeId, selectedColorId]

        for (let item of goodsSkus) {
          if (item.goodsAttrPath.toString() === selectIds.toString()) {
            const stock = item.stock
            const id = item.id
            this.setData({
              selectedSkuStock: stock,
              selectedGoodsSkuId: id
            })
          }
        }
      }
    },

    handleAddCart() {
      // console.log('handleAddCart---');
      // 执行逻辑同handleConfirmButtonClick方法中【加入购物车】分支
      this.handleConfirmButtonClick('加入购物车')
    },

    handleBuyNow() {
      // console.log('handleBuyNow---');
      // 执行逻辑同handleConfirmButtonClick方法中【立即购买】分支
      this.handleConfirmButtonClick('立即购买')
    },

    handleConfirmButtonClick(actionContent) {
      const {
        dConfirmContent,
        currentIndex1,
        currentIndex2,
        selectedGoodsSkuId,
        purchaseCount,
        selectedSkuContentList
      } = this.data

      // 如果规格信息未选择完毕，则提示先选择完具体的规格信息
      if (selectedSkuContentList.length !== 2) {
        Toast('请先选择完规格信息哦，亲~')
        
        return 
      }

      if (dConfirmContent === '加入购物车' || actionContent === '加入购物车') {
        // console.log('点击了【加入购物车】处理的逻辑')
        this.triggerEvent('addCartConfirmButtonClick', {
          currentIndex1,
          currentIndex2,
          selectedGoodsSkuId,
          selectedSkuContentList,
          purchaseCount
        })
      } else if (dConfirmContent === '立即购买' || actionContent === '立即购买') {
        // console.log('点击了【立即购买】处理的逻辑')

        this.triggerEvent('buyNowConfirmButtonClick', {
          currentIndex1,
          currentIndex2,
          selectedGoodsSkuId,
          selectedSkuContentList,
          purchaseCount
        })

      }

    }

  }
})