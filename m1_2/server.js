const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const csv = require("csv-parser");
const { Readable } = require("stream");

const { Op } = require("sequelize");
const sequelize = require("./conn.js");

const TableCsv = require("./model.js"); // grab the table model

const app = express();
const port = 3000;

// setup multer for reading the files
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
    const modelAttributes = Object.keys(TableCsv.getAttributes()); // grab the attributes to create the map

    //  create the readable from the buffer
    const readableStream = new Readable({
        read() {
            this.push(fileBuffer);
            this.push(null); // end of file!
        },
    });

    readableStream
        .pipe(csv())
        .on("data", (row) => {
            let value = Object.values(row); // asdads123132, leonardo, mosimann ...
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
                // console.log("QUE ERRO QUE DEU????");
                // console.log(err);
                res.send('<div class="alert alert-danger">Erro inserindo os dados na base.</div>');
            }
        })
        .on("error", (err) => {
            res.send('<div class="alert alert-danger">Erro inserindo os dados na base.</div>');
        });
});

app.post("/search", async (req, res) => {
    const query = req.body.query;
    const selectTable = req.body.table;
    const page = parseInt(req.body.page || "1");
    const limit = 20;
    const offset = (page - 1) * limit;
    const table = getTableModel(selectTable);

    const rows = await table.findAll({
        where: {
            first_name: {
                [Op.substring]: query, // LIKE %...%
            },
        },
        offset: offset,
        limit: limit,
    });

    let rowsHtml = parseRowsToTable(rows);

    // check if it'snot ended
    if (rows.length >= limit) {
        rowsHtml += `
            <tr hx-post="/search"  
            hx-vars="page:${page + 1}, table:'${selectTable}', query:'${query}'"
            hx-trigger="revealed" 
            hx-swap="afterend">
          </tr>`;
    } else {
        rowsHtml += `<tr><td colspan="100%">Fim dos Resultados</td></tr>`;
    }
    res.send(rowsHtml);
});

app.post("/list", async (req, res) => {
    const selectTable = req.body.table;
    const page = parseInt(req.body.page || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const table = getTableModel(selectTable);

    const rows = await table.findAll({ offset, limit });

    let rowsHtml = parseRowsToTable(rows);
    // check if it's not ended
    if (rows.length >= limit) {
        // Add the infinite scroll row -> https://htmx.org/examples/infinite-scroll/
        rowsHtml += `
        <tr hx-post="/list" 
        hx-vars="page:${page + 1}, table:'${selectTable}'"
        hx-trigger="revealed" 
        hx-swap="afterend">
      </tr>`;
    }
    // console.log(rowsHtml);
    // console.log("ASHJFHKGLHJAGJHLGASHSGAKHJG\n\n\n\n\n\n\n\n\n\n\n\n\n");
    // console.log(`Page: ${page}, Offset: ${offset}, Rows: ${rows.length}`);

    res.send(rowsHtml);
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

app.get("/getMessage", (req, res) => {
    // meti um spinner q fica baita
    res.send(`
    <div class="alert alert-warning d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Inserindo os dados na base.
    </div>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// let's just retrieve the one we've mapped, but later it could be sth to get any model based on table name
function getTableModel(tableName) {
    return TableCsv;
}

function parseRowsToTable(rows) {
    // function to map out values to table cells

    // console.log(rows);

    let rowsHtml = "";
    let row = rows.map((r) => {
        // [r: dataValue, r:dataValue,...]
        return r.dataValues;
    });

    row.forEach((value) => {
        // id: 1, user_id:sadads, first_name:'asdasda'...
        let columnsHtml = "";

        Object.values(value).map((v) => {
            // map to get each value and put in the cell
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
