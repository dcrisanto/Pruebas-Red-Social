// first
$(document).ready(function () {
    if (isLogged()) {
        console.log('se logeo')
        window.location = 'post.html';
    } else {
        window.location = 'login.html';
    }
});