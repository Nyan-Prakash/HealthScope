import pandas as pd
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.metrics import mean_absolute_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.preprocessing import StandardScaler

# Load your dataset (assuming a CSV file)
# Ensure your dataset has the columns ['latitude', 'longitude', 'year', 'healthscore']
df = pd.read_csv('spreadsheets/2016_2024_Data.csv')

# Feature and target
X = df[['Latitude', 'Longitude', 'Year']]
y = df['Normalized_Health_Score']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train an XGBoost Regressor
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Build a simple neural network
model = Sequential()
model.add(Dense(64, input_dim=X_train_scaled.shape[1], activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(1))  # Output layer for regression

# Compile the model
model.compile(optimizer='adam', loss='mean_absolute_error')

# Train the model
model.fit(X_train_scaled, y_train, epochs=50, batch_size=32, validation_split=0.2)

# Predict and calculate MAE
y_pred_nn = model.predict(X_test_scaled)
mae_nn = mean_absolute_error(y_test, y_pred_nn)
print(f"Neural Network MAE: {mae_nn}")
