from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.post("/neural-network-response")
async def neural_network_response(latitude: int=Form(), longitutde: int=Form(), date: str=Form()):
    print(latitude, longitutde, date)
    return latitude, longitutde, date