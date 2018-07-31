const IS_LOGGED_USER_KEY = '_isLoggedUser';

const config = {
    apiKey: "AIzaSyAB7icNPz-tO88wVkgcCeNmlz9H1xd8OTU",
    authDomain: "login-e3b98.firebaseapp.com",
    databaseURL: "https://login-e3b98.firebaseio.com",
    projectId: "login-e3b98",
    storageBucket: "login-e3b98.appspot.com",
    messagingSenderId: "857338189328"
};

firebase.initializeApp(config);

let UNLOGGED_USER = {
    userId: 'none',
    username: ''
};

const clearContent = (elements) => {
    elements.forEach(element => {
        clearElement(element);
    });
}

const clearElement = (element) => {
    if (element.value) {
        element.value = '';
    }
    element.innerHTML = '';
}

const getID = (id) => {
    return document.getElementById(id);
}

// Session storage almacena información en el navegador para poder trabajar con ella las veces que necesitemos
const putOnSession = (key, item) => {
    sessionStorage.setItem(key, item);
}

const getFromSession = (key) => {
    return sessionStorage.getItem(key);
}

const getLoggedUser = () => {
    return firebase.auth().currentUser;
}

// Verifica si el cliente se ha logueado
const isLogged = () => {
    return (getFromSession(IS_LOGGED_USER_KEY) == 'true');
}

//Logout
const logout = (redirect = true) => {
    firebase.auth().signOut()
        .then(() => {
            putOnSession(IS_LOGGED_USER_KEY, false);
            if (redirect) {
                //redirect to home
                window.location = 'src/login.html';
            }

        })
        .catch((error) => {
        })
}