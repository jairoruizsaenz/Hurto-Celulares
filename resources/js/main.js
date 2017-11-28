/* global d3 */
document.body.style.zoom = 0.60
var svg = d3.select("#chart"),
    margin = { top: 20, right: 30, bottom: 150, left: 60 },
    margin2 = { top: 780, right: 30, bottom: 30, left: 60 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

// var parseDate = d3.timeParse("%b %Y");
var parseDate = d3.timeParse("%Y-%-m-%-d");

var usecheckBox01 = true,
    usecheckBox02 = false,
    usecheckBox03 = false,
    usecheckBox04 = false;

d3.select("#checkBox01").property("checked", usecheckBox01);
d3.select("#checkBox02").property("checked", usecheckBox02);
d3.select("#checkBox03").property("checked", usecheckBox03);
d3.select("#checkBox04").property("checked", usecheckBox04);

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var areaTend_Anual = d3.line().curve(d3.curveCatmullRomOpen)
    .x(function (d) { return x(d.Fecha); })
    .y(function (d) { return y(d.tend_anual); });

var areaTend_Cuatrimestral = d3.line().curve(d3.curveCatmullRomOpen)
    .x(function (d) { return x(d.Fecha); })
    .y(function (d) { return y(d.tend_cuatrimestral); });

var areaTend_Mensual = d3.line().curve(d3.curveCatmullRomOpen)
    .x(function (d) { return x(d.Fecha); })
    .y(function (d) { return y(d.tend_mensual); });

var area = d3.line().curve(d3.curveCatmullRomOpen)
    .x(function (d) { return x(d.Fecha); })
    .y(function (d) { return y(d.Cantidad); });

var area2 = d3.line().curve(d3.curveMonotoneX)
    .x(function (d) { return x2(d.Fecha); })    
    .y(function (d) { return y2(d.Cantidad); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var urlData = "resources/data/hurtoCelularesFrecuencia_final.csv";

d3.csv(urlData, type, function (error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function (d) { return d.Fecha; }));
    y.domain([0, d3.max(data, function (d) { return d.Cantidad; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("path")
        .datum(data)
        .attr("class", "area")        
        .attr("d", area);
    
    focus.append("path")
        .datum(data)
        .attr("class", "areaTend")
        .attr("id", "areaTend_Anual")
        .attr("d", areaTend_Anual)
        .attr("stroke-opacity", 0.0);
    
    focus.append("path")
        .datum(data)
        .attr("class", "areaTend")
        .attr("id", "areaTend_Cuatrimestral")
        .attr("d", areaTend_Cuatrimestral)
        .attr("stroke-opacity", 0.0);
    
    focus.append("path")
        .datum(data)
        .attr("class", "areaTend")
        .attr("id", "areaTend_Mensual")
        .attr("d", areaTend_Mensual)
        .attr("stroke-opacity", 0.0);
    
    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);
    
    focus.append("g")
        .append("text")
        .attr("class", "axis_label")
        .attr("transform", "translate(-40," + height/2 + ") rotate(-90)")
        .text("Cantidad de hurtos a celular")        
        .attr("text-anchor","middle");

    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
});


function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".area").attr("d", area);
    focus.select("#areaTend_Anual").attr("d", areaTend_Anual);
    focus.select("#areaTend_Cuatrimestral").attr("d", areaTend_Cuatrimestral);
    focus.select("#areaTend_Mensual").attr("d", areaTend_Mensual);
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".area").attr("d", area);
    focus.select("#areaTend_Anual").attr("d", areaTend_Anual);
    focus.select("#areaTend_Cuatrimestral").attr("d", areaTend_Cuatrimestral);
    focus.select("#areaTend_Mensual").attr("d", areaTend_Mensual);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
    d.Fecha = parseDate(d.Fecha);
    d.Cantidad = +d.Cantidad;
    return d;
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

d3.select("#checkBox01").on("change", oncheckBox01);
d3.select("#checkBox02").on("change", oncheckBox02);
d3.select("#checkBox03").on("change", oncheckBox03);
d3.select("#checkBox04").on("change", oncheckBox04);

function oncheckBox01() {    
    if (usecheckBox01) {usecheckBox01 = false;focus.selectAll(".area").attr("stroke-opacity", 0.0);        
    } else {usecheckBox01 = true;focus.selectAll(".area").attr("stroke-opacity", 1.0);}
 }

function oncheckBox02() {    
    if (usecheckBox02) {usecheckBox02 = false;focus.selectAll("#areaTend_Anual").attr("stroke-opacity", 0.0);       
    } else {usecheckBox02 = true;focus.selectAll("#areaTend_Anual").attr("stroke-opacity", 1.0);}
}

function oncheckBox03() {
    if (usecheckBox03) {usecheckBox03 = false;focus.selectAll("#areaTend_Cuatrimestral").attr("stroke-opacity", 0.0);        
    } else {usecheckBox03 = true;focus.selectAll("#areaTend_Cuatrimestral").attr("stroke-opacity", 1.0);}        
}

function oncheckBox04() {    
    if (usecheckBox04) {usecheckBox04 = false;focus.selectAll("#areaTend_Mensual").attr("stroke-opacity", 0.0);     
    } else {usecheckBox04 = true;focus.selectAll("#areaTend_Mensual").attr("stroke-opacity", 1.0);}
}

/*
http://mcaule.github.io/d3-timeseries/
https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3

https://bl.ocks.org/mbostock/805115ebaa574e771db1875a6d828949
https://jsfiddle.net/ningunaparte/9gm68vmn/

Pendientes:
 - tooltip
 - leyenda
 - echar pola
 - ajustar height de las gráficas
 */