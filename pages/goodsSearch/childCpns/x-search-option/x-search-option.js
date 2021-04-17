// pages/goodsSearch/childCpns/x-search-option/x-search-option.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isAsc: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: '0',
    isPriceItemClick: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    optionClick(event) {
      // "data-*"拿到的数据是 String 类型的。
      const index = event.currentTarget.dataset.index
      // console.log('optionClick event---', event);
      this.setData({
        currentIndex: index
      })

      // 根据点击的类型，生成相对应的数据列表
      // ['综合', '价格', '上新']
      switch (index) {
        case '0':
          this.triggerEvent('defaultItemClick')
          this.setData({
            isPriceItemClick: false
          })
          break

        case '1':
          this.triggerEvent('priceItemClick')
          this.setData({
            isPriceItemClick: true
          })
          break

        case '2':
          this.triggerEvent('newItemClick')
          this.setData({
            isPriceItemClick: false
          })
          break
      }

    }
  }
})