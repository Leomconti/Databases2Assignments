const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const csv = require("csv-parser");

const { Op } = require("sequelize");
const sequelize = require("./conn.js");

const fs = require("fs");

const app = express();
const port = 3000;

const TableCsv = require("./model.js");

// here the upload is handled by multer automatically
const upload = multer({ dest: "uploads/" }); // this is to store uploaded files

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// here we use the upload we defined above to use multer
app.post("/upload", upload.single("csvFile"), async (req, res) => {
    const file = req.file;
    const path = file.path;
    allData = [];
    // reading the uploaded CSV file
    const dataToInsert = [];

    fs.createReadStream(path)
        .pipe(csv())
        .on("data", (row) => {
            dataToInsert.push(row);
        })
        .on("end", async () => {
            try {
                await TableCsv.bulkCreate(dataToInsert);
                console.log("end");
            } catch (err) {
                console.error("Error inserting data:", err);
            }
        })
        .on("error", (err) => {
            console.error(err);
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
