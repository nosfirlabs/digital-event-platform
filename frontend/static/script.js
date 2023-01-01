// script.js

// URL of the FastAPI server
const apiUrl = "http://localhost:8000/api";

// Get DOM elements
const home = document.getElementById("home");
const events = document.getElementById("events");
const registrations = document.getElementById("registrations");
const createEventBtn = document.getElementById("create-event-btn");
const createEventForm = document.getElementById("create-event-form");
const cancelCreateEventBtn = document.getElementById("cancel-create-event-btn");
const addDocumentForm = document.getElementById("add-document-form");
const cancelAddDocumentBtn = document.getElementById("cancel-add-document-btn");
const eventsTable = document.getElementById("events-table");
const registrationsTable = document.getElementById("registrations-table");

// Show the home page
showHome();

// Navigate to the home page when the "Home" link is clicked
document.querySelector("nav a[href='/']").addEventListener("click", showHome);

// Navigate to the events page when the "Events" link is clicked
document.querySelector("nav a[href='/events']").addEventListener("click", showEvents);

// Navigate to the registrations page when the "Registrations" link is clicked
document.querySelector("nav a[href='/registrations']").addEventListener("click", showRegistrations);

// Show the event creation form when the "Create event" button is clicked
createEventBtn.addEventListener("click", showCreateEventForm);

// Hide the event creation form and show the events table when the "Cancel" button is clicked
cancelCreateEventBtn.addEventListener("click", hideCreateEventForm);

// Hide the add document form and show the event documents when the "Cancel" button is clicked
cancelAddDocumentBtn.addEventListener("click", hideAddDocumentForm);

// Add a new event when the event creation form is submitted
createEventForm.addEventListener("submit", addEvent);

// Add a new document to an event when the add document form is submitted
addDocumentForm.addEventListener("submit", addDocument);

// Get a list of all events and display them in the events table
getEvents().then(r => console.log("Events loaded"));

// Get a list of all registrations and display them in the registrations table
getRegistrations().then(r => console.log(r));

function showHome() {
    // Hide the other pages
    events.style.display = "none";
    registrations.style.display = "none";
    // Show the home page
    home.style.display = "block";
}

function showEvents() {
    // Hide the other pages
    home.style.display = "none";
    registrations.style.display = "none";
    // Show the events page
    events.style.display = "block";
    // Hide the event creation form
    createEventForm.style.display = "none";
    // Hide the event documents
    document.getElementById("event-documents").style.display = "none";
    // Hide the add document form
    addDocumentForm.style.display = "none";
}

function showRegistrations() {
    // Hide the other pages
    home.style.display = "none";
    events.style.display = "none";
    // Show the registrations page
    registrations.style.display = "block";
}

function showCreateEventForm() {
    // Hide the events table
    eventsTable.style.display = "none";
    // Show the event creation form
    createEventForm.style.display = "block";
}

function hideCreateEventForm() {
    // Hide the event creation form
    createEventForm.style.display = "none";
    // Show the events table
    eventsTable.style.display = "block";
}

function hideAddDocumentForm() {
    // Hide the add document form
    addDocumentForm.style.display = "none";
    // Show the event documents
    document.getElementById("event-documents").style.display = "block";
}

async function getEvents() {
    try {
        // Send a GET request to the /events endpoint
        const response = await fetch(`${apiUrl}/events`);
        // Parse the response as JSON
        const data = await response.json();
        // Clear the events table
        eventsTable.querySelector("tbody").innerHTML = "";
        // Populate the events table with the events data
        data.forEach(event => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${event.name}</td>
                <td>${event.description}</td>
                <td>${event.date}</td>
                <td>
                    <button class="view-documents-btn" data-event-id="${event.id}">View documents</button>
                    <button class="add-document-btn" data-event-id="${event.id}">Add document</button>
                </td>
            `;
            eventsTable.querySelector("tbody").appendChild(row);
        });
        // Add event listeners to the "View documents" buttons
        document.querySelectorAll(".view-documents-btn").forEach(btn => {
            btn.addEventListener("click", viewEventDocuments);
        });
        // Add event listeners to the "Add document" buttons
        document.querySelectorAll(".add-document-btn").forEach(btn => {
            btn.addEventListener("click", showAddDocumentForm);
        });
    } catch (error) {
        console.error(error);
    }
}

async function getRegistrations() {
    try {
        // Send a GET request to the /registrations endpoint
        const response = await fetch(`${apiUrl}/registrations`);
        // Parse the response as JSON
        const data = await response.json();
        // Clear the registrations table
        registrationsTable.querySelector("tbody").innerHTML = "";
        // Populate the registrations table with the registrations data
        data.forEach(registration => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${registration.event.name}</td>
                <td>${registration.name}</td>
                <td>${registration.email}</td>
            `;
            registrationsTable.querySelector("tbody").appendChild(row);
        });
    } catch (error) {
        console.error(error);
    }
}


async function addEvent(event) {
    // Prevent the form from submitting
    event.preventDefault();
    // Get the form data
    const name = document.getElementById("event-name").value;
    const description = document.getElementById("event-description").value;
    const date = document.getElementById("event-date").value;
    // Send a POST request to the /events endpoint with the form data
    await fetch(`${apiUrl}/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name, description, date})
    });
    // Hide the event creation form and show the events table
    hideCreateEventForm();
    // Get a updated list of events and display them in the events table
    await getEvents();
}

async function viewEventDocuments(event) {
    // Get the event id from the button's data attribute
    const eventId = event.target.getAttribute("data-event-id");
    // Send a GET request to the /events/{event_id}/documents endpoint
    const response = await fetch(`${apiUrl}/events/${eventId}/documents`);
    // Parse the response as JSON
    const data = await response.json();
    // Clear the event documents
    document.getElementById("event-documents").innerHTML = "";
    // Populate the event documents with the documents data
    data.forEach(document => {
        const a = document.createElement("a");
        a.href = `/events/${eventId}/documents/${document.hash}`;
        a.textContent = document.name;
        document.getElementById("event-documents").appendChild(a);
    });
    // Show the event documents
    document.getElementById("event-documents").style.display = "block";
    // Hide the events table
    eventsTable.style.display = "none";
}

function showAddDocumentForm(event) {
    // Get the event id from the button's data attribute
    const eventId = event.target.getAttribute("data-event-id");
    // Set the event id as a data attribute on the add document form
    addDocumentForm.setAttribute("data-event-id", eventId);
    // Hide the event documents
    document.getElementById("event-documents").style.display = "none";
    // Show the add document form
    addDocumentForm.style.display = "block";
}

async function addDocument(event) {
    // Prevent the form from submitting
    event.preventDefault();
    // Get the event id from the form's data attribute
    const eventId = addDocumentForm.getAttribute("data-event-id");
    // Get the file from the form
    const file = document.getElementById("document-file").files[0];
    // Create a new FormData object to store the file
    const formData = new FormData();
    // Append the file to the FormData object
    formData.append("file", file);
    // Send a POST request to the /events/{event_id}/documents endpoint with the file
    await fetch(`${apiUrl}/events/${eventId}/documents`, {
        method: "POST",
        body: formData
    });
    // Hide the add document form and show the event documents
    hideAddDocumentForm();
    // Get a updated list of documents for the event and display them in the event documents
    await viewEventDocuments({target: {getAttribute: () => eventId}});
}

