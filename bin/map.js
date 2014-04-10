var fs = require("fs");
var china = require("./china.geo");
var map = [];
var an_hui = require("./an_hui.geo");
an_hui.province = "安徽";
map.push(an_hui);

var ao_men = require("./ao_men.geo");
var bei_jing = require("./bei_jing.geo");
var chong_qing = require("./chong_qing.geo");

var fu_jian = require("./fu_jian.geo");
fu_jian.province = "福建";
map.push(fu_jian);

var gan_su = require("./gan_su.geo");
gan_su.province = "甘肃";
map.push(gan_su);

var guang_dong = require("./guang_dong.geo");
guang_dong.province = "广东";
map.push(guang_dong);

var guang_xi = require("./guang_xi.geo");
guang_xi.province = "广西";
map.push(guang_xi);

var gui_zhou = require("./gui_zhou.geo");
gui_zhou.province = "贵州";
map.push(gui_zhou);

var hai_nan = require("./hai_nan.geo");
hai_nan.province = "海南";
map.push(hai_nan);

var he_bei = require("./he_bei.geo");
he_bei.province = "河北";
map.push(he_bei);

var he_nan = require("./he_nan.geo");
he_nan.province = "河南";
map.push(he_nan);

var hei_long_jiang = require("./hei_long_jiang.geo");
hei_long_jiang.province = "黑龙江";
map.push(hei_long_jiang);

var hu_bei = require("./hu_bei.geo");
hu_bei.province = "湖北";
map.push(hu_bei);

var hu_nan = require("./hu_nan.geo");
hu_nan.province = "湖南";
map.push(hu_nan);

var ji_lin = require("./ji_lin.geo");
ji_lin.province = "吉林";
map.push(ji_lin);

var jiang_su = require("./jiang_su.geo");
jiang_su.province = "江苏";
map.push(jiang_su);

var jiang_xi = require("./jiang_xi.geo");
jiang_xi.province = "江西";
map.push(jiang_xi);

var liao_ning = require("./liao_ning.geo");
liao_ning.province = "辽宁";
map.push(liao_ning);

var nei_meng_gu = require("./nei_meng_gu.geo");
nei_meng_gu.province = "内蒙古";
map.push(nei_meng_gu);

var ning_xia = require("./ning_xia.geo");
ning_xia.province = "宁夏";
map.push(ning_xia);

var qing_hai = require("./qing_hai.geo");
qing_hai.province = "青海";
map.push(qing_hai);

var shan_dong = require("./shan_dong.geo");
shan_dong.province = "山东";
map.push(shan_dong);

var shan_xi_1 = require("./shan_xi_1.geo");
shan_xi_1.province = "陕西";
map.push(shan_xi_1);

var shan_xi_2 = require("./shan_xi_2.geo");
shan_xi_2.province = "山西";
map.push(shan_xi_2);

var shang_hai = require("./shang_hai.geo");

var si_chuan = require("./si_chuan.geo");
si_chuan.province = "四川";
map.push(si_chuan);

var tai_wan = require("./tai_wan.geo");
var tian_jin = require("./tian_jin.geo");

var xi_zang = require("./xi_zang.geo");
xi_zang.province = "西藏";
map.push(xi_zang);

var xiang_gang = require("./xiang_gang.geo");

var xin_jiang = require("./xin_jiang.geo");
xin_jiang.province = "新疆";
map.push(xin_jiang);

var yun_nan = require("./yun_nan.geo");
yun_nan.province = "云南";
map.push(yun_nan);

var zhe_jiang = require("./zhe_jiang.geo");
zhe_jiang.province = "浙江";
map.push(zhe_jiang);

var CityWhiteList = [
     "合肥", "福州", "厦门", "兰州", "广州", "深圳", "桂林", "贵阳", "遵义", "海口", "三亚",
     "石家庄", "保定", "郑州", "洛阳", "哈尔滨", "齐齐哈尔", "武汉", "长沙", "长春", "吉林",
     "南京", "苏州", "南昌", "沈阳", "大连", "呼和浩特", "包头", "银川", "西宁", "济南",
     "青岛", "烟台", "太原", "西安", "成都", "乐山", "拉萨", "乌鲁木齐", "石河子", "昆明",
     "丽江", "大理", "杭州", "宁波", "温州"
];
                    
var isInWhiteList = function (city) {
    var result = false;
    CityWhiteList.forEach(function(value) {
        if (city.indexOf(value) != -1) {
            result = true;
            return;
        }
    });
    return result;
}

for (var i = 0, j = china.features.length; i < j; i++) {
    var province = china.features[i];
    province.properties.province = province.properties.name;
    province.properties.type = "province";
}

for (var i = 0, j = map.length; i < j; i++) {
    var province = map[i];
    for (var m = 0, n = province.features.length; m < n; m++) {
        var features = province.features[m];
        if (isInWhiteList(features.properties.name)) {
            features.properties.province = province.province;
            features.properties.type = "city";
            features.geometry.type = "Point";
            features.geometry.coordinates = features.properties.cp;
            china.features.push(features);
        }
    }
}

fs.writeFile('china.city.geo.json', JSON.stringify(china), function (err) {
    if (err) throw err;
    console.log("map geojson has been created");
});