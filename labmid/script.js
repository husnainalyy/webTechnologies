$(document).ready(function () {
    // Function to load projects from projects.json
    $('#getProjectsBtn').click(function () {
        $.getJSON('./projects.json', function (data) {
            const projects = data.projects;
            $('#projectsContainer').empty(); // Clear existing projects

            projects.forEach(project => {
                const projectCard = `
                    <div class="col-md-4">
                        <div class="card fixed-size-card">
                            <img src="${project.image}" class="card-img-top" alt="${project.name}">
                            <div class="card-body">
                                <h5 class="card-title">${project.name}</h5>
                                <p class="card-text">${project.description}</p>
                                <button class="btn btn-secondary details-btn" data-project='${JSON.stringify(project)}'>Open Project</button>
                            </div>
                        </div>
                    </div>`;
                $('#projectsContainer').append(projectCard);
            });

            // Show modal with project details when "Get Details" button is clicked
            $('.details-btn').click(function () {
                const project = $(this).data('project'); // Use data() to get the object directly

                // Check if project and its details exist
                if (project && project.details) {
                    console.log("Project data:", project); // Debugging output
                    const detailsHTML = `
                        <h4>${project.name}</h4>
                        <p><strong>Introduction:</strong> ${project.details.introduction}</p>
                        <p><strong>Tech Stack:</strong> ${project.details.techStack}</p>
                        <p><strong>Features:</strong>
                        <ul>${project.details.features.map(feature => `<li>${feature}</li>`).join('')}</ul></p>
                        <p><a href="${project.link}" class="btn btn-primary" target="_blank">Visit Project</a></p>
                    `;
                    $('#projectDetailsContent').html(detailsHTML);
                    $('#projectDetailsModal').modal('show');
                } else {
                    console.error("Project details not found:", project);
                    alert("Project details are not available. Please try again.");
                }
            });
        }).fail(function () {
            alert("Failed to load project data. Please check the path to projects.json.");
        });
    });
});
