const assert = require("assert");
const fs = require("fs");
const path = require("path");
const createBookmarkManager = require("./index");

const TEST_DB_PATH = path.resolve(__dirname, "test.db");

function resetTestDb() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

async function runTests() {
  resetTestDb();
  const manager = createBookmarkManager({ dbPath: TEST_DB_PATH });

  // Validation tests
  const emptyUrlResult = await manager.addBookmark("", "", "", "");
  assert.strictEqual(emptyUrlResult.success, false, "empty URL should fail");

  const validResult = await manager.addBookmark(
    "https://example.com",
    "Example",
    "work,important",
    "first",
  );
  assert.strictEqual(validResult.success, true, "valid URL should pass");

  const titleFallbackResult = await manager.addBookmark(
    "https://fallback.example",
    "",
    "",
    "",
  );
  assert.strictEqual(titleFallbackResult.success, true);
  assert.strictEqual(
    titleFallbackResult.data.title,
    "https://fallback.example",
    "blank title should fallback to URL",
  );

  // Tag parsing tests
  const normalizedTagsResult = await manager.addBookmark(
    "https://tags.example",
    "Tag Test",
    "work, important",
    "",
  );
  assert.strictEqual(normalizedTagsResult.success, true);
  assert.strictEqual(
    normalizedTagsResult.data.tags,
    "work,important",
    "spaced tags should normalize",
  );

  const emptyTagsResult = await manager.addBookmark(
    "https://notags.example",
    "No Tags",
    "",
    "",
  );
  assert.strictEqual(emptyTagsResult.success, true);
  assert.strictEqual(emptyTagsResult.data.tags, "", "empty tags should stay empty");

  // Database integration tests
  const allBeforeDelete = await manager.getAllBookmarks();
  assert.strictEqual(allBeforeDelete.success, true);
  const added = allBeforeDelete.data.find(
    (item) => item.url === "https://example.com",
  );
  assert.ok(added, "added bookmark should appear in getAll");

  const updateResult = await manager.updateBookmark(added.id, {
    url: "https://example.com/updated",
    title: "Updated Example",
    tags: "updated,work",
    notes: "updated note",
  });
  assert.strictEqual(updateResult.success, true, "update should succeed");
  assert.strictEqual(updateResult.data.url, "https://example.com/updated");

  const searchResult = await manager.searchByTag("updated");
  assert.strictEqual(searchResult.success, true);
  assert.ok(
    searchResult.data.some((item) => item.id === added.id),
    "search should return updated bookmark",
  );

  const deleteResult = await manager.deleteBookmark(added.id);
  assert.strictEqual(deleteResult.success, true, "delete should succeed");

  const allAfterDelete = await manager.getAllBookmarks();
  assert.strictEqual(allAfterDelete.success, true);
  assert.ok(
    !allAfterDelete.data.some((item) => item.id === added.id),
    "deleted bookmark should not appear in getAll",
  );

  const closeResult = await manager.close();
  assert.strictEqual(closeResult.success, true, "manager should close cleanly");

  console.log("All bookmark-manager tests passed.");
}

runTests()
  .catch((error) => {
    console.error("bookmark-manager tests failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      resetTestDb();
    } catch (error) {
      console.warn("Test DB cleanup warning:", error.message);
    }
  });
