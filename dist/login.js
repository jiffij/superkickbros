class LoginScene extends Phaser.Scene {
    constructor() {
      super('LoginScene');
    }

    init() {
        this.user = '';
    }
  
    preload() {
      // Load any necessary assets (e.g., images, sounds)
      this.load.image('background', 'assets/bg.jpg');
    }
  
    create() {
      // Add the login form to the scene
      this.add.image(400, 250,'background');
      const loginForm = document.createElement('form');
      loginForm.innerHTML = `
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"><br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password"><br><br>
        <input type="submit" value="Log In">
      `;
      loginForm.style.position = 'absolute';
      loginForm.style.top = '50%';
      loginForm.style.left = '50%';
      loginForm.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(loginForm);
  
      // Add event listeners to the form elements
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting normally
  
        const username = event.target.username.value;
        const password = event.target.password.value;

        console.log(username);
        console.log(password);

        const data = JSON.stringify({"username":username,"password":password});
  
        fetch("/signin", {
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body: data
        })
        .then((res) => res.json() )
        .then((json) => {
            console.log(json);
            if(json.status == "success"){
                this.user = json.user
            } else if (json.status == "error") console.log(json.error);
        });
      });
    }
  }

  // Register the login scene with Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 480,
    scene: [ LoginScene ],
  };
  
 export default LoginScene;