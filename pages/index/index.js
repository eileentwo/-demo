//index.js
//获取应用实例
const app = getApp();
var data_list =new Array;
Page({
  data: {
    itemTopArray: [],
    isContentCanFloat: [],
    isAddItemTopArray: true,
    isCategoryItemTap: false,
    categoryBoxScrollIntoView:0,
    currentCategoryContent:0,
    currentCategory:0,
    currentCategoryTitle:0,
  },
  onLoad: function () {
    let that =this;
    let totalCont=0;
    wx: wx.request({
      url: 'https://xxx.xxx.com/api/store_detail/list_store_goods_new',
      data: {
        store_id: 2,
        discount_id: '',
        page: 1,
        limit: 100
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.status == 1) {
          data_list = res.data.data;
          totalCont = data_list.length;
          if (data_list && totalCont> 0) {
            setTimeout(function () {
              //初始化时获取每个子view的offsetTop位置
              that.setData({
                currentCategoryContent: totalCont,
                categoryBoxScrollIntoView: totalCont
              });

              var timer = setInterval(function () {
                totalCont--;
                console.log(43, totalCont)
                if (totalCont < 0) {
                  clearInterval(timer);
                }
                that.setData({
                  currentCategoryContent: totalCont
                });
                //}, 800); //todo开发者工具上的模拟器上运行应用这个计算时间，真机运行应用下面那个300毫秒的时间
              }, 100); //这个100毫秒意味着1秒钟会计算10种分类的菜类的offsetTop,20种分类的菜类的offsetTop要两秒钟计算完成，改成70的话大概一秒钟要计算15钟菜类的offsetTop
            }, 300);
            that.setData({
              goodsItem: data_list,
            })
          }
        } else {
          wx.showToast({
            title: '营业日期加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '服务器响应失败',
          icon: 'none',
          duration: 3000,
        })
      },
      complete: function (res) { },
    })
    
  },


  setCurrentTab: function (e) {
    this.setData({
      currentTab: e.target.dataset.tab
    });
  },
  switchCategory: function (e) {
    var isContentCanFloatArr = this.data.isContentCanFloat;
    if (isContentCanFloatArr[parseInt(e.currentTarget.dataset.category)]) {
      this.setData({
        currentCategoryTitle: e.currentTarget.dataset.category
      });
    } else {
      this.setData({
        currentCategoryTitle: isContentCanFloatArr.length
      });
    }
    this.setData({
      currentCategory: e.currentTarget.dataset.category,
      currentCategoryContent: e.currentTarget.dataset.category,
      isCategoryItemTap: true
    });

    //延时1秒，禁用doCategoryContentsScroll中的滚动事件的代码块
    setTimeout(function () {
      this.setData({
        isCategoryItemTap: false
      });
    }.bind(this), 1000);
  },
  doCategoryBoxScroll: function (e) {
    console.log(153, e.detail.scrollHeight - e.detail.scrollTop)
    if (this.data.isAddItemTopArray) {
      this.setData({
        tabsContentHeight: e.detail.scrollHeight - e.detail.scrollTop,
        tabHeight: e.detail.scrollHeight / this.data.goodsItem.length+1
      });
    } else {
      var top = e.detail.scrollTop;
      this.setData({
        categoryBoxScrollTop: top
      });
    }
  },
  doCategoryContentsScroll: function (e) {
    if (this.data.isAddItemTopArray) {
      //初始化时获取每个子view的offsetTop位置
      var tempArr = this.data.itemTopArray;
      tempArr.unshift(e.detail.scrollTop);

      this.setData({
        itemTopArray: tempArr
      });

      console.log(131, tempArr, e.detail.scrollTop )
      if (e.detail.scrollTop <= 20) { //20是保险值，本应该是0
        var that = this;
        setTimeout(function () {
          console.log(135)
          that.setData({
            isScrollWithAnimation: true,
            isAddItemTopArray: false,
            isLoaded: true,
            categoryBoxScrollIntoView: 0
          });
          //校验itemTopArray的长度
          if (tempArr.length < that.data.goodsItem.length + 1) {
            var lastValue = tempArr[tempArr.length - 1];
            for (var m = that.data.goodsItem.length + 1; m > tempArr.length - 1; m--) {
              tempArr.push(lastValue);
            }
            console.log(tempArr, 92)
            that.setData({
              itemTopArray: tempArr
            });
          }
          var tempCanFloatArr = [];
          for (var k = 0; k < tempArr.length; k++) {
            //判断最后一个要不要把title漂浮起来
            var currContentHeight = e.detail.scrollHeight - tempArr[k];
            if (currContentHeight <= that.data.tabsContentHeight) {
              //只有最后一个内容区的高度大于滑动区的高度，最后一个内容区的标题可漂浮
              tempCanFloatArr.push(false);
            } else {
              tempCanFloatArr.push(true);
            }
          }
          that.setData({
            isContentCanFloat: tempCanFloatArr
          });
        })
      }
    } else {
      //减少操作太频繁的计算量
      if (!this.data.isCategoryItemTap) {
        console.log(277, this.data.itemTopArray)
        for (var i = 0; i < this.data.itemTopArray.length; i++) {
          if (e.detail.scrollTop < this.data.itemTopArray[i + 1]) {
            if (this.data.currentCategory != i) {
              var isContentCanFloatArr = this.data.isContentCanFloat;
              if (isContentCanFloatArr[i]) {
                this.setData({
                  currentCategoryTitle: i
                });
              } else {
                this.setData({
                  currentCategoryTitle: isContentCanFloatArr.length
                });
              }
              console.log(i, 186)
              this.setData({
                currentCategory: i
              });
              //滚动菜单分类
              var currentCategoryBox_offsetTop = i * this.data.tabHeight;
              var categoryBoxScrollTop_temp = this.data.categoryBoxScrollTop;
              var min_categoryBoxScrollTop = categoryBoxScrollTop_temp;
              var max_categoryBoxScrollTop = min_categoryBoxScrollTop + this.data.tabsContentHeight;
              if (currentCategoryBox_offsetTop < min_categoryBoxScrollTop) {
                //说明已经在屏幕的可视区的上方了，让滚动条向下一个tabHeight
                var scroll_top = currentCategoryBox_offsetTop;
                var scroll_view = Math.floor(scroll_top / this.data.tabHeight);
                if (scroll_view < 0) {
                  scroll_view = 0;
                }
                this.setData({
                  categoryBoxScrollTop: scroll_top,
                  categoryBoxScrollIntoView: scroll_view
                });
              } else if (currentCategoryBox_offsetTop + this.data.tabHeight > max_categoryBoxScrollTop) {
                //说明已经在屏幕的可视区的下方了，让滚动条向上移动一个tabHeight
                var scroll_top = min_categoryBoxScrollTop + (currentCategoryBox_offsetTop + this.data.tabHeight - max_categoryBoxScrollTop);
                var scroll_view = Math.ceil(scroll_top / this.data.tabHeight);
                if (scroll_view > this.data.goodsItem.length) {
                  scroll_view = this.data.goodsItem.length ;
                }
                this.setData({
                  categoryBoxScrollIntoView: scroll_view
                });
              }
            }
            break;
          }
        }
      }
    }
  },
  doCategoryContentsToLower: function (e) {
    console.log(221, !this.data.isAddItemTopArray)
    if (!this.data.isAddItemTopArray) {
      if (!this.data.isCategoryItemTap) {
        var isContentCanFloatArr = this.data.isContentCanFloat;
        if (isContentCanFloatArr[this.data.goodsItem.length]) {
          this.setData({
            currentCategoryTitle: this.data.goodsItem.length, 
          });
        } else {
          this.setData({
            currentCategoryTitle: isContentCanFloatArr.length
          });
        }
        console.log(this.data.goodsItem.length,235)
        this.setData({
          currentCategory: this.data.goodsItem.length ,
          categoryBoxScrollIntoView: this.data.goodsItem.length,
        });
      }
    }
  }
})
