const { Customer, Rental, Payment } = require("./model.js");
const { rl, getInput, createCustomer, createRental, createPayment, listRows } = require("./control.js");

async function main() {
    while (true) {
        console.log("1- Comecar\n2- Sair");
        let option = await getInput("Escolha uma opcao: ");
        if (option == "2") {
            break;
        }
        // aqui fazer um map das tabelas para os modelos, pros inputs e tals
        const tablesModelsMap = {
            cliente: Customer,
            aluguel: Rental,
            pagamento: Payment,
        };

        const tables = Object.keys(tablesModelsMap);

        for (let i = 0; i < tables.length; i++) {
            console.log(i, tables[i]);
        }

        const selectedTableIndex = parseInt(await getInput("Selecione uma Tabela? "));
        if (selectedTableIndex < 0 || selectedTableIndex >= tables.length) {
            console.log("Tabela invalida.");
            continue;
        }

        const table_name = tables[selectedTableIndex]; // nome da tabela (portugues)
        const table = tablesModelsMap[table_name]; // nome do modelo na base, para usar nas funcoes

        let action = await getInput("Qual acao voce quer executar?\n1- Inserir\n2- Listar\n: ");

        if (action == "1") {
            if (table_name == "cliente") {
                await createCustomer();
            } else if (table_name == "aluguel") {
                await createRental();
            } else if (table_name == "pagamento") {
                await createPayment();
            } else {
                console.log("Nome da tabela invalido.");
            }
        } else if (action == "2") {
            await listRows(table);
        } else {
            console.log("Acao invalida.");
        }
    }
    rl.close();
}

main();
