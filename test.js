const { MongoClient } = require(".");
let db = new MongoClient({
  mongoURI:
    "mongodb+srv://Salvage:SalvageDev@cluster0-bsjyv.mongodb.net/Data?retryWrites=true&w=majority",
  
});
(async () => {
  await db.addSchema("TEST__");
  await db.set("TEST2",{
    Test: "Hi!"
  },"TEST__");
  console.log(await db.get("TEST2","TEST__"));
  await db.set("TEST3",["hi","hello","ski"]);
  console.log(await db.get("TEST3"))
})();
