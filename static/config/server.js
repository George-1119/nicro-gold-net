/**
 * @Author mileS.
 * @Date 2018/8/29.
 * @Description: .server层 提供接口调用
 */
const API = require("./config");
import $WxResource from "../js/HttpRequest";
class InterServer {
  constructor() {
    this.login = $WxResource.save(API.login); // 登陆
    this.getUserInfo = $WxResource.save(API.getUserInfo); // 获取用户信息
  }
}

export default new InterServer();