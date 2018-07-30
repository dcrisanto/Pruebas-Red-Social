// first
$(document).ready(function () {
    if (isLogged()) {
        window.location = 'post.html';
    } else {
        window.location = 'login.html';
    }
});