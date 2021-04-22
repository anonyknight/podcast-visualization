var width = 2000,
height = 1200,
padding = 1.5, // separation nodes in same cluster
clusterPadding = 80, // separation between differnet clusters
maxRadius = 1;



//clustering_results_small.csv (5 clusters with 10-20 in each cluster)
//clustering_results_med.csv (50 clusters with only 3 in each cluster)
//clustering results_all.csv (all the data)
d3.text("clustering_results_small.csv", function(error, text) {
if (error) throw error;
var colNames = "ep_name,rank,group\n" + text; //the color has ep_name, rank, group
var data = d3.csv.parse(colNames);

data.forEach(function(d) {
d.rank = +d.rank; //size determines the radius of the node
});

data = data.filter(function (d) {
return d.rank <= 10;
}); //only show the top 10 episode from each cluster

//unique cluster/group id's
var cs = []; //cs is the clustering id
data.forEach(function(d){
    if(!cs.contains(d.group)) {
        cs.push(d.group);
    }
});

var n = data.length, // total number of nodes
  m = cs.length; // number of distinct clusters
var color = d3.scale.category10()

//hover event
//create a tooltip
var Tooltip = d3.select("#my_dataviz")
.append("div")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")
.style("position", "absolute");


// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  Tooltip
  .style("opacity", 1)
  .html('<u>' + d.ep_name + '</u>' + "<br>" + "Group "+ d.cluster + "<br>" + "Rank "+ d.rank);//show ep_name, group, and rank
}

var mousemove = function(d) {
return Tooltip.style("top", (d3.event.pageY+10)+"px").style("left",(d3.event.pageX+20)+"px");
}

var mouseleave = function(d) {
  Tooltip
  .style("opacity", 0)
}

//create clusters and nodes
var clusters = new Array(m);
var nodes = [];
for (var i = 0; i<n; i++){
  nodes.push(create_nodes(data,i));
}

var force = d3.layout.force()
  .nodes(nodes)
  .size([width, height])
  .gravity(.02)
  .charge(0)
  .on("tick", tick)
  .start();

var svg = d3.select("#my_dataviz").append("svg")
  .attr("width", width)
  .attr("height", height);


var node = svg.selectAll("circle")
  .data(nodes)
  .enter().append("g").call(force.drag);


node.append("circle")
  .style("fill", function (d) {
  return color(d.cluster);
  })
  .attr("r", function(d){return d.radius})


node.append("text")
  .attr("dy", ".3em")
  .style("text-anchor", "middle")
  .text(function(d) { return d.ep_name.substring(0, d.radius / 3); })
  .on("mouseover", mouseover) // What to do when hovered
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);




function create_nodes(data,node_counter) {
var i = cs.indexOf(data[node_counter].group),
    r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
    d = {
      cluster: i,
      radius: 30-data[node_counter].rank, //radius = 30-rank
      ep_name: data[node_counter].ep_name,
      rank: data[node_counter].rank, //rank
      //add more if we want to have more detail of the nodes
      x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
      y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
    };
if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
return d;
};



function tick(e) {
  node.each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
  .attr("transform", function (d) {
      var k = "translate(" + d.x + "," + d.y + ")";
      return k;
  })

}



// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  return function (d) {
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
      var x = d.x - cluster.x,
          y = d.y - cluster.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + cluster.radius;
      if (l != r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
      }
  };
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function (d) {
      var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
              if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
              }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
  };
}
});

Array.prototype.contains = function(v) {
for(var i = 0; i < this.length; i++) {
    if(this[i] === v) return true;
}
return false;
};