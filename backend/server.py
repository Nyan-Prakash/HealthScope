from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import tensorflow as tf
from neuralnet import preprocess_data
from contextlib import asynccontextmanager
import numpy as np

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
async def display_all_longandlat(year: int=Form()):
    print(year)
    file_path = "spreadsheets/2016_2024_Data.csv"

    data = pd.read_csv(file_path)
    if (year <= 2024):
        data_2024 = data[data['Year'] == year].copy()

        print("Sample 2024 data:", data_2024.head())

        data_2024['Latitude'] = pd.to_numeric(data_2024['Latitude'], errors='coerce')
        data_2024['Longitude'] = pd.to_numeric(data_2024['Longitude'], errors='coerce')
        data_2024['Normalized_Health_Score'] = pd.to_numeric(data_2024['Normalized_Health_Score'], errors='coerce')

        # Convert the filtered data to a list of dictionaries to return as JSON
        data_2024_filtered = data_2024.dropna(subset=['Latitude', 'Longitude', 'Normalized_Health_Score']).copy()

        data_2024_filtered_limited = data_2024_filtered[['Latitude', 'Longitude', 'Normalized_Health_Score']].head(80000)

        result = data_2024_filtered_limited.to_dict(orient='records')

        #print(result)

        return result
    else:
        data_2024 = data[data['Year'] == 2024].copy()
        data_2024['Latitude'] = pd.to_numeric(data_2024['Latitude'], errors='coerce')
        data_2024['Longitude'] = pd.to_numeric(data_2024['Longitude'], errors='coerce')

        data_2024_filtered = data_2024.dropna(subset=['Latitude', 'Longitude']).copy()

        latitudes = np.deg2rad(data_2024_filtered['Latitude'].values)
        longitudes = np.deg2rad(data_2024_filtered['Longitude'].values)

        print(len(latitudes))
        print(len(longitudes))

        latitude_sin = np.sin(latitudes)
        latitude_cos = np.cos(latitudes)
        longitude_sin = np.sin(longitudes)
        longitude_cos = np.cos(longitudes)

        cycle = 5
        year_sin = np.sin(2 * np.pi * year / cycle)
        year_cos = np.cos(2 * np.pi * year / cycle)

        input_data = np.column_stack((
            latitude_sin, latitude_cos, 
            longitude_sin, longitude_cos, 
            np.full(len(latitudes), year_sin), 
            np.full(len(latitudes), year_cos)
        ))
         
        model = tf.keras.models.load_model("geospatial_neural_net_model.keras")
        print("loaded model")

        predictions = model.predict(input_data)

        print(len(predictions))

        predictions = predictions.tolist()
        
        data_2024_filtered['Normalized_Health_Score'] = [item[0] for item in predictions]

        print(data_2024_filtered['Normalized_Health_Score'])

        result = data_2024_filtered[['Latitude', 'Longitude', 'Normalized_Health_Score']].to_dict(orient='records')

        return result

    #     #predicition = model.predict(input_data)
    #     predicition = 0
        
    #     data_2024['Normalized_Health_Score'] = predicition

    #     data_2024_filtered = data_2024.dropna(subset=['Latitude', 'Longitude', 'Normalized_Health_Score']).copy()

    #     data_2024_filtered_limited = data_2024_filtered[['Latitude', 'Longitude', 'Normalized_Health_Score']].head(80000)

    #     result = data_2024_filtered_limited.to_dict(orient='records')

    #     return result


@app.post("/health-information")
async def health_information(Latitude: float=Form(), Longitude: float=Form(), year: int=Form()):
    print(Longitude, Latitude, year)
    file_path = "spreadsheets/2016_2024_Data.csv"

    data = pd.read_csv(file_path)
    data_year = data[data['Year'] == year]

    match = data_year[(data_year['Latitude'].round(5) == round(Longitude, 5)) & (data_year['Longitude'].round(5) == round(Latitude, 5))]

    if not match.empty:
        result = match.drop(columns=['Year', 'Latitude', 'Longitude']).to_dict(orient='records')
        print(result)
        return result
    else:
        return None
