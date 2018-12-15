"use strict";
/**
 * @Author mileS.
 * @Date 2018/12/15.
 * @Description: 小程序配置文件.
 */
import { freezeConstant } from "../js/common";
const version = "1.0";
// let hostIp = "http://192.168.2.207:8000";  // 开发环境
//let hostIp = "http://192.168.2.132:8767";   // 开发环境
let hostIp = "http://192.168.2.203:8003"; // 測試环境

// let hostIp = "https://mimapi.xuanyiai.com"; // 生产环境
let root = `${hostIp}/api/pi`;
var config = {
  login: `/public/user/${version}/small_program/login`, // 登陆
};

// 增加root
Object.keys(config).forEach(key => {
  config[key] = root + config[key]
});
module.exports = freezeConstant(config);