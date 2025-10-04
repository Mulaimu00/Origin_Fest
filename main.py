from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

# Loading the saved model
model = joblib.load("model.joblib")

# Defining the FastAPI app
app = FastAPI(title="Carbon Impact API with ML Anomly Detection")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Input schema
class ActivityData(BaseModel):
    Diesel_Liters: float
    CO2_Emissions: float

#Root endpoint
@app.get("/")
def root():
    return {"message": "Carbon Impact API is running"}

# Calculation endpoint
@app.post("/calculate")
def calculate_emissions(data: ActivityData):
    """Calculate C02 emissions from Diesel_liters. 
    CO2_Emissions are also computed
    """
    co2_estimate = data.Diesel_Liters * 2.68
    return{
        "Diesel_Liters": data.Diesel_Liters,
        "CO2_Emissions_Estimate": co2_estimate
    }

#Verification endpoint
@app.post("/verify")
def verify_anomaly(data: ActivityData):
    df = pd.DataFrame([data.dict()])

    scores = model.decision_function(df)
    threshold = 0.1
    prediction = np.where(scores < threshold, 1, 0)

    response = {
        "Diesel_Liters": data.Diesel_Liters,
        "CO2_Emissions": data.CO2_Emissions,
        "Anomaly": bool(prediction[0]),
        "Score": float(scores[0])
    }
    return response

app.mount("/", StaticFiles(directory= "../frontend", html=True), name="frontend")
