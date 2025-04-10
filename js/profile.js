class Profile extends Component {
    #button;
    #user;
    #reviewUser = null;
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
        let emailSection = document.createElement('section');
        loginDiv.appendChild(emailSection);
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
        loginDiv.appendChild(passwordSection);
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
        loginButton.type = 'button';
        loginButton.className = 'login';
        loginButton.innerText = 'Login';
        let profile = this;
        loginButton.addEventListener('click', () => {
            loginButton.disabled = true;
            registerButton.disabled = true;
            profile.#login(emailInput.value, passwordInput.value);
        });
        loginDiv.appendChild(loginButton);

        let registerButton = document.createElement('button');
        registerButton.type = 'button';
        registerButton.className = 'register';
        registerButton.innerText = 'Register';
        registerButton.addEventListener('click', () => {
            loginButton.disabled = true;
            registerButton.disabled = true;
            profile.#showRegister(emailInput.value, passwordInput.value);
        });
        loginDiv.appendChild(registerButton);
        loginDiv.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                loginButton.disabled = true;
                registerButton.disabled = true;
                profile.#login(emailInput.value, passwordInput.value);
            }
        });

        this.#formButtons = [registerButton, loginButton];
    }

    #showRegister(email, password) {
        let element = this.getElement();
        Utilities.empty(element);
        let registerDiv = Utilities.createDiv('register', element);
        let emailSection = document.createElement('section');
        registerDiv.appendChild(emailSection);
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
        registerDiv.appendChild(passwordSection);
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
        registerDiv.appendChild(firstSection);
        let firstLabel = document.createElement('label');
        firstLabel.for = 'firstInput';
        firstLabel.innerText = 'First Name';
        let firstInput = document.createElement('input');
        firstInput.id = 'firstInput';
        firstInput.autocomplete = 'given-name';
        firstSection.appendChild(firstLabel);
        firstSection.appendChild(firstInput);

        let lastSection = document.createElement('section');
        registerDiv.appendChild(lastSection);
        let lastLabel = document.createElement('label');
        lastLabel.for = 'lastInput';
        lastLabel.innerText = 'Last Name';
        let lastInput = document.createElement('input');
        lastInput.id = 'lastInput';
        lastInput.autocomplete = 'family-name';
        lastSection.appendChild(lastLabel);
        lastSection.appendChild(lastInput);

        let registerButton = document.createElement('button');
        registerButton.type = 'button';
        registerButton.className = 'register';
        registerButton.innerText = 'Register';
        let profile = this;
        registerButton.addEventListener('click', (event) => {
            registerButton.disabled = true;
            profile.#register(emailInput.value, passwordInput.value, firstInput.value, lastInput.value);
        });
        registerDiv.appendChild(registerButton);
        registerDiv.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                registerButton.disabled = true;
                profile.#register(emailInput.value, passwordInput.value, firstInput.value, lastInput.value);
            }
        });

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
            this.checkDisplayMode();
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

        if (this.#user != null && this.#user.admin) {
            let controller = this;
            const userRequeset = new XMLHttpRequest();
            userRequeset.responseType = 'json';
            userRequeset.onload = function() {
                let response = this.response;
                if (response.success) {
                    let reviewDiv = Utilities.createDiv('review', profileDiv);
                    Utilities.createSpan('reviewLabel', reviewDiv, 'Review: ');
                    let reviewSelect = document.createElement('select');
                    reviewDiv.appendChild(reviewSelect);
                    let adminOption = document.createElement('option');
                    adminOption.value = 'self';
                    adminOption.innerText = 'Self (No Review)';
                    reviewSelect.appendChild(adminOption);
                    let users = {};
                    for (let i = 0; i < response.users.length; i++) {
                        let user = response.users[i];
                        users[user.id] = user;
                        if (user.id == controller.#user.id) continue;
                        let userOption = document.createElement('option');
                        userOption.value = user.id;
                        userOption.innerText = user.first_name + ' ' + user.last_name;
                        reviewSelect.appendChild(userOption);
                        reviewSelect.addEventListener('change', function() {
                            if (this.value == 'self') {
                                 controller.clearReview();
                            } else {
                                controller.review(users[this.value]);
                            }
                        });
                    }
                }
            };
            userRequeset.open("POST", "data/user.php?action=users&user=" + this.#user.id + "&token=" + this.#user.token, true);
            userRequeset.send();
        }

        let logoutDiv = Utilities.createDiv('logout', profileDiv);
        let logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.className = 'logout';
        logoutButton.innerText = 'Logout';
        let profile = this;
        logoutButton.addEventListener('click', (event) => {
            logoutButton.disabled = true;
            profile.#logout();
        });
        logoutDiv.appendChild(logoutButton);

        if (this.#user != null) {
            this.#showUser();
            if (this.#user.admin) {
                this.#showAdmin();

            } else {
                this.#hideAdmin();
            }
        } else {
            this.#hideUser();
            this.#hideAdmin();
        }
        this.#updateButton();
        this.#formButtons = [logoutButton];
    }

    clearReview() {
        this.#reviewUser = null;
    }

    review(user) {
        this.#reviewUser = user;
    }

    isReview() {
        return this.#reviewUser != null;
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
            elements[elementIndex].style.display = 'flex';
        }
    }

    #hideUser() {
        let elements = document.getElementsByClassName('user');
        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            elements[elementIndex].style.display = 'none';
        }
    }

    #showUser() {
        let elements = document.getElementsByClassName('user');
        for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            elements[elementIndex].style.display = 'flex';
        }
    }

    #processLogout(response) {
        if (response.success) {
            Utilities.removeClass(this.#button, 'loggedin');
            Utilities.addClass(this.#button, 'loggedout');
            this.#hideAdmin();
            this.#hideUser();
            this.#user = null;
            this.#updateButton();
            this.#showLogin();
            this.checkDisplayMode();
        } else {
            alert("Failed to logout, please try again!");
            this.#enableFormButtons();
        }
    }

    check() {
        this.#hideAdmin();
        this.#hideUser();
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
            this.checkDisplayMode();
        }
    }

    checkDisplayMode() {
        let theme = this.#user != null && this.#user.preferences.hasOwnProperty('theme') ? this.#user.preferences.theme : null;
        if (theme == null) {
            if (window.matchMedia) {
                theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
            } else {
                theme = 'light';
            }
        }
        document.documentElement.setAttribute('data-theme', theme);
    }

    getUser() {
        if (this.#reviewUser != null) {
            return this.#reviewUser;
        }
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

    saveProperty(property, value) {
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

        request.open("POST", "data/user.php?action=save_property&property=" + property
            + '&user=' + user.id
            + '&token=' + user.token
            + '&value=' + encodeURIComponent(value), true);
        request.send();
    }
}