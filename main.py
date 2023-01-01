from typing import List

import uvicorn as uvicorn
from fastapi import FastAPI
from ipfshttpclient import Client
from pydantic import BaseModel
from starlette.requests import Request
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

app = FastAPI()
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# Connect to the IPFS daemon
ipfs_client = Client()


# Define a model for the event data
class Event(BaseModel):
    name: str
    description: str
    date: str
    documents: List[str]


# Define a model for the registration data
class Registration(BaseModel):
    event_id: int
    user_name: str
    user_email: str


# Create an in-memory database of events
events = {
    1: {"name": "Virtual Conference", "description": "A virtual conference on the latest trends in technology",
        "date": "2022-03-15", "documents": []},
    2: {"name": "Virtual Workshop", "description": "A virtual workshop on how to build a successful startup",
        "date": "2022-05-20", "documents": []},
    3: {"name": "Virtual Webinar", "description": "A virtual webinar on the future of artificial intelligence",
        "date": "2022-07-01", "documents": []}
}

# Create an in-memory database of registrations
registrations = []


# Define an endpoint to get a list of all events
@app.get("/events")
def read_events():
    return events


@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# Define an endpoint to add a new event
@app.post("/events")
def create_event(event: Event):
    event_id = len(events) + 1
    events[event_id] = event.dict()
    return {"id": event_id, **event.dict()}


# Define an endpoint to get a specific event by id
@app.get("/events/{event_id}")
def read_event(event_id: int):
    return events[event_id]


# Define an endpoint to register for an event
@app.post("/events/{event_id}/register")
def create_registration(event_id: int, registration: Registration):
    registration_data = registration.dict()
    registration_data["event_id"] = event_id
    registrations.append(registration_data)
    return registration_data


# Define an endpoint to get a list of all registrations
@app.get("/registrations")
def read_registrations():
    return registrations


# Define an endpoint to add a document to an event
@app.post("/events/{event_id}/documents")
def add_event_document(event_id: int, file: bytes):
    # Add the document to IPFS and get the hash
    document_hash = ipfs_client.add(file).get("Hash")
    # Store the hash in the event's documents list
    events[event_id]["documents"].append(document_hash)
    return {"document_hash": document_hash}


@app.get("/events/{event_id}/documents/{document_hash}")
def get_event_document(event_id: int, document_hash: str):
    # Retrieve the document from IPFS
    file = ipfs_client.cat(document_hash)
    # Return the document as an HTML response
    return HTMLResponse(content=file, media_type="application/octet-stream")
