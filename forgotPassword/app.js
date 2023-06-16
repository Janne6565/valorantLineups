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
    triggerReset: function () {
      let self = this;
      let data = this.userData;
      sendResetPasswordMail(data["mail"], function (status, message) {
        if (status === 200) {
          self.errorData = {
              title: "Success",
              message: message,
              isError: true,
          }
        } else {
            self.errorData = {
                title: "Error",
                message: message,
                isError: true,
            }
        }
      });
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
