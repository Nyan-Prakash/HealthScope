import numpy as np
from keras.models import Sequential
from keras.layers import Dense

x_train_data = np.random.random((1000, 10))
y_train_data = np.random.randint(2, size=(1000, 1))

model = Sequential()
model.add(Dense(10, activation='relu', input_dim=10))
model.add(Dense(1, activation='sigmoid'))

model.compile(optimizer='adam', loss = 'mean_squared_error', metrics=['mae'])

model.fit(x_train_data, y_train_data, epochs=20, batch_size=10)

x_test_data = np.random.random((100, 10))
y_test_data = np.random.randint(2, size=(100, 1))

loss, accuracy = model.evaluate(x_test_data, y_test_data)
print('Test model loss:', loss)
print('Test model accuracy:', accuracy)
