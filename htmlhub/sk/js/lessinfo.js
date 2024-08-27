
$(function(){
	//导航菜单
	$(".head").find("a").click(function(){
		$(".head").find("li").removeClass("focus");
		$(this).parent("li").addClass("focus");
	});
	
	//提交表单
	$("#myform").Validform({
		tiptype:2,
		btnSubmit:".dlg_btn_sure",
		//btnReset:".dlg_btn_cancle",
		tiptype:function(msg,o,cssctl){
			var objtip=$(".Validform_checktip");
			cssctl(objtip,o.type);
			objtip.text(msg);
		},
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
		alert(str);
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

	//返回顶部
	var height = 300;
	var gotop = $(".plane");
	$(window).scroll(function(){
		if($(window).scrollTop() > height){
			gotop.show();
		}else{
			gotop.hide();
		}
	});
	var speed = 500;	//滚动速度
	$(".actGotop").click(function () {
		$("body,html").animate({ scrollTop: 0 }, speed);
	});
	
});
