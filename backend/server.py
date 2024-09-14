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

    data_2024['Geolocation'] = data_2024['Geolocation'].str.replace('POINT \(', '', regex=True).str.replace('\)', '', regex=True)

    data_2024_valid = data_2024[data_2024['Geolocation'].str.contains(" ")].copy()

    split_data = data_2024_valid['Geolocation'].str.split(' ', expand=True)

    if split_data.shape[1] == 2:
        data_2024_valid['Longitude'] = split_data[0]
        data_2024_valid['Latitude'] = split_data[1]
    else:
        # Handle the case where split failed
        data_2024_valid['Longitude'] = None
        data_2024_valid['Latitude'] = None
    
    data_2024_filtered = data_2024_valid[['Latitude', 'Longitude']].copy()

    data_2024_filtered['Latitude'] = pd.to_numeric(data_2024_filtered['Latitude'], errors='coerce')
    data_2024_filtered['Longitude'] = pd.to_numeric(data_2024_filtered['Longitude'], errors='coerce')

    # Convert the filtered data to a list of dictionaries to return as JSON
    data_2024_filtered = data_2024_filtered.dropna()

    result = data_2024_filtered.to_dict(orient='records')

    print(result)

    return result