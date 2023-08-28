const readline = require("readline");
const { Customer, Rental, Payment } = require("./model.js");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function getInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function createCustomer() {
    try {
        const first_name = await getInput("Primeiro nome: ");
        const last_name = await getInput("Sobrenome: ");
        const email = await getInput("Email: ");
        const address_id = await getInput("Id do Endereco: ");
        const store_id = await getInput("Id da loja: ");

        // variavel estava sendo usada para printar o que o usuario digitou e a query que foi realizada
        const newCustomer = await Customer.create({
            store_id,
            first_name,
            last_name,
            email,
            address_id,
        });

        console.log("Cliente criado com sucesso");
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
    }
}

async function createRental() {
    try {
        const inventory_id = await getInput("Id do inventario: ");
        const customer_id = await getInput("Id do cliente: ");
        const return_date = await getInput("Data de retorno (YYYY-MM-DD): ");
        const staff_id = await getInput("Id do vendedor: ");

        const newRental = await Rental.create({
            inventory_id,
            customer_id,
            return_date,
            staff_id,
        });

        console.log("Aluguel criado com sucesso");
    } catch (error) {
        console.error("Erro ao criar aluguel:", error);
    }
}

async function createPayment() {
    try {
        const customer_id = await getInput("Id do cliente: ");
        const staff_id = await getInput("Id do vendedor: ");
        const rental_id = await getInput("Id do aluguel: ");
        const amount = await getInput("Valor do pagamento: ");

        const newPayment = await Payment.create({
            customer_id,
            staff_id,
            rental_id,
            amount,
        });

        console.log("Pagamento criado com sucesso:");
    } catch (error) {
        console.error("Error ao criar pagamento:", error);
    }
}

// func para retornar as tabelas que devem ser incluidas no eager load
function getIncludeTables(tableModel) {
    switch (tableModel) {
        case Rental:
            return [{ model: Customer }, { model: Payment }];

        case Payment:
            return [{ model: Customer }, { model: Rental }];

        default:
            return [];
    }
}

async function listRows(tableModel) {
    try {
        const includeTables = getIncludeTables(tableModel);
        const data = await tableModel.findAll({
            include: includeTables, // eager lode por meio do include
        });
        data.forEach((item) => {
            console.log(JSON.stringify(item.get(), null, 2));
            console.log("-----------------------------------");
        });
    } catch (error) {
        console.error("Error log", error);
    }
}

module.exports = {
    createCustomer,
    createRental,
    createPayment,
    rl,
    getInput,
    listRows,
};
