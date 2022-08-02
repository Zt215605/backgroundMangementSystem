import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}




/*  个人扩充(使用vue-cookies库  本项目中使用到的是js-cookie库来通过cookies来存储token，大多情况下都更倾向于使用本地存储来存token)： 

  使用cookie保存token
  首先下载cookie模块

  npm install vue-cookies --save
  在引入进项目

  import VueCookies from 'vue-cookies'
  我个人喜欢绑定至原型

  Vue.prototype.cookie = VueCookies
  this.cookie.set('name' , 'li') //这样就可以存储

  token认证,说一下token 能放在cookie中吗？
    https://blog.csdn.net/qq_45715615/article/details/123729019

  cookie和session和token的区别？
    https://blog.csdn.net/qq_36262295/article/details/116565331

*/