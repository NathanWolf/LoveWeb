class Profile {
    #element;
    #button;
    #email;
    #user;
    #token;

    constructor(element, button) {
        this.#element = element;
        this.#button = button;
    }

    show() {
        if (this.#user == null) {
            this.#showLogin();
            return;
        }

        this.#showProfile();
    }

    #showLogin() {
        Utilities.empty(this.#element);
        let loginDiv = Utilities.createDiv('login', this.#element);
        let loginForm = document.createElement('form');
        loginDiv.appendChild(loginForm);
        let emailSection = document.createElement('section');
        loginForm.appendChild(emailSection);
        let emailLabel = document.createElement('label');
        emailLabel.for = 'emailInput';
        emailLabel.innerText = 'Email Address';
        let emailInput = document.createElement('input');
        emailInput.id = 'emailInput';
        emailInput.type = 'email';
        // emailInput.placeholder = 'Email Address';
        emailInput.required = true;
        emailInput.autocomplete = 'username';
        emailSection.appendChild(emailLabel);
        emailSection.appendChild(emailInput);

        let passwordSection = document.createElement('section');
        loginForm.appendChild(passwordSection);
        let passwordLabel = document.createElement('label');
        passwordLabel.for = 'passwordInput';
        passwordLabel.innerText = 'Password';
        let passwordInput = document.createElement('input');
        passwordInput.id = 'passwordInput';
        passwordInput.type = 'password';
        // passwordInput.placeholder = 'Password';
        passwordInput.required = true;
        passwordInput.autocomplete = 'current-password';
        passwordSection.appendChild(passwordLabel);
        passwordSection.appendChild(passwordInput);

        let loginButton = document.createElement('button');
        loginButton.className = 'login';
        loginButton.innerText = 'Login';
        let profile = this;
        loginForm.addEventListener('submit', () => {
            profile.#login(emailInput.value, passwordInput.value);
        });
        loginForm.appendChild(loginButton);
    }

    #login(email, password) {
        const request = new XMLHttpRequest();
        let profile = this;
        request.onload = function() {
            profile.#processLogin(this.response);
        };
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to login, sorry!"); };
        request.open("POST", "data/user.php?action=login&user=" + email + "&password=" + password, true);
        request.send();
    }

    #processLogin(response) {
        if (response.success) {
            this.#user = response.user;
            Utilities.setCookie('email', this.#user.email);
            Utilities.setCookie('token', this.#user.token);
            Utilities.removeClass(this.#button, 'loggedout');
            Utilities.addClass(this.#button, 'loggedin');
            this.#showProfile();
        } else {
            alert("An error occurred logging you in, please try again!")
        }
    }

    #showProfile() {
        Utilities.empty(this.#element);
        let welcomeDiv = Utilities.createDiv('profile', this.#element);
        welcomeDiv.innerText = 'Welcome back, ' + this.#user.first_name + '!';
    }

    check() {
        this.#email = Utilities.getCookie('email');
        this.#token = Utilities.getCookie('token');
        if (this.#email != null && this.#token != null) {
            const request = new XMLHttpRequest();
            let profile = this;
            request.onload = function() {
                profile.#processReturn(this.response);
            };
            request.responseType = 'json';
            request.onerror = function() { alert("Failed to load user info, sorry!"); };
            request.open("POST", "data/user.php?action=return&user=" + this.#email + "&token=" + this.#token, true);
            request.send();
        } else {
            Utilities.addClass(this.#button, 'loggedout');
        }
    }

    #processReturn(response) {
        if (response.success) {
            this.#user = response.user;
            Utilities.removeClass(this.#button, 'loggedout');
            Utilities.addClass(this.#button, 'loggedin');
            this.#showLogin();
        }
    }
}