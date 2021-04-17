/*
关于微信登录鉴权的说明（接口）：
【前端】
（1）wx.login：调用接口获取登录凭证（code）。【微信服务器】
  通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。
  用户数据的加解密通讯需要依赖会话密钥完成。

  获取的 code 即为用户登录凭证（有效期五分钟），开发者需要在开发者服务器后台调用 auth.code2Session（即下边的URL），
  使用 code 换取 openid 和 session_key 等信息。

（2）wx.checkSession：检查登录态（即code）是否过期。【微信服务器】
  开发者只需要调用 wx.checkSession 接口检测当前用户登录态是否有效。
  登录态过期后开发者可以再调用 wx.login 获取新的用户登录态。
  调用成功说明当前 session_key 未过期，调用失败说明 session_key 已过期。

（3）wx.request：向开发者服务器请求接口时，需要带上 token 用于鉴权。【开发者服务器】


【后端】
（1）通过 axios.get 方法向以下的URL请求数据（注意相应的query参数），随即可以 openid、session_key、unionid
请求的URL为：GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code

（2）需要有某个接口用于验证用户身份

*/

import {request} from './request'
import wxp from '../utils/wxp'

export const authLogin = (token, code, userInfo, encryptedData, iv, sessionKeyIsValid) => {

  return request({
    url: '/user/wexin-login',
    method: 'POST',
    header: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    },
    data: {
      code,
      userInfo,
      encryptedData,
      iv,
      sessionKeyIsValid
    }
  })

}

export const checkSession = () => {
  return wxp.checkSession()
}

export const login = () => {
  return wxp.login()
}