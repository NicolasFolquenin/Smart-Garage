const Entidade = require("./models/index");

async function popularBanco() {
    const marcas = [
        "Audi", "BMW", "BYD", "Caoa Chery", "Chevrolet", "Citroën", "Dodge", 
        "Effa", "Ferrari", "Fiat", "Ford", "GWM", "Haval", "Honda", "Hyundai", 
        "Iveco", "Jac Motors", "Jaguar", "Jeep", "Kia", "Lamborghini", 
        "Land Rover", "Lexus", "Lifan", "Maserati", "Mazda", "Mercedes-Benz", 
        "Mini", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", 
        "Rolls-Royce", "Subaru", "Suzuki", "Tesla", "Toyota", "Troller", 
        "Volkswagen", "Volvo", "Willys", "Aston Martin", "Bentley", 
        "Chrysler", "Dacia", "Geely", "Hummer", "Isuzu"
    ];
    
    console.log("Iniciando inserção das 50 marcas...");
    
    for (const nome of marcas) {
        await Entidade.Marca.findOrCreate({ where: { nome } });
    }
    
    console.log("Banco populado com 50 marcas!");
    process.exit();
}

popularBanco();