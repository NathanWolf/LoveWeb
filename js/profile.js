class Profile extends Component {
    #button;
    #user;
    #formButtons = [];

    constructor(controller, element, button) {
        super(controller, element);
        this.#button = button;
        this.#updateButton();
    }

    show() {
        if (this.#user == null) {
            this.#showLogin();
            return;
        }

        this.#showProfile();
    }

    #showLogin() {
        let element = this.getElement();
        Utilities.empty(element);
        let loginDiv = Utilities.createDiv('login', element);
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
            loginButton.disabled = true;
            registerButton.disabled = true;
            profile.#login(emailInput.value, passwordInput.value);
        });
        loginForm.appendChild(loginButton);

        let registerButton = document.createElement('button');
        registerButton.type = 'button';
        registerButton.className = 'register';
        registerButton.innerText = 'Register';
        registerButton.addEventListener('click', () => {
            loginButton.disabled = true;
            registerButton.disabled = true;
            profile.#showRegister(emailInput.value, passwordInput.value);
        });
        loginForm.appendChild(registerButton);

        this.#formButtons = [registerButton, loginButton];
    }

    #showRegister(email, password) {
        let element = this.getElement();
        Utilities.empty(element);
        let registerDiv = Utilities.createDiv('register', element);
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
        emailInput.value = email;
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
        passwordInput.value = password;
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

        let registerButton = document.createElement('button');
        registerButton.className = 'register';
        registerButton.innerText = 'Register';
        let profile = this;
        registerForm.addEventListener('submit', () => {
            registerButton.disabled = true;
            profile.#register(emailInput.value, passwordInput.value, firstInput.value, lastInput.value);
        });
        registerForm.appendChild(registerButton);

        this.#formButtons = [registerButton];
    }

    #enableFormButtons() {
        for (let i = 0; i < this.#formButtons.length; i++) {
            this.#formButtons[i].disabled = false;
        }
    }

    #register(email, password, firstName, lastName) {
        const request = new XMLHttpRequest();
        let profile = this;
        request.onload = function() {
            profile.#processLogin(this.response);
        };
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to register, sorry!"); };
        request.open("POST", "data/user.php?action=register&email=" + email + "&password=" + password + "&first=" + firstName + "&last=" + lastName, true);
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
        request.open("POST", "data/user.php?action=login&email=" + email + "&password=" + password, true);
        request.send();
    }

    #processLogin(response) {
        if (response.success) {
            this.#user = response.user;
            Utilities.setCookie('user', this.#user.id);
            Utilities.setCookie('token', this.#user.token);
            Utilities.removeClass(this.#button, 'loggedout');
            Utilities.addClass(this.#button, 'loggedin');
            this.#showProfile();
        } else {
            alert("An error occurred logging you in, please try again: " + response.message);
            this.#enableFormButtons();
        }
    }

    #showProfile() {
        let element = this.getElement();
        Utilities.empty(element);
        let profileDiv = Utilities.createDiv('profile', element);
        let welcomeDiv = Utilities.createDiv('welcome', profileDiv);
        welcomeDiv.innerText = 'Welcome back, ' + this.#user.first_name + '!';

        let logoutDiv = Utilities.createDiv('logout', profileDiv);
        let logoutForm = document.createElement('form');
        let logoutButton = document.createElement('button');
        logoutButton.className = 'logout';
        logoutButton.innerText = 'Logout';
        let profile = this;
        logoutForm.addEventListener('submit', () => {
            logoutButton.disabled = true;
            profile.#logout();
        });
        logoutForm.appendChild(logoutButton);
        logoutDiv.appendChild(logoutForm);

        if (this.#user != null && this.#user.admin) {
            this.#showAdmin();
        } else {
            this.#hideAdmin();
        }
        this.#updateButton();
        this.#formButtons = [logoutButton];
    }

    #logout() {
        const request = new XMLHttpRequest();
        let profile = this;
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to logout, sorry!"); };
        request.onload = function() {
            profile.#processLogout(this.response);
        };
        request.open("POST", "data/user.php?action=logout&user=" + this.#user.id + "&token=" + this.#user.token, true);
        request.send();
    }

    #hideAdmin() {
        let elements = document.getElementsByClassName('admin');
        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            elements[elementIndex].style.display = 'none';
        }
    }

    #showAdmin() {
        let elements = document.getElementsByClassName('admin');
        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            elements[elementIndex].style.display = 'block';
        }
    }

    #processLogout(response) {
        if (response.success) {
            Utilities.removeClass(this.#button, 'loggedin');
            Utilities.addClass(this.#button, 'loggedout');
            this.#hideAdmin();
            this.#user = null;
            this.#updateButton();
            this.#showLogin();
        } else {
            alert("Failed to logout, please try again!");
            this.#enableFormButtons();
        }
    }

    check() {
        this.#hideAdmin();
        let userId = Utilities.getCookie('user');
        let token = Utilities.getCookie('token');
        if (userId != null && token != null) {
            const request = new XMLHttpRequest();
            let profile = this;
            request.onload = function() {
                profile.#processReturn(this.response);
            };
            request.responseType = 'json';
            request.onerror = function() { alert("Failed to load user info, sorry!"); };
            request.open("POST", "data/user.php?action=return&user=" + userId + "&token=" + token, true);
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
            this.#showProfile();
        }
    }

    getUser() {
        return this.#user;
    }

    getTitle() {
        return 'User Profile';
    }

    #updateButton() {
        Utilities.empty(this.#button);
        let portrait = '';
        let characters = this.getController().getCharacters();
        if (this.#user != null && this.#user.properties.hasOwnProperty('persona_id')) {
            let selectedCharacter = this.#user.properties['persona_id'].value;
            portrait = characters.getPortrait(selectedCharacter)
        }

        if (portrait != '') {
            let portraitContainer = Utilities.createDiv('portrait tiny', this.#button);
            portraitContainer.style.backgroundImage = 'url(' + portrait + ')';
        } else {
            this.#button.innerHTML = '&#128100;&#xfe0e;';
        }
    }

    getCharacterId() {
        if (this.#user != null && this.#user.properties.hasOwnProperty('persona_id')) {
            return this.#user.properties['persona_id'].value;
        }
        return null;
    }

    loaded() {
        this.#updateButton();
    }

    save(property, value) {
        if (this.#user == null) return;
        let user = this.#user;
        this.#user['properties'][property] = {property_id: property, value: value};
        if (property == 'persona_id') {
            this.#updateButton();
        }
        const request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onerror = function() {
            console.log("Error saving profile");
        };

        request.open("POST", "data/user.php?action=save&property=" + property
            + '&user=' + user.id
            + '&token=' + user.token
            + '&value=' + encodeURIComponent(value), true);
        request.send();
    }
}