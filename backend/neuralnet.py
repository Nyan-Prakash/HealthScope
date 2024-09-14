import numpy as np
from keras.models import Sequential
from keras.layers import Dense

def neural_net():
    x_train_data = np.random.random((1000, 10))
    y_train_data = np.random.random(2, size=(1000, 1))
