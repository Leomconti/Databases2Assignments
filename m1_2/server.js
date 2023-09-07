const express = require("express");
const csvParser = require("csv-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Op } = require("sequelize");
const sequelize = require("./conn.js");

const app = express();
const port = 3000;

// const TableModel = require("./model.js");

const TableModel = require("./model_teste.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/upload", (req, res) => {
    let dataString = "";
    req.on("data", (chunk) => {
        dataString += chunk;
    });

    req.on("end", () => {
        const csvData = dataString.split("csvFile=")[1]; // Adjust based on your form field name
        const decodedCsv = decodeURIComponent(csvData);

        const rows = [];
        const stream = require("stream");
        const s = new stream.Readable();

        s._read = () => {};
        s.push(decodedCsv);
        s.push(null);

        s.pipe(csvParser())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", async () => {
                try {
                    // later we can simplify the input etc, I just really wanted to test out htmx, seems great
                    // lets use the defined model to insert data
                    await TableModel.bulkCreate(rows);
                    res.send("Dados inseridos com sucesso na base");
                } catch (error) {
                    res.status(500).send("Erro ao inserir dados.");
                }
            });
    });
});

app.get("/tables", async (req, res) => {
    let optionsHTML = "";
    let [tables] = await sequelize.query("SHOW TABLES");

    tables.forEach((row) => {
        let tableName = Object.values(row)[0];
        optionsHTML += `<option value="${tableName}">${tableName}</option>`;
    });

    res.send(`
        <select
            class="form-control"
            id="selectTable"
            name="selectTable"
            hx-post="/tableHeaders"
            hx-trigger="load, change"
            hx-target="#tableHeaders"
            hx-vars="table:selectTable.value"
        >
            ${optionsHTML}
        </select>`);
});

app.post("/search", async (req, res) => {
    const query = req.body.query;
    const selectTable = req.body.table;
    const table = getTableModel(selectTable);

    rows = await table.findAll({
        where: {
            first_name: {
                [Op.substring]: query, // substring would be %query% look at: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
            },
        },
    });

    res.send(`${parseRowsToTable(rows)}`);
});

app.post("/list", async (req, res) => {
    const selectTable = req.body.table;
    const table = getTableModel(selectTable);

    rows = await table.findAll();

    res.send(`${parseRowsToTable(rows)}`);
});

app.post("/tableHeaders", (req, res) => {
    const selectTable = req.body.table;
    const table = getTableModel(selectTable);

    let headersHtml = "";

    for (let key in table.getAttributes()) {
        headersHtml += `<th id="${key}">${key}</th>`; // rawAttributes is deprecated, so we use getAttributes, test it out before!
    }
    res.send(`<tr>${headersHtml}</tr>`);
});

// // selecionar a coluna para buscar no search
// app.post("/cols", (req, res) => {
//     const selectTable = req.body.table;
//     const table = getTableModel(selectTable);
//     let optionsHTML = "";

//     for (let key in table.getAttributes()) {
//         optionsHTML += `<option value="${key}">${key}</option>`;
//     }
//     res.send(optionsHTML);
// });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// let's just retrieve the one we've mapped, but later it could be sth to get any model based on table name
function getTableModel(tableName) {
    return TableModel;
}

function parseRowsToTable(rows) {
    let rowsHtml = "";
    let row = rows.map((r) => {
        return r.dataValues;
    });

    row.forEach((value) => {
        let columnsHtml = "";

        Object.values(value).map((v) => {
            columnsHtml += `<td>${v}</td>`;
        });
        rowsHtml += `<tr>${columnsHtml}</tr>`;
    });

    return rowsHtml;
}
