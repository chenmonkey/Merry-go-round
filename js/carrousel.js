//封装插件
;(function($){/*前面加分号是为了规避在之前引入的脚本未封闭报错*/
	
	var Carrousel=function(poster){
		var self=this;
		//保存单个旋转木马对象
		this.poster=poster;
		//保存广告指针区域
		this.itemMain=poster.find("ul.list");
		//保存左右切换按钮
		this.leftBtu=poster.find("div.left");
		this.rightBtu=poster.find("div.right");
		//保存幻灯片个数
		this.items=poster.find("li.item");
		/*若幻灯片是偶数个，则克隆第一张幻灯片，将它放置最后*/
		if(this.items.length%2==0){
			this.itemMain.append(this.items.eq(0).clone());
			this.items=this.itemMain.children();
		}
		//保存幻灯片第一帧
		this.firstItem=this.items.first();
		//幻灯片最后一帧
		this.lastItem=this.items.last();
		this.rotateFlag=true;//旋转标识
		
		
		//默认配置参数
		this.setting={
			"width":700,//幻灯片宽度
			"height":166,//幻灯片高度
			"phWidth":540,//幻灯片第一帧宽度
			"phHeight":166,//幻灯片第一帧高度
			"scale":0.9,//图片显示比例关系
			"speed":1000,//轮播速度
			"autoPlay":false,//是否自动播放
			"delay":2000,//播放间隔时间
			"verticalAlign":"middle"//top bottom
		};
		$.extend(this.setting,this.getSetting());//扩展配置参数属性，第二个对象覆盖第一个对象
		
		//设置配置参数值
		this.setSettingValue();
		
		//设置剩余帧
		this.setRestPic();
		
		//左旋转所有帧的按钮事件
		this.leftBtu.click(function(){
			if(self.rotateFlag){
				self.rotateFlag=false;
				self.carrouseRotate("left");//旋转
			}						
		});
		//右旋转所有帧的按钮事件
		this.rightBtu.click(function(){
			if(self.rotateFlag){
				self.rotateFlag=false;
			    self.carrouseRotate("right");//旋转	
			 }
		});
		
		//是否开启自动播放
		if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function(){
				window.clearInterval(self.timer);
			},function(){
				
			});
		}
		
	
	};	
	
	Carrousel.prototype={
				
		//获取人工配置参数
		getSetting:function(){
			var setting=this.poster.attr("data-setting");
			if(setting&&setting!=""){//表示已有人工配置参数
				return $.parseJSON(setting);
			}else{
				return {};//返回一个空对象
			}
		},
		
		//设置配置参数值去控制基本的宽度高度
		setSettingValue:function(){
			//main区域的宽高
			this.poster.css({
				width:this.setting.width,
				height:this.setting.height
			});
			//ul区域的宽高
			this.itemMain.css({
				width:this.setting.width,
				height:this.setting.height
			});
			//计算左右切换按钮宽高、z-index
			var w=(this.setting.width-this.setting.phWidth)/2;
			//alert(this.items.length/2);
			this.leftBtu.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.items.length/2)//向上取整
			});
			this.rightBtu.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.items.length/2)
			});
			//计算幻灯片第一帧的位置刚好在左右按钮之间的位置、z-index、宽高
			this.firstItem.css({
				width:this.setting.phWidth,
				height:this.setting.phHeight,
				left:w,
				zIndex:Math.floor(this.items.length/2)//向下取整
			});
		},
		
		//设置剩余帧的位置关系
		setRestPic:function(){
			var self=this;
			var restItems=this.items.slice(1),//除第一帧之外剩余的图片（长度为4）
			    averLength=restItems.length/2,//左右两边平均剩余帧数的长度
			    rightRest=restItems.slice(0,averLength),//右边剩余帧数的长度为2
			    leftRest=restItems.slice(averLength),//左边剩余帧数的长度为2			    
                level=Math.floor(this.items.length/2);//帧层级关系,为2

            //设置右边帧的位置关系、宽高、top
            var rw=this.setting.phWidth,//右边第一帧宽度
                rh=this.setting.phHeight,//右边第一帧高度
                gap=((this.setting.width-this.setting.phWidth)/2)/level;//帧与帧之间间隙的宽度
            
            var firstLeft=(this.setting.width-this.setting.phWidth)/2;//第一帧距离左按钮的宽度,即left值
            var fixOffsetLeft=firstLeft+rw
            
            rightRest.each(function(i){
            	level--;
            	rw=rw*self.setting.scale;//右边每一帧自身宽度
            	rh=rh*self.setting.scale;//右边每一帧自身高度
            	var j=i;  
            
            	$(this).css({
            		zIndex:level,
          		    width:rw,
          		    height:rh,
            		opacity:1/(++j),
            		left:fixOffsetLeft+(++i)*gap-rw,
          		    top:self.setVertucalAlign(rh)//幻灯片居中排列
            	});                                                       	
            });
            
            //设置左边帧的位置关系 （以右边最后一帧作为比例进行循环）  
            var lw=rightRest.last().width(),//左边第一帧宽度=右边最后一帧的宽度
                lh=rightRest.last().height(),//左边第一帧高度=右边最后一帧的高度
                oloop=Math.floor(this.items.length/2);//帧层级关系，为2
           
            leftRest.each(function(i){
                $(this).css({
            	zIndex:level,
          		width:lw,
          		height:lh,
                opacity:1/oloop,                
            	left:i*gap,
          		top:self.setVertucalAlign(lh)//幻灯片居中排列          		    
            	});
            lw=lw/self.setting.scale;
            lh=lh/self.setting.scale;
            oloop--;            	
            });
                         
		},
		
		//设置垂直排列对齐方式
		setVertucalAlign:function(height){
			var verticalAlign=this.setting.verticalAlign,//保存对齐类型
			    top=0;
			if(verticalAlign==="middle"){
				top=(this.setting.height-height)/2;
			}else if(verticalAlign==="top"){
				top=0;
			}else if(verticalAlign==="bottom"){
				top=this.setting.height-height;
			}else{
				top=(this.setting.height-height)/2;
			}
			return top;		
		},
		
		//旋转
		carrouseRotate:function(dir){
			var _this_=this;
			if(dir==="left"){
				this.items.each(function(){
					var self=$(this),//当前帧
					    prev=self.prev().get(0)?self.prev():_this_.lastItem,//当前帧的上一帧，如果上一帧不存在则取最后一帧
					    width=prev.width(),
					    height=prev.height(),
					    zIndex=prev.css("zIndex"),
					    opacity=prev.css("opacity"),
					    left=prev.css("left"),
					    top=prev.css("top");
					    
					    self.animate({
					    	width:width,
					    	height:height,
					    	zIndex:zIndex,
					    	opacity:opacity,
					    	left:left,
					    	top:top					    	
					    },_this_.setting.speed,function(){
					    	_this_.rotateFlag=true;
					    });
				});
			}else if(dir==="right"){
				this.items.each(function(){
					var self=$(this),//当前帧
					    next=self.next().get(0)?self.next():_this_.firstItem,//当前帧的上一帧，如果上一帧不存在则取最后一帧
					    width=next.width(),
					    height=next.height(),
					    zIndex=next.css("zIndex"),
					    opacity=next.css("opacity"),
					    left=next.css("left"),
					    top=next.css("top");
					    
					    self.animate({
					    	width:width,
					    	height:height,
					    	zIndex:zIndex,
					    	opacity:opacity,
					    	left:left,
					    	top:top					    	
					    },_this_.setting.speed,function(){
					    	_this_.rotateFlag=true;
					    });					
				});
			}			
		},
		
		//执行自动播放功能
		autoPlay:function(){
			var self=this;
			this.timer=window.setInterval(function(){
				self.leftBtu.click();
			},this.setting.delay);
		}
		
	};
	
	Carrousel.init=function(posters){/*posters加s表示集合*/
		var _this_=this;//this指Carrousel
		posters.each(function(){
			new _this_($(this));//this指posters里的每一个
		});
		
	};
	
	//window["Carrousel"]=Carrousel;//全局变量注册
	window.Carrousel = Carrousel;
	
})(jQuery);
