// Function to show custom loader with counter
function showLoader(callback) {
    let counter = 0;
    $("#customLoader").show();
    const interval = setInterval(() => {
        counter++;
        $(".counter").text(counter);
        if (counter >= 6) {
            clearInterval(interval);
            hideLoader();
            if (callback) callback();
        }
    }, 1000);
}

// Function to hide custom loader
function hideLoader() {
    $("#customLoader").hide();
}

// Modify displayStories to include loader functionality
function displayStories() {
    showLoader(() => {
        $.ajax({
            url: "https://usmanlive.com/wp-json/api/stories",
            method: "GET",
            dataType: "json",
            success: function (data) {
                handleResponse(data);
            },
            error: function (error) {
                console.error("Error fetching stories:", error);
            },
        });
    });
}

// Event listener for "Superheroes" navbar link click
$(document).ready(function () {
    $("#superheroesLink").on("click", function (e) {
        e.preventDefault();
        displayStories(); // Fetch stories when clicking on Superheroes
    });

    // Clear button functionality
    $("#clearBtn").on("click", function (e) {
        e.preventDefault();
        $("#clearBtn").hide();
        $("#createBtn").removeAttr("data-id");
        $("#createBtn").html("Create");
        $("#createTitle").val("");
        $("#createContent").val("");
    });

    // Handle form submission
    $("#createForm").submit(handleFormSubmission);
});

// Function to handle form submission
function handleFormSubmission(event) {
    event.preventDefault();
    let storyId = $("#createBtn").attr("data-id");
    var title = $("#createTitle").val();
    var content = $("#createContent").val();

    const formData = { title, content };

    if (storyId) {
        $.ajax({
            url: "https://usmanlive.com/wp-json/api/stories/" + storyId,
            method: "PUT",
            data: formData,
            success: function () {
                displayStories(); // Refresh the list after updating a story
                clearForm(); // Clear the form after updating
            },
            error: function (error) {
                console.error("Error updating story:", error);
            },
        });
    } else {
        $.ajax({
            url: "https://usmanlive.com/wp-json/api/stories",
            method: "POST",
            data: formData,
            success: function () {
                displayStories(); // Refresh the list after creating a new story
                clearForm(); // Clear the form after creating
            },
            error: function (error) {
                console.error("Error creating story:", error);
            },
        });
    }
}

// Function to clear the form
function clearForm() {
    $("#createTitle").val("");
    $("#createContent").val("");
    $("#createBtn").removeAttr("data-id").html("Create");
    $("#clearBtn").hide();
}

// Function to delete a story
function deleteStory() {
    let storyId = $(this).attr("data-id");
    $.ajax({
        url: "https://usmanlive.com/wp-json/api/stories/" + storyId,
        method: "DELETE",
        success: function () {
            displayStories(); // Refresh the list after deleting a story
        },
        error: function (error) {
            console.error("Error deleting story:", error);
        },
    });
}

// Function to handle edit button click
function editBtnClicked(event) {
    event.preventDefault();
    let storyId = $(this).attr("data-id");
    $.ajax({
        url: "https://usmanlive.com/wp-json/api/stories/" + storyId,
        method: "GET",
        success: function (data) {
            $("#clearBtn").show();
            $("#createTitle").val(data.title);
            $("#createContent").val(data.content);
            $("#createBtn").html("Update");
            $("#createBtn").attr("data-id", data.id);
        },
        error: function (error) {
            console.error("Error fetching story:", error);
        },
    });
}

// Function to handle AJAX response and display stories
function handleResponse(data) {
    var storiesList = $("#storiesList");
    storiesList.empty();

    $.each(data, function (index, story) {
        storiesList.append(
            `<div class="col-md-4 mb-3 d-flex align-items-stretch">
                <div class="card" style="background-color: #003049; color: #fff;">
                    <div class="card-body d-flex flex-column">
                        <h3 class="card-title">${story.title}</h3>
                        <p class="card-text flex-grow-1">${story.content}</p>
                        <div>
                            <button class="btn btn-warning btn-sm mr-2 btn-edit" data-id="${story.id}">Edit</button>
                            <button class="btn btn-danger btn-sm btn-del" data-id="${story.id}">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    });

    // Attach event listeners for delete and edit buttons
    $(".btn-del").click(deleteStory);
    $(".btn-edit").click(editBtnClicked);
}