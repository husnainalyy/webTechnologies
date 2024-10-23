function submitForm(event) {
    event.preventDefault();

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var address = document.getElementById("address").value;
    var city = document.getElementById("city").value;



    var hasError = false;

    if (name === "") {
        alert("Name is required.");
        hasError = true;
    }
    if (email === "") {
        alert("Email is required.");
        hasError = true;
    }
    if (address === "") {
        alert("Address is required.");
        hasError = true;
    }
    if (city === "") {
        alert("City is required.");
        hasError = true;
    }

    if (!hasError) {
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("address").value = "";
        document.getElementById("city").value = "";
        document.getElementById("formStatus").textContent = "Form submitted successfully!";
    }
}