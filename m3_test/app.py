from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS

from db_conn import create_sql_connection, get_cassandra_session

app = Flask(__name__)
CORS(app)

cassandra = get_cassandra_session()


@app.route("/employees-by-manager/<manager_emp_no>", methods=["GET"])
def employees_by_manager(manager_emp_no):
    html = request.args.get("html", default="true") == "true"
    rows = cassandra.execute(
        f"SELECT * FROM employees_by_manager WHERE manager_emp_no = {manager_emp_no}"
    )

    if html:
        # Return HTML
        data_html = "<table>"
        for col in rows[0]._fields:
            print(col)
            data_html += f"<th>{col}</th>"

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


@app.route("/employees-by-dept/<dept_name>/<date_range>", methods=["GET"])
def employees_by_dept(dept_name, date_range):
    html = request.args.get("html", default="true") == "true"
    from_date = date_range.split(",")[0]
    to_date = date_range.split(",")[1]
    rows = cassandra.execute(
        f"SELECT * FROM employees_by_dept WHERE dept_name = {dept_name} AND to_date = {to_date} AND from_date = {from_date}"
    )

    if html:
        # Return HTML
        data_html = "<table>"
        for col in rows[0]._fields:
            print(col)
            data_html += f"<th>{col}</th>"
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
    rows = cassandra.execute(
        f"SELECT * FROM avg_salary_by_dept WHERE dept_name = {dept_name}"
    )

    if html:
        # Return HTML
        data_html = "<table>"
        for col in rows[0]._fields:
            print(col)
            data_html += f"<th>{col}</th>"
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


@app.route("/show-all/<table_name>", methods=["GET"])
def show_all(table_name):
    html = request.args.get("html", default="true") == "true"
    valid_tables = ["employees_by_manager", "employees_by_dept", "avg_salary_by_dept"]

    if table_name not in valid_tables:
        return "Invalid table name", 400

    query = f"SELECT * FROM {table_name}"
    rows = cassandra.execute(query)

    if html:
        # Return HTML
        data_html = "<table>"
        for col in rows[0]._fields:
            print(col)
            data_html += f"<th>{col}</th>"
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
        return jsonify(data_json)


if __name__ == "__main__":
    app.run(debug=True)
