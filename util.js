const API_URL = "https://projektejwkk.de/valorantLineups/API/";

/**
 * @description: Redirects the user to the given url
 * @param {String} url - The url to redirect to
 */
function redirect(url = String) {
  location.href = url;
}

/**
 * @description: Gets the value of a cookie
 * @param {String} name - The name of the cookie
 */
function getCookie(name = String) {
  let cookies = document.cookie.split(";");
  let cookie = cookies.find((cookie) => cookie.includes(name));
  if (cookie) {
    return cookie.split("=")[1];
  } else {
    return null;
  }
}

/**
 * @description: Sets a cookie
 * @param {String} name - The name of the cookie
 * @param {String} value - The value of the cookie
 * @param {Number} days - The amount of days the cookie should be valid
 */
function setCookie(name = String, value = String, days = Number) {
  let date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  let expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

/**
 * @description: Deletes a cookie
 * @param {String} name - The name of the cookie
 */
function deleteCookie(name = String) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function echoParams(url = String, params = Object) {
  let paramsString = "?";
  for (let key in params) {
    if (
      params[key] != null &&
      params[key] != undefined &&
      params[key] != "" &&
      params[key] != " " &&
      params[key] != []
    ) {
      paramsString += key + "=" + params[key] + "&";
    }
  }
  paramsString += "time=" + Date.now();
  return url + paramsString;
}

/**
 * @description: Checks if the user is logged in
 * @param {String} userId - The id of the user
 * @param {String} token - The token of the user
 * @param {Function} callback - The function to call after the request is done
 */
function checkLogin(userId, token = String, callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "check/isLoggedIn.php", {
    userId: userId,
    authKey: token,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    callback(status, response["user"]);
  };
  xml.send();
}

/**
 * @description: Logs the user in
 * @param {String} email - The email of the user
 * @param {String} password - The password of the user
 * @param {Function} callback - The function to call after the request is done
 */
function login(email = String, password = String, callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/userAuth.php", {
    email: email,
    password: password,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    let userId = response["id"];
    let token = response["token"];
    callback(status, userId, token);
  };
  xml.send();
}

/**
 * @description: Registers the user
 * @param {String} email - The email of the user
 * @param {String} password - The password of the user
 * @param {String} username - The username of the user
 * @param {Function} callback - The function to call after the request is done
 */
function register(
  email = String,
  password = String,
  username = String,
  callback = Function
) {
  let color = Math.floor(Math.random() * 16777215).toString(16);
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "create/user.php", {
    username: username,
    password: password,
    email: email,
    color: color,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    let userId = response["data"]["id"];

    if (status == 200) {
      login(email, password, (status, userId, token) => {
        callback(status, userId, token);
      });
    } else {
      callback(status, message, null);
    }
  };
  xml.send();
}

/**
 * @description: Sends Password reset email
 * @param {String} email - The email of the user
 * @param {Function} callback - The function to call after the request is done
 */
function sendResetPasswordMail(email = String, callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "action/resetPassword.php", {
    email: email,
  });
  xml.open("GET", url);
  xml.onload = function () {
    const response = JSON.parse(xml.responseText);
    const status = response["code"];
    const message = response["message"];
    callback(status, message);
  };
  xml.send();
}

/**
 * @description: Reset Password via Token
 * @param {String} token - The token of the user
 * @param {String} password - The password of the user
 */
function resetPassword(token = String, password = String, callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "change/resetPassword.php", {
    authKey: token,
    password: password,
  });
  xml.open("GET", url);
  xml.onload = function () {
    const response = JSON.parse(xml.responseText);
    const status = response["code"];
    const message = response["message"];
    if (status == 200) {
      const email = response["email"];
      callback(status, message, email);
    } else {
      callback(status, message, null);
    }
  };
  xml.send();
}

/**
 * @description: Get a list of all Maps
 * @param {Function} callback - The function to call after the request is done with all the Maps
 */
function getMaps(callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/maps.php", {});
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    let maps = response["data"];
    callback(status, maps);
  };
  xml.send();
}

/**
 * @description: Get a list of all Agents
 * @param {Function} callback - The function to call after the request is done with all the Agents
 */
function getAgents(callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/agents.php", {});
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    let agents = response["data"];
    callback(status, agents);
  };
  xml.send();
}

/**
 * @description: Get a list of abilitys from agent
 * @param {String} agentId - The id of the agent
 * @param {Function} callback - The function to call after the request is done with all the abilitys
 */
function getAbilitys(agentId = String, callback = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/abilitiesFromAgent.php", {
    agent: agentId,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    let abilitys = response["data"];
    callback(status, abilitys);
  };
  xml.send();
}

/**
 * @description: Get a list of all abilitys
 * @param {number[]} tags - Tags the abilities should have
 * @param {Function} callback - The function to call after the request is done with all the abilitys
 */
function getLineups(tags, abilityId, map, limit, recall = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/lineups.php", {
    tags: tags,
    abilityId: abilityId,
    mapId: map,
    limit: limit,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    if (status == 200) {
      let lineups = response["data"];
      let maxCount = response["countAllLineups"];
      recall(status, lineups, maxCount);
    } else {
      recall(status, null);
    }
  };
  xml.send();
}

/**
 *
 * @param {Number} timestamp - The timestamp to convert
 * @returns - The time string
 */
function getTimeStringFromTimestamp(timestamp) {
  const now = new Date();
  const difference = Math.floor((now.getTime() - timestamp) / 1000); // Calculate the time difference in seconds

  const secondsInMinute = 60;
  const secondsInHour = 60 * secondsInMinute;
  const secondsInDay = 24 * secondsInHour;

  if (difference >= secondsInDay) {
    const days = Math.floor(difference / secondsInDay);
    if (days == 1) return `${days} Day ago`;
    return `${days} Days ago`;
  } else if (difference >= secondsInHour) {
    const hours = Math.floor(difference / secondsInHour);
    if (hours == 1) return `${hours} Hour ago`;
    return `${hours} Hours ago`;
  } else if (difference >= secondsInMinute) {
    const minutes = Math.floor(difference / secondsInMinute);
    if (minutes == 1) return `${minutes} Minute ago`;
    return `${minutes} Minutes ago`;
  } else {
    return "Just now";
  }
}

/**
 *  @description: Loads an image and calls the callback function after the image is loaded
 * @param {String} imgUrl - The url of the image
 * @param {Function} recall - The function to call after the image is loaded
 */
function loadImage(imgUrl = String, recall = Function) {
  var img = new Image();
  img.onload = function () {
    recall();
  };
  img.src = imgUrl;
}

/**
 * @description: Draws an arrow on the canvas (all credits: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag)
 * @param {*} context - The context of the canvas
 * @param {*} fromx
 * @param {*} fromy
 * @param {*} tox
 * @param {*} toy
 */
function canvas_arrow(context, fromx, fromy, tox, toy, color, length) {
  var headlen = length; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.strokeStyle = color;

  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.stroke();

  context.lineWidth = 8;
  context.beginPath();
  context.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 4),
    toy - headlen * Math.sin(angle - Math.PI / 4)
  );
  context.moveTo(tox, toy);
  context.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 4),
    toy - headlen * Math.sin(angle + Math.PI / 4)
  );
  context.stroke();
}

/**
 * @description: Calculates the distance between a point and a line (all credits: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment)
 * @param {*} x - The x coordinate of the point
 * @param {*} y - The y coordinate of the point
 * @param {*} x1 - The x coordinate of the first point of the line
 * @param {*} y1 - The y coordinate of the first point of the line
 * @param {*} x2 - The x coordinate of the second point of the line
 * @param {*} y2 - The y coordinate of the second point of the line
 * @returns - The distance
 */
function pDistance(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 *
 */
function getLineup(id, recall = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/lineup.php", {
    lineupId: id,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    if (status == 200) {
      let lineup = response["data"];
      recall(status, lineup);
    } else {
      recall(status, null);
    }
  };
  xml.send();
}

/**
 * @description: Gets the spots on a map
 * @param {Number} mapId - The id of the map
 */
function getSpotsOnMap(mapId, recall = Function) {
  let xml = new XMLHttpRequest();
  const url = echoParams(API_URL + "get/spots.php", {
    mapId: mapId,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    if (status == 200) {
      let spots = response["data"];
      recall(status, spots);
    } else {
      recall(status, null);
    }
  };
  xml.send();
}

function createSpot(x, y, mapId, userId, userAuth, callback) {
  let xml = new XMLHttpRequest();
  console.log(userAuth);
  const url = echoParams(API_URL + "create/spot.php", {
    posX: parseInt(x),
    posY: parseInt(y),
    mapId: mapId,
    userId: userId,
    authKey: userAuth,
  });
  xml.open("GET", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];
    if (status == 200) {
      let spot = response["data"];
      callback(status, spot);
    } else {
      callback(status, null);
    }
  };
  xml.send();
}

function createLineup(
  image,
  imageStandOn,
  agentId,
  abilityId,
  from,
  to,
  userId,
  userAuth,
  callback
) {
  let xml = new XMLHttpRequest();

  var formData = new FormData();
  formData.append("image", image);
  formData.append("imageStandOn", imageStandOn);

  const url = echoParams(API_URL + "create/lineup.php", {
    agentId: agentId,
    abilityId: abilityId,
    spotIdFrom: from,
    spotIdTo: to,
    userId: userId,
    authKey: userAuth,
  });

  xml.open("POST", url);
  xml.onload = function () {
    let response = JSON.parse(xml.responseText);
    let status = response["code"];

    callback(status, response);
  };
  xml.send(formData);
  1;
}

function deleteSpot(spotId, userId, authKey, recall) {
  let xml = new XMLHttpRequest();

  const url = echoParams(API_URL + "delete/spot.php", {
    spotId: spotId,
    userId: userId,
    authKey: authKey,
  });

  xml.open("GET", url);
  xml.onload = function () {
    recall(xml.responseText);
  };
  xml.send();
}
