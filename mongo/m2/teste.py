from json import load
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

# Create a new client and connect to the server
client = MongoClient(uri)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)