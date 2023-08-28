const csv = require("csv"); // csv parser
const fs = require("fs"); // file system

const csv_path = "./Teste_RLS (1).csv";
const data = fs.readFileSync(csv_path, "utf8");
const csv_data = csv.parse(data, {
    delimiter: ";",
});

console.log(csv_data.read());

// for (row in csv_data) {
//     console.log(row);
// }
