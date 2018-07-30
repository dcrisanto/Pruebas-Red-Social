// first
$(document).ready(function () {
    firebase.auth().onAuthStateChanged((user) => {
        listPosts();
    });
});

const getDataBase = () => {
    return firebase.database();
}

//esta función determina si el post debe ser mostrado o no
const shouldDisplayPost = (currentUser, post) => {
    // si es un post propio mostrar siempre
    if (currentUser.uid === post.userId) {
        return true;
    } else {
        return !post.private;
    }
}

const getOptionsForPosts = (currentUser, post) => {
    let options = ``;
    //si son mis propios posts, se agrega las opciones de edición y eliminar
    if (post.userId === currentUser.uid) {
        options = options
            + `<span><a href="#" class="edit-post" onClick="editPost('${post.idPost}')" data-post="${post.idPost}">Editar</a>`
            + `<br/>`
            + `<a href="#" class="delete-post" onClick="removePost('${post.idPost}')" data-post="${post.idPost}">Eliminar</a></span>`;
    }
    return options;
}

//esta función consulta si el usuario ya le ha dado like al post, para decidir qué opción mostrar
const getLikeOptionsAndThenShow = (currentUser, post, postWrapper) => {
    getDataBase().ref('/postLikes/' + post.idPost + '/' + currentUser.uid).once('value', (snapshot) => {
        //Cuando el usuario aún no le ha dado 'Me gusta', se muestra la opción
        if (snapshot.val() == null) {
            postWrapper = postWrapper
                + `<br/>`
                + `<span class="likeCounterWrapper" data-post="${post.idPost}">${post.likesCount}</span>`
                + `<span><a href="#" onClick="addLikeToPost('${post.idPost}')">Me gusta</a></span>`
                + `</div></li>`;
        }
        //Cuando el usuario ya le dio Like al post, entonces se muestra la opción 'Ya no me gusta' 
        else {
            postWrapper = postWrapper
                + `<br/>`
                + `<span class="likeCounterWrapper" data-post="${post.idPost}">${post.likesCount}</span>`
                + `<span><a href="#" onClick="removeLikeFromPost('${post.idPost}')">Ya no me gusta</a></span>`
                + `</div></li>`;
        }
        //agregar post a la lista
        $('#user-posts-lst').prepend(postWrapper);
    });
}

const updatePostOnList = (idPost) => {
    let callback = (snapshot) => {
        let post = snapshot.val();
        //primero lo quitamos de la lista
        removePostFromList(idPost);
        //lo volvemos a mostrar
        showPostOnList(post);
    };
    getPostByIdPost(idPost, callback);
}

const removePostFromList = (idPost) => {
    $('#' + idPost).remove();
}

//esta función muestra el post en pantalla, lo agrega a la lista de posts
const showPostOnList = (post) => {
    let currentUser = getLoggedUser();
    if (shouldDisplayPost(currentUser, post)) {
        let postWrapper = `<li id="${post.idPost}" data-id="${post.idPost}">`
            + `<div class="post">`
            + `<span>${post.content}</span><br/>`;
        postWrapper = postWrapper + getOptionsForPosts(currentUser, post);
        getLikeOptionsAndThenShow(currentUser, post, postWrapper);
    }
}

const getPostByIdPost = (postId, callback) => {
    getDataBase().ref('/posts/' + postId).once('value', callback);
}

const getAllPosts = (callback) => {
    getDataBase().ref('/posts/').once('value', callback);
}

const getPostByUserAndId = (userId, postId, callback) => {
    getDataBase().ref('/user-posts/' + userId + '/' + postId).once('value', callback);
}

const removeLikeFromPost = (idPost) => {
    let currentUser = getLoggedUser();
    getDataBase().ref('/posts/' + idPost + '/likesCount').once('value', (snapshot) => {
        let currentLikes = snapshot.val();
        if (currentLikes == null) {
            currentLikes = 0;
        } else {
            currentLikes--;
        }
        removeLike(idPost, currentUser, currentLikes);
    });
}

const removeLike = (idPost, currentUser, currentLikes) => {
    var updates = {};
    updates['/posts/' + idPost + '/likesCount'] = currentLikes;
    getDataBase().ref().update(updates);
    getDataBase().ref().child('/postLikes/' + idPost + '/' + currentUser.uid).remove().then(() => {
        updatePostOnList(idPost);
    });
}

const addLikeToPost = (idPost) => {
    let currentUser = getLoggedUser();
    getDataBase().ref('/posts/' + idPost + '/likesCount').once('value', (snapshot) => {
        let currentLikes = snapshot.val();
        if (currentLikes == null) {
            currentLikes = 0;
        }
        currentLikes++;
        addLike(idPost, currentUser, currentLikes);
    });
}

const addLike = (idPost, currentUser, currentLikes) => {
    var updates = {};
    var like = {};
    like.datetime = new Date().toLocaleString();
    like.author = currentUser.uid;
    updates['/postLikes/' + idPost + '/' + currentUser.uid] = like;
    updates['/posts/' + idPost + '/likesCount'] = currentLikes;
    getDataBase().ref().update(updates).then(() => {
        updatePostOnList(idPost);
    });
}

const addNewPost = (post) => {
    let uid = post.userId;
    // Get a key for a new Post.
    var postKey = getDataBase().ref().child('posts').push().key;
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/posts/' + postKey] = post;
    updates['/user-posts/' + uid + '/' + postKey] = post;

    post.idPost = postKey;
    getDataBase().ref().update(updates).then(() => {
        showPostOnList(post);
    });

    return post;
}

const updatePost = (post) => {
    var updates = {};
    let updateDatetime = new Date().toLocaleString();

    updates['/posts/' + post.idPost + '/content'] = post.content;
    updates['/posts/' + post.idPost + '/private'] = post.private;
    updates['/posts/' + post.idPost + '/edited'] = true;
    updates['/posts/' + post.idPost + '/editedOn'] = updateDatetime;

    updates['/user-posts/' + post.userId + '/' + post.idPost + '/content'] = post.content;
    updates['/user-posts/' + post.userId + '/' + post.idPost + '/private'] = post.private;
    updates['/user-posts/' + post.userId + '/' + post.idPost + '/edited'] = true;
    updates['/user-posts/' + post.userId + '/' + post.idPost + '/editedOn'] = updateDatetime;

    getDataBase().ref().update(updates).then(() => {
        //
        alertify.success('Se ha actualizado el post');
        //show post again
        updatePostOnList(post.idPost);
    });

}

const deletePost = (userId, idPost) => {
    getDataBase().ref().child('posts/' + idPost).remove();
    getDataBase().ref().child('/user-posts/' + userId + '/' + idPost).remove().then(() => {
        //
        alertify.success('Se ha elminado el post');
        //remove from list
        removePostFromList(idPost);
    });
}


const editPost = (idPost) => {
    let currentUser = getLoggedUser();

    alertify.genericDialog || alertify.dialog('genericDialog', function () {
        return {
            main: function (content) {
                this.setContent(content);
            },
            setup: function () {
                return {
                    focus: {
                        element: function () {
                            return this.elements.body.querySelector(this.get('selector'));
                        },
                        select: true
                    },
                    options: {
                        basic: true,
                        maximizable: false,
                        resizable: false,
                        padding: false
                    }
                };
            },
            settings: {
                selector: undefined
            }
        };
    });

    let callbackEdit = (snapshot) => {
        let post = snapshot.val();
        let $editForm = $('#form-edit-post');
        $editForm.find('textarea[name="postContent"]').val(post.content);
        $editForm.find('input[name="idPost"]').val(post.idPost);
        $editForm.find('input[name="privatePost"]').prop('checked', post.private)
        alertify.genericDialog($editForm[0]).set('selector', 'textarea[name="postContent"]');
    }

    getPostByUserAndId(currentUser.uid, idPost, callbackEdit);
}

const removePost = (idPost) => {

    let question = document.createElement('span');
    question.innerHTML = '¿Seguro que desea eliminar el Post?';

    //show confirm diaglo
    alertify.confirm(question,
        //if YES
        () => {
            let currentUser = getLoggedUser();
            let userId = currentUser.uid;
            deletePost(userId, idPost);
        },
        //if NO
        () => {
            //Do nothing
        }
    )
        .set(
            { labels: { ok: 'Sí', cancel: 'No' }, padding: true, title: 'Red Social - Dorelly' }
        );
}

const getPostToEdit = () => {
    let currentUser = getLoggedUser();
    let $form = $('#form-edit-post');
    let content = $form.find('textarea[name="postContent"]').val();
    let idPost = $form.find('input[name="idPost"]').val();

    if (content.trim().length == 0) {
        throw new Error("El post debe tener contenido");
    }

    let isPrivate = $form.find('input[name="privatePost"]').prop('checked');
    let post = {};
    post.userId = currentUser.uid;
    post.idPost = idPost;
    post.content = content;
    post.private = isPrivate;
    return post;
}

const getPost = () => {
    let $form = $('#add-form-post');
    let content = $form.find('textarea[name="postContent"]').val();

    if (content.trim().length == 0) {
        throw new Error("El post debe tener contenido");
    }

    let isPrivate = $form.find('input[name="privatePost"]').prop('checked');
    let currentUser = getLoggedUser();

    let post = {};
    post.author = currentUser.email;
    post.userId = currentUser.uid;
    post.content = content;
    post.private = isPrivate;
    post.edited = false;
    post.likesCount = 0;

    return post;
}

const listPosts = () => {
    $('#user-posts-lst').html('<p>Cargando posts...</p>');
    let callback = (snapshot) => {
        $('#user-posts-lst').html('');
        snapshot.forEach(function (child) {
            showPostOnList(child.val());
        })
    };
    getAllPosts(callback);
}

$('#add-form-post').submit((e) => {
    e.preventDefault();
    try {
        let post = getPost();
        post = addNewPost(post);
    } catch (error) {
        console.log(error);
        alert(error.message);
    }

});

$('#form-edit-post').submit((e) => {
    e.preventDefault();
    try {
        let post = getPostToEdit();
        updatePost(post);
        alertify.closeAll();
    } catch (error) {
        alert(error.message);
    }
});

$('#logout-lnk').click((e) => {
    logout();
});