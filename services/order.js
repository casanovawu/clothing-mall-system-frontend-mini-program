import {
  requestWithToken
} from './request'

export const generateOrder = (totalFee, addressId, preOrderGoodsList, goodsNameDesc, leaveMessage) => {
  return requestWithToken({
    url: '/user/my/order',
    method: 'post',
    data: {
      totalFee,
      addressId,
      preOrderGoodsList,
      goodsNameDesc,
      leaveMessage
    }
  })
}

export const updateOrderPayState = (orderNo, payState) => {
  return requestWithToken({
    url: '/user/my/order?orderNo=' + orderNo,
    method: 'put',
    data: {
      payState
    }
  })
}

export const getOrderList = () => {
  return requestWithToken({
    url: '/user/my/order'
  })
}