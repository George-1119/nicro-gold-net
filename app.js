
import "static/utils/custom";
import { localStorageSyncServer, camelCase, updateMiniProgram } from "./static/js/common";
import InterServer from "static/config/server";
App({
  onLaunch: function () {
    // 检测更新小程序
    updateMiniProgram();
    // 清楚缓存
    localStorageSyncServer.clear();
    // android 1  /  ios 2
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.os = res.system.match(/android/i) ? 1 : 2;
        localStorageSyncServer.set("os", that.globalData.os);
        that.globalData.ratio = res.windowWidth / 750;
      }
    });
    // InterServer.getCommonConfig().then(res => {
    //   if (res.code == 200) {
    //     that.globalData.commonConfig = camelCase(res.data)
    //   }
    // })
  },

  // onShow(){
  //
  //
  // },
  globalData: {
    commonConfig: "",
    userInfo: {  // 用户信息
      userInfoId: "",
      avatar: "",
      nickname: "",
      sex: "",
      birthday: ""
    },
    os: "",  // 操作系统
    ratio: 1,//rpx与px的比例
    depthReportList: '',//深度报告列表
    fortuneReportList: '',//财运指南列表
    formId: [],
    Token: "" // token
  }
});
