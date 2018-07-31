//Validar formulario de login
const validateLogin = () => {
    expresionLogin = /\w+@\w+\.+[a-z]/;
    let accessMail = getID('mail-access').value;
    let accessPassword = getID('password-access').value;
    if (accessMail === '' || accessPassword === '') {
        alert('Todos los campos son obligatorios');
        return false;
    }
    //Usando expresiones regulares: evaluar cadena de caracteres
    //Evaluando que cumpla con la expresion regular
    else if (!expresionLogin.test(accessMail)) {
        alert('El formato del correo no es válido');
        return false;
    }
    return true;
}

const processAuthResult = (authResult, needsEmailVerified = false) => {
    if (needsEmailVerified && !authResult.user.emailVerified) {
        logout(false);
        alert('Aún no ha activado su cuenta. Por favor ingrese a su correo para verificarla');
    } else {
        putOnSession(IS_LOGGED_USER_KEY, true);
        //redirect to home
        //window.location = '/';
        window.location = 'post.html'
    }
}

const authWithEmailAndPassword = (email, password) => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function () {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        })
        .then(function (response) {
            processAuthResult(response, true);
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $('#container-text').html('error message: ' + errorMessage);
        });
}

const getAuthProvider = (socialNetwork) => {
    switch (socialNetwork) {
        case 'google':
            return new firebase.auth.GoogleAuthProvider();
        case 'facebook':
            return new firebase.auth.FacebookAuthProvider();
        default:
            throw new Error("No valid auth provider");
    }
}

//login with google
const authWithOAuth = (socialNetwork) => {
    let authProvider = getAuthProvider(socialNetwork);
    authProvider.setCustomParameters({
        'display': 'popup'
    });
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function () {
            return firebase.auth().signInWithPopup(authProvider);
        })
        .then((response) => {
            processAuthResult(response);
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $('#container-text').html('error message: ' + errorMessage);
        });
}

//Autentificación con Google
$('#btn-login-google').click(() => {
    authWithOAuth('google');
});

//Autentificación con Facebook
$('#btn-login-facebook').click(() => {
    authWithOAuth('facebook');
});

$('#form-login').submit(login = (e) => {
    e.preventDefault();
    //Obtener email y pass registrados
    let email = $('#mail-access').val();
    let password = $('#password-access').val();
    if (validateLogin()) {
        authWithEmailAndPassword(email, password);
    }
    else {
        alert('error')

    }
    clearContent([getID('mail-access'), getID('password-access')]);
})