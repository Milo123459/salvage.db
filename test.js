const { MongoClient } = require(".");
let db = new MongoClient({
  mongoURI:
    "mongodb+srv://Salvage:SalvageDev@cluster0-bsjyv.mongodb.net/Data?retryWrites=true&w=majority",
    logFile: './log.txt'
});
(async()=>{
    await db.addSchema("hello")
    await db.addSchema("TEST_1_2_3")
    console.log(db.schemas)
    await db.set("key","value","TEST_1_2_3")
    await db.delete("key","hello")
    await db.set("key1","value1")
    console.log(await db.get("key1"))
})();