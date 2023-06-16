let vue = new Vue({
  el: "#app",
  data: {
    navHeaders: [
      { title: "Home", link: "../" },
      { title: "About", link: "../about" },
      { title: "Login", link: "../login" },
    ],
    userData: {
      mail: "",
    },
    errorData: {
      title: "",
      message: "",
      isError: false,
    },
    endpoint: "https://projektejwkk.de/valorantLineups/API/",
  },
  methods: {
    triggerResetPassword: function () {
      let self = this;
      let data = this.userData;
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const token = urlParams.get("authKey");

      resetPassword(
        token,
        data["newPassword"],
        function (status, message, email) {
          if (status === 200) {
            self.errorData = {
              title: "Success",
              message: message,
              isError: true,
            };
            
            setTimeout(function () {
              login(
                email,
                data["newPassword"],
                function (status, userId, token) {
                  if (status === 200) {
                    setCookie("vtUserId", userId, 1);
                    setCookie("vtUserAuth", token, 1);
                    redirect("../");
                  } else {
                    self.errorData = {
                      title: "Wrong credentials",
                      message:
                        "The credentials you entered are wrong. Please try again.",
                      isError: true,
                    };
                  }
                }
              );
            }, 1000);
          } else {
            self.errorData = {
              title: "Error",
              message: message,
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
        self.triggerReset();
      }
    });
  },
});

function redirect(url = String) {
  location.href = url;
}
