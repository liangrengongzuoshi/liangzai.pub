
$(function(){
	//�����˵�
	$(".head").find("a").click(function(){
		$(".head").find("li").removeClass("focus");
		$(this).parent("li").addClass("focus");
	});
	
	//�ύ��
	$("#myform").Validform({
		btnSubmit:".dlg_btn_sure",
		//btnReset:".dlg_btn_cancle",
		tiptype:function(msg,o,cssctl){
			var objtip=$(".Validform_checktip");
			cssctl(objtip,o.type);
			objtip.text(msg);
		},
	});
	
	//���˵�����
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
	
	//���ض���
	var height = 300;
	var gotop = $(".actGotop");
	$(window).scroll(function(){
		if($(window).scrollTop() > height){
			gotop.addClass("actGotopShow");
		}else{
			gotop.removeClass("actGotopShow");
		}
	});
	var speed = 500;	//�����ٶ�
	$(".actGotop a").click(function () {
		$("body,html").animate({ scrollTop: 0 }, speed);
	});


	//����ظ�
	$(".qq-bq").find("li").click(function(){
		//.clone() �Ǹ���һ��   ����ԭ���Ķ����ᱻ������������
		var img = $(this).find("img").clone();
		$(".text-show").append(img);
		$("#MyQQ").toggle("fast");
	});
	$(".btn-fabu").click(function(){
		var str = document.getElementById("text-show-id").innerHTML;
		$("#hid-message").val(str);
		$("#myform").submit();
	});
	//������ ��ǩ�л�
	$(".list-bq").find("li").click(function(){
		$(".list-bq").find("li").removeClass("hover");
		$(this).addClass("hover");
		$(".qq-bq").hide();
		var to = $(this).attr("to");
		$("#"+to).show();
	});

	
	//�����򵯳���
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
	//������ �����  �����Ƴ�
	$(".dlg_btn").click(function(){
		$(".move_dialog").hide();
		$(".dlg_shade").hide();
	});
	//������ ����Ƶ����� ��Ч��
	$(".dlg_btn").hover(function(){
		$(this).addClass("animated flash");
	},function(){
		$(this).removeClass("flash");
	});


	//��ʱ����
	$(".kecheng-box").find("img").lazyload({ 
		placeholder: "images/lazyload.gif", 
		effect: "fadeIn" 
	});
	

});
