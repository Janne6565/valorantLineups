let vue = new Vue({
  el: "#app",
  data: {
    navHeaders: [
      { title: "Home", link: "../" },
      { title: "About", link: "../about" },
      { title: "Login", link: "../login" },
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
  },
  methods: {
    triggerRegister: function () {
      let self = this;
      let data = this.userData;
      if (data["password"] !== data["password2"]) {
        self.errorData = {
          message: "Passwords don't match",
          isError: true,
        };
        return;
      }
      register(
        data["email"],
        data["password"],
        data["username"],
        function (status, userId, token) {
          if (status === 200) {
            setCookie("vtUserId", userId, 31);
            setCookie("vtUserAuth", token, 31);
            redirect("../");
          } else {
            self.errorData = {
              title: "Registration failed",
              message: userId,
              isError: true,
            };
          }
        }
      );
    },
  },
  mounted: function () {
    let self = this;

    document.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        self.triggerRegister();
      }
    });
  },
});

function redirect(url = String) {
  location.href = url;
}
