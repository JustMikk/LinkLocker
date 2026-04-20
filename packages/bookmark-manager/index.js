const path = require("path");
const createDatabase = require("@linklocker/database");

const REQUIRED_SERVICES = {
  database: "@linklocker/database",
};

const PROVIDED_SERVICES = [
  "addBookmark",
  "getAllBookmarks",
  "deleteBookmark",
  "searchByTag",
];

function createBookmarkManager(options = {}) {
  const dbPath =
    options.dbPath || path.resolve(__dirname, "../database/linklocker.db");
  const database = createDatabase(dbPath);
  let initialized = false;

  async function ensureInitialized() {
    if (initialized) {
      return { success: true, data: { initialized: true } };
    }

    const initResult = await database.init();
    if (!initResult.success) {
      return initResult;
    }

    initialized = true;
    return { success: true, data: { initialized: true } };
  }

  function _validateUrl(url) {
    const trimmed = (url || "").trim();
    if (!trimmed) {
      return { success: false, error: "URL is required" };
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return {
        success: false,
        error: "URL must start with http:// or https://",
      };
    }

    return { success: true, data: trimmed };
  }

  function _parseTags(tags) {
    if (!tags) {
      return [];
    }

    return String(tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  function _formatTagsForStorage(tagsArray) {
    return tagsArray.join(",");
  }

  async function addBookmark(url, title, tags, notes) {
    try {
      const initResult = await ensureInitialized();
      if (!initResult.success) {
        return initResult;
      }

      const validatedUrl = _validateUrl(url);
      if (!validatedUrl.success) {
        return validatedUrl;
      }

      const cleanUrl = validatedUrl.data;
      const cleanTitle = (title || "").trim() || cleanUrl;
      const cleanTags = _formatTagsForStorage(_parseTags(tags));
      const cleanNotes = (notes || "").trim();

      return await database.save(cleanUrl, cleanTitle, cleanTags, cleanNotes);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function getAllBookmarks() {
    try {
      const initResult = await ensureInitialized();
      if (!initResult.success) {
        return initResult;
      }

      const result = await database.getAll();
      if (!result.success) {
        return result;
      }

      const mapped = result.data.map((item) => ({
        ...item,
        tags: _formatTagsForStorage(_parseTags(item.tags)),
      }));

      return { success: true, data: mapped };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function deleteBookmark(id) {
    try {
      const initResult = await ensureInitialized();
      if (!initResult.success) {
        return initResult;
      }

      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        return { success: false, error: "Invalid bookmark ID" };
      }

      return await database.delete(numericId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function searchByTag(tag) {
    return { success: true, data: [] };
  }

  return {
    addBookmark,
    getAllBookmarks,
    deleteBookmark,
    searchByTag,
  };
}

createBookmarkManager.REQUIRED_SERVICES = REQUIRED_SERVICES;
createBookmarkManager.PROVIDED_SERVICES = PROVIDED_SERVICES;

module.exports = createBookmarkManager;
