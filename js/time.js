(function(){  
	//cavas元素对象  
	var canvas=null;  
	//canvas的3d上下文  
	var ctx=null;  
	//cavan的尺寸  
	var cw=0;  
	var ch=0;  
	/**  
	 * 页面导入时的事件处理  
	 */  
	window.addEventListener("load",function(){  
		canvas=document.getElementById("time");  
		ctx=canvas.getContext("2d");  
		cw=parseInt(canvas.width);  
		ch=parseInt(canvas.height);  
		ctx.translate(cw/2, ch/2);  
		//绘制时钟  
		draw_watch();  
	},false);    
	/**  
	 * 绘制时钟  
	 */  
	function draw_watch(){  
		//清空Canvas  
		ctx.clearRect(-cw/2,-ch/2,cw,ch);  
		//计算针的最大长度  
		var len=Math.min(cw, ch)/2;  
		//绘制刻度盘  
		var tlen=len*0.85;  
		ctx.font="14px 'Arial'";  
		ctx.fillStyle="black";  
		ctx.textAlign="center";  
		ctx.textBaseLine="middle";  
		for(var i=0; i<12; i++){  
			var tag1=Math.PI*2*(3-i)/12;  
			var tx=tlen * Math.cos(tag1);  
			var ty=-tlen * Math.sin(tag1);  
			ctx.fillText(12-i,tx,ty+5);  
		}
		//获取当前的时分秒  
		var d=new Date();  
		var h=d.getHours();  
		var m=d.getMinutes();  
		var s=d.getSeconds();  
		if(h >12 ){  
			h=h-12;  
		}
		//绘制时针  
		var angle1 = Math.PI * 2 *(3 - (h + m/60))/12;  
		var length1=len * 0.55;  
		var width1=5;  
		var color1="#000000";  
		drawhand(angle1,length1,width1,color1);  
		//绘制分针  
		var angle2 = Math.PI * 2 *(15 - (m+ s/60))/60;  
		var length2=len * 0.72;  
		var width2=3;  
		var color2="#555555";  
		drawhand(angle2,length2,width2,color2);  
		//绘制秒针  
		var angle3 = Math.PI * 2 *(15 - s)/60;  
		var length3=len * 0.82;  
		var width3=1;  
		var color3="#aa0000";  
		drawhand(angle3,length3,width3,color3);  
		//设置timer  
		setTimeout(draw_watch,1000);  
	}  
	/**  
	 * 针绘制函数  
	 */  
	function drawhand(angle,len,width,color){  
		//计算针端的坐标  
		var x=len*Math.cos(angle);  
		var y=-len * Math.sin(angle);  
		//绘制针  
		ctx.strokeStyle=color;  
		ctx.lineWidth=width;  
		ctx.lineCap="round";  
		ctx.beginPath();  
		ctx.moveTo(0,0);  
		ctx.lineTo(-x,y);  
		ctx.stroke();  
	}  
})();

