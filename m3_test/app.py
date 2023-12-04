from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS

from db_conn import create_sql_connection, get_cassandra_session

app = Flask(__name__)
CORS(app)

cassandra = get_cassandra_session()


@app.route("/employees-by-manager/<manager_name>", methods=["GET"])
def employees_by_manager(manager_name):
    html = request.args.get("html", default="true") == "true"
    query = "SELECT * FROM employees_by_manager WHERE manager_name = %s"
    rows = cassandra.execute(query, [manager_name])

    if html:
        # Return HTML
        data_html = "<table>"
        for row in rows:
            data_html += (
                "<tr>"
                + "".join([f"<td>{getattr(row, col)}</td>" for col in row._fields])
                + "</tr>"
            )
        data_html += "</table>"
        return render_template_string(data_html)
    else:
        # Return JSON
        data_json = [dict(row._asdict()) for row in rows]
        print(data_json)
        return jsonify(data_json)


@app.route("/employees-by-dept/<dept_name>/<query_date>", methods=["GET"])
def employees_by_dept(dept_name, query_date):
    html = request.args.get("html", default="true") == "true"
    query = f"SELECT * FROM employees_by_dept WHERE dept_name = {dept_name} AND query_date = {query_date}"
    rows = cassandra.execute(query)

    if html:
        # Return HTML
        data_html = "<table>"
        for row in rows:
            data_html += (
                "<tr>"
                + "".join([f"<td>{getattr(row, col)}</td>" for col in row._fields])
                + "</tr>"
            )
        data_html += "</table>"
        return render_template_string(data_html)
    else:
        # Return JSON
        data_json = [dict(row._asdict()) for row in rows]
        print(data_json)
        return jsonify(data_json)


@app.route("/avg-salary-by-dept/<dept_name>", methods=["GET"])
def avg_salary_by_dept(dept_name):
    html = request.args.get("html", default="true") == "true"
    query = f"SELECT * FROM avg_salary_by_dept WHERE dept_name = {dept_name}"
    rows = cassandra.execute(query)

    if html:
        # Return HTML
        data_html = "<table>"
        for row in rows:
            data_html += (
                "<tr>"
                + "".join([f"<td>{getattr(row, col)}</td>" for col in row._fields])
                + "</tr>"
            )
        data_html += "</table>"
        return render_template_string(data_html)
    else:
        # Return JSON
        data_json = [dict(row._asdict()) for row in rows]
        print(data_json)
        return jsonify(data_json)


if __name__ == "__main__":
    app.run(debug=True)
