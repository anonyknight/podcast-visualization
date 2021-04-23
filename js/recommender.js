function init() {
  var init_cluster_id = 4;
  episodesDB = [];
  clusterData = [];
  setupModal();
  getClusters(init_cluster_id);
}

episodesDB = [];
clusterData = [];

var backend_url = "https://1wk1r9dra8.execute-api.us-east-1.amazonaws.com/Test";

function getClusters(clusterId) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      clusterData.push(JSON.parse(xhttp.responseText));
      arr = JSON.parse(xhttp.responseText);
      arr = arr.flat();
      arr.forEach((i) => episodesDB.push(i));
      if (clusterId <= 5 - document.getElementById("clusterSlider").value) {
        visualization(clusterData);
        getLikedEpisodes();
      } else {
        getClusters(clusterId - 1);
      }
    }
  };
  xhttp.open(
    "GET",
    `${backend_url}/episode?clusterId=${clusterId}`,
    true
  );
  xhttp.send();
}

function likeEpisode(clusterId, episodeId, rating = 3) {
  document.getElementById("likeBar").innerHTML = "Thanks for feedback!";
  updateLikeDB(clusterId, episodeId, rating);
}

function updateLikeDB(clusterId, episodeId, rating) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      ratingThanks();
      init();
    }
  };
  xhttp.open(
    "POST",
    `${backend_url}/episode?rating=${rating}&episodeId=${episodeId}&clusterId=${clusterId}`,
    true
  );
  xhttp.send();
}

function rateLikedEpisode(clusterId, episodeId, rating) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      ratingThanks();
      init();
    }
  };
  xhttp.open(
    "POST",
    `${backend_url}/liked?rating=${rating}&episodeId=${episodeId}&clusterId=${clusterId}`,
    true
  );
  xhttp.send();
}

function getLikedEpisodes() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      result = JSON.parse(xhttp.responseText);
      rec = [];
      result[1].forEach((i) => rec.push(JSON.parse(i)));
      document.getElementById("liked").innerHTML = episodeParser(
        JSON.parse(result[0]).Items,
        0
      );
      document.getElementById("recommended").innerHTML = episodeParser(rec, 1);
      document.getElementById("stats").innerHTML = updateStats(
        JSON.parse(result[0]).Items
      );
    }
  };
  xhttp.open(
    "GET",
    `${backend_url}/liked`,
    true
  );
  xhttp.send();
}

function episodeParser(response, type) {
  if (response == null) return;
  var header =
    '<center><div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front">';
  var middle = '</div><div class="flip-card-back">';
  var footer = " </div></div></div><br></center>";
  var defaultImage =
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png";
  episodes = "";
  response.forEach((i) => {
    episodesDB.push(i);
    rating = "<br>";
    var j = 0;
    for (j = 0; j < i["rating"]; j++)
      rating +=
        '<span class="fa fa-star checked" onclick="rateEpisode(' +
        i["episodeId"] +
        "," +
        i["clusterId"] +
        "," +
        (j + 1) +
        "," +
        type +
        ')"></span>';
    for (; j < 5; j++)
      rating +=
        '<span class="fa fa-star" onclick="rateEpisode(' +
        i["episodeId"] +
        "," +
        i["clusterId"] +
        "," +
        (j + 1) +
        "," +
        type +
        ')"></span>';
    rating += "<br>";
    thumbnail = i["thumbnail"];
    if (!thumbnail) thumbnail = getImageHeader(defaultImage);
    else thumbnail = getImageHeader(thumbnail);
    episodes +=
      header + thumbnail + middle + rating + getEpisodeInfo(i) + footer;
  });
  return episodes;
}

function getImageHeader(link) {
  return '<img src="' + link + '" style="width:200px;height:200px;">';
}

function getEpisodeInfo(data) {
  episode =
    "<br><b>" +
    data["episodeName"].split(/\s+/).slice(0, 5).join(" ") +
    "</b><br>Duration - " +
    Math.round(data["duration"]).toString() +
    " mins<br> Language - " +
    data["language"] +
    "<br><button onclick=moreInfo('" +
    data["episodeId"].toString() +
    "') style='color:#000000';>More Info...</button>";
  return episode;
}

function moreInfo(episodeId, clusterId = -1, type = "") {
  like = "";
  if (type === "viz") {
    like =
      '<p id="likeBar">Like<i onclick="likeEpisode(' +
      clusterId.toString() +
      "," +
      episodeId.toString() +
      ')" class="fa fa-thumbs-up"></i>&nbsp;&nbsp;&nbsp;&nbsp;Dislike<i onclick="likeEpisode(' +
      clusterId.toString() +
      "," +
      episodeId.toString() +
      ',0)" class="fa fa-thumbs-down"></i></p><br>';
  }
  data = null;
  for (var i = 0; i < episodesDB.length; i++) {
    if (episodeId.toString() === episodesDB[i]["episodeId"].toString()) {
      data = episodesDB[i];
      break;
    }
  }
  if (!data) return;
  var defaultImage =
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png";
  thumbnail = data["thumbnail"];
  if (!thumbnail) thumbnail = getImageHeader(defaultImage);
  else thumbnail = getImageHeader(thumbnail);

  document.getElementById("moreInfo").innerHTML =
    "<h3>Peek into the episode</h3>" +
    like +
    "<table><tr><td>Episode Name</td><td>" +
    data["episodeName"] +
    "</td></tr><tr><td>Podcast Name</td><td>" +
    data["showName"] +
    "</tr><tr><td>Author</td><td>" +
    data["author"] +
    "</td></tr><tr><td>Episode Description</td><td>" +
    data["episodeDesc"] +
    "</td></tr><tr><td>Show Description</td><td>" +
    data["showDesc"] +
    "</td></tr><tr><td>Language</td><td>" +
    data["language"] +
    "</td></tr><tr><td>Published Data</td><td>" +
    data["date"] +
    "</td></tr><tr><td>Duration</td><td>" +
    Math.round(data["duration"]).toString() +
    " mins</td></tr><tr><td>Title</td><td>" +
    data["title"] +
    "</td></tr><tr><td>Thumbnail</td><td>" +
    thumbnail +
    "</td></tr></table>";
  document.getElementById("episodeDetailedInfo").style.display = "block";
}

function rateEpisode(episodeId, clusterId, rating, type) {
  if (type == 1) {
    updateLikeDB(clusterId, episodeId, rating);
  } else if (type == 0) {
    rateLikedEpisode(clusterId, episodeId, rating);
  }
}

function resetDB() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert("Reset successful");
      init();
    }
  };
  xhttp.open(
    "GET",
    `${backend_url}/reset`,
    true
  );
  xhttp.send();
}

function updateStats(response) {
  count = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  avgRating = 0;
  for (var j = 0; j < response.length; j++) {
    count[response[j]["rating"]] += 1;
    avgRating += parseInt(response[j]["rating"]);
  }
  if (response.length) avgRating /= response.length;
  document.getElementById("globalStats").innerHTML =
    "Avg. Rating " +
    Math.round(avgRating.toString() * 100) / 100 +
    " across " +
    response.length.toString() +
    " ratings";
  stats = "<center><table>";
  percent = 25;
  for (var i = 0; i <= 4; i++) {
    rating = "";
    for (j = 0; j < 5 - i; j++)
      rating += '<span class="fa fa-star checked"></span>';
    for (; j < 5 - i; j++) rating += '<span class="fa fa-star"></span>';
    icons =
      '<div class="w3-container w3-green w3-center" style="width:' +
      Math.max((100 * count[5 - i]) / response.length, 20).toString() +
      '%">' +
      ((100 * count[5 - i]) / response.length).toString() +
      "%</div>";
    stats += "<tr><td>" + rating + "</td><td>" + icons + "</td></tr>";
  }
  stats += "</table></center>";
  return stats;
}

//uploadEpisodes()
function uploadEpisodes() {
  $.ajax({
    url: "data.csv",
    dataType: "text",
  }).done((data) => uploader(data, "4"));
}

function setupModal() {
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    document.getElementById("episodeDetailedInfo").style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == document.getElementById("episodeDetailedInfo")) {
      document.getElementById("episodeDetailedInfo").style.display = "none";
    }
  };

  var slider = document.getElementById("clusterSlider");
  var output = document.getElementById("clusterCount");
  slider.oninput = function () {
    output.innerHTML = "Generate " + this.value + " cluster(s)";
  };
}

function ratingThanks() {
  var x = document.getElementById("snackbar");
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

var i = 0;
var txt = "Podcast Episode Explorer - Team #157 Elegant";
document.getElementById("heading").innerHTML = "";
var speed = 50;
typeWriter();
function typeWriter() {
  if (i < txt.length) {
    document.getElementById("heading").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

function uploader(episodes, clusterId) {
  var allTextLines = episodes.split(/\r\n|\n/);
  var headers = allTextLines[0].split(",");
  var lines = [];

  for (var i = 1; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (data[7] === clusterId) {
      var tarr = [];
      for (var j = 0; j < headers.length; j++) {
        tarr.push(data[j]);
      }
      lines.push(tarr);
    }
  }

  for (var i = 0; i < lines.length && i < 15; i++) {
    var eData = lines[i];
    var data = {};
    data["episodeId"] = eData[0];
    data["showName"] = eData[1];
    data["showDesc"] = eData[2];
    data["language"] = eData[3];
    data["episodeName"] = eData[4];
    data["episodeDesc"] = eData[5];
    data["duration"] = eData[6];
    data["clusterId"] = eData[7];
    data["title"] = eData[8];
    data["thumbnail"] = eData[9];
    data["author"] = eData[10];
    data["date"] = eData[11];
    data["liked"] = false;
    data["rating"] = 0;
    var xhttp = new XMLHttpRequest();
    xhttp.open(
      "POST",
      `${backend_url}/uploadepisode`,
      true
    );
    xhttp.send(JSON.stringify(data));
  }
}
