// components/x-swiper/x-swiper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    banners: {
      type: Array,
      value: []
    }
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
    itemClick(event) {
      // console.log('swiper event---', event);
      const index = event.currentTarget.dataset.index
      
      this.triggerEvent('itemClick', {index})

    }
  }
})
