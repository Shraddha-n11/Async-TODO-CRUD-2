
var cl = console.log;

const Base_url = "https://xhr-1st-crud-default-rtdb.firebaseio.com";
const Employee_url = `${Base_url}/Employees.json`;

const form = document.getElementById("form");
const spinner = document.getElementById("spinner");
const list = document.getElementById("list");

const Employee = document.getElementById("Employee");
const Task = document.getElementById("Task");

const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

let state = {
    EmployeeArr: [],
    Edit_Id: null
};

// Snackbar
function Snakbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500,
        showConfirmButton: false
    });
}

// Spinner
function Handlespinner() {
    spinner.classList.toggle("d-none");
}

// Rendering
function Rendering(arr) {

    let result = ``;

    arr.forEach(ele => {

        result += `
        <li class="list-group-item d-flex justify-content-between align-items-center"
            id="${ele.id}">

            <div>
                <strong>${ele.employee}</strong>
                <p class="mb-0 text-muted">${ele.task}</p>
            </div>

            <div>
                <i onclick="OnEditList(this)"
                    class="fa-solid fa-pen-to-square fa-2x text-primary mr-3"
                    role="button"></i>

                <i onclick="DeleteList(this)"
                    class="fa-solid fa-trash fa-2x text-danger"
                    role="button"></i>
            </div>

        </li>`;
    });

    list.innerHTML = result;
}

// Read
async function Show() {

    Handlespinner();

    try {

        let res = await fetch(Employee_url);
        let data = await res.json();

        state.EmployeeArr = [];

        for (const key in data) {

            data[key].id = key;
            state.EmployeeArr.unshift(data[key]);

        }

        Rendering(state.EmployeeArr);

    } catch (err) {

        cl(err);

    } finally {

        Handlespinner();
    }
}

Show();

// Create
async function CreateData(eve) {

    eve.preventDefault();
    Handlespinner();

    try {

        let obj = {
            employee: Employee.value,
            task: Task.value
        };

        let res = await fetch(Employee_url, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error("Failed to create task");
        }

        let data = await res.json();

        obj.id = data.name;

        state.EmployeeArr.unshift(obj);

        Rendering(state.EmployeeArr);

        Snakbar("New Task Created", "success");

        form.reset();

    } catch (err) {

        cl(err);
        Snakbar("Something went wrong", "error");

    } finally {

        Handlespinner();
    }
}

// Edit
function OnEditList(eve) {

    let Edit_id = eve.closest("li").id;

    state.Edit_Id = Edit_id;

    let Edit_obj = state.EmployeeArr.find(
        t => t.id === Edit_id
    );

    if (!Edit_obj) return;

    Employee.value = Edit_obj.employee;
    Task.value = Edit_obj.task;

    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
}

// Update
async function UpdateList() {

    if (!form.reportValidity()) return;

    Handlespinner();

    let Update_id = state.Edit_Id;

    try {

        let update_obj = {
            employee: Employee.value,
            task: Task.value
        };

        let Update_url =
            `${Base_url}/Employees/${Update_id}.json`;

        let res = await fetch(Update_url, {
            method: "PATCH",
            body: JSON.stringify(update_obj),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error("Failed to update task");
        }

        let data = await res.json();

        let index = state.EmployeeArr.findIndex(
            t => t.id === Update_id
        );

        state.EmployeeArr[index] = {
            ...data,
            id: Update_id
        };

        Rendering(state.EmployeeArr);

        submitBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");

        state.Edit_Id = null;

        form.reset();

        Snakbar("Task Updated", "success");

    } catch (err) {

        cl(err);
        Snakbar("Update Failed", "error");

    } finally {

        Handlespinner();
    }
}

// Delete
async function DeleteList(eve) {

    let Remove_id = eve.closest("li").id;

    let result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {

        Handlespinner();

        try {

            let Remove_url =
                `${Base_url}/Employees/${Remove_id}.json`;

            let res = await fetch(Remove_url, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Failed to delete task");
            }

            state.EmployeeArr =
                state.EmployeeArr.filter(
                    t => t.id !== Remove_id
                );

            Rendering(state.EmployeeArr);

            Snakbar("Task Deleted", "success");

        } catch (err) {

            cl(err);
            Snakbar("Delete Failed", "error");

        } finally {

            Handlespinner();
        }
    }
}

// Events
form.addEventListener("submit", CreateData);
updateBtn.addEventListener("click", UpdateList);