import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras import regularizers
import matplotlib.pyplot as plt
import numpy as np

data = pd.read_csv('spreadsheets/2016_2024_Data.csv')
data = data.dropna(subset=['Latitude', 'Longitude', 'Year', 'Normalized_Health_Score'])


data['latitude_rad'] = np.deg2rad(data['Latitude'])
data['longitude_rad'] = np.deg2rad(data['Longitude'])

data['latitude_sin'] = np.sin(data['latitude_rad'])
data['latitude_cos'] = np.cos(data['latitude_rad'])
data['longitude_sin'] = np.sin(data['longitude_rad'])
data['longitude_cos'] = np.cos(data['longitude_rad'])

cycle = 5
data['Year_sin'] = np.sin(2 * np.pi * data['Year'] / cycle)
data['Year_cos'] = np.cos(2 * np.pi * data['Year'] / cycle)


feature_columns = [
        'latitude_sin', 'latitude_cos',
        'longitude_sin', 'longitude_cos',
        'Year_sin', 'Year_cos'
    ]

X = data[feature_columns].values
y = data['Normalized_Health_Score'].values

X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )


def build_geospatial_model(input_dim):
        model = models.Sequential()
        model.add(layers.InputLayer(input_shape=(input_dim,)))
        
        model.add(layers.Dense(256, activation='relu', kernel_regularizer=regularizers.l2(0.001)))
        model.add(layers.BatchNormalization())
        model.add(layers.Dropout(0.1))
        
        model.add(layers.Dense(128, activation='relu', kernel_regularizer=regularizers.l2(0.001)))
        model.add(layers.BatchNormalization())
        model.add(layers.Dropout(0.1))
        
        model.add(layers.Dense(64, activation='relu', kernel_regularizer=regularizers.l2(0.001)))
        model.add(layers.BatchNormalization())
        model.add(layers.Dropout(0.1))

        model.add(layers.Dense(32, activation='relu', kernel_regularizer=regularizers.l2(0.001)))
        model.add(layers.BatchNormalization())
        model.add(layers.Dropout(0.1))
        
        model.add(layers.Dense(1, activation='linear'))
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model

input_dim = X_train.shape[1]
model = build_geospatial_model(input_dim)
model.summary()

early_stop = tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=50,
        restore_best_weights=True
    )

history = model.fit(
        X_train, y_train,
        validation_split=0.2,
        epochs=400,
        batch_size=1024,
        callbacks=[early_stop],
        verbose=1
    )

test_loss, test_mae = model.evaluate(X_test, y_test, verbose=2)
print(f'Test MAE: {test_mae}')

model.save("geospatial_neural_net_model.keras")

    # 9. Make predictions
predictions = model.predict(X_test)
print("Predicted Health Scores:", predictions.flatten())
print("Actual Health Scores:", y_test)

# def preprocess_data(lat_data,long_data,year ):
#     latitude_rad = np.deg2rad(lat_data)
#     longitude_rad = np.deg2rad(long_data)
    
#     latitude_sin = np.sin(latitude_rad)
#     latitude_cos = np.cos(latitude_rad)
#     longitude_sin = np.sin(longitude_rad)
#     longitude_cos = np.cos(longitude_rad)
    
#     cycle = 5
#     year_sin = np.sin(2 * np.pi * year / cycle)
#     year_cos = np.cos(2 * np.pi * year / cycle)

#     return np.array([[latitude_sin, latitude_cos, longitude_sin, longitude_cos, year_sin, year_cos]])
# import numpy as np
# from keras.models import Sequential
# from keras.layers import Dense

# x_train_data = np.random.random((1000, 10))
# y_train_data = np.random.randint(2, size=(1000, 1))

# model = Sequential()
# model.add(Dense(10, activation='relu', input_dim=10))
# model.add(Dense(1, activation='sigmoid'))

# model.compile(optimizer='adam', loss = 'mean_squared_error', metrics=['mae'])

# model.fit(x_train_data, y_train_data, epochs=20, batch_size=10)

# x_test_data = np.random.random((100, 10))
# y_test_data = np.random.randint(2, size=(100, 1))

# loss, accuracy = model.evaluate(x_test_data, y_test_data)
# print('Test model loss:', loss)
# print('Test model accuracy:', accuracy)
