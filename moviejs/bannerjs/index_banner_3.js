 //                    娃娃团队 www.yava.pw                              
 //  
//首页横幅 3

var banner_html = '';
var banner_array = new Array();


//此处设置图片和链接地址
banner_array = [
  {
  'pic': '', //图片地址，如不需显示广告请留空
  'link': '', //链接地址
  }, 
];


//以下不要修改

if (banner_array.length > 0) {
  for (var i = 0; i < banner_array.length; i++) {
    if (banner_array[i]['pic'] != '' && banner_array[i]['pic'] != undefined) {
      banner_html += '<a ';
      banner_html += (banner_array[i]['link'] != '' && banner_array[i]['link'] != undefined) ? 'href="' + banner_array[i]['link'] + '" target="_blank">' : 'href="javascript:;">';
      banner_html += '<img src="' + banner_array[i]['pic'] + '"></a>';
    }
  }
}
if ((banner_html == '' || banner_html == undefined) && ewave_config.banner_text == 1) {
  banner_html = '<p class="ewave-banner-text">广告位</p>';
}
document.getElementById('index-banner-3').innerHTML = banner_html;
