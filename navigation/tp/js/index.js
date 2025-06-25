//页面加载完毕事件
$(document).ready(function() {
    if(theme_config.style == 1){ load_css(); } 
    if(theme_config.yibujiazai == 1 && page == 'home'){
        $.post("./index.php?theme=wanfeng&api=data&u=" + u, function (r, status) {
            if (r.code == 1) {
                mix_data = r.data;
                init_home();
            } else {
                $('.loading-text').text("异步加载数据失败,请刷新重试!");
            }
        }).fail(function () {
            $('.loading-text').text("请求数据失败,请刷新重试!");
        });
    }else if(page == 'home'){
        init_home();
    }else if(page == 'article'){
        init_article();
    }else if(page == 'transit'){
        init_transit();
    }else if(page == 'apply'){
        init_transit();
    }else if(page == 'guestbook'){
        init_transit();
    }
    init_cursor();
}); 


function init_transit() {
    //通用类配置初始化
    init_currency();
    //懒加载
    init_lazyImages();
}

function init_article() {
    //通用类配置初始化
    init_currency();
    //高亮代码
    hljs.highlightAll();
    //懒加载
    init_lazyImages();
    //给正文内的图片添加CSS类(实现点击放大等效果)
    $(".wzynrzw img").addClass("spotlight");
    //置顶按钮
    to_top();
}

function init_home() {
    //设置最大宽度
    //$('.main, .search-container, .gg, .ggw1, .wenzhang, .foot, .tongji').css('max-width', theme_config.max_width + 'px');
    
    //分类渲染
    const cblfl = $('.cblfl ul');
    const fl_list = $('.fl-list ul');
    const cebianlan = $('.cebianlan ul');
    category_parent.forEach(category => {
        insertCategoryToList(category, cblfl);
        insertCategoryToList(category, fl_list);
        insertCategoryToList(category, cebianlan);
    });
    
    //列表渲染
    const main_list = $('.main-list');
    mix_data.forEach(item => {
        let id = 0;
        let links_html = '';
        let button = "";
        //插入标题
        main_list.append(`<div id="v${item.id}" class="biaoti"><i class="${item.font_icon}"></i>&nbsp;${item.name}</div>`);

        //如果一级分类下存在链接
        if(item.links.length > 0){
            id++;
            button = `<button class="tablinks" onclick="openTab(event, 'tab${id}')"><i class="${item.font_icon}"></i>&nbsp;${item.name}</button>`;
            links_html = '<div id="tab' + id +  '" class="tabcontent"><ul>' + generateListItem(item.links) + '</ul></div>';
        }
        //遍历二级分类
        item.sub_category.forEach(sub_item => {
            id++;
            button += `<button class="tablinks" onclick="openTab(event, 'tab${id}')"><i class="${sub_item.font_icon}"></i>&nbsp;${sub_item.name}</button>`;
            links_html += '<div id="tab' + id +  '" class="tabcontent"><ul>' + generateListItem(sub_item.links) + '</ul></div>';
        });
        
        //插入分类按钮和链接
        main_list.append('<div class="box" data-loaded="false"> <div class="tab">'+ button +'</div>'+ links_html +'</div>');
    });
    
    //监听分类栏a标签点击事件(用于修正定位未减去顶部栏高度)
    $(".cebianlan,.fl-list,.cblfl a").click(function(event) {
        const main_top = $('.main').offset().top - $("#headerbs").height() - 5;
        $("html, body").animate({ scrollTop: main_top }, 188);
    });
    
    //点亮二级tab的第一个
    $(".tab").each(function () {
        $(this).find("button:first").addClass("active");
    });

    // 二级分类左右滑动
    const $tab = $('.tab');
    let isMouseDown = false;
    let startX;
    let scrollLeft;
    $tab.on('mousedown', function(e) {
      if (e.which === 1) { // 左键按下
        isMouseDown = true;
        startX = e.clientX;
        scrollLeft = $tab.scrollLeft();
        $tab.addClass('scrolling');
      }
    });
    
    $tab.on('mousemove', function(e) {
      if (isMouseDown) {
        const moveX = e.clientX - startX;
        $tab.scrollLeft(scrollLeft - moveX);
      }
    });
    
    $tab.on('mouseup', function() {
      isMouseDown = false;
      $tab.removeClass('scrolling');
    });
    
    $tab.on('mouseleave', function() {
      isMouseDown = false;
      $tab.removeClass('scrolling');
    });
    
    //夜间模式
    const night = localStorage.getItem(u + "_wanfeng_night");
    if(night == '1'){
        $('html').addClass('night');
    }
    $('#mode-switch').on('click', function() {
        if ($(".night").hasClass("night")) {
            $('html').removeClass('night');
            localStorage.setItem(u + "_wanfeng_night",'0');
        } else {
            $('html').addClass('night');
            localStorage.setItem(u + "_wanfeng_night",'1');
        }
    });
    
    //调用搜索
    function performSearch() {
        const activeSstab = $(".sstab.active").attr("id");
        const inputContent = $("#search-input input").val();
        const url = searchUrls[activeSstab].url + inputContent;
        //根据主题配置判断是新标签打开还是当前标签
        if(theme_config.search == '1'){
            window.open(url);
        }else{
            window.location.href = url;
        }
    }
    if(theme_config.search > 0){
        // 搜索引擎区块
        var searchUrls = {
            "baidu-tab":{"name":"百度","url":"https://www.baidu.com/s?wd="},
            "bing-tab":{"name":"必应","url":"https://www.bing.com/search?q="},
            "360-tab":{"name":"360","url":"https://www.so.com/s?q="},
            "sogou-tab":{"name":"搜狗","url":"https://www.sogou.com/web?query="},
            "wanfeng-tab":{"name":"挽风","url":"https://www.a754.com/?s="},
            "GT-tab":{"name":"Gitee","url":"https://search.gitee.com/?skin=rec&type=repository&q="},
            "Bzhan-tab":{"name":"B站","url":"https://search.bilibili.com/all?keyword="},
            "wuzhui-tab":{"name":"无追","url":"https://www.wuzhuiso.com/s?ie=utf-8&fr=none&src=360sou_newhome&q="},
            "weibo-tab":{"name":"微博","url":"https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D"},
            "zhihu-tab":{"name":"知乎","url":"https://www.zhihu.com/search?type=content&q="},
            "douban-tab":{"name":"豆瓣","url":"https://www.douban.com/search?q="},
            "Fsou-tab":{"name":"F搜","url":"https://fsoufsou.com/search?q="},
            "quanzhong-tab":{"name":"权重查询","url":"https://seo.chinaz.com/"},
            "beian-tab":{"name":"备案查询","url":"https://icp.chinaz.com/"},
            "ip-tab":{"name":"IP查询","url":"https://ip.chinaz.com/"},
            "ping-tab":{"name":"Ping检测","url":"https://www.itdog.cn/ping/"}
        };
        //初始化搜索模块
        for (const key in searchUrls) {
            $("#search-tabs").append(`<button class="sstab" id="${key}">${searchUrls[key].name}</button>`);
        }
        //默认搜索引擎
        $('#' + (localStorage.getItem(u + "_wanfeng_sstab") || 'baidu-tab')).addClass("active");
        let active_left = $('.sstab.active').position().left - $('#search-tabs').offset().left;
        $('#search-tabs').scrollLeft(active_left - 200);
        
        //切换搜索引擎
        $(".sstab").click(function(event) {
            $('.sstab').removeClass("active");
            $(this).addClass("active");
            localStorage.setItem(u + "_wanfeng_sstab",this.id);
        });
        //回车搜索
        $("#search-input input").on("keyup", function(event) {
            if (event.keyCode === 13) {
                performSearch();
            }
        });
        //点击搜索
        $("#search-btn").on("click", function() {
            performSearch();
        });
        
        // 搜索引擎选项卡左右滑动
        var $tabss = $('.tabss');
        var isMouseDownCustom = false;
        var startXCustom = 0;
        var startScrollLeftCustom = 0;
        
        $tabss.on('mousedown', function(e) {
            isMouseDownCustom = true;
            startXCustom = e.clientX;
            startScrollLeftCustom = $tabss.scrollLeft();
        });
        
        $tabss.on('mousemove', function(e) {
            if (!isMouseDownCustom) return;
            var moveXCustom = startScrollLeftCustom - (e.clientX - startXCustom);
            $tabss.scrollLeft(moveXCustom);
        });
        
        $tabss.on('mouseup', function() {
            isMouseDownCustom = false;
        });
    } // 搜索 end
    
    //广告区
    if(theme_config.gg == '1'){
        //跑马灯文字
        if(theme_config.gundong_gg.length > 0){
            $('#pmd_text').text(theme_config.gundong_gg);
        }else{
            $('.pmd').remove();
        }
        //广告列表
        if(theme_config.gg_list.length > 0 ){
            $('.gg-list').html('<ul>' + theme_config.gg_list + '</ul>');
        }else{
            $('.ggw0').remove();
        }
        //图片广告
        if(theme_config.ggw1.length > 0 ){
            $('.ggw1').html(theme_config.ggw1);
        }else{
            $('.ggw1').remove();
        }
    }
    //文章区(含友链)
    if(theme_config.friend_link.length > 0){
        $('.yqlj').html('<ul>' + theme_config.friend_link + '</ul>');
    }else{
        $('.yqlj').remove();$('#youqinglianjie').remove();
    }

    //书签区高度
    if(theme_config.main_height > 200){
        $(".main-list").css({"height":theme_config.main_height + 'px'})
        $(".cebianlan ul").css({"height":theme_config.main_height + 'px'})
    }
    //通用配置初始化
    init_currency();

    //懒加载
    init_lazyImages();
    
    //不显示描述
    if(theme_config.card_style == '0'){
        $('#custom_css').html('.main-list .tabcontentimg{ width: 40px; } .main-list a{ height: 40px;}');
    }else if(theme_config.card_style == '1'){
        $('#custom_css').html('.tabcontentms p { -webkit-line-clamp: 1;}');
    }
    
    //卡片间距
    $('#custom_css').append(`.tabcontent ul li { padding: ${theme_config.card_padding}px; }`);
    
    //置顶按钮
    to_top();
    
    //移除加载动画
    remove_loader(); 
    


    //动态标题
    var OriginTitile = document.title,titleTime;
    $(document).on("visibilitychange", function () {
        if (document.hidden) {
            document.title = "你别走吖 Σ(っ °Д °;)っ";
            clearTimeout(titleTime);
        } else {
            document.title = "(/≧▽≦/)你又回来啦！ ";
            titleTime = setTimeout(function () {
                document.title = OriginTitile;
            }, 2000);
        }
    });

    //顶部分类按钮和分类盒子
    $("#x, .fl").hover(
        function () { //移入事件
            $('.fl').css('display',"block"); //显示下拉分类
            $('#sx').css('transform', 'scaleY(1)'); //使svg图标向下
        },
        function () { //移出事件
             $('.fl').css('display',"none"); //隐藏下拉分类
             $('#sx').css('transform', 'scaleY(-1)'); //svg图标向上
        }
    );
}
//置顶按钮
function to_top() {
    //获取滚动按钮元素
    var scrollToTopBtn = $("#scroll-to-top");
    //监听页面滚动事件
    $(window).scroll(function () {
        var scrollY = $(window).scrollTop();
        scrollToTopBtn.css("display", (scrollY >= 200 ? "block":"none"));
    });

    //返回顶部
    scrollToTopBtn.click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });
}
//懒加载图片
function init_lazyImages() {
    let lazyImages = $('img[data-src]');
    if ('IntersectionObserver' in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = $(entry.target);
                    lazyImage.attr('src', lazyImage.data('src'));
                    lazyImage.removeClass('lazy');
                    lazyImageObserver.unobserve(entry.target);
                }
            });
        });

        lazyImages.each(function() {
            lazyImageObserver.observe(this);
        });
    } else {
        // 如果不支持 IntersectionObserver，则直接加载所有图片
        lazyImages.each(function() {
            $(this).attr('src', $(this).data('src'));
            $(this).removeClass('lazy');
        });
    }
}
//通用类配置初始化
function init_currency() {

    //在线留言
    if(theme_config.is_guestbook){
        $('.top-list nav ul').append(`<li><a href="./index.php?c=guestbook&u=${u}">在线留言</a></li>`);
        $('.cblfldb').append(`<a href="./index.php?c=guestbook&u=${u}">在线留言</a>`);
    }
    //申请收录
    if(theme_config.is_apply){
        $('.top-list nav ul').append(`<li><a href="./index.php?c=apply&u=${u}">申请收录</a></li>`);
        $('.cblfldb').append(`<a href="./index.php?c=apply&u=${u}">申请收录</a>`);
    }
    //顶部链接
    if(theme_config.navbar_link.length > 0){
       $('.top-list nav ul').append(theme_config.navbar_link); 
    }
    //底部联系方式 - QQ
    if(theme_config.QQ.length > 0){
        $('.tb').append(`<a href="http://wpa.qq.com/msgrd?v=3&uin=${theme_config.QQ}&site=qq&menu=yes" title="联系QQ：${theme_config.QQ}" target="_blank">
					    <svg t="1690960223032" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11694" width="200" height="200">
							<path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" p-id="11695" fill="#515151"></path>
						</svg>
					</a>`);
    }
    //微信
    if(theme_config.WX.length > 0){
        $('.tb').append(`<a id="wx" title="微信号：${theme_config.WX}"><svg t="1690960265371" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12786" width="200" height="200"><path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" fill="#515151" p-id="12787"></path></svg>
					</a>`);
		$("#wx").click(function(event) {
            alert("微信号: " + theme_config.WX)
        });
    }
    //邮箱
    if(theme_config.email.length > 0){
        $('.tb').append(`<a href="mailto:${theme_config.email}" title="联系邮箱：${theme_config.email}">
					    <svg t="1690960160802" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10555" width="200" height="200">
							<path d="M886.3 299.8l-381.1 220-371.6-214.6c3.6-56.2 50.3-100.7 107.4-100.7h538.3c55.3 0 100.9 41.6 107 95.3z m0.7 78.8v334.9c0 59.5-48.2 107.7-107.7 107.7H241c-59.5 0-107.7-48.2-107.7-107.7V384.3l354.9 204.9c12.2 7 26.9 5.7 37.5-2.1 0.5-0.2 0.9-0.5 1.4-0.8L887 378.6z"
								p-id="10556" fill="#515151">
							</path>
						</svg>
					</a>`);
    }
    
    //二维码
    if(theme_config.QR_data.length > 0){
        const jsonData = JSON.parse(theme_config.QR_data);
        const groupList = $('#group-list');
        jsonData.forEach(item => {
            const li = $('<li>');
            const img = $('<img>').attr('data-src', item['data-src']).attr('alt', '');
            const a = $('<a>').text(item['a']);
            li.append(img).append(a);
            $(".right ul").append(li);
        });
    }
    
    //底部a
    if(theme_config.bottom_a.length > 0){
       $(".center .biaoqian ul").append(theme_config.bottom_a); 
       const colors = ["#73bbf7", "#e100ff", "#ff67c0", "#36c84c", "#ff9500", "#ff3b30", "#ffcc00"];
       $(".center .biaoqian ul li a").each(function() {
           const randomColor = colors[Math.floor(Math.random() * colors.length)];
           $(this).css("background-color", randomColor);
       });
    }
    //51统计
    if(theme_config.tongji.length == 0){
        $('.tongji').remove();
    }
    //全站变灰
    if(theme_config.mourn == 1){
        $("html").css({"-webkit-filter": "grayscale(100%)","filter": "grayscale(100%)"});
    }
}

//插入分类到列表
function insertCategoryToList(category, list) {
    list.append($('<li>').append($('<a>').attr('href', `#v${category.id}`).html(`<i class="${category.font_icon}"></i>&nbsp;${category.name}`)));
}
//生成列表
function generateListItem(links) {
    let html = ``;
    links.forEach(link => {
        let p = (theme_config.card_style == '0' ? '':'<p>' + (link.description.length > 0 ? link.description : '作者很懒，没有填写描述。' ) + '</p>');
        html += `<li>
					<a href="${link.url}" target="_blank">
						<div class="tabcontentimg">
							<img data-src="${link.ico}" alt="网站1">
						</div>
						<div class="tabcontentms">
							<h2>${link.title}</h2>
							${p}
						</div>
					</a>
				</li>
				`;
    });
    return html;
}

//打开移动侧边栏
function openNav() {
    $('#mySidebar').css("left", "0");
}
//关闭移动侧边栏
function closeNav() {
    $('#mySidebar').css("left", "-100vw");
}

//二级分类切换
function openTab(evt, tabName) {
  // 获取当前节点的父节点 -> 找到 class = tabcontent的节点
  var tabcontent = $(evt.currentTarget).parent().nextAll('.tabcontent');
  // 全部隐藏
  tabcontent.hide();
  // 获取除当前节点外的所有兄弟节点
  $(evt.currentTarget).siblings().removeClass('active');
  $(evt.currentTarget).addClass('active');

  // 获取当前节点的父节点 -> 找到目标节点
  let targetTab = $(evt.currentTarget).parent().nextAll('#' + tabName);
  targetTab.show();
}

//背景音乐相关
if ($('#tp').length > 0) {
    var image = $('#tp');
    var audio = $('#myaudio');
    var isRotating = false; // 图片是否正在旋转
    var isPlaying = false; // 音频是否正在播放
    var rotateInterval; //定时器ID
    //是否自动播放
    if(theme_config.myaudio_autoplay == 1){
       audio[0].play();
    }
    //是否循环播放
    if(theme_config.myaudio_loop == 1){
       audio.attr('loop', 'loop'); 
    }
    //音乐图标点击播放/暂停
    image.on('click', function() {
        if (!isRotating) {
            audio[0].play();
        } else {
            audio[0].pause();
            stop_state();
        }
    });
    // 开始播放
    $('#myaudio').on('play', function() {
        var rotateAngle = 0;
        //创建定时器旋转图标
        rotateInterval = setInterval(function() {
            rotateAngle += 1;
            if (rotateAngle > 360) {
                rotateAngle = 0;
            }
            image.css('transform', 'rotate(' + rotateAngle + 'deg)');
        }, 10);
        //如果播放完毕，则重新播放
        if (audio[0].ended) {
            audio[0].currentTime = 0;
        }
        audio[0].play();
        isRotating = true;
        isPlaying = true;
    });
    // 播放结束
    audio.on('ended', function() {stop_state()});
    // 设停止播放状态
    function stop_state() {
        clearInterval(rotateInterval); // 清除旋转定时器
        image.css('transform', 'rotate(0deg)'); // 重置图标角度
        isRotating = false;
        isPlaying = false;
    }
}

//移除加载动画
function remove_loader() {
    $("#loader").remove(); 
    return;
    //往右移走,效果不满意!
    leftValue = parseInt($('#loader').attr('left') || '0');
    $('#loader').css('left', leftValue + '%');
    leftValue+=2;
    if (leftValue <= 100) {
        $('#loader').attr('left',leftValue)
        setTimeout(remove_loader, 1); 
    }else{
        $("#loader").remove(); 
    }
}

//添加鼠标样式
function init_cursor() {
    $("head").append(`<style>html,body{background-color:#ebecf0;cursor:url(data:image/cur;base64,AAACAAEAICAAAAMAAgCoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAMAAAADAAAABAAAAAQAAAAEAAAAAwAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAFAAAABwAAAAkAAAAKAAAACgAAAAoAAAAIAAAABgAAAAMAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABQAAAAkAAAANAAAAEAAAABIAAAASAAAAEQAAAA4AAAALAAAABwAAAAMAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAUAAAAJAAAADgAAABQAAAAYAAAAGwAAABsAAAAZAAAAFQAAABAAAAAKAAAABQAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAIAAAADAAAABAAAAAUAAAAIAAAADAAAABEAAAAXAAAAHQAAACIAAAAlAAAAJAAAACEAAAAbAAAAFAAAAA0AAAAHAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAABQAAAAcAAAAKAAAADAAAABAAAAAVAAAAGwAAACEAAAAnAAAALAAAAC4AAAAsAAAAJwAAACAAAAAYAAAADwAAAAgAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAYAAAAKAAAADQAAABEAAAAVAAAAGgAAAB8AAAAlAAAAKwAAADEAAAA1AAAANgAAADIAAAAsAAAAJAAAABoAAAARAAAACAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAFAAAACgAAAA8AAAAUAAAAGQAAAB4AAAAkAAAAKgAAAC8AAAA0AAAAOQAAADwAAAA8AAAAOAAAAC8AAAAlAAAAGgAAABAAAAAIAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAgAAAAOAAAAFQAAABsAAAAiAAAAKAAAAC8AAAA0AAAAOAAAADwAAAA/AAAAWQcHB40NDQ2TAQEBaAAAACwAAAAZAAAADwAAAAcAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAACwAAABMAAAAbAAAAIwAAACsAAAAyAAAAOQAAAD0AAABAAAAAQwAAAFwjIyOwoaGhyP////9wcHC/CgoKfwAAAB4AAAANAAAABQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAcAAAAOAAAAFwAAACEAAAAqAAAAMwAAADwAAABCAAAARQAAAEcAAABQEBAQoqenp8n///////////////9mZma4AAAARwAAAAoAAAAEAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAACQAAABIAAAAcAAAAJgAAADEAAAA7AAAAQwAAAEkAAABLAAAASwAAAIFtbW3I/////////////////////46OjrwAAABXAAAACQAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAALAAAAFQAAAB8AAAAqAAAAOwAAAGgAAAB9AAAAfgAAAH0AAACINDQ0vMzMzMr/////////////////////R0dHrgAAADMAAAAIAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAA4AAAAXAAAAIgAAAC4DAwN7V1dXw42NjcqJiYnKhISEypCQkMvFxcXK/////////////////////4iIiL8FBQVwAAAAEgAAAAcAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAADwAAABkAAAAkAAAASjs7O7fX19fI//////////////////////////////////////////+tra3CFBQUkwAAACcAAAAPAAAABwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAARAAAAGwAAACYBAQF3kJCQxv///////////////////////////////////////////////zk5ObAAAABAAAAAFwAAAA4AAAAGAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAABIAAAAdAAAALhkZGZ3IyMjH///////////////////////////////////////////b29vDKysrpAAAACsAAAAUAAAADAAAAAYAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAEwAAAB4AAABAQUFBtOHh4cb///////////////////////////////////////////////9jY2O3AAAARgAAABAAAAAKAAAABAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsAAAAUAAAAHwAAAFZsbGy//////////////////////////////////////////////////////7Ozs70KCgp3AAAADQAAAAcAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAABQAAAAfAAAAbJKSksP//////////////////////////////////////////////////////////zg4OJ8AAAAcAAAABAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAEwAAABwJCQmAtbW1w///////////////////////////////////////////////////////////QEBAowAAAB4AAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAQAAAAHBYWFo7Nzc3B/////////////////////////////////////////////////////4aGhrUGBgZjAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAA4AAAAdJiYmmd7e3r7//////////////////////////////////////////+np6bZ1dXWyCQkJbAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAACgAAACA4ODih//////////////////////////////////////////+/v7+3REREpAICAlEAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAHAAAAIUVFRaT////////////////////////////////a2tq3cHBwsBMTE30AAAApAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAUAAAAkUVFRp//////////////////////d3d22hISEsyUlJY8AAABCAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAgAAACFSUlKm///////////R0dG2fX19siYmJpABAQFLAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGDk5OaGfn5+2WlpaqBkZGYIAAABCAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAgICUQMDA1YAAAAnAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////gD///wAf//4AD//8AA//gAAP/wAAD/4AAA/+AAAP/gAAD/wAAA/8AAAP/AAAH/wAAB/8AAAf/AAAH/wAAB/8AAAf/AAAH/wAAD/8AAA//AAAf/wAAP/8AAH//AAD//wAB//8AB///AB///8B////B//////////////8=),pointer}
a{color:#000000}
a:hover{color:#0889f3;cursor:url(data:image/cur;base64,AAACAAEAICAAAAoAAgCoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAQAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAgAAAAMAAAAEAAAABgAAAAcAAAAIAAAACAAAAAgAAAAGAAAABAAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAQAAAAHAAAACgAAAA4AAAAQAAAAEgAAABMAAAAUAAAAEgAAABAAAAALAAAACQAAAAUAAAADAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAIAAAAGAAAACgAAAA8AAAAVAAAAGQAAABwAAAAfAAAAIAAAACEAAAAfAAAAGwAAABUAAAARAAAADAAAAAgAAAAEAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAABQAAAAsAAAASAAAAGQAAACAAAAAlAAAAKQAAACwAAAAtAAAALgAAACwAAAAnAAAAIAAAABoAAAATAAAADgAAAAgAAAACAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAUAAAAKAAAAEwAAABsAAAAkAAAALQAAADIAAAA2AAAAOAAAADoAAAA6AAAAOAAAADMAAAAsAAAAJAAAABwAAAAUAAAADQAAAAYAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAEAAAACQAAABAAAAAaAAAAJAAAAC4AAAA4AAAAPQAAAEAAAABDAAAARAAAAEQAAABCAAAAPgAAADYAAAAtAAAAJAAAABsAAAARAAAACQAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAcAAAANAAAAFgAAACEAAAAtAAAAOAAAAEEAAABFAAAASAAAAEoAAABLAAAATAAAAEoAAABGAAAAPgAAADUAAAArAAAAIQAAABYAAAAMAAAABQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAACwAAABIAAAAdAAAAKQAAADUAAAA/AAAASAAAAF8AAAB7BAQEkQwMDJwODg6gCQkJmAICAoIAAABVAAAAOwAAADEAAAAnAAAAGwAAABAAAAAHAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAcAAAAPAAAAGAAAACMAAAAwAAAAPgICAlwSEhKYRkZGvoKCgsmoqKjMurq6zL6+vsy1tbXMjIyMyi4uLrMDAwNnAAAANwAAACsAAAAfAAAAEwAAAAkAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAACwAAABQAAAAeAAAAKQAAADoKCgpsSkpKsa6ursr/////////////////////////////////////x8fHylBQULsFBQVrAAAAMQAAACMAAAAXAAAACwAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAYAAAAOAAAAGAAAACIAAAAvBwcHW1BQUKzCwsLJ/////////////////////////////////////8HBwcr/////ycnJyTw8PK8AAABOAAAAJQAAABgAAAANAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAABwAAAA8AAAAZAAAAIwEBATcsLCyVsLCwxv///////////////7q6usr//////////6KiosrMzMzKi4uLyaSkpMn/////p6enxREREYsAAAApAAAAFwAAAAwAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAGAAAADgAAABcAAAAiBgYGY4GBgb//////////////////////dXV1ypqamsr/////hYWFyrGxscq6urrJYGBgyP//////////WFhYuAAAAEYAAAAUAAAACwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAUAAAAMAAAAFQAAAC0qKiqh0NDQxP////////////////////+CgoLKhYWFyv////+Xl5fKoKCgyv////+Li4vH//////////+ioqLBAwMDaAAAABEAAAAJAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAABAAAAAoAAAASAAAAW4GBgb3//////////////////////////4ODg8qEhITK/////6Ojo8mXl5fJ/////////////////////8fHx8ARERF9AAAADwAAAAcAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAABwAAABISEhKGx8fHwP//////////////////////////ra2tyrm5ucn/////yMjIyL+/v8f//////////////////////////yAgIIoAAAAPAAAABQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAAFiUlJZje3t6//////8TExMXMzMzH////////////////////////////////////////////////////////////////JSUliwAAAA4AAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAQFxcXhcXFxb7/////iIiIxLy8vMb////////////////////////////////////////////////U1NS6/////8DAwLkUFBR0AAAABQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAoCAgJHU1NTo4WFhbyAgIDE1NTUxv//////////////////////////////////////////r6+vuklJSa1ubm6bRkZGjgICAjQAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAACwAAABoFBQVCHR0dhImJicD////////////////////////////////Nzc27////////////////JiYmmQQEBDICAgIeAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAALAAAAFQAAACMfHx93rKyswf//////////urq6wf///////////////4eHh7ehoaG3//////////80NDSaAAAAEwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAoAAAATAAAAIjMzM43KysrC//////////9oaGi+ra2tu///////////fHx8rSUlJZxzc3OuVlZWqgUFBVcAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAACQAAABACAgImTExMn////////////////1VVVbycnJy6//////////9NTU2RAAAAMAAAADYAAAApAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAHAAAADQQEBC1oaGir////////////////MzMzrR0dHZheXl6sRUVFoQYGBkkAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAUAAAAKBgYGOISEhLH//////////9PT07sXFxeFAAAAGwAAACcAAAAcAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAYHBwc8kpKSsv//////////sLCwuQUFBWIAAAAFAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwYGBi+EhISs//////////9ycnKuAAAANwAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAgICE0dHR4/FxcW2oqKish0dHXIAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBQUFLxYWFm8MDAxTAQEBDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//4f///AAf//gAB//gAAP/wAAB/8AAAf+AAAH/gAAA/wAAAP8AAAD/AAAA/gAAAP4AAAD+AAAA/gAAAP4AAAD/AAAA/wAAAf+AAAH/gAAD/4AAB/+AAA//gAAf/4AAP/+AAf//gAP//4AH///AD///4D////B////9////////8=),pointer}</style>`); 
}

function load_css(){
    $('head').append(`<style>:root {
    --text: #000;
    --sd: #22222230;
    --s3d: #99999947;
    --card: #efefef55;
    --night-card: #00000030;
    --filters: blur(5px) saturate(1.3);
    --radius:5px;
    --max-width:1200px;
    --border1:1px solid #ffffff26;
    --border2:1px solid #7f7f7f55;
} 
html, body {
    background: url(https://www.dmoe.cc/random.php) !important;
    background-repeat: no-repeat!important;
    background-size: cover!important; 
    background-position: center center!important;
    background-attachment: fixed!important;
}
::-webkit-scrollbar-thumb {
    background: #7f7f7f70 !important;
    background-clip: padding-box !important;
    border-radius: 10px !important;
    box-shadow: none !important;
}
::-webkit-scrollbar-track {
    box-shadow: none !important;
}
/*<!-- 顶部导航栏 -->*/
.header {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    /*box-shadow: none !important; */
    backdrop-filter: var(--filters)!important;
}
/*<!-- 分类内容 -->*/
.fl {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    backdrop-filter: var(--filters)!important;
}
.fl ul li a {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
}
/*<!-- 搜索引擎区块 -->*/
.search-container {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
    backdrop-filter: var(--filters)!important;
    max-width: var(--max-width)!important;
}
.search-container {
    width: 100%;
    border-radius: 0px;
}
#search-tabs {
     width: 100%!important; 
     margin: 20px 0 !important;
}
#search-input {
    box-shadow: none !important;
}
.sstab {
    border: 2px solid lightblue!important;
    /*background-color: var(--card)!important;*/
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
}
/*<!-- 广告位 -->*/
.glyg {
    max-width: var(--max-width)!important;
}
.pmd {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
    backdrop-filter: var(--filters)!important;
}
.pmd {
    width: 100%;
    border-radius: 0px;
}
.ggw0 {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: 5px !important;
    backdrop-filter: var(--filters)!important;
}
.gg-list li a {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
}
/*<!-- 横幅广告 -->*/
.ggw1 {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
    backdrop-filter: var(--filters)!important;
    max-width: var(--max-width)!important;
}
/*<!-- main -->*/
.main {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
    backdrop-filter: var(--filters)!important;
    max-width: var(--max-width)!important;
}
.cebianlan {
    box-shadow: none !important;
}
.cebianlan ul li {
    height: 45px!important;
    line-height: 45px!important;
}
.cebianlan ul li a {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
    height: 45px!important;
}
.main-list {
    box-shadow: none !important;
}
.biaoti {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    /*box-shadow: none !important;*/
    border-radius: var(--radius) !important;
}
.tab {
    box-shadow: none !important;
}
.tablinks {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    /*box-shadow: none !important;*/
}
/*.tabcontent ul li {*/
/*    height: 90px;*/
/*}*/
.tabcontent ul li a {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
}
.tabcontentms p {
    color: #626a7b !important;
}
/*<!-- 文章区块 -->*/
.wenzhang {
    backdrop-filter: var(--filters);
    max-width: var(--max-width)!important;
}
.wenzhangnr {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
}
.wzbt {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius)!important;
}
.wz-list {
    padding: 0px!important; 
    box-shadow: none !important;
}
.wzk {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
}
.yqlj {
    box-shadow: none !important;
    background-color: var(--card)!important;
    border-radius: var(--radius) !important;
    margin: 20px 0 !important;
}
.yqlj ul li a {
    /*color:var(--text)!important;*/
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
}
/*<!-- 底部 -->*/
.foot {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    border-radius: var(--radius) !important;
    backdrop-filter: var(--filters)!important;
    max-width: var(--max-width)!important;
    
}
.footer {
    box-shadow: none !important;
}
.left a {
    color:var(--text);
}
.banquan a {
    color:var(--text);
}
.right ul li a {
    color:var(--text);
}

/* 移动端侧边栏 */
.cblzc {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
    backdrop-filter: var(--filters)!important;
}
.cblfl {
    box-shadow: none !important;
}
.cblfl ul li {
    background-color: var(--card)!important;
    box-shadow: 0 1.5px 2px var(--s3d), 0px 1px 6px var(--sd) !important;
}

/*边框*/
/*.sstab,*/
.header,
/*.cblfl,*/
.cblzc,
.cblfl ul li,
.search-container,
.fl,
.fl ul li a,
.cebianlan,
.cebianlan ul li a,
.pmd,
.ggw0,
.gg-list li a,
.ggw1,
.main,
.main-list,
.biaoti,
/*.tab,*/
.tablinks,
.tabcontent ul li a,
.wenzhangnr,
.wzbt,
.wzlm,
.wzlm ul li a,
/*.wz-list,*/
.wzk,
/*::-webkit-scrollbar-thumb,*/
/*::-webkit-scrollbar-track,*/
.foot,
/*.footer,*/
.tongji,
.tongjinr,
.yqlj,
.yqlj ul li a{
    /*box-shadow: none;*/
    border: var(--border1)!important;
}
/*夜间模式*/
/*.night .sstab,*/
.night .header,
.night .cblfl,
.night .cblzc,
.night .cblfl ul li,
.night .search-container,
.night .fl,
.night .fl ul li a,
.night .cebianlan,
.night .cebianlan ul li a,
.night .pmd,
.night .ggw0,
.night .gg-list li a,
.night .ggw1,
.night .main,
.night .main-list,
.night .biaoti,
.night .tab,
.night .tablinks,
.night .tabcontent ul li a,
.night .wenzhangnr,
.night .wzbt,
.night .wzlm,
.night .wzlm ul li a,
.night .wz-list,
.night .wzk,
.night ::-webkit-scrollbar-thumb,
.night ::-webkit-scrollbar-track,
.night .foot,
.night .footer,
.night .tongji,
.night .tongjinr,
.night .yqlj,
.night .yqlj ul li a{
    box-shadow: none;
    border: var(--border2)!important;
}
/*边框*/
.night .cblfl,
.night .tab,
.night .wz-list,
.night ::-webkit-scrollbar-thumb,
.night ::-webkit-scrollbar-track,
.night .footer{
    border: none!important;
}
.night .header,
.night .fl,
.night .fl ul li a ,
.night .search-container ,
.night .pmd,
.night .ggw0,
.night .gg-list li a,
.night .ggw1,
.night .main,
.night .cebianlan ul li a,
.night .biaoti,
.night .tablinks,
.night .tabcontent ul li a,
.night .wenzhangnr,
.night .wzbt,
.night .wzk,
.night .yqlj,
.night .yqlj ul li a,
.night .foot,
.night .cblzc,
.night .cblfl ul li{
    background-color: var(--night-card)!important;
}
.night h3, .night a, .night button, .night .tongjinr,.night p{
    color: white!important;
}</style>`);
}