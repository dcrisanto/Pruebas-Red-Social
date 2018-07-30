// Initialize Firebase
const config = {
    apiKey: "AIzaSyAB7icNPz-tO88wVkgcCeNmlz9H1xd8OTU",
    authDomain: "login-e3b98.firebaseapp.com",
    databaseURL: "https://login-e3b98.firebaseio.com",
    projectId: "login-e3b98",
    storageBucket: "login-e3b98.appspot.com",
    messagingSenderId: "857338189328"
};
firebase.initializeApp(config);

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

//Evento para seguridad de contraseña de registro
$("#passwordR").on('keyup', () => {
    let mayus = new RegExp('^(?=.*[A-Z])');
    let special = new RegExp('^(?=.*[!%@#$&*])');
    let number = new RegExp('^(?=.*[0-9])');
    let lower = new RegExp('^(?=.*[a-z])');
    let len = new RegExp('^(?=.{8,})');
    //Arreglos
    let regExp = [mayus, special, number, lower, len];
    let elements = [$('#mayus'), $('#special'), $('#number'), $('#lower'), $('#len')];
    let registrationPassword = $('#passwordR').val();
    for (let i = 0; i < 5; i++) {
        if (regExp[i].test(registrationPassword)) {
            elements[i].hide();
        } else {
            elements[i].show();
        }
    }

})

//Validar formulario de registro
const validateSignUp = () => {
    expresion = /\w+@\w+\.+[a-z]/;
    let registrationMail = $('#emailR').val();
    let registrationPassword = $('#passwordR').val();
    let confirmPassword = $('#confirm-password').val();
    console.log(registrationPassword);
    console.log(confirmPassword);
    if (!expresion.test(registrationMail)) {
        //$('#error-email-signup').css('background', 'url(https://scontent.flim17-1.fna.fbcdn.net/v/t1.15752-9/37638965_1870900236323040_1375884492576653312_n.png?_nc_cat=0&oh=95d07850998541818679f363b50f5319&oe=5BDCC2B7)')
        alert('El formato de correo es invalido');
        return false;
    }
    else if (registrationMail === '' || registrationPassword === '') {
        alert('Todos los campos deben llenarse')
        return false;
    }
    else if (registrationPassword != confirmPassword) {
        //$('#error-email-signup').css('background', 'url(https://scontent.flim17-1.fna.fbcdn.net/v/t1.15752-9/37638965_1870900236323040_1375884492576653312_n.png?_nc_cat=0&oh=95d07850998541818679f363b50f5319&oe=5BDCC2B7)')
        alert('Las contraseñas no coinciden');
        return false;
    }
    return true;
};

//Enviar un mensaje de verificación al usuario
const checkEmail = () => {
    const user = firebase.auth().currentUser;
    user.sendEmailVerification().then(() => {
        document.getElementById('container-sigup').innerHTML = '';
        document.getElementById('container-sigup').innerHTML = `<p>Se ha enviado un correo de validación</p>`;
        console.log(user);
        // Email sent.
    }).catch((error) => {
        clearContent(getID('container-sigup'));
        getID('container-sigup').innerHTML = `<p>Ha ocurrido un error</p>`;

    });
}

/*Registrar nuevo usuario con correo y contraseña
$('#registerLink').click(() => {
    getID('signIn').style.display = 'none';
    getID('signUp').style.display = 'block';
});*/

$('#form-signup').submit(registrar = (e) => {
    e.preventDefault();
    //Obtener email y pass
    let registrationMail = getID('emailR').value;
    let registrationPassword = getID('passwordR').value;
    //let resuldo = validateSignUp();
    if (validateSignUp()) {
        firebase.auth().createUserWithEmailAndPassword(registrationMail, registrationPassword)
            .then(() => {
                checkEmail();
            })
            .catch((error) => {
                // Handle Errors here.
                getID('container-sigup').innerHTML = `<p>${error.code}:${error.message} </p>`
            });
    }
    else {
        alert('error');
    }

    clearContent([getID('emailR'), getID('passwordR'), getID('confirm-password')]);
});