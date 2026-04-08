const createDatabase = require("./index");

async function runTest() {
  const db = createDatabase("./linklocker.db");

  const initResult = await db.init();
  console.log("init:", initResult);

  const saveResult = await db.save(
    "https://example.com",
    "Example",
    "test,bookmark",
    "Created from test script"
  );
  console.log("save:", saveResult);

  const allResult = await db.getAll();
  console.log("getAll:", allResult);
}

runTest().catch((error) => {
  console.error("Unexpected script error:", error.message);
});
