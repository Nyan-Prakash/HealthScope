from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware
)

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.post("/neural-network-response")
async def neural_network_response(location: str=Form()):
    return location