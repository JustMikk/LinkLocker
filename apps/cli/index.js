const readline = require("readline");
const createBookmarkManager = require("@linklocker/bookmark-manager");

const bookmarkManager = createBookmarkManager();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function toFriendlyError(message) {
  const text = String(message || "Unknown error");
  if (text.toLowerCase().includes("database")) {
    return "Database error. Check if file exists.";
  }

  return text;
}

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

function printSearchResults(tag, items) {
  if (!items.length) {
    console.log(`No bookmarks found for tag: ${tag}`);
    return;
  }

  console.log(`Bookmarks with tag: ${tag}`);
  printBookmarkList(items);
}

async function addBookmark() {
  try {
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

    const result = await bookmarkManager.addBookmark(url, title, tags, notes);

    if (result.success) {
      console.log("Bookmark saved!");
    } else {
      console.log("Invalid bookmark:", toFriendlyError(result.error));
    }
  } catch (error) {
    console.log("Error while adding bookmark:", toFriendlyError(error.message));
  }
}

async function viewAllBookmarks() {
  try {
    const result = await bookmarkManager.getAllBookmarks();
    if (!result.success) {
      console.log("Failed to load bookmarks:", toFriendlyError(result.error));
      return;
    }

    if (!result.data.length) {
      console.log("No bookmarks yet. Add one from option 1.");
      return;
    }

    printBookmarkList(result.data);
  } catch (error) {
    console.log("Error while loading bookmarks:", toFriendlyError(error.message));
  }
}

async function deleteBookmark() {
  try {
    const allResult = await bookmarkManager.getAllBookmarks();
    if (!allResult.success) {
      console.log("Failed to load bookmarks:", toFriendlyError(allResult.error));
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

    const result = await bookmarkManager.deleteBookmark(idInput);

    if (result.success && result.data.changes > 0) {
      console.log("Deleted!");
    } else if (result.success) {
      console.log("Bookmark not found");
    } else {
      console.log("Failed to delete bookmark:", toFriendlyError(result.error));
    }
  } catch (error) {
    console.log("Error while deleting bookmark:", toFriendlyError(error.message));
  }
}

async function searchBookmarksByTag() {
  try {
    const tag = await ask("Enter tag to search: ");
    if (tag === null) {
      return;
    }

    const result = await bookmarkManager.searchByTag(tag);
    if (!result.success) {
      console.log("Failed to search bookmarks:", toFriendlyError(result.error));
      return;
    }

    printSearchResults(tag.trim(), result.data);
  } catch (error) {
    console.log("Error while searching bookmarks:", toFriendlyError(error.message));
  }
}

async function menuLoop() {
  while (true) {
    console.log("\nLinkLocker Menu");
    console.log("1. Add bookmark");
    console.log("2. View all bookmarks");
    console.log("3. Delete bookmark");
    console.log("4. Exit");
    console.log("5. Search by tag");

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
    } else if (choice === "5") {
      await searchBookmarksByTag();
    } else {
      console.log("Invalid option, try again.");
    }
  }
}

async function main() {
  await menuLoop();
  rl.close();
}

main().catch((error) => {
  console.error("Unexpected CLI error:", toFriendlyError(error.message));
  rl.close();
});
