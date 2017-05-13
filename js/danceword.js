
var danceword={
	interval:60,
	loop:false,
	isComeHere:function(obj){
		var h1 = document.body.scrollTop;
		if (!/Chrome|Safari/.test(navigator.userAgent)) {
			h1 = document.documentElement.scrollTop;
		}
		var h2 = $(window).height();
		return (h1 + h2 - $(obj).offset().top) >= $(obj).height();
	},
	isVisible:function(obj){
		var h1 = document.body.scrollTop;
		if (!/Chrome|Safari/.test(navigator.userAgent)) {
			h1 = document.documentElement.scrollTop;
		}
		var h2 = $(window).height();
		return h1 + h2 - $(obj).offset().top >= $(obj).height() && $(obj).offset().top + $(obj).height() >= h1;
	},
	showCore:function(){
		var me=this;
		if(!me.loop){
			$("[class^='danceWord']:not(.past)").each(function(){
				var tmp=$.trim($(this).text());
				var h='';
				for(var i in tmp){
					h += "<span>"+tmp[i]+"</span>";
				}
				h=h.replace(/<\/span><span>([\，\,\。\.\!\！\?\？])/g,"$1");
				$(this).html(h);
			});
			$("[class^='danceWord']:not(.past)").each(function(){
				var m1=this;
				var l=$(this).text().length;
				if(me.isComeHere(m1)){
					$(m1).find("span").each(function(k,v){
						var me2=this;
						setTimeout(function(){$(me2).addClass('ele')},(k+1)*me.interval);
					});
					setTimeout(function(){
						$(m1).html($(m1).text());
					},l*me.interval+1000);
					$(m1).addClass('past');
				}
			});
		}else{
			$("[class^='danceWord']").each(function(){
				var m1=this;
				var l=$(this).text().length;
				if(!me.isVisible(m1)){
					$(m1).removeClass('past');
					var tmp=$.trim($(m1).text());
					var h='';
					for(var i in tmp){
						h += "<span>"+tmp[i]+"</span>";
					}
					h=h.replace(/<\/span><span>([\，\,\。\.\!\！\?\？])/g,"$1");
					$(m1).html(h);
				}
				if(me.isVisible(m1)&&!$(m1).hasClass('past')){
					var tmp=$.trim($(m1).text());
					var h='';
					for(var i in tmp){
						h += "<span>"+tmp[i]+"</span>";
					}
					h=h.replace(/<\/span><span>([\，\,\。\.\!\！\?\？])/g,"$1");
					$(m1).html(h).addClass('past');
					$(m1).find("span").each(function(k,v){
						var me2=this;
						setTimeout(function(){$(me2).addClass('ele')},(k+1)*me.interval);
					});
					setTimeout(function(){
						$(m1).html($(m1).text());
					},l*me.interval+1000);
				};
			});
		}
		if(/MSIE/.test(navigator.userAgent)||navigator.userAgent.indexOf("Trident/7.0;")>-1){
			$('[class^="danceWord"] span').css('display','inline');
		}
	},
	init:function(a){
		var me=danceword;
		if(typeof a=='object'){
			$.extend(me,a);
		}
		me.showCore();
		window.onscroll=function(){
			me.showCore();
		}
	}
};
	
window.onload=danceword.init;

