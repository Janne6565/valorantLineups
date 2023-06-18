let vue = new Vue({
  el: "#app",
  data: {
    navHeaders: [
      { title: "Home", link: "../" },
      { title: "About", link: "../about" },
      { title: "Login", link: "#" },
    ],
    userData: {
      username: "",
      password: "",
    },
    errorData: {
      title: "",
      message: "",
      isError: false,
    },
    endpoint: "https://projektejwkk.de/valorantLineups/API/",
    error: {
      message: "",
      isError: false,
    },
  },
  methods: {
    triggerLogin: function () {
      let self = this;
      let data = this.userData;
      login(data["mail"], data["password"], function (status, userId, token) {
        if (status === 200) {
          setCookie("vtUserId", userId, 31);
          setCookie("vtUserAuth", token, 31);

          const urlParams = new URLSearchParams(window.location.search);
          const myParam = urlParams.get("callback");
          if (myParam != null) {
            redirect(myParam);
          } else {
            redirect("../");
          }
        } else {
          self.errorData = {
            title: "Wrong credentials",
            message: "The credentials you entered are wrong. Please try again.",
            isError: true,
          };
        }
      });
    },
  },
  mounted: function () {
    let self = this;

    document.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        self.triggerLogin();
      }
    });

    let urlParams = new URLSearchParams(window.location.search);
    let myParam = urlParams.get("loginExpired");
    if (myParam != null) {
      this.error = {
        message: "Your login has expired. Please login again.",
        isError: true,
      };
    }
  },
});

function redirect(url = String) {
  location.href = url;
}
