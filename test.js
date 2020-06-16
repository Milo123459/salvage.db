const { MongoClient } = require(".");
let db = new MongoClient({
  mongoURI:
    "mongodb+srv://Salvage:SalvageDev@cluster0-bsjyv.mongodb.net/Data?retryWrites=true&w=majority",
});
(async () => {
  await db.set("LolTest", {
    O: "L  o l",
  });
  console.log(await db.get("LolTest"));
  await db.delete("LolTest");
  console.log(await db.get("LolTest"));
})();
