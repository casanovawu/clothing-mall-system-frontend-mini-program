import {
  requestWithToken
} from './request'

export const getAddressList = () => {
  return requestWithToken({
    url: `/user/my/address`,
  })
}

export const createAddress = (userName, telNumber, region, detailInfo) => {
  return requestWithToken({
    url: `/user/my/address`,
    method: 'post',
    data: {
      userName,
      telNumber,
      region,
      detailInfo
    }
  })
}

export const updateAddress = (addressId, userName, telNumber, region, detailInfo) => {
  return requestWithToken({
    url: `/user/my/address/${addressId}`,
    method: 'put',
    data: {
      userName,
      telNumber,
      region,
      detailInfo
    }
  })
}

export const removeAddress = (addressId) => {
  return requestWithToken({
    url: `/user/my/address/${addressId}`,
    method: 'delete',
  })
}