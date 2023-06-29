let vue = new Vue({
  el: "#app",
  data: {
    navHeaders: [],
    userData: {
      mail: "",
      userIconLetter: "J",
    },
    isLoggedIn: false,
    activePage: "",
    selection: {
      map: null,
      agent: null,
      ability: null,
      spot: null,
    },
    maps: [],
    agents: [],
    lineups: [],
    activeAbilitys: [],
    activeLineups: [],
    isLineupSelected: false,
    selectedLineup: {
      id: null,
      whenReleased: null,
      image: null,
      map: {
        name: null,
        image: null,
      },
      ability: {
        icon: null,
        name: null,
      },
      from: {
        x: null,
        y: null,
      },
      to: {
        x: null,
        y: null,
      },
      tags: [],
    },
    isLineupShown: false,
    highlightedLineup: null,
    uploadInput: {
      map: null,
      agent: null,
      ability: null,
      from: null,
      to: null,
    },
    possibleAbilitys: [],
    spots: [],
    selectedImage1: "",
    selectedImage2: "",
    selectedImage3: "",
    userLineups: [],
    isUploading: false,
  },
  watch: {
    "uploadInput.agent": function () {
      this.loadPossibleAbilitys();
    },
    "uploadInput.map": function () {
      this.updateCreatorCanvas();
    },
  },
  methods: {
    loadUserLineups: function () {
      let self = this;

      let authKey = getCookie("vtUserAuth");
      let userId = getCookie("vtUserId");

      let lineups = getUserLineups(userId, authKey, (lineups) => {
        let json = JSON.parse(lineups);

        let data = json["data"];

        self.userLineups = data;

        console.log(data);
      });
    },
    creatorCanvasMouseMove: function (e) {
      let self = this;

      self.x = e.clientX;
      self.y = e.clientY;
    },
    submitLineup: function () {
      let self = this;
      let imageLookingAt = document.getElementById("file").files[0];
      let imageStandOn = document.getElementById("imagePosition").files[0];
      let imageLandOn = document.getElementById("imageLandOn").files[0];

      if (
        imageLookingAt == null ||
        imageStandOn == null ||
        imageLandOn == null
      ) {
        alert("Please select an image");
        return;
      }

      if (this.uploadInput.map == null) {
        alert("Please select a map");
        return;
      }

      if (this.uploadInput.agent == null) {
        alert("Please select an agent");
        return;
      }

      if (this.uploadInput.ability == null) {
        alert("Please select an ability");
        return;
      }

      if (this.uploadInput.from == null) {
        alert("Please select a start spot");
        return;
      }

      if (this.uploadInput.to == null) {
        alert("Please select an end spot");
        return;
      }

      if (this.uploadInput.from == this.uploadInput.to) {
        alert("Start and end spot can't be the same");
        return;
      }

      const userAuth = getCookie("vtUserAuth");
      const userId = getCookie("vtUserId");

      self.isUploading = true;
      console.log("Uploading");

      createLineup(
        imageLookingAt,
        imageStandOn,
        imageLandOn,
        this.uploadInput.agent,
        this.uploadInput.ability,
        this.uploadInput.from,
        this.uploadInput.to,
        userId,
        userAuth,
        (status, lineup) => {
          if (status == 200) {
            self.updateCreatorCanvas();
            self.refreshSelectors();
            self.uploadInput = {
              "map": null,
              "agent": null,
              "ability": null,
              "from": null,
              "to": null,
            };
            document.getElementById("file").value = null;
            document.getElementById("imagePosition").value = null;
            document.getElementById("imageLandOn").value = null;
            alert("Lineup created");
          } else {
            alert("Something went wrong");
          }
          self.isUploading = false;
        }
      );
    },
    refreshSelectors: function () {
      let self = this;

      const selectors = document.getElementsByClassName("selector");
      for (let selector of selectors) {
        selector.value = null;
      }
    },
    creatorCanvasButtonDown: function (e) {
      let self = this;
      let canvas = document.getElementById("canvasLineupCreator");
      let rect = canvas.getBoundingClientRect();
      let x = ((self.clientX - rect.left) / (rect.right - rect.left)) * 1000;
      let y = ((self.clientY - rect.top) / (rect.bottom - rect.top)) * 1000;

      let spot = null;

      let minDistance = -1;
      for (let s of this.spots) {
        let distance = Math.sqrt(
          Math.pow(s["PosX"] - x, 2) + Math.pow(s["PosY"] - y, 2)
        );
        if (distance < 60 && (minDistance == -1 || distance < minDistance)) {
          spot = s;
          minDistance = distance;
        }
      }

      if (spot != null) {
        let userId = getCookie("vtUserId");
        let userAuth = getCookie("vtUserAuth");

        if (e.key == "Delete") {
          deleteSpot(spot, userId, userAuth, (status, data) => {
            self.updateCreatorCanvas();
          });
        }
      }
    },
    creatorCanvasClick: function (e) {
      let self = this;
      let canvas = document.getElementById("canvasLineupCreator");
      let rect = canvas.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / (rect.right - rect.left)) * 1000;
      let y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) * 1000;

      const userAuth = getCookie("vtUserAuth");
      const userId = getCookie("vtUserId");

      if (e.button == 1) {
        createSpot(
          x,
          y,
          self.uploadInput.map,
          userId,
          userAuth,
          (status, spot) => {
            if (status == 200) {
              setTimeout(() => {
                self.updateCreatorCanvas();
              }, 400);
            }
          }
        );
      }

      if (e.button == 0) {
        e.preventDefault();
        let self = this;
        let spot = null;

        let minDistance = -1;
        for (let s of this.spots) {
          let distance = Math.sqrt(
            Math.pow(s["PosX"] - x, 2) + Math.pow(s["PosY"] - y, 2)
          );
          if (distance < 60 && (minDistance == -1 || distance < minDistance)) {
            spot = s;
            minDistance = distance;
          }
        }
        if (spot != null) {
          self.uploadInput.from = spot["ID"];
          self.updateCreatorCanvas();
        }
      }

      if (e.button == 2) {
        e.preventDefault();
        let self = this;
        let spot = null;

        let minDistance = -1;
        for (let s of this.spots) {
          let distance = Math.sqrt(
            Math.pow(s["PosX"] - x, 2) + Math.pow(s["PosY"] - y, 2)
          );
          if (distance < 60 && (minDistance == -1 || distance < minDistance)) {
            spot = s;
            minDistance = distance;
          }
        }
        if (spot != null) {
          self.uploadInput.to = spot["ID"];
          if (self.uploadInput.from == spot["ID"]) {
            self.uploadInput.from = null;
          }
          self.updateCreatorCanvas();
        }
      }
    },
    refreshSpots: function (callback) {
      const self = this;
      if (this.uploadInput.map == null) return;
      getSpotsOnMap(this.uploadInput.map, (status, spots) => {
        if (status == 200) {
          self.spots = spots;
        } else {
          self.spots = [];
        }
        callback();
      });
    },
    updateCreatorCanvas: function () {
      this.refreshSpots(() => {
        const canvas = document.getElementById("canvasLineupCreator");
        if (canvas == null) return;
        const ctx = canvas.getContext("2d");
        const self = this;
        const img = new Image();
        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let spotFrom = null;
          let spotTo = null;

          for (let spot of self.spots) {
            ctx.beginPath();
            let x = (spot["PosX"] / 1000) * canvas.width;
            let y = (spot["PosY"] / 1000) * canvas.height;

            let color = "#e9f5a6";

            if (spot["ID"] == self.uploadInput.from) {
              color = "red";
              spotFrom = spot;
              spotFrom.x = x;
              spotFrom.y = y;
            }

            if (spot["ID"] == self.uploadInput.to) {
              color = "green";
              spotTo = spot;
              spotTo.x = x;
              spotTo.y = y;
            }

            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }

          if (spotTo != null && spotFrom != null) {
            canvas_arrow(
              ctx,
              spotFrom.x,
              spotFrom.y,
              spotTo.x,
              spotTo.y,
              "#d1e65c",
              30
            );
          }
        };
        let url = "";

        for (let map of this.maps) {
          if (map["ID"] == this.uploadInput.map) {
            url = map["MapImagePath"];
            break;
          }
        }

        img.src = url;
      });
    },
    loadPossibleAbilitys: function () {
      const self = this;
      getAbilitys(this.uploadInput.agent, (status, abilitys) => {
        if (status == 200) {
          self.possibleAbilitys = abilitys;
        }
      });
    },
    setPage: function (page) {
      const self = this;
      if (this.activePage == page) {
        this.setPage("home");
        return;
      }
      this.activePage = page;

      const newUrl = new URL(window.location.href);

      newUrl.searchParams.set("page", page);
      window.history.pushState({}, "", newUrl);
      this.loadDemoLineups();

      const icons = document.getElementsByClassName("redirectButton");

      for (const icon of icons) {
        if (icon.classList.contains("redirect" + page)) {
          icon.classList.add("active");
        } else {
          icon.classList.remove("active");
        }
      }

      if (this.activePage == "maps") {
        setTimeout(() => {
          this.refreshCanvas(() => {
            document.getElementById("canvasMapDisplay").addEventListener(
              "mousemove",
              function (e) {
                self.checkCanvasMovement(e);
              },
              false
            );
            document.getElementById("canvasMapDisplay").addEventListener(
              "mousedown",
              function (e) {
                self.checkCanvasClick(e);
              },
              false
            );
            this.selectMap(1);
          });
        }, 100);
      }
      if (this.activePage == "upload") {
        this.updateCreatorCanvas();
        setTimeout(() => {
          const canvas = document.getElementById("canvasLineupCreator");
          canvas.addEventListener("mousedown", (e) => {
            self.creatorCanvasClick(e);
          });
          canvas.addEventListener("contextmenu", (event) =>
            event.preventDefault()
          );
          canvas.addEventListener("mousemove", (e) => {
            self.creatorCanvasMouseMove(e);
          });

          document.addEventListener("keydown", (e) => {
            if (self.activePage == "upload") {
              self.creatorCanvasButtonDown(e);
            }
          });
        }, 200);
      }
    },
    loadMaps: function () {
      const self = this;
      getMaps((status, maps) => {
        if (status == 200) {
          self.maps = maps;
          setTimeout(() => {
            self.selectMap(1);
          }, 10);
        }
      });
    },
    loadAgents: function () {
      const self = this;
      getAgents((status, agents) => {
        if (status == 200) {
          self.agents = agents;
          setTimeout(() => {
            self.selectAgent(12);
          }, 10);
        }
      });
    },
    loadDemoLineups: function () {
      const self = this;
      getLineups(
        undefined,
        undefined,
        undefined,
        10,
        (status, lineups, maxCount) => {
          if (status == 200) {
            self.lineups = [];

            for (const lineup of lineups) {
              let lineupCorrect = {
                id: lineup["ID"],
                whenReleased: getTimeStringFromTimestamp(lineup["DateCreated"]),
                map: {
                  name: lineup["FromSpot"]["Name"],
                  image: lineup["FromSpot"]["SmallIImages"],
                },
                ability: {
                  icon: lineup["Ability"]["IconPath"],
                },
                agent: {
                  name: lineup["Ability"]["Agent"]["Name"],
                },
              };
              self.lineups.push(lineupCorrect);
            }
            self.amountLineupsLeft = maxCount - self.lineups.length;
          }
        }
      );
    },
    loadAbilitys: function (callback = Function) {
      const self = this;
      getAbilitys(this.selection.agent, (status, abilitys) => {
        if (status == 200) {
          self.activeAbilitys = abilitys;
          setTimeout(() => {
            callback();
          }, 100);
        }
      });
    },
    loadLineups: function (recall) {
      const self = this;
      getLineups(
        [],
        this.selection.ability,
        this.selection.map,
        null,
        (status, lineups) => {
          if (status == 200) {
            self.activeLineups = lineups;
          }
          recall();
        }
      );
    },
    checkCanvasMovement: function (e, print = false) {
      let canvas = document.getElementById("canvasMapDisplay");
      let rect = canvas.getBoundingClientRect();
      let x =
        ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
      let y =
        ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
      let leastDistance = -1;
      let foundLineup = null;

      for (let lineup of this.activeLineups) {
        let fromSpot = lineup["FromSpot"];
        let toSpot = lineup["ToSpot"];

        let fromSpotX = (fromSpot["PosX"] / 1000) * canvas.width;
        let fromSpotY = (fromSpot["PosY"] / 1000) * canvas.height;

        let toSpotX = (toSpot["PosX"] / 1000) * canvas.width;
        let toSpotY = (toSpot["PosY"] / 1000) * canvas.height;

        let distance = pDistance(x, y, fromSpotX, fromSpotY, toSpotX, toSpotY);

        if (
          distance <= 20 &&
          (distance <= leastDistance || leastDistance == -1)
        ) {
          foundLineup = lineup["ID"];
          leastDistance = distance;
        }
      }

      if (this.highlightedLineup != foundLineup) {
        this.highlightedLineup = foundLineup;
        this.refreshCanvas();
      }

      if (leastDistance == -1) {
        this.highlightedLineup = null;
      }
    },
    checkCanvasClick: function (e = Event) {
      if (e.button == 0) {
        if (this.highlightedLineup != null) {
          this.showLineup(this.highlightedLineup);
        }
      }
    },
    showLineup: function (lineupId) {
      const self = this;
      getLineup(lineupId, (status, lineup) => {
        if (status == 200) {
          self.selectedLineup = lineup;
          self.isLineupShown = true;

          const image = new Image();
          image.src = lineup["ToSpot"]["MapImagePath"];
          image.onload = function () {
            const canvas = document.getElementById("canvasPositionLineup");
            const ctx = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);

            ctx.strokeWidth = 15;
            ctx.lineWidth = 15;

            const fromSpot = lineup["FromSpot"];
            const toSpot = lineup["ToSpot"];

            const fromSpotX = (fromSpot["PosX"] / 1000) * canvas.width;
            const fromSpotY = (fromSpot["PosY"] / 1000) * canvas.height;

            const toSpotX = (toSpot["PosX"] / 1000) * canvas.width;
            const toSpotY = (toSpot["PosY"] / 1000) * canvas.height;

            let color = "#E9F5A6";

            canvas_arrow(
              ctx,
              fromSpotX,
              fromSpotY,
              toSpotX,
              toSpotY,
              color,
              30
            );

            ctx.beginPath();
            ctx.arc(fromSpotX, fromSpotY, 15, 0, 2 * Math.PI);
            ctx.fillStyle = "#d1e65c";
            ctx.fill();
          };
          self.selectedImage2 = lineup.ImageStandOn;
          self.selectedImage1 = lineup.ImageLineup;
          self.selectedImage3 = lineup.ImageLandOn;

          if (
            self.selectedImage1 == "" ||
            self.selectedImage1 == null ||
            self.selectedImage1 == undefined
          ) {
            self.selectedImage1 = "../assets/noImageUploaded.png";
          }

          if (
            self.selectedImage2 == "" ||
            self.selectedImage2 == null ||
            self.selectedImage2 == undefined
          ) {
            self.selectedImage2 = "../assets/noImageUploaded.png";
          }

          if (
            self.selectedImage3 == "" ||
            self.selectedImage3 == null ||
            self.selectedImage3 == undefined
          ) {
            self.selectedImage3 = "../assets/noImageUploaded.png";
          }
        }
      });
    },
    switchImages: function () {
      let imageBackup = this.selectedImage1;
      this.selectedImage1 = this.selectedImage2;
      this.selectedImage2 = imageBackup;
    },
    switchImages2: function () {
      let imageBackup = this.selectedImage3;
      this.selectedImage3 = this.selectedImage1;
      this.selectedImage1 = imageBackup;
    },
    refreshCanvas: function (recall = Function) {
      let self = this;
      let mapImage = new Image();
      let canvas = document.getElementById("canvasMapDisplay");
      if (canvas != null) {
        let ctx = canvas.getContext("2d");

        this.loadLineups(() => {
          if (this.selection.map == null) {
            return;
          }
          mapImage.src = this.maps[this.selection.map - 1]["MapImagePath"];
          mapImage.onload = function () {
            canvas.width = mapImage.width;
            canvas.height = mapImage.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(mapImage, 0, 0);

            for (const lineup of self.activeLineups) {
              if (lineup["AbilityId"] != self.selection.ability) {
                continue;
              }

              const fromSpot = lineup["FromSpot"];
              const toSpot = lineup["ToSpot"];

              const fromSpotX = (fromSpot["PosX"] / 1000) * canvas.width;
              const fromSpotY = (fromSpot["PosY"] / 1000) * canvas.height;

              const toSpotX = (toSpot["PosX"] / 1000) * canvas.width;
              const toSpotY = (toSpot["PosY"] / 1000) * canvas.height;

              const abilityType = lineup["Ability"]["Type"];

              const colors = {
                1: "#E9F5A6",
                2: "#d1e65c",
              };

              let color = colors[1];

              if (lineup.ID == self.highlightedLineup) {
                color = colors[2];
                ctx.lineWidth = 5;
                ctx.strokeWidth = 5;
              } else {
                ctx.strokeWidth = 3;
                ctx.lineWidth = 3;
              }

              const abilityDrawFunction = abilityDrawfunctions[abilityType];

              abilityDrawFunction(
                ctx,
                fromSpotX,
                fromSpotY,
                toSpotX,
                toSpotY,
                color
              );
            }
            recall();
          };
        });
      }
    },
    selectMap: function (map) {
      if (this.selection.map != null) {
        const oldMap = document.getElementsByClassName(
          "map" + this.selection.map
        )[0];

        if (oldMap != null) {
          oldMap.classList.remove("active");
        }
      }

      let elem = document.getElementsByClassName("map" + map)[0];
      if (elem != undefined && elem != null) {
        elem.classList.add("active");
      }

      this.selection.map = map;
      this.refreshCanvas();
    },
    selectAgent: function (agent) {
      if (this.selection.agent != null) {
        const oldAgent = document.getElementsByClassName(
          "agent" + this.selection.agent
        )[0];
        oldAgent.classList.remove("active");
      }

      let agentIcon = document.getElementsByClassName("agent" + agent)[0];
      if (agentIcon != undefined) {
        agentIcon.classList.add("active");
      }

      this.selection.agent = agent;

      const self = this;

      this.loadAbilitys(() => {
        for (const ability of this.activeAbilitys) {
          if (ability["AgentId"] == this.selection.agent) {
            this.selectAbility(ability["ID"]);
            break;
          }
        }
      });

      this.refreshCanvas();
    },
    selectAbility: function (ability) {
      if (this.selection.ability != null) {
        const oldAbility = document.getElementsByClassName(
          "ability" + this.selection.ability
        )[0];
        if (oldAbility != null) {
          oldAbility.classList.remove("active");
        }
      }

      let abilityIcon = document.getElementsByClassName("ability" + ability)[0];
      if (abilityIcon != undefined) {
        abilityIcon.classList.add("active");
      }

      this.selection.ability = ability;

      this.refreshCanvas();
    },
    selectSpot: function (spot) {
      this.selection.spot = spot;
    },
    testLogin: function () {
      const self = this;

      const userAuth = getCookie("vtUserAuth");
      const userId = getCookie("vtUserId");

      if (userAuth != null && userId != null) {
        checkLogin(userId, userAuth, (status, userData) => {
          if (status === 200) {
            self.userData = {
              userIconLetter: userData["Username"][0],
              mail: userData["Email"],
              authKey: userAuth,
              userId: userId,
            };
            self.isLoggedIn = true;
          } else {
            self.userData = {
              mail: "",
              userIconLetter: "G",
            };
            self.isLoggedIn = false;
            redirect("../login/?loginExpired=true");
          }
        });
      } else {
        self.userData = {
          mail: "",
          userIconLetter: "G",
        };
        self.isLoggedIn = false;
      }
    },
    isActiveMap: function (mapId) {
      return this.selection.map != null && this.selection.map == mapId;
    },
    resetPopup: function () {
      this.isLineupShown = false;
    },
    fileUploaded: function () {
      console.log("fileUploaded");

      let fileLookAt = document.getElementById("file").files[0];
      let labelLookAt = document.getElementById("labelLookAt");

      if (fileLookAt != null) {
        labelLookAt.classList.add("valid");
      } else {
        labelLookAt.classList.remove("valid");
      }

      let fileStandAt = document.getElementById("imagePosition").files[0];
      let labelPosition = document.getElementById("labelPosition");

      if (fileStandAt != null) {
        labelPosition.classList.add("valid");
      } else {
        labelPosition.classList.remove("valid");
      }

      let fileLandOn = document.getElementById("imageLandOn").files[0];
      let labelLandOn = document.getElementById("labelLandOn");

      if (fileLandOn != null) {
        labelLandOn.classList.add("valid");
      } else {
        labelLandOn.classList.remove("valid");
      }
    },
  },
  mounted: function () {},
  created: function () {
    const self = this;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const activePage = urlParams.get("page");
    if (activePage) {
      this.setPage(activePage);
    } else {
      this.setPage("home");
    }

    this.loadMaps();
    this.loadAgents();
    this.testLogin();
    this.loadDemoLineups();
    this.loadUserLineups();

    document.body.onmousedown = function (e) {
      if (e.button == 1) {
        e.preventDefault();
        return false;
      }
    };

    document.body.onkeydown = function (e) {
      if (e.keyCode == 27) {
        self.resetPopup();
      }
    };
  },
});
