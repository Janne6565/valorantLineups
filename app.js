let vue = new Vue({
    el: '#app',
    data: {
        navHeaders: [
            { title: "Home", link: "#"},
            { title: "About", link: "./about"},
            { title: "Login", link: "./login"}
        ]
    },
    methods: {
    },
    mounted: function () {
        let self = this; 

      const userAuth = getCookie("vtUserAuth");
      const userId = getCookie("vtUserId");
    
      if (userAuth !== null && userId !== null) {
        checkLogin(
            userId, 
            userAuth,
            (status, response) => {
                console.log(status, response)
                if (status === 200) {
                    redirect("./home");
                }
            }
        )
      }
    }
});