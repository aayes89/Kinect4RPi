 
// Some CRUD operations and others functions for index and crud html files
$(document).ready(function () {
    // Obtener la lista de usuarios al cargar la página
    showUserList();

    // Evento para mostrar el formulario de creación
    $("#showCreateFormBtn").click(function () {
        $(".user-form").removeClass("show");
        $("#createForm").addClass("show");
    });

    // Evento para mostrar el formulario de actualización
    $("#userListTableBody").on("click", ".updateBtn", function () {
        $(".user-form").removeClass("show");
        $("#updateForm").addClass("show");

        const row = $(this).closest("tr");
        const userId = row.find(".userId").text();
        const username = row.find(".username").text();

        $("#updateUserId").val(userId);
        $("#updateUsername").val(username);
    });

    // Evento para mostrar el formulario de eliminación
    $("#userListTableBody").on("click", ".deleteBtn", function () {
        $(".user-form").removeClass("show");
        $("#deleteForm").addClass("show");

        const row = $(this).closest("tr");
        const userId = row.find(".userId").text();
        $("#deleteUserId").val(userId);
    });

    // Evento para crear un nuevo usuario
    $("#createForm").submit(function (event) {
        event.preventDefault();
        createUser();
    });

    // Evento para actualizar un usuario
    $("#updateForm").submit(function (event) {
        event.preventDefault();
        updateUser();
    });

    // Evento para eliminar un usuario
    $("#deleteForm").submit(function (event) {
        event.preventDefault();
        deleteUser();
    });
});

// Función para obtener y mostrar la lista de usuarios
function showUserList() {
    $.get('/users')
        .done((data) => {
            const userListTableBody = $("#userListTableBody");
            userListTableBody.empty();
            // Agregar los datos de los usuarios a la tabla
            data.forEach((user) => {
                userListTableBody.append(`
                    <tr>
                        <td class="userId">${user.id}</td>
                        <td class="username">${user.username}</td>
                        <td>
                            <button class="btn btn-primary updateBtn">Edit</button>
                            <button class="btn btn-danger deleteBtn">Delete</button>
                        </td>
                    </tr>
                `);
            });
        })
        .fail((error) => {
            console.error('Error fetching users:', error);
        });
}

// Función para crear un nuevo usuario
function createUser() {
    const username = $("#createUsername").val();
    const password = $("#createPassword").val();

    $.post('/users', { username, password })
        .done(() => {
            showUserList();
            $("#createForm").trigger("reset");
            showMessage("User created successfully", "success");
        })
        .fail((error) => {
            console.error('Error creating user:', error);
            showMessage("Error creating user", "danger");
        });
}

// Función para actualizar un usuario
function updateUser() {
    const id = $("#updateUserId").val();
    const username = $("#updateUsername").val();
    const password = $("#updatePassword").val();

    $.ajax({
        url: `/users/${id}`,
        method: 'PUT',
        data: { username, password }
    })
        .done(() => {
            showUserList();
            $("#updateForm").trigger("reset");
            showMessage("User updated successfully", "success");
        })
        .fail((error) => {
            console.error('Error updating user:', error);
            showMessage("Error updating user", "danger");
        });
}

// Función para eliminar un usuario
function deleteUser() {
    const id = $("#deleteUserId").val();

    $.ajax({
        url: `/users/${id}`,
        method: 'DELETE'
    })
        .done(() => {
            showUserList();
            $("#deleteForm").trigger("reset");
            showMessage("User deleted successfully", "success");
        })
        .fail((error) => {
            console.error('Error deleting user:', error);
            showMessage("Error deleting user", "danger");
        });
}

// Función para mostrar un mensaje en la parte inferior
function showMessage(message, type) {
    const messageDiv = $("<div>").addClass(`alert alert-${type}`).text(message);
    $(".container").append(messageDiv);

    setTimeout(function () {
        messageDiv.remove();
    }, 3000);
}
