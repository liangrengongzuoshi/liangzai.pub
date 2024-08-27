
$(function(){
	//导航菜单
	$(".head").find("a").click(function(){
		$(".head").find("li").removeClass("focus");
		$(this).parent("li").addClass("focus");
	});
	
	//提交表单
	$("#myform").Validform({
		btnSubmit:".dlg_btn_sure",
		//btnReset:".dlg_btn_cancle",
		tiptype:function(msg,o,cssctl){
			var objtip=$(".Validform_checktip");
			cssctl(objtip,o.type);
			objtip.text(msg);
		},
	});
	
	//左侧菜单悬浮
	var topMain = 300;
	var nav=$(".body-left");	
	$(window).scroll(function(){
		if($(window).scrollTop()>topMain){
			var a = $(window).width();
			var b = $(".body").width();
			var w = 0;
			if(a > b){
				w = ((a-b)/2);
			}
			$(".login").hide();
			nav.addClass("lesson-box-scro").css("left",w+"px");
		}else{
			nav.css("transition","none").removeClass("lesson-box-scro");
			$(".login").show();
		}
	});
	
	//返回顶部
	var height = 300;
	var gotop = $(".actGotop");
	$(window).scroll(function(){
		if($(window).scrollTop() > height){
			gotop.addClass("actGotopShow");
		}else{
			gotop.removeClass("actGotopShow");
		}
	});
	var speed = 500;	//滚动速度
	$(".actGotop a").click(function () {
		$("body,html").animate({ scrollTop: 0 }, speed);
	});


	//表情回复
	$(".qq-bq").find("li").click(function(){
		//.clone() 是复制一份   否则原来的东西会被剪贴过来。。
		var img = $(this).find("img").clone();
		$(".text-show").append(img);
		$("#MyQQ").toggle("fast");
	});
	$(".btn-fabu").click(function(){
		var str = document.getElementById("text-show-id").innerHTML;
		$("#hid-message").val(str);
		$("#myform").submit();
	});
	//表情栏 标签切换
	$(".list-bq").find("li").click(function(){
		$(".list-bq").find("li").removeClass("hover");
		$(this).addClass("hover");
		$(".qq-bq").hide();
		var to = $(this).attr("to");
		$("#"+to).show();
	});

	
	//弹出框弹出。
	$(".less-movie").find("li").click(function(){
		var left = ($(window).width() - $(".move_dialog").width()) / 2;
		var top = ($(window).height() - $(".move_dialog").height()) / 2;
		$(".move_dialog").show().css({
			left:left,
			top:top,
			//position:fixed
		});
		$(".dlg_shade").css("opacity","0.3").show();
	});
	//弹出框 鼠标点击  窗口移出
	$(".dlg_btn").click(function(){
		$(".move_dialog").hide();
		$(".dlg_shade").hide();
	});
	//弹出窗 鼠标移到上面 特效。
	$(".dlg_btn").hover(function(){
		$(this).addClass("animated flash");
	},function(){
		$(this).removeClass("flash");
	});


	//延时加载
	$(".kecheng-box").find("img").lazyload({ 
		placeholder: "images/lazyload.gif", 
		effect: "fadeIn" 
	});
	

});
