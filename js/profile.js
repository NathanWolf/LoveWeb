class Profile {
    #element;
    #button;
    #user;

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

        let registerButton = document.createElement('button');
        registerButton.type = 'button';
        registerButton.className = 'register';
        registerButton.innerText = 'Register';
        registerButton.addEventListener('click', () => {
            profile.#showRegister(emailInput.value, passwordInput.value);
        });
        loginForm.appendChild(registerButton);
    }

    #showRegister(email, password) {
        Utilities.empty(this.#element);
        let registerDiv = Utilities.createDiv('register', this.#element);
        let registerForm = document.createElement('form');
        registerDiv.appendChild(registerForm);
        let emailSection = document.createElement('section');
        registerForm.appendChild(emailSection);
        let emailLabel = document.createElement('label');
        emailLabel.for = 'emailInput';
        emailLabel.innerText = 'Email Address';
        let emailInput = document.createElement('input');
        emailInput.id = 'emailInput';
        emailInput.type = 'email';
        emailInput.required = true;
        emailInput.autocomplete = 'username';
        emailSection.appendChild(emailLabel);
        emailSection.appendChild(emailInput);

        let passwordSection = document.createElement('section');
        registerForm.appendChild(passwordSection);
        let passwordLabel = document.createElement('label');
        passwordLabel.for = 'passwordInput';
        passwordLabel.innerText = 'Password';
        let passwordInput = document.createElement('input');
        passwordInput.id = 'passwordInput';
        passwordInput.type = 'password';
        passwordInput.required = true;
        passwordInput.autocomplete = 'current-password';
        passwordSection.appendChild(passwordLabel);
        passwordSection.appendChild(passwordInput);

        let firstSection = document.createElement('section');
        registerForm.appendChild(firstSection);
        let firstLabel = document.createElement('label');
        firstLabel.for = 'firstInput';
        firstLabel.innerText = 'First Name';
        let firstInput = document.createElement('input');
        firstInput.id = 'firstInput';
        firstInput.autocomplete = 'given-name';
        firstSection.appendChild(firstLabel);
        firstSection.appendChild(firstInput);

        let lastSection = document.createElement('section');
        registerForm.appendChild(lastSection);
        let lastLabel = document.createElement('label');
        lastLabel.for = 'lastInput';
        lastLabel.innerText = 'Last Name';
        let lastInput = document.createElement('input');
        lastInput.id = 'lastInput';
        lastInput.autocomplete = 'family-name';
        lastSection.appendChild(lastLabel);
        lastSection.appendChild(lastInput);

        let loginButton = document.createElement('button');
        loginButton.className = 'register';
        loginButton.innerText = 'Register';
        let profile = this;
        registerForm.addEventListener('submit', () => {
            profile.#register(emailInput.value, passwordInput.value, firstInput.value, lastInput.value);
        });
        registerForm.appendChild(loginButton);
    }

    #register(email, password, firstName, lastName) {
        const request = new XMLHttpRequest();
        let profile = this;
        request.onload = function() {
            profile.#processLogin(this.response);
        };
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to register, sorry!"); };
        request.open("POST", "data/user.php?action=register&user=" + email + "&password=" + password + "&first=" + firstName + "&last=" + lastName, true);
        request.send();
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
            alert("An error occurred logging you in, please try again: " + response.message)
        }
    }

    #showProfile() {
        Utilities.empty(this.#element);
        let profileDiv = Utilities.createDiv('profile', this.#element);
        let welcomeDiv = Utilities.createDiv('welcome', profileDiv);
        welcomeDiv.innerText = 'Welcome back, ' + this.#user.first_name + '!';

        let logoutDiv = Utilities.createDiv('logout', profileDiv);
        let logoutForm = document.createElement('form');
        let logoutButton = document.createElement('button');
        logoutButton.className = 'logout';
        logoutButton.innerText = 'Logout';
        let profile = this;
        logoutForm.addEventListener('submit', () => {
            profile.#logout();
        });
        logoutForm.appendChild(logoutButton);
        logoutDiv.appendChild(logoutForm);
    }

    #logout() {
        const request = new XMLHttpRequest();
        let profile = this;
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to logout, sorry!"); };
        request.onload = function() {
            profile.#processLogout(this.response);
        };
        request.open("POST", "data/user.php?action=logout&user=" + this.#user.email + "&token=" + this.#user.token, true);
        request.send();
    }

    #processLogout(response) {
        if (response.success) {
            Utilities.removeClass(this.#button, 'loggedin');
            Utilities.addClass(this.#button, 'loggedout');
            this.#user = null;
            this.#showLogin();
        } else {
            alert("Failed to logout, please try again!");
        }
    }

    check() {
        let email = Utilities.getCookie('email');
        let token = Utilities.getCookie('token');
        if (email != null && token != null) {
            const request = new XMLHttpRequest();
            let profile = this;
            request.onload = function() {
                profile.#processReturn(this.response);
            };
            request.responseType = 'json';
            request.onerror = function() { alert("Failed to load user info, sorry!"); };
            request.open("POST", "data/user.php?action=return&user=" + email + "&token=" + token, true);
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