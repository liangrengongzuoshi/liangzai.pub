
$(function(){
	//�����˵�
	$(".head").find("a").click(function(){
		$(".head").find("li").removeClass("focus");
		$(this).parent("li").addClass("focus");
	});
	
	//�ύ��
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

	//����ظ�
	$(".qq-bq").find("li").click(function(){
		//.clone() �Ǹ���һ��   ����ԭ���Ķ����ᱻ������������
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
	//������ ��ǩ�л�
	$(".list-bq").find("li").click(function(){
		$(".list-bq").find("li").removeClass("hover");
		$(this).addClass("hover");
		$(".qq-bq").hide();
		var to = $(this).attr("to");
		$("#"+to).show();
	});

	//���ض���
	var height = 300;
	var gotop = $(".plane");
	$(window).scroll(function(){
		if($(window).scrollTop() > height){
			gotop.show();
		}else{
			gotop.hide();
		}
	});
	var speed = 500;	//�����ٶ�
	$(".actGotop").click(function () {
		$("body,html").animate({ scrollTop: 0 }, speed);
	});
	
});
