import { promisifyAll } from 'miniprogram-api-promise'

const wxp = {}
promisifyAll(wx, wxp)

// console.log('wxp--', wxp);

// 说明：除了网络请求部分的API使用“wxp”外，其他微信小程序内置的API均使用“wx”！
// 作用：提高小程序代码的编译性能

export default wxp