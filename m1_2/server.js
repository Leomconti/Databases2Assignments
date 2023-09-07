const express = require("express");
const csvParser = require("csv-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const TableModel = require("./model.js");

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

app.get("/tables", (req, res) => {
    // TODO: Show tables for the database !!!!

    // here we'll get the tables from the database and show them as options
    const tables = [
        { id: "Customer", name: "Cliente" },
        { id: "Rental", name: "Aluguel" },
        { id: "Payment", name: "Pagamento" },
    ];

    // Send only the option elements as the response
    let optionsHTML = tables.map((table) => `<option value="${table.id}">${table.name}</option>`).join("");
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
    const table = req.body.table;

    rows = await TableModel.findAll({
        where: {
            name: {
                [Op.substring]: query, // substring would be %query% look at: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
            },
        },
    });

    let rowsHtml = "";

    rows.forEach((row) => {
        let columnsHtml = "";

        for (let value in row) {
            // we'll be getting each column value from the row, and adding it to the <td>
            columnsHtml += `<td>${row[value]}</td>`;
        }
        rowsHtml += `<tr>${columnsHtml}</tr>`; // for each row we create a <tr> element with the columns (<td>)
    });

    // @anderson !! Essa de cima eh a msm coisa doq emabaixo ne? parei pra pensar e mt mais facil tacar o foreach
    // mas eu vou precisar tacar um await nele ou da boa assim?

    // for (let i = 0; i < rows.length; i++) {
    //     let row = rows[i];
    //     let columnsHtml = "";

    //     for (let value in row) {
    //         // we'll be getting each column value from the row, and adding it to the <td>
    //         columnsHtml += `<td>${row[value]}</td>`;
    //     }
    //     rowsHtml += `<tr>${columnsHtml}</tr>`; // for each row we create a <tr> element with the columns (<td>)
    // }

    res.send(`${rowsHtml}`);
});

app.post("/list", async (req, res) => {
    const table = req.body.table;
    rows = await TableModel.findAll();

    let rowsHtml = "";

    rows.forEach((row) => {
        let columnsHtml = "";
        for (let value in row) {
            columnsHtml += `<td>${row[value]}</td>`; // we'll be getting each column value from the row, and adding it to the <td>
        }
        rowsHtml += `<tr>${columnsHtml}</tr>`; // for each row we create a <tr> element with the columns (<td>)
    });

    res.send(`${rowsHtml}`);
});

app.post("/tableHeaders", (req, res) => {
    const table = req.body.table;

    for (let key in TableModel.getAttributes()) {
        // rawAttributes is deprecated, so we use getAttributes, test it out before!
        headersHtml += `<th id="${key}">${key}</th>`;
    }
    res.send(`<tr>${headersHtml}</tr>`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
