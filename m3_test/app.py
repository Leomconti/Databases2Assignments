import os

import dotenv
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster
from flask import Flask, render_template_string, request
from flask_cors import CORS

dotenv.load_dotenv()

# URL of the file to be downloaded
FILE_PATH: str = str(os.environ.get("FILE_PATH"))

# Rest of your code
cloud_config = {"secure_connect_bundle": FILE_PATH}

CLIENT_ID: str = str(os.environ.get("CLIENT_ID"))
CLIENT_SECRET: str = str(os.environ.get("SECRET"))

auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
session = cluster.connect()

# Now you can use 'session' to interact with your database

app = Flask(__name__)
CORS(app)


@app.route("/fetch-data", methods=["POST"])
def fetch_data():
    database = request.form.get("database")
    table = request.form.get("table")
    column = request.form.get("column")
    filter_value = request.form.get("filter")

    # Querying Cassandra Database
    query = f"SELECT * FROM {table} WHERE {column} = %s ALLOW FILTERING"
    rows = session.execute(query, (filter_value,))

    # Generating HTML table
    data_html = "<table>"
    for row in rows:
        data_html += (
            "<tr>"
            + "".join([f"<td>{getattr(row, col)}</td>" for col in row._fields])
            + "</tr>"
        )
    data_html += "</table>"

    return render_template_string(data_html)


from flask import jsonify


@app.route("/get-keyspaces", methods=["GET"])
def get_keyspaces():
    keyspaces = session.execute("SELECT keyspace_name FROM system_schema.keyspaces;")
    options = "".join(
        [
            f'<option value="{ks.keyspace_name}">{ks.keyspace_name}</option>'
            for ks in keyspaces
        ]
    )
    return render_template_string(options)


# Endpoint to get tables based on the selected keyspace
@app.route("/get-tables/<keyspace>", methods=["GET"])
def get_tables(keyspace):
    tables = session.execute(
        f"SELECT table_name FROM system_schema.tables WHERE keyspace_name='{keyspace}';"
    )
    options = "<option>Select Table</option>"
    options += "".join(
        [
            f'<option value="{table.table_name}">{table.table_name}</option>'
            for table in tables
        ]
    )
    return render_template_string(options)


# Endpoint to get columns based on the selected keyspace and table
@app.route("/get-columns/<keyspace>/<table>", methods=["GET"])
def get_columns(keyspace, table):
    columns = session.execute(
        f"SELECT column_name FROM system_schema.columns WHERE keyspace_name='{keyspace}' AND table_name='{table}';"
    )
    options = "<option>Select Column</option>"
    options += "".join(
        [
            f'<option value="{column.column_name}">{column.column_name}</option>'
            for column in columns
        ]
    )
    return render_template_string(options)


if __name__ == "__main__":
    app.run(debug=True)
