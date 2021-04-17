import {
  request,
  requestWithToken
} from './request'

export const getGoodsDetail = (goodsId) => {
  return request({
    url: '/goods/' + goodsId
  })
}

export const getGoodsSkuAndAttrDetail = (goodsId) => {
  const urlInfo = `/goods/${goodsId}/sku`
  return request({
    url: urlInfo
  })
}

export const addToCart = (goodsId, goodsSkuId, goodsSkuDesc, num) => {
  return requestWithToken({
    url: '/user/my/carts',
    method: 'post',
    data: {
      goodsId,
      goodsSkuId,
      goodsSkuDesc,
      num
    }
  })
}