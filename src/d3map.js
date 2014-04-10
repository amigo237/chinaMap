;(function($, d3) {
    var D3Map = function(options) {
        var defaults = {
            mapWidth: 960,
            mapHeight: 700,
            cityColor: "#429dd4",
            provinceColor: "#aad5ff",
            mouseOverColor: "#feb41c",
            selectedColor: "#e32f02",
            selector: "body",
            selectedArea: "",
            geoJSON: null,
            change: $.noop
        };
        options = $.extend(defaults, options);
        if (!options.geoJSON) {
            throw new Error("miss param geoJSON");
        }
        this._init(options);
        return this;
    }
    
    D3Map.prototype._getTipPos = function(e) {
        var mouseX;
        var mouseY;
        var tipWidth = $('.mapTip').outerWidth();
        var tipHeight = $('.mapTip').outerHeight();
        if (e && e.pageX) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        } else {
            mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        var tipX = mouseX - tipWidth/2 < 0 ? 0 : mouseX - tipWidth/2;
        var tipY = mouseY - tipHeight - 10 < 0 ? mouseY + 10 : mouseY - tipHeight - 10;
        return [tipX, tipY];
    }
    
    D3Map.prototype._init = function(options) {
        var self = this;
        var mapWidth = options.mapWidth;
        var mapHeight = options.mapHeight;
        var cityColor = options.cityColor;
        var provinceColor = options.provinceColor;
        var mouseOverColor = options.mouseOverColor;
        var selectedColor = options.selectedColor;
        var selectedArea = options.selectedArea.split(",");
        var selector = options.selector;
        var projection = d3.geo.albers()
        .scale(mapWidth)
        .translate([mapWidth / 2, mapHeight / 2])
        .rotate([-105, 0])
        .center([0, 36])
        .parallels([27, 45]);
        var path = d3.geo.path().projection(projection);
        var svg = d3.select(selector)
        .append("svg")
        .attr({
            "width": mapWidth,
            "height": mapHeight
        });
        
        $(selector).on("GEOJSON_DONE", function(event, json) {
            svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .attr("data-type", function(data) {
                return data.properties.type;
            })
            .attr("data-province", function(data) {
                return data.properties.province;
            })
            .attr("data-name", function(data) {
                return data.properties.name;
            })
            .attr("fill", function(data) {
                var path = d3.select(this);
                if (data.properties.type === "city") {
                    var str = data.properties.province + "|" + data.properties.name;
                    return selectedArea.indexOf(str) !== -1 || path.attr("data-selected") == "true" ? (path.attr("data-selected", "true"), selectedColor) : cityColor;
                }
                else {
                    var str = data.properties.province;
                    if (selectedArea.indexOf(str) !== -1) {
                        d3.selectAll("[data-province=" + data.properties.name + "]")
                        .attr("data-selected", "true")
                        .attr("fill", selectedColor);
                        return selectedColor;
                    }
                    else {
                        return provinceColor;
                    }
                }
            })
            .on("mouseover", function(data) {
                var path = d3.select(this);
                if (path.attr("data-selected") != "true") {
                    path.transition().attr("fill", mouseOverColor);
                }
            })
            .on("mousemove", function(data) {
                if ($('.mapTip').length == 0) {
                    $(document.body).append('<div class="mapTip"></div');
                }
                $('.mapTip').html(data.properties.name);
                var xy = self._getTipPos(d3.event);
                $('.mapTip').css({
                    left: xy[0],
                    top: xy[1]
                }).show();
            })
            .on("mouseout", function(data) {
                var path = d3.select(this);
                if (path.attr("data-selected") != "true") {
                    if (data.properties.type === "city") {
                        path.transition().attr("fill", cityColor);
                    }
                    else {
                        path.transition().attr("fill", provinceColor);
                    }
                }
                $('.mapTip').hide();
            })
            .on("click", function(data) {
                var path = d3.select(this);
                if (path.attr("data-selected") != "true") {
                    path.attr("data-selected", "true").transition().attr("fill", selectedColor);
                    if (data.properties.type !== "city") {
                        d3.selectAll("[data-province=" + data.properties.name + "]")
                        .attr("data-selected", "true")
                        .transition()
                        .attr("fill", selectedColor);
                    }
                }
                else {
                    path.attr("data-selected", "false").transition().attr("fill", mouseOverColor);
                    if (data.properties.type === "city") {
                        d3.selectAll("[data-province=" + data.properties.province + "][data-type=province]")
                        .attr("data-selected", "false")
                        .transition()
                        .attr("fill", provinceColor);
                    }
                    else {
                        d3.selectAll("[data-province=" + data.properties.province + "][data-type=city]")
                        .attr("data-selected", "false")
                        .transition()
                        .attr("fill", cityColor);
                    }
                }
                
                var geo = d3.selectAll(options.selector + " path[data-selected=true]").data();
                var area = [];
                var province = [];
                for (var i = 0, j = geo.length; i < j; i++) {
                    var object = geo[i];
                    area.push(object.properties.province + "|" + object.properties.name);
                }
                area = area.join(",");
                area = area.replace(/([^,]*)\|([^,]*),?/ig, function(m, m1, m2) {
                    if (m1 === m2) {
                        province.push(m2);
                        return m2 + ",";
                    }
                    else {
                        return province.indexOf(m1) !== -1 ? "" : m;
                    }
                });
                area = area.replace(/,$/ig, "");
                options.change(area);
            });
        });
        
        if ($.isPlainObject(options.geoJSON)) {
            $(selector).trigger("GEOJSON_DONE", options.geoJSON);
        }
        else {
            d3.json(options.geoJSON, function(json) {
                $(selector).trigger("GEOJSON_DONE", json);
            })
        }
    }
    
    $.D3Map = function (options) {
        return new D3Map(options);
    }
    
    if ("function" == typeof define && define.amd) {
        define(["jquery", "d3"], function(require, exports, module) {
            return D3Map;
        });
    }
    else {
        window.D3Map = D3Map;
    }
})(jQuery, d3);