const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const csv = require("csv-parser");
const { Readable } = require("stream"); // Import the Readable stream

const { Op } = require("sequelize");
const sequelize = require("./conn.js");

const app = express();
const port = 3000;

const TableCsv = require("./model.js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/upload", upload.single("csvFile"), async (req, res) => {
    // here we had to use the multer memoryStorage because the /upload was making the page reload ;-;
    const file = req.file;
    const fileBuffer = file.buffer;

    const dataToInsert = [];
    const modelAttributes = Object.keys(TableCsv.getAttributes());

    // Convert the buffer to a readable stream
    const readableStream = new Readable({
        read() {
            this.push(fileBuffer);
            this.push(null); // Indicates EOF
        },
    });

    readableStream
        .pipe(csv())
        .on("data", (row) => {
            let value = Object.values(row);
            const rowObject = {};
            for (let i = 0; i < modelAttributes.length; i++) {
                rowObject[modelAttributes[i]] = value[i];
            }
            dataToInsert.push(rowObject);
        })
        .on("end", async () => {
            try {
                await TableCsv.bulkCreate(dataToInsert);
                res.send('<div class="alert alert-success">Dados inseridos com sucesso!</div>');
            } catch (err) {
                res.send('<div class="alert alert-danger">Erro inserindo os dados na base.</div>');
            }
        })
        .on("error", (err) => {
            res.send('<div class="alert alert-danger">Erro inserindo os dados na base.</div>');
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
            disabled
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// let's just retrieve the one we've mapped, but later it could be sth to get any model based on table name
function getTableModel(tableName) {
    return TableCsv;
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

// app.post("/list", async (req, res) => {
//     const table = getTableModel(req.body.table);
//     const page = parseInt(req.body.page || "1"); // get's the page from the front, use 1 as default
//     const limit = 10; // always limit 10, to lower complexity

//     const offset = (page - 1) * limit; // calculate the offset for the query

//     const rows = await table.findAll({
//         // use offset and limit for pagination
//         offset: offset,
//         limit: limit,
//     });
//     const totalRows = await table.count(); // get the total rows to calculate the pages for the frontend

//     const totalPages = Math.ceil(totalRows / limit); // get and round the pages based on the limit (10)

//     // we send the data, as the html for the table, page, and the totalPages
//     let tosend = {
//         data: `<div id="htmxData">${parseRowsToTable(rows)}</div>`,
//         page: page,
//         totalPages: totalPages,
//     };

//     console.log(tosend);

//     res.send({
//         data: parseRowsToTable(rows),
//         page: page,
//         totalPages: totalPages,
//     });
// });
