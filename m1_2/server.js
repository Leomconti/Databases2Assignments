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
    const tables = [
        { id: "tabela1", name: "Tabela 1" },
        { id: "tabela2", name: "Tabela 2" },
        { id: "tabela3", name: "Tabela 3" },
    ];

    // Send only the option elements as the response
    let optionsHTML = tables.map((table) => `<option value="${table.id}">${table.name}</option>`).join("");
    res.send(optionsHTML);
});

app.post("/search", (req, res) => {
    const query = req.body.query;
    const table = req.body.table;
    // vendo se chegou no endpoint pelo menos
    console.log(`Searching for '${query}' in table '${table}'`);

    // enviando resposta teste
    res.send(`Results for '${query}' in table '${table}': ...`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
