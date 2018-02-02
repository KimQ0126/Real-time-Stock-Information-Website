/*angular*/

var myApp = angular.module('myApp',['ngAnimate']);
myApp.controller("firstCtrl",function($scope){
    //$scope.ifShow=true;
    $scope.oppShow=true;
    $scope.toggle1=function(){
        $scope.oppShow=false;
        //$scope.ifShow=false;
    }
    $scope.toggle2=function(){
        $scope.oppShow=true;
        //$scope.ifShow=true;
    }
});
/*jquery*/
window.onload = function() {
        //localStorage.clear();
        var obj;
        var symbol;
        var fav_list;
    console.log(fav_list);
        var des;
        var price_arr=new Array();
        var vol_arr=new Array();
        var p_date=new Array();
        var date=new Array();
        var ind=new Array();
        var loadBar="<div class='progress progress-striped active'><div class='progress-bar progress-bar-info' style='width:50%'></div></div>"
        console.log(localStorage.getItem("fav_list"));
        createFavtb();
//actiion 
//autocomplete
        $("#ss")
		.focus()
		.autocomplete({
			source: function(request,response) {
				$.ajax({
					url: "http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
					type: "GET",
                    datatype: "json",
					data: {
						input: request.term
					},}).done(function(data) {
						$("#err1").hide();
						var auto_arr= $.parseJSON(data);
						response( $.map(auto_arr, function(item) {
							return {
								label: item.Symbol + " - " + item.Name + " ( " +item.Exchange+ " )",
								value: item.Symbol
							}
						}));
					});
            },
			minLength: 0,
			select: function( event, ui ) {
				$("#err1").hide();
			},
			open: function() {
				$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
			},
			close: function() {
				$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
			}
		});
    
        $('#quote_btn').click(function(){
            symbol=$("#ss").val();
            if (symbol.match(/^\s*$/)){
                $("#err1").show();
                $("#textarea").addClass("has-error");
                return false;
            }
            else{
                $("#err1").hide();
                $("#textarea").removeClass("has-error");
                var $scope=angular.element('#showarea').scope();
                    $scope.$apply(function(){
                        $scope.toggle1();
                    });
                showStockInfo(symbol);
            }
          });
        
        $('#clear_btn').click(function(){
            document.getElementById("ss").value="";
            $("#chart_container").empty();
            $("#st").empty();
            $("#hc_container").empty();
            $("#news_container").empty(); 
            var $scope=angular.element('#showarea').scope();
                $scope.$apply(function(){
                    $scope.toggle2();
            });
            $('#detail_btn').prop('disabled','disabled');
            $("#detail_btn").off("click");
            /*回到fav list函数未完成*/
            
            

        });
    
        $('.link').click(function(){
            symbol=$(this).text();
            var $scope=angular.element('#showarea').scope();
            $scope.$apply(function(){
                $scope.toggle1();
            });
            showStockInfo(symbol);
        });
    
        $('#refresh_btn').click(function(){
            fav_list=JSON.parse(localStorage.getItem("fav_list"));
            if (fav_list) {
                for (var i=0;i<fav_list.length;i++) {
                    updateRow(fav_list[i].sym);
                } 
		  }
        });
        var inter;
        $('#refresh_toggle').change(function(){
            if ($(this).prop('checked')) {
                inter=setInterval(function(){
                    fav_list=JSON.parse(localStorage.getItem("fav_list"));
                    if (fav_list) {
                        for (var i=0;i<fav_list.length;i++) {
                            updateRow(fav_list[i].sym);
                        } 
                  }
                },5000);
            }
            else {
                if(inter){clearInterval(inter);}
            }
        });
//star button function
        $("#star").click(function(){
            status=check(symbol);
            if (status=="false"){
                $(this).css("color","yellow");
                save(symbol);
            }
            else {
                $(this).css("color","white");
                var fav_list=JSON.parse(localStorage.getItem("fav_list"));
                fav_list.splice(status-1,1);
                localStorage.setItem("fav_list",JSON.stringify(fav_list));
            }
            createFavtb();
        });
//share on fb
        $("#facebook").click(function(){
            var exportUrl = 'https://export.highcharts.com.cn/';
            var pic_src;
            var str=JSON.stringify({
               "title":{
                  "text":symbol+"Stock Price and Volume"
               },
               "subtitle":{
                  "useHTML":true,
                  "text":"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
               },
               "yAxis":[
                  {
                     "title":{
                        "text":"Stock Price"
                     },  
                  },
                  {
                     "title":{
                        "text":"Volume"
                     },
                     "opposite":true,
                  }
               ],
               "xAxis":{
                   "categories":p_date,
                    "tickPositioner": function() {
                        let pointer=[];
                        for(let p=0;p<this.categories.length;p++) 
                        {
                            if(p%5==0){ 
                                pointer.push(this.categories.length-p-1);
                            }
                        }
                        
                        return pointer;
                }
                    },
               "series":[
                  {
                     "type":"area",
                     "name":symbol,
                     "data":price_arr,
                      "threshold":null,
                     "yAxis":0,
                     "tooltip":{
                        "pointFormat":symbol+": {point.y:,..2f}",
                     },
                     "marker":{
                        "enabled":false
                     }
                  },
                  {
                     "type":"column",
                     "name":symbol+" Volume",
                     "data":vol_arr,
                     "yAxis":1,
                     "color":"rgb(242,137,134)"
                  }
               ]
            });
            var dataString = encodeURI('type=jpeg&width=500&options='+str);
            $.ajax({
                type: 'GET',
                data: dataString,
                url: exportUrl,
                async: false,
                }).done(function(data){
                    console.log('get the file from relative url: ', data);
                    pic_src=exportUrl+data;
                }).fail(function(err){
                    console.log('error', err.statusText);
                });
            console.log(pic_src);
            FB.ui({
				method: 'share',
                display: 'popup',
                //href: 'https://developers.facebook.com/docs/'
				picture: pic_src,
				link: 'https://www.alphavantage.co/',
			},
			function (response) {
				if (response && !response.error_message) {
					alert('Posted Successfully!');
				} else {
					alert('Not Posted.');
				}
			}
		  );
        });
        $('#SMA').click(function(){
            type="SMA";
            showSMA(type);
          });
        $('#EMA').click(function(){
            type="EMA";
            showEMA(type);
          });
        $('#RSI').click(function(){
            type="RSI";
            showRSI(type);
          });
        $('#ADX').click(function(){
            type="ADX";
            showADX(type);
          });
        $('#CCI').click(function(){
            type="CCI";
            showCCI(type);
          });
        $('#STOCH').click(function(){
            type="STOCH";
            showSTOCH(type);
          });
        $('#BBANDS').click(function(){
            type="BBANDS";
            showBBANDS(type);
          });
        $('#MACD').click(function(){
            type="MACD";
            showSMA(type);
          });
        $('#sort').change(function(){ 
            var val=$(this).children('option:selected').val();
            if(val=="default"){
                $('#order').prop('disabled','disabled');
            }
            else{
                $('#order').prop('disabled', false);
                sort(val);
            }
        });
        $('#order').change(function(){ 
            var ord=$(this).children('option:selected').val();
            order(ord);
        });
//slide action
        $('#detail_btn').click(function(){ 
                var $scope=angular.element('#showarea').scope();
                $scope.$apply(function(){
                        $scope.toggle1();
                    });
            });
        $('#favlist_btn').click(function(){ 
                var $scope=angular.element('#showarea').scope();
                $scope.$apply(function(){
                    $scope.toggle2();
                });
            });
            
    
    
//facebook sdk
         window.fbAsyncInit = function() {
            FB.init({
              appId      : '153291828751098',
              xfbml      : true,
              version    : 'v2.11'
            });
            FB.AppEvents.logPageView();
          };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "https://connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));
        
//create favorite table
        function createFavtb(){
            fav_list=JSON.parse(localStorage.getItem("fav_list"));
            var table="";
            if (fav_list) {
                for (var i=0;i<fav_list.length;i++) {
                    table+=createFavRow(fav_list[i].sym);
                }
                console.log(table);
                $("#fav_con").html(table);
		  }
        }
		//trash_btn remove
		$(".trash_btn").click(function () {
			//delete tr
			$(this).parents("tr").remove();
			//delete localstorage 
            var item=$(this).parents("tr").children("td.symbol").text();
			DeleteFavItem(item);
		});
//delete fav item(local)
        function DeleteFavItem(item){
            var num=check(item);
			var fav_list=JSON.parse(localStorage.getItem("fav_list"));
			fav_list.splice(num - 1, 1);
			localStorage.setItem("fav_list", JSON.stringify(fav_list));
        }
//create fav row
        function createFavRow(symbol) {
            var row="";
            $.ajax({
                type: "GET",
                url: "http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                datatype: "json",
                data: {
                    symbol:symbol
                },
                async: false,
            }).done(function(stockjson){
                        var Obj=JSON.parse(stockjson);
                        var info=Obj["Meta Data"];
                        var data=Obj["Time Series (Daily)"];
                        var stocksymbol=info["2. Symbol"];
                        var temp_time=info["3. Last Refreshed"].substr(0,10);
                        var date_temp=Object.keys(data).slice(0,2);
                        var next=date_temp[1];
                        var close1=data[temp_time]["4. close"];
                        var vol=data[temp_time]["5. volume"];
                        var close2=data[next]["4. close"];
                        var change=(close2-close1).toFixed(2);
                        var cpercent=((change/close2)*100).toFixed(2);
                        close1=Number(close1).toFixed(2);
                        close2=Number(close2).toFixed(2);
                        row += "<tr>";
                        row += "<td class='symbol'><a href='javascript:void(0)' class='link' >"+stocksymbol+"</a></td>";
                        row += "<td class='Price'>" + close1 + "</td>";
                        if (change>0){
                            row+="<td class='Change'><span class='green'>"+change+" ( "+cpercent+" %) </span><span style='display: inline-block;width: 22px;height:22px'><img width=100% height=100% src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png'></span></td>";
                        }
                        else{
                            row+="<td class='Change'><span class='red'>"+change+" ( "+cpercent+" %) </span><span style='display: inline-block;width: 22px;height:22px'><img width=100% height=100% src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png'></span></td>";
                        }
                        row += "<td class='Volume'>"+vol+"</td>";
                        row += "<td><button type='button' class='btn btn-default btn-sm trash_btn' id='" + stocksymbol + "'><span class='glyphicon glyphicon-trash'></span></button></td>";
                        row += "</tr>";
            }).fail(function(){
                    $("#fav_con").html("<div class='alert alert-danger'>Error! Failed to get favorite list data.</div>");
            });
            return row;
	}
//update fav row
        function updateRow(symbol){
            $.ajax({
                type: "GET",
                url: "http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                datatype: "json",
                data: {
                    symbol: symbol
                },
                async: false,
            }).done(function(stockjson){
                        var Obj=JSON.parse(stockjson);
                        var info=Obj["Meta Data"];
                        var data=Obj["Time Series (Daily)"];
                        var temp_time=info["3. Last Refreshed"].substr(0,10);
                        var date_temp=Object.keys(data).slice(0,2);
                        var next=date_temp[1];
                        var close1=data[temp_time]["4. close"];
                        var vol=data[temp_time]["5. volume"];
                        var close2=data[next]["4. close"];
                        var change=(close2-close1).toFixed(2);
                        var cpercent=((change/close2)*100).toFixed(2);
                        close1=Number(close1).toFixed(2);
                        close2=Number(close2).toFixed(2);
                        var row=$("#fav_tb").children().children();
                        for(var i=1;i<row.length;i++) {
                            if($(row[i]).children("td.symbol").text()==symbol){
                                $(row[i]).children("td.Price").text(close1);
                                if (change>0){
                                    $(row[i]).children("td.Change").html("<td class='Change'><span class='green'>"+change+" ( "+cpercent+" %) </span><span style='display: inline-block;width: 22px;height:22px'><img width=100% height=100% src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png'></span></td>");
                                }
                                else{
                                    $(row[i]).children("td.Change").html("<td class='Change'><span class='red'>"+change+" ( "+cpercent+" %) </span><span style='display: inline-block;width: 22px;height:22px'><img width=100% height=100% src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png'></span></td>");
                                }
                                $(row[i]).children("td.Volume").text(vol);
                                break;
                            }
                        }
            }).fail(function(){
                    $("#fav_con").html("<div class='alert alert-danger'>Error! Failed to get favorite list data.</div>");
            });  
        }
//check this stock is in fav list or not
    	function check(symbol){
		if (!localStorage.getItem("fav_list")){
			$('#star').css("color","white");
			var empty=[];
			localStorage.setItem("fav_list", JSON.stringify(empty));
			return false;
		}
		var fav_list=JSON.parse(localStorage.getItem("fav_list"));
		for (var i=0;i<fav_list.length;i++) {
			if (fav_list[i].sym==symbol) {
                $('#star').css("color","yellow");
				return i+1;
			}
		}
		return false;
	}
//save item to local
        function save(symbol){
            var sym={
				sym: symbol
			};
            fav_list=JSON.parse(localStorage.getItem("fav_list"));
			fav_list.push(sym);
			localStorage.setItem("fav_list",JSON.stringify(fav_list));
        }
//stock table
        function createStocktb(obj){
            var info=obj["Meta Data"];
            var data=obj["Time Series (Daily)"];
            var stocksymbol=info["2. Symbol"];
            var time2=info["3. Last Refreshed"];
            var temp_time=time2.substr(0,10);
            var c_time=temp_time+" 16:00:00";
            var myDate=new Date();
            var nytime=moment(myDate).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss z');
            var res=moment(c_time,'YYYY-MM-DD HH:mm:ss').isBefore(nytime);
            var date_temp=Object.keys(data).slice(0,2);
            var next=date_temp[1];
            var close1=data[temp_time]["4. close"];
            var open=data[temp_time]["1. open"];
            var low=data[temp_time]["3. low"];
            var high=data[temp_time]["2. high"];
            var vol=data[temp_time]["5. volume"];
            var close2=data[next]["4. close"];
            var change=(close2-close1).toFixed(2);
            var cpercent=((change/close2)*100).toFixed(2);
            close1= Number(close1).toFixed(2);
            close2=Number(close2).toFixed(2);
            high=Number(high).toFixed(2);
            low=Number(low).toFixed(2);
            open=Number(open).toFixed(2);
            var table="<table class='table table-striped' id='current_stock_table'>";
            table+="<tr><td><b>Stock Ticker Symbol</b></td><td>"+stocksymbol+"</td></tr>";
            table+="<tr><td><b>Last Price</b></td><td>"+close1+"</td></tr>";
            if (change>0){
                table+="<tr><td><b>Change(Change Percent)</b></td><td class='green'>"+change+" ( "+cpercent+" %)<span style='display:inline-block;width: 22px;height:22px'><img width=100% height=100% src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png'></span></td></tr>";
            }
            else{
                table+="<tr><td><b>Change(Change Percent)</b></td><td class='red'>"+change+" ( "+cpercent+" %) <span style='display: inline-block;width: 22px;height:22px'><img width=100% height=100% src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png'></span></td></tr>";
            }
            //choose which day's close
            if(res==true){
                table+="<tr><td><b>Timestamp</b></td><td>"+c_time+" EDT</td></tr>";
                table+="<tr><td><b>Open</b></td><td>"+open+"</td></tr>";
                table+="<tr><td><b>Close</b></td><td>"+close1+"</td></tr>";
               }
            else if(res==false){
                table+="<tr><td><b>Timestamp</b></td><td>"+time2+" EDT</td></tr>";
                table+="<tr><td><b>Open</b></td><td>"+open+"</td></tr>";
                table+="<tr><td><b>Close</b></td><td>"+close2+"</td></tr>";
               }
            table+="<tr><td><b>Day's Range</b></td><td>"+low+" - "+high+"</td></tr>";
            table+="<tr><td><b>Volume</b></td><td>"+vol+"</td></tr></table>";
            $("#st").html(table);
            
        }
//historical chart
        function createHischart(Obj){
            // Create the chart
            var c_arr=new Array();
            var i=0;
            for(value in Obj){
                c_arr[i]=Obj[value];
                i++;
            }
            $("#table").html(c_arr);
            var chart = Highcharts.stockChart('hc_container', {
                title: {
                    text: symbol+" Stockk Value",
                },

                subtitle: {
                    useHTML:true,
                    text :"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
                },

                yAxis:{
                     title:{
                        text:"Stock Value"
                     },  
                },
                
                rangeSelector: {
                        buttons : [{
                            type : 'day',
                            count : 7,
                            text : '1w'
                        }, {
                            type : 'month',
                            count : 1,
                            text : '1m'
                        }, {
                            type : 'month',
                            count : 3,
                            text : '3m'
                        }, {
                            type : 'month',
                            count : 6,
                            text : '6m'
                        },  {
                            type: 'ytd',
                            text: 'YTD'
                        }, {
                            type : 'year',
                            count : 1,
                            text : '1y'
                        },	{
                            type : 'all',
                            count : 1,
                            text : 'All'
                        }],
                        selected : 0,
                },
                xAxis: {
                    crosshair: false
                },
                tooltip: {
                        split: false,
                        xDateFormat: '%A, %b %e，%Y',
                        valueDecimals: 2,
                    },

                series: [{
                    name: symbol,
                    data: c_arr,
                    type: 'areaspline',
                    threshold: null,
                }],
            });
        }
//news table
        function createNewstb(Obj){
            var i=0;
            var list="";
            for (var j=0;j<5;j++){
                value=Obj[j];
                list+="<div class='well'><p style='font-size:22px'><a href="+value[1]+" target='_blank'>"+value[0]+"</a></p>";
                list+="<p><b>Author: "+value[2]+"</b></p>";
                list+="<p><b>Date: "+value[3]+" EDT</b></p></div>";
            }    
            $("#news_container").html(list);
        }
//price chart
        drawPrice=function(obj){
            var info=obj["Meta Data"];
            var data=obj["Time Series (Daily)"];
            var stocksymbol=info["2. Symbol"];
            var temp_time=info["3. Last Refreshed"].substr(0,10);
            var date_temp=Object.keys(data).slice(0,131);
            for (var j=0;j<131;j++){
                m=date_temp[j].substr(5,2);
                d=date_temp[j].substr(8,2);
                p_date[130-j]=m+'/'+d;
            }
            var i=0;
            for (var key in data){
                temp = data[key];
                price_arr[130-i]=Number(temp["4. close"]);
                vol_arr[130-i]=Number(temp["5. volume"]);
                i++;
                if(i>130){
                    break;
                }
            }
            $('#chart_container').highcharts({
               chart: {
                   zoomType: 'x',
               },
               title:{
                  "text":stocksymbol+"Stock Price and Volume"
               },
               "subtitle":{
                  "useHTML":true,
                  "text":"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
               },
               "yAxis":[
                  {
                     "title":{
                        "text":"Stock Price"
                     },  
                  },
                  {
                     "title":{
                        "text":"Volume"
                     },
                     "opposite":true,
                  }
               ],
               "xAxis":{
                   "categories":p_date,
                    "tickPositioner": function() {
                        let pointer=[];
                        for(let p=0;p<this.categories.length;p++) 
                        {
                            if(p%5==0){ 
                                pointer.push(this.categories.length-p-1);
                            }
                        }
                        return pointer;
                }
                    },
               "series":[
                  {
                     "type":"area",
                     "name":stocksymbol,
                     "data":price_arr,
                      "threshold":null,
                     "yAxis":0,
                     "tooltip":{
                        "pointFormat":stocksymbol+": {point.y:,..2f}",
                     },
                     "marker":{
                        "enabled":false
                     }
                  },
                  {
                     "type":"column",
                     "name":stocksymbol+" Volume",
                     "data":vol_arr,
                     "yAxis":1,
                     "color":"rgb(242,137,134)"
                  }
               ]
            });
        }
//all stock detail info
        function showStockInfo(symbol){
            //stock table&price chart
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    symbol: symbol
                },
                beforeSend: function(){
                    //loading
                    $("#st").html(loadBar);
                    $("#chart_container").html(loadBar);
                },
            }).done(function(stockjson){
                    obj=stockjson;
                    var stockObj=obj;
                    var sta=check(symbol);
                    if (!check(symbol)){
                        $("#star").css("color","white");
                    }
                    else{
                        $("#star").css("color","yellow");
                    }
                    createStocktb(stockObj);
                    $('#detail_btn').prop('disabled',false);
                }).fail(function(){
                    $("#st").html("<div class='alert alert-danger'>Error! Failed to get current stock data.</div>");
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get Price data.</div>");
                });
            //Price chart
             showPrice(symbol);   
            //newsfeed
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    news: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#news_container").html(loadBar);
                },
            }).done(function(newsjson){
                    createNewstb(newsjson);
                }).fail(function(){
                    $("#news_container").html("<div class='alert alert-danger'>Error! Failed to get news feed data.</div>");
            });
            //his_chart
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    his: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#hc_container").html(loadBar);
                },
            }).done(function(chartjson){
                    /*var chartObj=JSON.parse(chartjson);*/
                    createHischart(chartjson);
                }).fail(function(){
                    $("#hc_container").html("<div class='alert alert-danger'>Error! Failed to get histroical chart data.</div>");
            });
                /*sucess:function(chartjson){
                    var chartObj=JSON.parse(chartjson);
                    createHischart(chartjson);
                },
                error: function(e){
                    $("#hc_container").html("<div class='alert alert-danger'>Error! Failed to get historical charts data.</div>");
                }
            });*/
    }

//Price
        showPrice=function(){
                $.ajax({
                    type:"GET",
                    url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                    dataType:"json",
                    data:{
                        symbol: symbol
                    },
                    beforeSend: function() {
                        //loading
                        $("#chart_container").html(loadBar); 
                    },
                }).done(function(stockjson){
                        /*var indObj=JSON.parse(indjson);*/
                        drawPrice(stockjson);
                    }).fail(function(){
                        $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get Price data.</div>");
                    });
            }
//SMA
        showSMA=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    SMA: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container").html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawIndicator(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get SMA data.</div>");
                });
        }
        
        
//EMA
        showEMA=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    EMA: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container").html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawIndicator(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get EMA data.</div>");
                });
        }
//RSI
        showRSI=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    RSI: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container").html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawIndicator(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get RSI data.</div>");
                });
        }
//ADX
        showADX=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    ADX: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container"). html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawIndicator(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get ADX data.</div>");
                });
        }
//CCI
        showCCI=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    CCI: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container"). html(loadBar); 
                },
             }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawIndicator(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get CCI data.</div>");
                });
        
        }
//STOCH
        showSTOCH=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    STOCH: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container"). html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawIndicator(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get STOCH data.</div>");
                });
        }
//BBANDS
        showBBANDS=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    BBANDS: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container"). html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawBBANDS(indjson,type);
                }).fail(function(){
                    $("#chart_container").html("<div class='alert alert-danger'>Error! Failed to get BBANDS data.</div>");
                });
        }
//MACD
        showMACD=function(type){
            $.ajax({
                type:"GET",
                url:"http://csci571-hw8php.us-west-1.elasticbeanstalk.com/index.php",
                dataType:"json",
                data:{
                    MACD: symbol
                },
                beforeSend: function() {
                    //loading
                    $("#chart_container"). html(loadBar); 
                },
            }).done(function(indjson){
                    /*var indObj=JSON.parse(indjson);*/
                    drawMACD(indjson,type);
                }).fail(function(){
                    $("#chart_containerr").html("<div class='alert alert-danger'>Error! Failed to get MACD data.</div>");
                });
        }     
//draw indicator charts
        function drawIndicator(Obj,type){
            var ind_arr=Obj['Technical Analysis: '+type];
            var date_temp=Object.keys(ind_arr).slice(0,131);
            for (var j=0;j<131;j++){
                m=date_temp[j].substr(5,2);
                d=date_temp[j].substr(8,2);
                date[130-j]=m+'/'+d;
            }
            var i=0;
            for (var key in ind_arr){
                temp = ind_arr[key];
                ind[130-i]=Number(temp[type]);
                i++;
                if(i>130){
                    break;
                }
            }
            var title;
            switch(type){
                case "SMA": 
                    title="Simple Moving Averages (SMA)";break;
                case "EMA":
                    title="Exponential Moving Average (EMA)";break;
                case "RSI":
                    title="Relative Strength Index (RSI)";break;
                case "ADX":
                    title="Average Directional movement indeX (ADX)";break;
                case "CCI":
                    title="Commodity Channel Index (CCI)";break;
                default:
                    break;
                       }
            $('#chart_container').highcharts({
                chart: {
                    zoomType: 'x',
                },
               "title":{
                  "text":title
               },
               "subtitle":{
                  "useHTML":true,
                  "text":"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
               },
                "xAxis":{
                   "categories":date,
                    "tickPositioner": function() {
                        let pointer=[];
                        for(let p=0;p<this.categories.length;p++) 
                        {
                            if(p%5==0){ 
                                pointer.push(this.categories.length-p-1);
                            }
                        }
                        return pointer;
                },
                    },
               "yAxis":
                  {
                     "title":{
                        "text":type
                     },

                  },
               "series":[
                  {
                      "type":"spline",
                      "name":symbol,
                      "data":ind,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+": {point.y:,.2f}",
                      },
                      lineWidth: 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  }],
            });
        }         
//drawBBANDS
        function drawBBANDS(Obj,type){
            var ind_arr=Obj['Technical Analysis: '+type];
            var rub_arr=new Array();
            var rlb_arr=new Array();
            var rmb_arr=new Array();
            var date_temp=Object.keys(ind_arr).slice(0,131);
            var date=new Array();
            for (var j=0;j<131;j++){
                m=date_temp[j].substr(5,2);
                d=date_temp[j].substr(8,2);
                date[130-j]=m+'/'+d;
            }
            var i=0;
            for (var key in ind_arr){
                temp = ind_arr[key];
                rub_arr[130-i]=Number(temp['Real Upper Band']);
                rlb_arr[130-i]=Number(temp['Real Lower Band']);
                rmb_arr[130-i]=Number(temp['Real Middle Band']);
                i++;
                if(i>130){
                    break;
                }
            }
           var chart=Highcharts.chart('chart_container', {
               "chart": {
                    events: {
                        addSeries: function () {
                            }
                        },
                    zoomType: 'x'
                    },
               "title":{
                  "text":"Bollinger bands (BBANDS)"
               },
               "subtitle":{
                  "useHTML":true,
                  "text":"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
               },
                "xAxis":{
                   "categories":date,
                    "tickPositioner": function() {
                        let pointer=[];
                        for(let p=0;p<this.categories.length;p++) 
                        {
                            if(p%5==0){ 
                                pointer.push(this.categories.length-p-1);
                            }
                        }
                        
                        return pointer;
                },
                    },
               "yAxis":
                  {
                     "title":{
                        "text":type
                     },
                  },
               "series":[
                  {
                      "type":"spline",
                      "name":symbol+" Real Upper Band",
                      "data":rub_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" Real Upper Band: {point.y:,.2f}",
                      },
                      lineWidth: 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  },
               ],
            });
            chart.addSeries(
                {
                      "type":"spline",
                      "name":symbol+" Real Lower Band",
                      "data":rlb_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" Real Lower Band: {point.y:,.2f}",
                      },
                      "lineWidth": 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  });
            chart.addSeries(
                {
                      "type":"spline",
                      "name":symbol+" Real Middle Band",
                      "data":rmb_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" Real Middle Band: {point.y:,.2f}",
                      },
                        lineWidth: 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  }
            );
    }       
//drawMACD   
        function drawMACD(Obj,type){
            var ind_arr=Obj['Technical Analysis: '+type];
            var mh_arr=new Array();
            var m_arr=new Array();
            var ms_arr=new Array();
            var date_temp=Object.keys(ind_arr).slice(0,131);
            var date=new Array();
            for (var j=0;j<131;j++){
                m=date_temp[j].substr(5,2);
                d=date_temp[j].substr(8,2);
                date[130-j]=m+'/'+d;
            }
            var i=0;
            for (var key in ind_arr){
                temp = ind_arr[key];
                mh_arr[130-i]=Number(temp['MACD_Hist']);
                m_arr[130-i]=Number(temp['MACD']);
                ms_arr[130-i]=Number(temp['MACD_Signal']);
                i++;
                if(i>130){
                    break;
                }
            }
           var chart=Highcharts.chart('chart_container', {
               "chart": {
                    events: {
                        addSeries: function () {
                            }
                        },
                    zoomType: 'x',
                    },

               "title":{
                  "text":"Moving Average Convergence / Divergence (MACD)"
               },
               "subtitle":{
                  "useHTML":true,
                  "text":"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
               },
                "xAxis":{
                   "categories":date,
                    "tickPositioner": function() {
                        let pointer=[];
                        for(let p=0;p<this.categories.length;p++) 
                        {
                            if(p%5==0){ 
                                pointer.push(this.categories.length-p-1);
                            }
                        }
                        
                        return pointer;
                },
                    },
               "yAxis":
                  {
                     "title":{
                        "text":type
                     },
                  },
               "series":[
                   {
                      "type":"spline",
                      "name":symbol+" MACD",
                      "data":m_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" MACD: {point.y:,.2f}",
                      },
                       lineWidth: 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  },
               ],
            });
            chart.addSeries(
                {
                      "type":"spline",
                      "name":symbol+" MACD_Hist",
                      "data":mh_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" MACD_Hist: {point.y:,.2f}",
                      },
                    lineWidth: 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  },);
             chart.addSeries(
                {
                      "type":"spline",
                      "name":symbol+" MACD_Signal",
                      "data":ms_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" MACD_Signal: {point.y:,.2f}",
                      },
                    lineWidth: 1,
                      "marker":{
                          "enabled":false,
                          "radius":2,
                      }
                  }
            );
    }         
//drawSTOCH
        function drawSTOCH(Obj,type){
            var ind_arr=Obj['Technical Analysis: '+type];
            var sk_arr=new Array();
            var sd_arr=new Array();
            var date_temp=Object.keys(ind_arr).slice(0,131);
            var date=new Array();
            for (var j=0;j<131;j++){
                m=date_temp[j].substr(5,2);
                d=date_temp[j].substr(8,2);
                date[130-j]=m+'/'+d;
            }
            var i=0;
            for (var key in ind_arr){
                temp = ind_arr[key];
                sk_arr[130-i]=Number(temp['SlowK']);
                sd_arr[130-i]=Number(temp['SlowD']);
                i++;
                if(i>130){
                    break;
                }
            }
           var chart=Highcharts.chart('chart_container', {
               "chart": {
                    events: {
                        addSeries: function () {
                            }
                        },
                    zoomType: 'x',
                    },
               "title":{
                  "text":"Stochastic Oscillator (STOCH)"
               },
               "subtitle":{
                  "useHTML":true,
                  "text":"<a href='https://www.alphavantage.co/' target='_blank'>Source: Alpha Vantage</a>",
               },
                "xAxis":{
                   "categories":date,
                    "tickPositioner": function() {
                        let pointer=[];
                        for(let p=0;p<this.categories.length;p++) 
                        {
                            if(p%5==0){ 
                                pointer.push(this.categories.length-p-1);
                            }
                        }
                        
                        return pointer;
                },
                    },
               "yAxis":
                  {
                     "title":{
                        "text":type
                     },
                  },
               "series":[
                  {
                      "type":"spline",
                      "name":symbol+" SlowK",
                      "data":sk_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" SlowK: {point.y:,.2f}",
                      },
                      lineWidth: 1,
                      "marker":{
                          "enabled":true,
                          "radius":2,
                      }
                  },
               ],
            });
            chart.addSeries(
            {
                      "type":"spline",
                      "name":symbol+" SlowD",
                      "data":sd_arr,
                      "threshold":null,
                      "tooltip":{
                          "pointFormat":symbol+" SlowD: {point.y:,.2f}",
                      },
                        lineWidth: 1,
                      "marker":{
                          "enabled":true,
                          "radius":2,
                      }
                  }
            );
    }
//sort
        function sort(id){
          var tb=$("#fav_tb");
          var ord=$('#order').children('option:selected').val();
          if (id=="sym_th"){
            var th=$("#sym_th");
          }
          else if (id=="pri_th"){
            var th=$("#pri_th");
          }
          else if (id=="cha_th"){
            var th=$("#cha_th");
          }
          else if (id=="vol_th"){
            var th=$("#vol_th");
          }
          var rows=tb.find('tr:gt(0)').toArray().sort(compare(th.index()));
          if (ord=="asc"){
          	$("#fav_con").empty();
          	$("#fav_con").html(rows);
          	des=false;
          }
          else{
          	rows=rows.reverse();
          	$("#fav_con").empty();
          	$("#fav_con").html(rows);
          	des=true;
          }
        }
        function compare(index) {
          return function(a, b) {
            var A = getCellValue(a, index),
              B = getCellValue(b, index);
            return $.isNumeric(A) && $.isNumeric(B) ?
              A-B : A.localeCompare(B);
          };
        }
        function getCellValue(row,index) {
          return $(row).children('td').eq(index).text();
        }
//order
        function order(ord){
            if (ord=="des"&&des==false){
                var tb=$("#fav_tb");
                var rows=tb.find('tr:gt(0)').toArray();
                $("#fav_con").empty();
                $("#fav_con").html(rows.reverse());
                des=true;
                }
            else if (ord=="asc"&&des==true){
                var tb=$("#fav_tb");
                var rows=tb.find('tr:gt(0)').toArray();
                $("#fav_con").empty();
                $("#fav_con").html(rows.reverse());
                des=false;
            }
        }
//sort action

//最后的符号    
};

