<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
date_default_timezone_set("America/New_York");
if ($_SERVER["REQUEST_METHOD"] == "GET"){
//autocomplete
    if (isset($_GET["input"])) {
        $input = urlencode($_GET["input"]);
        $autoUrl = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=".$input;
        $autojson = file_get_contents($autoUrl);
        echo $autojson;
    }
//stock data
    else if (isset($_GET["symbol"])) {
        $symbol = urlencode($_GET["symbol"]);
        $quoteUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=".$symbol."&outputsize=full&apikey=4GR9E3A9YSU9UZPI";
        $stockjson=file_get_contents($quoteUrl);
//        $stockjson=json_encode($s_json);
        echo $stockjson;
    }
//his_chart data
    else if (isset($_GET["his"])){
        $symbol = urlencode($_GET["his"]);
        $dataUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=".$symbol."&outputsize=full&apikey=4GR9E3A9YSU9UZPI";
        $cjson = file_get_contents($dataUrl);
        $chartData=json_decode($cjson,true);
        $temp=array_slice($chartData['Time Series (Daily)'],0,1000,false);
        $i=999;
        $c_json=array();
        foreach ($temp as $key => $val){
            $d2=strtotime($key);
            $date=floatval($d2."000");
            $c_json[$i]=array($date,floatval($val['4. close']));
            $i--;
        }
        $chartjson=json_encode($c_json);
        echo $chartjson;
        
    }
//indicators
    else if (isset($_GET["SMA"])){
        $symbol = urlencode($_GET["SMA"]);
        $SMAurl="https://www.alphavantage.co/query?function=SMA&symbol=".$symbol."&interval=daily&time_period=10&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($SMAurl);
        echo $indjson;
    }
    else if (isset($_GET["EMA"])){
        $symbol = urlencode($_GET["EMA"]);
        $EMAurl="https://www.alphavantage.co/query?function=EMA&symbol=".$symbol."&interval=daily&time_period=10&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($EMAurl);
        echo $indjson;
    }
    else if (isset($_GET["STOCH"])){
        $symbol = urlencode($_GET["STOCH"]);
        $STOCHurl="https://www.alphavantage.co/query?function=STOCH&symbol=".$symbol."&interval=daily&slowkmatype=1&slowdmatype=1&time_period=10&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($STOCHurl);
        echo $indjson;
    }
    else if (isset($_GET["RSI"])){
        $symbol = urlencode($_GET["RSI"]);
        $RSIurl="https://www.alphavantage.co/query?function=RSI&symbol=".$symbol."&interval=daily&time_period=10&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($RSIurl);
        echo $indjson;
    }
    else if (isset($_GET["ADX"])){
        $symbol = urlencode($_GET["ADX"]);
        $ADXurl="https://www.alphavantage.co/query?function=ADX&symbol=".$symbol."&interval=daily&time_period=10&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($ADXurl);
        echo $indjson;
    }
    else if (isset($_GET["CCI"])){
        $symbol = urlencode($_GET["CCI"]);
        $CCIurl="https://www.alphavantage.co/query?function=CCI&symbol=".$symbol."&interval=daily&time_period=10&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($CCIurl);
        echo $indjson;
    }
    else if (isset($_GET["BBANDS"])){
        $symbol = urlencode($_GET["BBANDS"]);
        $BBANDSurl="https://www.alphavantage.co/query?function=BBANDS&symbol=".$symbol."&interval=daily&time_period=5&series_type=close&nbdevup=3&nbdevdn=3&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($BBANDSurl);
        echo $indjson;
    }
    else if (isset($_GET["MACD"])){
        $symbol = urlencode($_GET["MACD"]);
        $MACDurl="https://www.alphavantage.co/query?function=MACD&symbol=".$symbol."&interval=daily&series_type=close&apikey=4GR9E3A9YSU9UZPI";
        $indjson = file_get_contents($MACDurl);
        echo $indjson;
    }
//news data
    else if (isset($_GET["news"])){
        $news_symbol=urlencode($_GET["news"]); $news_url="https://seekingalpha.com/api/sa/combined/".$news_symbol.".xml";
        $xml=simplexml_load_file($news_url);
        $item=$xml->channel->item;
        $json=array();
        $title=array();
        $author=array();
        $link=array();
        $p_date=array();
        $k=0;
        $j=0;
        $str='sa:author_name';
        while($k<5){
            $temp=(string)$item[$j]->link;
            if (strpos($temp,'article')!=FALSE){
                $link[$k]=$temp;
                $title[$k]=(string)$item[$j]->title;
                $p_date[$k]=substr($item[$j]->pubDate,0,-6);
                $author[$k]=1111; $json[$k]=array($title[$k],$link[$k],$author[$k],$p_date[$k]);
                $k++;
            }
            $j++;
        }
        $newsjson=json_encode($json);
        echo $newsjson;            
    }
}
?>