from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

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
async def neural_network_response(latitude: float=Form(), longitude: float=Form(), date: str=Form()):
    print(latitude, longitude, date)
    return latitude, longitude, date

@app.post("/display-all-longandlat")
async def display_all_longandlat():
    file_path = "spreadsheets/2016_2024_Data.csv"

    data = pd.read_csv(file_path)
    data_2024 = data[data['Year'] == 2024].copy()

    print("Sample 2024 data:", data_2024.head())

    data_2024['Latitude'] = pd.to_numeric(data_2024['Latitude'], errors='coerce')
    data_2024['Longitude'] = pd.to_numeric(data_2024['Longitude'], errors='coerce')

    # Convert the filtered data to a list of dictionaries to return as JSON
    data_2024_filtered = data_2024.dropna(subset=['Latitude', 'Longitude']).copy()

    data_2024_filtered_limited = data_2024_filtered[['Latitude', 'Longitude']].head(80000)

    result = data_2024_filtered_limited.to_dict(orient='records')

    print(result)

    return result