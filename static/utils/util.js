import InterServer from "../config/server";
import {
  localStorageSyncServer,
  camelCase,
  bytesNumber
} from "../../static/js/common"
import VALUES from "../values/values";
var APP = getApp();

const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n
};

// 将时间变成两位
function toDouDate(date) {
  if (date.toString().length == 1) {
    return '0' + date.toString()
  } else {
    return date.toString()
  }
}

//函数节流（防止快速点击）
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 2000
  }
  let _lastTime = null
  // 返回新的函数
  return function() {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}

/**
 * 数字转大写
 * @param lifeNumber
 * @return
 */
// function transformNumToChinese(num){
//      // 提供中文数字
//   var cnum = ['一', '二', '三', '四', '五', '六', '七', '八', '九','十','百','千','万'];
//   let result = "";
//
//   return result;
// }

// 时长转换为时间格式 单位秒
function transformTimeToClock(seconds) {
  let [h, m, s] = [parseInt(seconds / 3600), parseInt(seconds / 60) % 60, seconds % 60];
  return formatNumber(h) + ":" + formatNumber(m) + ":" + formatNumber(s)
}

/**
 * 设置标题
 * @param title
 */
function setWxNavBarTitle(title) {
  wx.setNavigationBarTitle({
    title: title
  })
}
/**
 * 设置标题字体，背景颜色
 */
function setNavigationBarColor(font = "#000000", bg = '#333', dur = 0, effect = "linear") {
  wx.setNavigationBarColor({
    frontColor: font,
    backgroundColor: bg,
    animation: {
      duration: dur,
      timingFunc: effect
    }
  });
}

/**
 * 微信登录授权
 */
function loginOauth(needAuth) {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        if (res.code != null) {
          wx.getUserInfo({
            success: function(response) {
              if ( localStorageSyncServer.get("Token")) { // 已登录
                getUserInfo().then(() => {
                  resolve(APP.globalData.userInfo, "done")
                });
                // ret.data.birthdayUpdateCount 0 未完善信息  1/2 完善信息
                console.log(needAuth)
                if (APP.globalData.userInfo.birthdayUpdateCount == 0 && needAuth) {
                  wx.navigateTo({
                    url: '../complete_base_info/complete_base_info'
                  })
                }
              } else { // 未登录
                InterServer.login({
                  encrypted_data: response.encryptedData,
                  iv: response.iv,
                  code: res.code
                }).then(ret => {
                  if (ret.code == 200) {
                    APP.globalData.token = ret.data.token;
                    localStorageSyncServer.set("Token", ret.data.token); // token 存储
                    APP.globalData.openid = ret.data.open_id;
                    getUserInfo().then(res => {
                      console.log(res)
                      resolve(APP.globalData.userInfo, "done")
                    });
                    // ret.data.birthdayUpdateCount 0 未完善信息  1/2 完善信息
                    console.log(needAuth)
                    if (APP.globalData.userInfo.birthdayUpdateCount == 0 && needAuth) {
                      wx.navigateTo({
                        url: '../complete_base_info/complete_base_info'
                      })
                    }
                  }
                });
              }
            },
            fail: function() {
              if (needAuth) {
                wx.navigateTo({
                  url: '/pages/oauth/oauth',
                })
              }
              resolve()
            }
          });
        }
      },
    })
  })
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return new Promise((resolve, reject) => {
    InterServer.getUserInfo({
      third_party_type: 1
    }).then(userInfo => { // 获取用户信息
      let info = camelCase(userInfo.data);
      let nickname = info.nickname;
      // 未完善信息，需截取微信昵称 16字节以内
      if (info.birthdayUpdateCount == 0 && 　bytesNumber(nickname) > VALUES.NICKNAME_MAX_BYTE_LENGTH) {
        for (let i = 0; i < nickname.length; i++) {
          if (bytesNumber(nickname.substring(0, i)) > VALUES.NICKNAME_MAX_BYTE_LENGTH) {
            nickname = nickname.substring(0, i - 1)
          }
        }
      }
      APP.globalData.userInfo = info;
      if (APP.globalData.userInfo.sex == 0) {
        APP.globalData.userInfo.sex == 2
      }
      resolve(APP.globalData.userInfo, "done")
    });
  })
}
// 向后台发送formID
function sendFormId(formId) {

  if (!isNaN(formId) && formId != '') {
    InterServer.sendFormId({
      form_id: formId
    }).then((val) => {
      if (val.code == 200) {
        console.log(val.msg)
      }
    })
  }

}
/**
 * canvas绘图文本换行
 *
 * ctx 画布
 * str 绘制的字符串
 * initX 初始坐标X
 * initY 初始坐标Y
 * rowHeight 每一行的高度
 * rowWidth 每一行的宽度
 */
function canvasNewLine(ctx, str, initX, initY, rowWidth, rowHeight) {
  var lineWidth = 0;
  var lineWidthNext = 0;
  var lastSubStrIndex = 0; //每次开始截取的字符串的索引
  var rowNum = 1; //绘制了多少行
  for (let i = 0; i < str.length; i++) {
    if (lineWidth + lineWidthNext > rowWidth) {
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY); //绘制截取部分
      initY += rowHeight;
      lineWidth = 0;
      lastSubStrIndex = i;
      ++rowNum
    }
    if (i == str.length - 1) { //绘制最后一行
      ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
    }
    lineWidth += ctx.measureText(str[i]).width;
    lineWidthNext = str[i + 1] ? ctx.measureText(str[i + 1]).width : 0
  }
  return rowNum
}

/**
 * canvas 字符串省略号
 * ctx 画布对象
 * str 字符串
 * width 截取的长度
 */
function cavansEllipsis(ctx, str, width) {
  let len = 0
  let strNew = ''
  let w = width - ctx.measureText('...').width
  for (let i = 0; i < str.length; i++) {
    len += ctx.measureText(str[i]).width
    if (len < w) {
      strNew += str[i]
    } else {
      strNew += '...'
      break
    }
  }
  return strNew
}

// 下载图片
function downCancasImgFun(that,url,obj,key) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode == 200) {
          //获取下载的图片信息，判断是否可用
          wx.getImageInfo({
            src: res.tempFilePath,
            success(res) {
              that.data[obj][key] = res.path
              that.setData({
                [obj]: that.data[obj]
              })
              resolve(res.path)
            },
            fail(res) {
              console.log('生成图片错误')
              that.data[obj][key] = ''
              that.setData({
                [obj]: that.data[obj]
              })
            }
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  })
}
module.exports = {
  transformTimeToClock: transformTimeToClock,
  throttle: throttle,
  toDouDate: toDouDate,
  formatTime: formatTime,
  setWxNavBarTitle: setWxNavBarTitle,
  setNavigationBarColor: setNavigationBarColor,
  loginOauth: loginOauth,
  getUserInfo: getUserInfo,
  sendFormId: sendFormId,
  canvasNewLine: canvasNewLine,
  cavansEllipsis: cavansEllipsis,
  downCancasImgFun: downCancasImgFun
};
