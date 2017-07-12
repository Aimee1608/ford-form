
/**计算rem**/
(function(win){
    var remCalc = {};
    var docEl = win.document.documentElement,
        tid,
        hasRem = true;
    hasZoom = true;
    designWidth = 750;
    function refresh(){
        var width = docEl.getBoundingClientRect().width;
        if(hasRem){
            var rem = width/10;
            docEl.style.fontSize = rem + "px";
            remCalc.rem = rem;
            var actualSize = parseFloat(window.getComputedStyle(document.documentElement)["font-size"]);
            if(actualSize!== rem && actualSize>0 && Math.abs(actualSize-rem)>1){
                var remScaled = rem*rem/actualSize;
                docEl.style.fontSize = remScaled + "px";
            }
        }
        if(hasZoom){
            var style = document.getElementById('y_style');
            if(!style){
                style = document.createElement('style');
                style.id = 'y_style';
            }
            style.innerHTML = '._z{zoom:'+ width/designWidth + '}';
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }
    function dbcRefresh(){
        clearTimeout(tid);
        tid = setTimeout(refresh,100);
    }
    win.addEventListener("resize",function(){
        dbcRefresh()
    },false);
    win.addEventListener("pageshow",function(e){
        if(e.persisted){
            dbcRefresh()
        }
    },false);
    refresh();
    if(hasRem){
        remCalc.refresh = refresh;
        remCalc.rem2px = function(d){
            var val = parseFloat(d)/this.rem;
            if(typeof d==="string" && d.match(/px$/)){
                val+="rem";
            }
            return val
        };
        win.remCalc = remCalc;
    }
})(window);



/***用户注册留资
 来源渠道 source  值要动态获取当前路由的渠道值
 1 天津玩艺儿
 2 看天津
 3 天津生活通
 4 乐活北京
 5 石家庄本地通
 6 掌控沧州
 7 家在济南
 8 青岛圈
 9 晋城头条
 10 太原人微生活***/
var SaveInfo = {
    username:null,//name,name
    gender:'未知',//gender,无
    phone:null,//mobile,mobile
    email1:'null@null.com',//email,无
    buytime:null,//buyCarTime,buy_time
    cartype:null,//interested,car_type
    province:null,//province,dealer_name省份，城市，经销商（1,2,3）
    city:null,//city,无
    dealerName:null,//dealerName,无
    source:null,//source,source,123
    sourcename:"汽车大全_PC",
    eventCode:"1499076514582",//eventCode,无
    memo1:'2017年DAF北区7-8月促销计划',//memo1,无
    memo2:'https://h5.xingyuanauto.com/201707/Ford/index.html',//memo2,无
    createDate:null,
    key:null,
    initImgData:null,
    init:function(){
        $.ajax({
            type:'get',
            url:'https://fld.xingyuanauto.com/public/index.php/port/Aes/GetEncrypt',
            success:function(key){
                console.log(key);
                if(key){
                    SaveInfo.key = key;
                    function GetQueryString(name)
                    {
                        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
                        var r = window.location.search.substr(1).match(reg);
                        if(r!=null&&r!=undefined)return  unescape(r[2]); return null;
                    }
                    SaveInfo.source = GetQueryString('sourceid');
                    console.log(SaveInfo.source);
                    if(SaveInfo.source==null) {
                        SaveInfo.source = 1;
                    }
                    console.log(SaveInfo.source);
                    $.ajax({
                        type:'post',
                        url:'https://h5php.xingyuanauto.com/Flow/public/index.php/port/Userftlotter/RandomBroker',
                        data:{source:SaveInfo.source},
                        dataType:'json',
                        success:function(msg){
                            console.log(msg);
                            SaveInfo.initImgData = msg;
                            SaveInfo.showImg(msg);
                            SaveInfo.updateView();
                        }
                    });
                }
            }
        });
    },
    updateView:function(){
        SaveInfo.inputReg();
        SaveInfo.submit();
        SaveInfo.getImg();
        $('select').on('touchstart',function(){
            $(this).find('option[value="-1"]').attr('disabled','disabled');
        });
        $('select').change(function(){
            $(this).addClass('changed');
        })
    },
    showImg:function(data){//展示图像信息
            if(data.length>0){
                var html = '';
                for(var i=0;i<data.length;i++){
                    var imgurl = 'img/tou.png';
                    if(data[i].imgurl!=null){
                        imgurl = ""+data[i].imgurl;
                    }
                    html+='<li class="people-img one">\
                                <a href="tel:'+data[i].phone+'" class="telPhone">\
                                    <img src="'+imgurl+'" alt="" class="head" />\
                                    <div class="In">\
                                        <p class="people-name" style="font-weight:bold">姓名： <span>'+data[i].name+'</span></p>\
                                        <img src="img/tel.png" alt="" class="people-tel"/>\
                                    </div><br />\
                                     <p style="font-weight:bold" class="jing">经销商：<span>'+data[i].dealer_name+'</span></p>\
                                </a>\
                            </li>';
                }
                $('#agencyList').html(html);
            }
    },
    getImg:function(){//根据经销商查找经纪人
        $('select[name="agency"]').unbind('change').bind('change',function(){
            $(this).addClass('changed');
            var val = $('select[name="agency"] option:selected').val();
            console.log(val);

            if(val!=""&&val!=-1){
                $.ajax({
                    type:'post',
                    url:'https://h5php.xingyuanauto.com/Flow/public/index.php/port/Userftlotter/DealerDataVert',
                    data:{dealer_id:val},
                    dataType:'json',
                    success:function(msg){
                        if(msg.code==2001){
                            SaveInfo.showImg(msg.data);
                        }
                    }
                })
            }
        })
    },
    inputReg:function(){
        $('input[name="username"]').blur(function(){
            var val = $(this).val();
            var reg =/^[a-zA-Z\u4E00-\u9FA5]*$/;
            console.log(reg.test(val));
            if(val!=""&&val!="test"&&val!="空白"&&val!="Unknown"&&val!="未知"&&val!="未告知"&&this.validity.valid&&reg.test(val)){
                //$(this).parent().removeClass('red');
                $(this).attr('placeholder','姓名');
                $(this).removeClass('inputerror');
            }else{
                //$(this).parent().addClass('red');
                $(this).val('');
                $(this).attr('placeholder','请您正确输入姓名');
                $(this).addClass('inputerror');
            }
        });
        var nofirst = false;
        $('input[name="username"]').focus(function(){
            if(nofirst){
                if(this.validity.valid) {
                    //$('input[name="username"]').parent().removeClass('red');
                }else{
                    //$('input[name="username"]').parent().addClass('red');
                }
            }else{
                nofirst = true;
            }

        });
        $('input[name="phone"]').blur(function(){
            var reg = /^1[34578]\d{9}$/;
            var val = $(this).val();
            if(isNaN(parseFloat(val))){
                $(this).val('');
                //$(this).parent().addClass('red');
                $(this).attr('placeholder','请您输入手机号');
                $(this).addClass('inputerror');
            }else{
                if(reg.test(val)){
                    //$(this).parent().removeClass('red');
                    $(this).attr('placeholder','手机号');
                    $(this).removeClass('inputerror');

                }else{
                    $(this).val('');
                    //$(this).parent().addClass('red');
                    $(this).attr('placeholder','请您正确输入手机号');
                    $(this).addClass('inputerror');
                }
            }

        });
        $('input[name="phone"]').focus(function(){
            $(this).keyup(function(){
                if(this.validity.valid){
                    $(this).parent().removeClass('red');
                }else{
                    $(this).parent().addClass('red');
                }
            })
        });
    },
    clickReg:function(){
        var usernameReg = false,phoneReg = false,provinceReg = false,cityReg = false,agencyReg = false,cartypeReg = false,buycartimeReg = false;
        var errMsg = '';
        var inputUsername = document.getElementById('username');
        if(inputUsername.validity.valid){
            usernameReg = true;
        }else{
            usernameReg = false;
        }
        var reg = /^1[34578]\d{9}$/;
        if(reg.test($('input[name="phone"]').val())){
            phoneReg = true;
        }else{
            phoneReg = false;
        }
        function selectReg(selectName){
            var val = $('select[name='+selectName+'] option:selected').val();
            var reg;
            if(val&&val!=-1){
                reg = true;
            }else{
                reg = false;
            }
            return reg;

        }
        provinceReg = selectReg('ddlProvince');
        cityReg = selectReg('ddlCity');
        cartypeReg = selectReg('cartype');
        agencyReg = selectReg('agency');
        buycartimeReg = selectReg('cartime');
        var total = usernameReg&&phoneReg&&provinceReg&&cityReg&&agencyReg&&cartypeReg&&buycartimeReg;
        console.log(usernameReg,phoneReg,provinceReg,cityReg,agencyReg,cartypeReg,buycartimeReg);
        console.log(total);
        return total;
        //return true;
    },
    submit:function(){
        function p(nowDate) {
            var myDate = nowDate;
            //获取当前年
            var year = myDate.getFullYear();
            //获取当前月
            var month = myDate.getMonth()+1;
            //获取当前日
            var date = myDate.getDate();
            var h = myDate.getHours();       //获取当前小时数(0-23)
            var m = myDate.getMinutes();     //获取当前分钟数(0-59)
            var s = myDate.getSeconds();
            s=s < 10 ? '0' + s: s;
            m=m<10?'0'+m:m;
            h=h<10?'0'+h:h;
            var now = year + '-' + month + "-" + date + " " + h + ':' + m + ":" + s;
            return now;
        }
        $('#btn-userInfo').on('click',function(e){
            e.preventDefault();
            $(".alert").click(function(){
                $(".alertBox").fadeOut(300);
                $('.btn-userInfo').addClass('btn-move');
            });
            if(SaveInfo.clickReg()){
                SaveInfo.createDate = p(new Date());
                SaveInfo.username = $('input[name="username"]').val();
                SaveInfo.phone = $('input[name="phone"]').val();
                SaveInfo.buytime = $('select[name="cartime"] option:selected').html();
                SaveInfo.cartype = $('select[name="cartype"] option:selected').val();
                var provinceID = $('select[name="ddlProvince"] option:selected').val();
                SaveInfo.province = $('select[name="ddlProvince"] option:selected').html();
                var cityID = $('select[name="ddlCity"] option:selected').val();
                SaveInfo.city = $('select[name="ddlCity"] option:selected').html();
                var dealerNameID = $('select[name="agency"] option:selected').val();
                SaveInfo.dealerName = $('select[name="agency"] option:selected').html();

                var postData ={
                    createDate:SaveInfo.createDate,
                    name:SaveInfo.username,
                    gender:SaveInfo.gender,
                    mobile:SaveInfo.phone,
                    email1:SaveInfo.email1,
                    interested:SaveInfo.cartype,
                    buyCarTime:SaveInfo.buytime,
                    province:SaveInfo.province,
                    city:SaveInfo.city,
                    dealerName:SaveInfo.dealerName,
                    source:SaveInfo.sourcename,
                    eventCode:SaveInfo.eventCode,
                    memo1:SaveInfo.memo1,
                    memo2:SaveInfo.memo2
                };
                console.log(postData);
                /**
                 *  createDate:null,
                 * username:null,//name,name
                 phone:null,//mobile,mobile
                 buytime:null,//buyCarTime,buy_time
                 cartype:null,//interested,car_type
                 province:null,//province,dealer_name省份，城市，经销商（1,2,3）
                 city:null,//city,无
                 dealerName:null,//dealerName,无
                 source:null,//source,source,123
                 eventCode:"1491551316583",//eventCode,无
                 memo1:'2017年DAF中区3-4月促销计划',//memo1,无
                 memo2:'http://www.xxx.com.cn/zt/20170409',//memo2,无
                 key:null,***/
                //请求下游接口注册用户信息
                // 发起Ajax调用
                var xyData = {
                    name:SaveInfo.username,
                    mobile:SaveInfo.phone,
                    buy_time:SaveInfo.buytime,
                    car_type:SaveInfo.cartype,
                    dealer_name:provinceID+','+cityID+','+dealerNameID,
                    source:SaveInfo.source,
                    key:SaveInfo.key
                };
                console.log(xyData);
                $.ajax({
                    type:'get',
                    url:'https://h5php.xingyuanauto.com/Flow/public/index.php/port/Userftlotter/UserLotter',
                    data:xyData,
                    dataType:'json',
                    success:function(msg){
                        console.log(msg);
                        if(msg.code==1001){
                            $.ajax({
                                url:"http://www.changanfordclub.com/Media2Ford/json/saveDataJSONP.action",
                                dataType:'jsonp',
                                data:postData,
                                jsonp:'jsonpcallback',
                                success:function(result) {
                                    if (result.data > 0) {
                                        $(".success").show();
                                        $('.btn-userInfo').removeClass('btn-move');
                                        $('select option[value="-1"]').attr('disabled',false);
                                        $('#userForm')[0].reset();
                                        $('select').removeClass('changed');

                                    }else if(result.data==-99||result.data==-12){
                                        alert('error');
                                    }else{
                                        $(".error").show();
                                    }
                                },
                                timeout:3000
                            });
                        }else if(msg.code==1003){//已注册
                            $(".repace").show();
                            $('.btn-userInfo').removeClass('btn-move');
                        }else if(msg.code==1005){//重复提交
                            $(".repaceagain").show();
                            $('select option[value="-1"]').attr('disabled',false);
                            $('.btn-userInfo').removeClass('btn-move');
                            $('#userForm')[0].reset();
                        }else{
                            $(".error").show();
                        }
                    }
                });
            }else{
                $(".error").show();
            }
        });
    }
};
$(function(){
    //活动详情
    ProvinceData.init('ddlProvince','ddlCity','agency');
    SaveInfo.init();

});




