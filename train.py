import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle

# Load dataset
df = pd.read_csv("Crop_recommendation.csv")

# Features & Target
X = df.drop("label", axis=1)
y = df["label"]

# Encode crop names
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Save model and encoder
pickle.dump(model, open("crop_model.pkl", "wb"))
pickle.dump(encoder, open("label_encoder.pkl", "wb"))

print("Model trained and saved successfully!")
