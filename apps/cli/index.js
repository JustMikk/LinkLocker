const readline = require("readline");
const path = require("path");
const createDatabase = require("@linklocker/database");

const dbPath = path.resolve(__dirname, "../../packages/database/linklocker.db");
const database = createDatabase(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    if (rl.closed || !process.stdin.readable) {
      resolve(null);
      return;
    }

    try {
      rl.question(question, (answer) => resolve(answer));
    } catch (error) {
      resolve(null);
    }
  });
}

function printBookmarkList(items) {
  if (!items.length) {
    console.log("No bookmarks yet");
    return;
  }

  for (const item of items) {
    console.log(`ID: ${item.id}`);
    console.log(`Title: ${item.title || "(no title)"}`);
    console.log(`URL: ${item.url}`);
    console.log(`Tags: ${item.tags || ""}`);
    console.log("-------------------------");
  }
}

async function addBookmark() {
  const url = await ask("URL: ");
  if (url === null) {
    return;
  }

  const title = await ask("Title: ");
  if (title === null) {
    return;
  }

  const tags = await ask("Tags (comma separated): ");
  if (tags === null) {
    return;
  }

  const notes = await ask("Notes: ");
  if (notes === null) {
    return;
  }

  const result = await database.save(url, title, tags, notes);
  if (result.success) {
    console.log("Bookmark saved!");
  } else {
    console.log("Failed to save bookmark:", result.error);
  }
}

async function viewAllBookmarks() {
  const result = await database.getAll();
  if (!result.success) {
    console.log("Failed to load bookmarks:", result.error);
    return;
  }

  printBookmarkList(result.data);
}

async function deleteBookmark() {
  const allResult = await database.getAll();
  if (!allResult.success) {
    console.log("Failed to load bookmarks:", allResult.error);
    return;
  }

  printBookmarkList(allResult.data);
  if (!allResult.data.length) {
    return;
  }

  const idInput = await ask("Enter ID to delete: ");
  if (idInput === null) {
    return;
  }

  const result = await database.delete(Number(idInput));

  if (result.success && result.data.changes > 0) {
    console.log("Deleted!");
  } else if (result.success) {
    console.log("No bookmark deleted (ID may not exist).");
  } else {
    console.log("Failed to delete bookmark:", result.error);
  }
}

async function menuLoop() {
  while (true) {
    console.log("\nLinkLocker Menu");
    console.log("1. Add bookmark");
    console.log("2. View all bookmarks");
    console.log("3. Delete bookmark");
    console.log("4. Exit");

    const choice = await ask("Select an option: ");
    if (choice === null) {
      console.log("Input stream closed. Exiting.");
      break;
    }

    if (choice === "1") {
      await addBookmark();
    } else if (choice === "2") {
      await viewAllBookmarks();
    } else if (choice === "3") {
      await deleteBookmark();
    } else if (choice === "4") {
      console.log("Goodbye!");
      break;
    } else {
      console.log("Invalid option, try again.");
    }
  }
}

async function main() {
  const initResult = await database.init();
  if (!initResult.success) {
    console.log("Failed to initialize database:", initResult.error);
    rl.close();
    return;
  }

  await menuLoop();
  rl.close();
}

main().catch((error) => {
  console.error("Unexpected CLI error:", error.message);
  rl.close();
});
