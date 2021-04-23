function visualization(data) {
  d3.selectAll("#my_dataviz > *").remove();
  var width = 800,
    height = 600,
    padding = 1.5, // separation nodes in same cluster
    clusterPadding = 80, // separation between different clusters
    maxRadius = 1;

  var data = data.flat();
  data.forEach(function (d) {
    d.rank = +d.duration; //size determines the radius of the node
    d.radius = 10;
  });

  //unique cluster/group id's
  var cs = []; //cs is the clustering id
  data.forEach(function (d) {
    if (!cs.includes(d.clusterId)) {
      cs.push(d.clusterId);
    }
  });

  var n = data.length, // total number of nodes
    m = cs.length; // number of distinct clusters
  var color = d3.scale.category10();

  //hover event
  //create a tooltip
  var Tooltip = d3
    .select("#my_dataviz")
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
  var mouseover = function (d) {
    Tooltip.style("opacity", 1).html(
      "<u>" +
        d.episodeName.split(/\s+/).slice(0, 5).join(" ") +
        "</u>" +
        "<br>" +
        "by " +
        d.author.split(/\s+/).slice(0, 5).join(" ") +
        "<br>" +
        "Duration " +
        d.duration.toString() +
        " mins"
    );
    d3.select(this).style("fill", "red");
  };

  var mousemove = function (d) {
    return Tooltip.style("left", d3.event.pageX - 300 + "px").style(
      "top",
      d3.event.pageY - 50 + "px"
    );
  };

  var mouseleave = function (d) {
    Tooltip.style("opacity", 0);
    d3.select(this).style("fill", function (d) {
      return color(d.cluster);
    });
  };

  //create clusters and nodes
  var clusters = new Array(m);
  var nodes = [];
  for (var i = 0; i < n; i++) {
    nodes.push(create_nodes(data, i));
  }

  var force = d3.layout
    .force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0.02)
    .charge(0)
    .on("tick", tick)
    .start();

  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var node = svg
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("g")
    .call(force.drag);

  node
    .append("circle")
    .style("fill", function (d) {
      return color(d.cluster);
    })
    .attr("r", function (d) {
      return d.radius;
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("dblclick", function (d) {
      moreInfo(d.episodeId, d.clusterId, "viz");
    });

  node
    .append("text")
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.episodeName.substring(0, 10);
    });

  function create_nodes(data, node_counter) {
    var i = cs.indexOf(data[node_counter].clusterId),
      r = Math.sqrt(((i + 1) / m) * -Math.log(Math.random())) * maxRadius,
      d = {
        cluster: i,
        radius: 30, //radius = 30-rank
        episodeName: data[node_counter].episodeName,
        rating: data[node_counter].rating,
        clusterId: data[node_counter].clusterId,
        episodeId: data[node_counter].episodeId,
        author: data[node_counter].author,
        duration: Math.round(data[node_counter].duration),
        x: Math.cos((i / m) * 2 * Math.PI) * 200 + width / 2 + Math.random(),
        y: Math.sin((i / m) * 2 * Math.PI) * 200 + height / 2 + Math.random(),
      };
    if (!clusters[i] || r > clusters[i].radius) clusters[i] = d;
    return d;
  }

  function tick(e) {
    node
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(0.5))
      .attr("transform", function (d) {
        var k = "translate(" + d.x + "," + d.y + ")";
        return k;
      });
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
        l = ((l - r) / l) * alpha;
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
        if (quad.point && quad.point !== d) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r =
              d.radius +
              quad.point.radius +
              (d.cluster === quad.point.cluster ? padding : clusterPadding);
          if (l < r) {
            l = ((l - r) / l) * alpha;
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

  Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === v) return true;
    }
    return false;
  };
}
