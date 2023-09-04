const express = require("express");
const csvParser = require("csv-parser");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

const TableModel = require("./model.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    // fazer busca das tabelas com o sequelize ("generalizar o codigo para buscar as tabelas")
    const tables = [
        { id: "tabela1", name: "Tabela 1" },
        { id: "tabela2", name: "Tabela 2" },
    ];

    // utilizando htmx ent manda o html para o cliente
    let optionsHTML = tables.map((table) => `<option value="${table.id}">${table.name}</option>`).join("");
    res.send(`<select class="form-control" id="selectTable" name="selectTable">${optionsHTML}</select>`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
