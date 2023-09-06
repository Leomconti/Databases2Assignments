const express = require("express");
const csvParser = require("csv-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// const TableModel = require("./model.js");

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
                    await TableModel.bulkCreate(rows);
                    res.send("Dados inseridos com sucesso na base");
                } catch (error) {
                    res.status(500).send("Erro ao inserir dados.");
                }
            });
    });
});

app.get("/tables", (req, res) => {
    console.log("It's calling the /tables endpoint");
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

app.post("/search", (req, res) => {
    console.log("SEARCH");
    const query = req.body.query;
    const table = req.body.table;

    // use sequelize to query the database by name and return the results
    // enviando resposta teste
    res.send(`<td>SEARCH</td>`);
});

app.post("/list", (req, res) => {
    const table = req.body.table;

    rows = [
        { id: "1", name: "Cliente 1" },
        { id: "2", name: "Cliente 2" },
        { id: "3", name: "Cliente 3" },
        { id: "4", name: "Cliente 4" },
        { id: "5", name: "Cliente 5" },
    ];

    // fazer um map diferente, para cada row, coloca em <tr> antes, dai passa cada coluna em <td>, como ja esta abaixo

    let rowsHtml = rows.map((row) => `<tr><td value="${row.name}">${row.name}</td></tr>`).join("");
    res.send(`${rowsHtml}`);
});

app.post("/tableHeaders", (req, res) => {
    const table = req.body.table;

    // teste q o copilot completou kkkkk
    // utilizar o sequelize para pegar os headers certo
    headers = [
        { id: "customer_id", name: "ID" },
        { id: "first_name", name: "Nome" },
        { id: "last_name", name: "Sobrenome" },
        { id: "email", name: "Email" },
        { id: "address_id", name: "Endereço" },
        { id: "active", name: "Ativo" },
        { id: "create_date", name: "Data de criação" },
        { id: "last_update", name: "Última atualização" },
    ];

    let headersHtml = headers.map((column) => `<th id="${column.name}">${column.name}</th>`).join("");
    res.send(`<tr>${headersHtml}</tr>`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
