from pymongo.mongo_client import MongoClient
from dotenv import load_dotenv
from os import environ

load_dotenv()
user = environ.get('MONGO_USER')
pwd = environ.get('MONGO_PASSWORD')
host = environ.get('MONGO_HOST')
port = environ.get('MONGO_PORT')

# Replace the placeholder with your Atlas connection string
uri = f"mongodb://{user}:{pwd}@{host}:{port}"

uri = "mongodb+srv://anton:<password>@serverlessinstance0.wnmcs7p.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp"

# Create a new client and connect to the server
client = MongoClient(uri)