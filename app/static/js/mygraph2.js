var base_url = `http://${document.domain}:${location.port}`;

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = $("#svg-div").parent().width() - margin.left - margin.right,
    height = $("#svg-div").parent().height() - margin.top - margin.bottom;


var nodeScale = d3.scaleSqrt();


var svg = d3.select('#svg-div')
    .append('svg')
    .attr('viewbox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', true);

//  FIGURE OUT THIS VIEWBOX STUFF
var transform = d3.zoomIdentity.translate(100, 50).scale(0.8)
var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .duration(500)
    .on("zoom", function () {
        svg.selectAll('circle')
            .attr('transform', d3.event.transform);
        tooltip.attr('transform', d3.event.transform);
        svg.selectAll('line')
            .attr('transform', d3.event.transform);
        tooltip.attr('transform', d3.event.transform);
        // style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
    });



svg.call(zoom);

var xScale = null;
var yScale = null;

var simulation = d3.forceSimulation()
    // .force("charge", null)//.strength(-200))
    .force("link", d3.forceLink().id(function (d) { return d.sub; }))//.distance(40))
    // .force("x", d3.forceX(width / 2))
    // .force("y", d3.forceY(height / 2))
    .force('collision', d3.forceCollide().radius(4))
    .on("tick", ticked);

// simulation.stop();


var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var adjlist = [];

jsonfile = d3.json("/jsondata").then(function (data) {


    console.log(data)

    xScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, (d) => d.x))
        .range([0, width])


    yScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, (d) => d.y))
        .range([0, height])

    simulation.nodes(data.nodes);
    simulation.force("link").links(data.links);

    node = node
        .data(data.nodes)
        .enter().append("circle")
        .attr("cx", function (d) { return xScale(d.x); })
        .attr("cy", function (d) { return yScale(d.y); })
        .attr("class", "node")
        .attr("r", 6)
        .style("fill", "rgb(172, 220, 114)")
        .style("opacity", 0.8)
        .on('mouseover', nodeOverFunction)
        .on('mousemove', () => tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"))
        .on('mouseout', nodedOutFunction);
        // .call(drag(simulation));

        svg.call(zoom.transform, transform);


    //console.log(node)
    link = link
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "1px")
        .attr("x1", (d) => xScale(d.source.x))
        .attr("y1", (d) => yScale(d.source.y))
        .attr("x2", (d) => xScale(d.target.x))
        .attr("y2", (d) => yScale(d.target.y))


    data.links.forEach(function (d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
    });


    //node.on("mouseover", focus).on("mouseout", unfocus);
});
simulation.tick(10);

function ticked() {

    // link.attr("x1", function (d) { return d.source.x; })
    //     .attr("y1", function (d) { return d.source.y; })
    //     .attr("x2", function (d) { return d.target.x; })
    //     .attr("y2", function (d) { return d.target.y; });
        

    // node.attr("cx", function (d) { return d.x; })
    //     .attr("cy", function (d) { return d.y; });
}


function nodeOverFunction(d) {
    tooltip.style("visibility", "visible")
        .html(() => {
            const content = `<strong>Subreddit:</strong> <span>${d.sub}</span>`
            return content;
        })
    d3.select(this)
        .style('opacity', 1)
        .transition()
        .duration(100)
        .attr('r', '12px')


    var index = d3.select(d3.event.target).datum().index;
    node.style("opacity", function (o) {
        return neigh(index, o.index) ? 1 : 0.1;
    });
    link.style("opacity", function (o) {
        return o.source.index == index || o.target.index == index ? 1 : 0.1;
    });

};

function nodedOutFunction() {
    d3.select(this)
        .transition()
        .duration(100)
        .style('opacity', 0.8)
        .attr('r', '8px')
    tooltip.style("visibility", "hidden")

    node.style("opacity", 0.8);
    link.style("opacity", 0.8);
}

tooltip = d3.select("body").append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("");

drag = simulation => {

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function neigh(a, b) {
    return a == b || adjlist[a + "-" + b];
}