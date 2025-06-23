//天气插件
WIDGET={"CONFIG":{"modules":"12043","background":"5","tmpColor":"FFFFFF","tmpSize":"16","cityColor":"FFFFFF","citySize":"18","aqiColor":"FFFFFF","aqiSize":"16","weatherIconSize":"24","alertIconSize":"18","padding":"0px 0px 0px 0px","shadow":"0","language":"auto","fixed":"false","vertical":"center","horizontal":"center","right":"0","top":"0","key":"9d714f8dd6b94c7696f9cea8dc3ed1c5"}}


// //输入框获取焦点
// window.onload= function () {
//     var text=document.getElementById('search-text');
// 	text.focus();

// } 

//关键词sug
$(function() {
    //当键盘键被松开时发送Ajax获取数据
    $('#search-text').keyup(function() {
        var keywords = $(this).val();
        if (keywords == '') { $('#word').hide(); return };
        $.ajax({
            url: 'https://suggestion.baidu.com/su?wd=' + keywords,
            dataType: 'jsonp',
            jsonp: 'cb', //回调函数的参数名(键值)key
            // jsonpCallback: 'fun', //回调函数名(值) value
            beforeSend: function() {
                // $('#word').append('<li>正在加载。。。</li>');
            },
            success: function(data) {
                $('#word').empty().show();
                if (data.s == '') {
                    // $('#word').append('<div class="error">暂无  ' + keywords + ' 相关索引</div>');
                    $('#word').empty();
                    $('#word').hide();
                }
                $.each(data.s, function() {
                    $('#word').append('<li>' + this + '</li>');
                })
            },
            error: function() {
                $('#word').empty().show();
                //$('#word').append('<div class="click_work">Fail "' + keywords + '"</div>');
                $('#word').hide();
            }
        })
    })


    //点击搜索数据复制给搜索框
    $(document).on('click', '#word li', function() {
        var word = $(this).text();
        $('#search-text').val(word);
        $('#word').empty();
        $('#word').hide();
        //$("form").submit();
         $('.submit').trigger('click');//触发搜索事件
    })
    $(document).on('click', '.container,.banner-video,nav', function() {
        $('#word').empty();
        $('#word').hide();
    })
})


$(function(){
    $('.type-right').click(function(e){
        $('#type-left').toggleClass('showListType');
        e.stopPropagation();  //阻止冒泡
    });
    
    $(document).click(function(e){
    var con = $('.type-left');
    if(!con.is(e.target)){ 
        con.toggleClass('showListType',false);
    }
    });
    $(document).click(function(e){
    var con = $('.collapse');
    if(!con.is(e.target)){ 
        con.toggleClass('show',false);
    }
    });
    $('.type-left ul li').click(function(){
        $(this).addClass('active').siblings('li').removeClass('active');
        $('.type-left').toggleClass('showListType');
        var lylme_tag = '#'+$(this).attr("data-lylme");
        $('html,body').animate({scrollTop:$(lylme_tag).offset().top},500);
        
    })
})

//点击空白处关闭导航

//显示日期和时间
function show() {
	var date = new Date();
	var y = date.getFullYear();     //获取年份  
    var m =date.getMonth()+1;   //获取月份  返回0-11  
    var d = date.getDate(); // 获取日  
    var w = date.getDay();   //获取星期几  返回0-6   (0=星期天) 
    var ww = ' 星期'+'日一二三四五六'.charAt(new Date().getDay()) ;//星期几
	var format = [
		("0" + date.getHours()).substr(-2), ("0" + date.getMinutes()).substr(-2)
	].join(":");
	
    document.getElementById("show_date").innerHTML =  y+"年"+m+"月"+d+"日 "+ww; 
	document.getElementById("show_time").innerHTML = format;
	return show;
}
setInterval(show(), 500);
 

!
function() {
	function g() {
		h(), i(), j(), k()
	}
	function h() {
		d.checked = s()
	}
	function i() {
		var a = document.querySelector('input[name="type"][value="' + p() + '"]');
		a && (a.checked = !0, l(a))
	}
	function j() {
		v(u())
	}
	function k() {
		w(t())
	}
	function l(a) {
		for (var b = 0; b < e.length; b++) e[b].classList.remove("s-current");
		a.parentNode.parentNode.parentNode.classList.add("s-current")
	}
	function m(a, b) {
		window.localStorage.setItem("superSearch" + a, b)
	}
	function n(a) {
		return window.localStorage.getItem("superSearch" + a)
	}
	function o(a) {
		f = a.target, v(u()), w(a.target.value), m("type", a.target.value), c.focus(), l(a.target)
	}
	function p() {
		var b = n("type");
		return b || a[0].value
	}
	function q(a) {
		m("newWindow", a.target.checked ? 1 : -1), x(a.target.checked)
	}
	function r(a) {
		return a.preventDefault(), "" == c.value ? (c.focus(), !1) : (w(t() + c.value), x(s()), s() ? window.open(b.action, +new Date) : location.href = b.action, void 0)
	}
	function s() {
		var a = n("newWindow");
		return a ? 1 == a : !0
	}
	function t() {
		return document.querySelector('input[name="type"]:checked').value
	}
	function u() {
		return document.querySelector('input[name="type"]:checked').getAttribute("data-placeholder")
	}
	function v(a) {
		c.setAttribute("placeholder", a);
	}
	function w(a) {
		b.action = a
	}
	function x(a) {
		a ? b.target = "_blank" : b.removeAttribute("target")
	}
	var y, a = document.querySelectorAll('input[name="type"]'),
		b = document.querySelector("#super-search-fm"),
		c = document.querySelector("#search-text"),
		c = document.querySelector("#search-text"),
		d = document.querySelector("#set-search-blank"),
		e = document.querySelectorAll(".search-group"),
		f = a[0];
	for (g(), y = 0; y < a.length; y++) a[y].addEventListener("change", o);
	d.addEventListener("change", q), b.addEventListener("submit", r)
	 
}();

//返回顶部
(function(a){a.fn.scrollToTop=function(c){var d={speed:800};c&&a.extend(d,{speed:c});return this.each(function(){var b=a(this);a(window).scroll(function(){100<a(this).scrollTop()?b.fadeIn():b.fadeOut()});b.click(function(b){b.preventDefault();a("body, html").animate({scrollTop:0},d.speed)})})}})(jQuery);$(function(){ahtml='<a href="javascript:void(0)" id="toTop" style="display:none;position:fixed;bottom:66px;right:10px;width:48px;height:48px;background-image:url(\'data:image/svg+xml;base64,PHN2ZyB0PSIxNjU0OTM5MTkxNTY0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjEyMTgiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0iTTUxMyAxMDMuN2MtMjI2LjEgMC00MDkuNCAxODMuMy00MDkuNCA0MDkuNFMyODYuOSA5MjIuNiA1MTMgOTIyLjZzNDA5LjQtMTgzLjMgNDA5LjQtNDA5LjRTNzM5LjEgMTAzLjcgNTEzIDEwMy43eiBtMTUzLjUgMzY0LjdjLTUuMiA1LjMtMTIuMSA3LjktMTkgNy45cy0xMy44LTIuNi0xOS03LjlMNTQ1LjEgMzg1YzAgMC40IDAuMSAwLjcgMC4xIDEuMVY3MDVjMCAxMS4xLTUuNyAyMC45LTE0LjQgMjYuNi00LjcgNC4yLTEwLjkgNi43LTE3LjcgNi43LTYuOCAwLTEzLTIuNS0xNy43LTYuNy04LjctNS43LTE0LjQtMTUuNS0xNC40LTI2LjZWMzg2LjFjMC0wLjQgMC0wLjcgMC4xLTEuMWwtODMuNCA4My40Yy0xMC41IDEwLjUtMjcuNSAxMC41LTM4IDBzLTEwLjUtMjcuNSAwLTM4TDQ5NCAyOTUuOWMxMC41LTEwLjUgMjcuNS0xMC41IDM4IDBsMTM0LjUgMTM0LjVjMTAuNSAxMC40IDEwLjUgMjcuNSAwIDM4eiIgZmlsbD0iIzE1NzJlZiIgcC1pZD0iMTIxOSI+PC9wYXRoPjwvc3ZnPg==\');z-index:999;opacity:0.9;"></a>';$("body").append(ahtml);$("#toTop").scrollToTop(300);});

//时间代码
window.addEventListener("DOMContentLoaded",() => {
	const clock = new ProgressClock("#clock");
});

class ProgressClock {
	constructor(qs) {
		this.el = document.querySelector(qs);
		this.time = 0;
		this.updateTimeout = null;
		this.ringTimeouts = [];
		this.update();
	}
	getDayOfWeek(day) {
		switch (day) {
			case 1:
				return "星期一";
			case 2:
				return "星期二";
			case 3:
				return "星期三";
			case 4:
				return "星期四";
			case 5:
				return "星期五";
			case 6:
				return "星期六";
			default:
				return "星期天";
		}
	}
	getMonthInfo(mo,yr) {
		switch (mo) {
			case 1:
				return { name: "2月 -", days: yr % 4 === 0 ? 29 : 28 };
			case 2:
				return { name: "3月 -", days: 31 };
			case 3:
				return { name: "4月 -", days: 30 };
			case 4:
				return { name: "5月 -", days: 31 };
			case 5:
				return { name: "6月 -", days: 30 };
			case 6:
				return { name: "7月 -", days: 31 };
			case 7:
				return { name: "8月 -", days: 31 };
			case 8:
				return { name: "9月 -", days: 30 };
			case 9:
				return { name: "10月 -", days: 31 };
			case 10:
				return { name: "11月 -", days: 30 };
			case 11:
				return { name: "12月 -", days: 31 };
			default:
				return { name: "1月 -", days: 31 };
		}
	}
	update() {
		this.time = new Date();

		if (this.el) {
			// date and time
			const dayOfWeek = this.time.getDay();
			const year = this.time.getFullYear();
			const month = this.time.getMonth();
			const day = this.time.getDate();
			const hr = this.time.getHours();
			const min = this.time.getMinutes();
			const sec = this.time.getSeconds();
			const dayOfWeekName = this.getDayOfWeek(dayOfWeek);
			const monthInfo = this.getMonthInfo(month,year);
			const m_progress = sec / 60;
			const h_progress = (min + m_progress) / 60;
			const d_progress = (hr + h_progress) / 24;
			const mo_progress = ((day - 1) + d_progress) / monthInfo.days;
			const units = [
				{
					label: "w",
					value: dayOfWeekName
				},
				{
					label: "mo",
					value: monthInfo.name,
					progress: mo_progress
				},
				{
					label: "d", 
					value: day,
					progress: d_progress
				},
				{
					label: "h", 
					value: hr > 12 ? hr - 12 : hr,
					progress: h_progress
				},
				{
					label: "m", 
					value: min < 10 ? "0" + min : min,
					progress: m_progress
				},
				{
					label: "s", 
					value: sec < 10 ? "0" + sec : sec
				},
				{
					label: "ap",
					value: hr > 12 ? "下午" : "上午"
				}
			];

			// flush out the timeouts
			this.ringTimeouts.forEach(t => {
				clearTimeout(t);
			});
			this.ringTimeouts = [];

			// update the display
			units.forEach(u => {
				// rings
				const ring = this.el.querySelector(`[data-ring="${u.label}"]`);

				if (ring) {
					const strokeDashArray = ring.getAttribute("stroke-dasharray");
					const fill360 = "progress-clock__ring-fill--360";

					if (strokeDashArray) {
						// calculate the stroke
						const circumference = +strokeDashArray.split(" ")[0];
						const strokeDashOffsetPct = 1 - u.progress;

						ring.setAttribute(
							"stroke-dashoffset",
							strokeDashOffsetPct * circumference
						);

						// add the fade-out transition, then remove it
						if (strokeDashOffsetPct === 1) {
							ring.classList.add(fill360);

							this.ringTimeouts.push(
								setTimeout(() => {
									ring.classList.remove(fill360);
								}, 600)
							);
						}
					}
				}

				// digits
				const unit = this.el.querySelector(`[data-unit="${u.label}"]`);

				if (unit)
					unit.innerText = u.value;
			});
		}

		clearTimeout(this.updateTimeout);
		this.updateTimeout = setTimeout(this.update.bind(this),1e3);
	}
}

//幻灯片
$(document).ready(function(){
	// Set options
	var speed = 500;			// Fade speed
	var autoSwitch = true;		// Auto slider options
	var autoSwitchSpeed = 4000;	// Auto slider speed
	var hoverPause = true;	// Pause auto slider on hover
	var keyPressSwitch = true;	// Key press next/prev
	
	// Add initial active class
	$('.slide').first().addClass('active');
	
	// Hide all slides
	$('.slide').hide();
	
	// Show first slide
	$('.active').show();
		
	// Switch to next slide
	function nextSlide(){
		$('.active').removeClass('active').addClass('oldActive');
		if($('.oldActive').is(':last-child')){
			$('.slide').first().addClass('active');
		} else {
			$('.oldActive').next().addClass('active');
		}
		$('.oldActive').removeClass('oldActive');
		$('.slide').fadeOut(speed);
		$('.active').fadeIn(speed);
	}
	
	// Switch to prev slide
	function prevSlide(){
		$('.active').removeClass('active').addClass('oldActive');
		if($('.oldActive').is(':first-child')){
			$('.slide').last().addClass('active');
		} else {
			$('.oldActive').prev().addClass('active');
		}
		$('.oldActive').removeClass('oldActive');
		$('.slide').fadeOut(speed);
		$('.active').fadeIn(speed);
	}

	// Key press event handler
	if(keyPressSwitch === true){
		$("body").keydown(function(e){
			if(e.keyCode === 37){
		    	nextSlide();
		  	} else if(e.keyCode === 39){
		    	prevSlide();
		  	}
		});
	}

	// Next handler
	$('#next').on('click', nextSlide);
	
	// Prev handler
	$('#prev').on('click', prevSlide);
	
	// Auto slider handler
	if(autoSwitch === true){
		var interval = null;
		interval = window.setInterval(function(){nextSlide();},autoSwitchSpeed);
	}

	// Stop and start on hover
	if(autoSwitch === true && hoverPause === true){
		$('#slider,#prev,#next').hover(function() {
		    window.clearInterval(interval);    
		}, function() {
		    interval = window.setInterval(function(){nextSlide();},autoSwitchSpeed);
		});
	}

	// Slider hover class handler
	$('#sliderContainer').hover(function() {
	    $('#sliderContainer').addClass('sliderHovered');
	}, function() {
	    $('#sliderContainer').removeClass('sliderHovered');
	});

});
