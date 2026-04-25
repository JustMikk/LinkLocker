const path = require("path");
const createDatabase = require("@linklocker/database");

const REQUIRED_SERVICES = {
  database: "@linklocker/database",
};

const PROVIDED_SERVICES = [
  "addBookmark",
  "getAllBookmarks",
  "deleteBookmark",
  "updateBookmark",
  "searchByTag",
  "close",
];

function createBookmarkManager(options = {}) {
  const dbPath =
    options.dbPath || path.resolve(__dirname, "../database/linklocker.db");
  const database = createDatabase(dbPath);
  let initialized = false;

  function _formatDatabaseError(error) {
    if (!error || !error.message) {
      return "Database error. Check if file exists.";
    }

    const message = String(error.message);
    if (
      message.includes("SQLITE") ||
      message.includes("database") ||
      message.includes("open")
    ) {
      return "Database error. Check if file exists.";
    }

    return message;
  }

  async function ensureInitialized() {
    if (initialized) {
      return { success: true, data: { initialized: true } };
    }

    const initResult = await database.init();
    if (!initResult.success) {
      return {
        success: false,
        error: _formatDatabaseError(initResult.error),
      };
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

  function _normalizeBookmarkRecord(record) {
    return {
      ...record,
      tags: _formatTagsForStorage(_parseTags(record.tags)),
    };
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
      return { success: false, error: _formatDatabaseError(error) };
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
        return {
          success: false,
          error: _formatDatabaseError(result.error),
        };
      }

      const mapped = result.data.map(_normalizeBookmarkRecord);

      return { success: true, data: mapped };
    } catch (error) {
      return { success: false, error: _formatDatabaseError(error) };
    }
  }

  async function _findBookmarkById(numericId) {
    const allResult = await getAllBookmarks();
    if (!allResult.success) {
      return allResult;
    }

    const existing = allResult.data.find((bookmark) => bookmark.id === numericId);
    if (!existing) {
      return { success: false, error: "Bookmark not found" };
    }

    return { success: true, data: existing };
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

      const existingResult = await _findBookmarkById(numericId);
      if (!existingResult.success) {
        return existingResult;
      }

      const result = await database.delete(numericId);
      if (!result.success) {
        return {
          success: false,
          error: _formatDatabaseError(result.error),
        };
      }

      return result;
    } catch (error) {
      return { success: false, error: _formatDatabaseError(error) };
    }
  }

  async function updateBookmark(id, updates) {
    try {
      const initResult = await ensureInitialized();
      if (!initResult.success) {
        return initResult;
      }

      const numericId = Number(id);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        return { success: false, error: "Invalid bookmark ID" };
      }

      const existingResult = await _findBookmarkById(numericId);
      if (!existingResult.success) {
        return existingResult;
      }
      const existing = existingResult.data;

      const nextUrl =
        updates && updates.url !== undefined ? updates.url : existing.url;
      const validatedUrl = _validateUrl(nextUrl);
      if (!validatedUrl.success) {
        return validatedUrl;
      }

      const cleanUrl = validatedUrl.data;
      const cleanTitle =
        updates && updates.title !== undefined
          ? (updates.title || "").trim() || cleanUrl
          : existing.title || cleanUrl;
      const cleanTags = _formatTagsForStorage(
        _parseTags(
          updates && updates.tags !== undefined ? updates.tags : existing.tags,
        ),
      );
      const cleanNotes =
        updates && updates.notes !== undefined
          ? (updates.notes || "").trim()
          : existing.notes || "";

      const result = await database.update(
        numericId,
        cleanUrl,
        cleanTitle,
        cleanTags,
        cleanNotes,
      );

      if (!result.success) {
        return {
          success: false,
          error: _formatDatabaseError(result.error),
        };
      }

      if (!result.data.changes) {
        return { success: false, error: "Bookmark not found" };
      }

      return {
        success: true,
        data: {
          id: numericId,
          url: cleanUrl,
          title: cleanTitle,
          tags: cleanTags,
          notes: cleanNotes,
        },
      };
    } catch (error) {
      return { success: false, error: _formatDatabaseError(error) };
    }
  }

  async function searchByTag(tag) {
    try {
      const initResult = await ensureInitialized();
      if (!initResult.success) {
        return initResult;
      }

      const queryTag = (tag || "").trim().toLowerCase();
      if (!queryTag) {
        return { success: true, data: [] };
      }

      const allResult = await getAllBookmarks();
      if (!allResult.success) {
        return allResult;
      }

      const filtered = allResult.data.filter((bookmark) => {
        const tagList = _parseTags(bookmark.tags).map((item) =>
          item.toLowerCase(),
        );
        return tagList.includes(queryTag);
      });

      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, error: _formatDatabaseError(error) };
    }
  }

  async function close() {
    try {
      if (typeof database.close !== "function") {
        return { success: true, data: { closed: false } };
      }

      const result = await database.close();
      if (!result.success) {
        return {
          success: false,
          error: _formatDatabaseError(result.error),
        };
      }

      initialized = false;
      return { success: true, data: { closed: true } };
    } catch (error) {
      return { success: false, error: _formatDatabaseError(error) };
    }
  }

  return {
    addBookmark,
    getAllBookmarks,
    deleteBookmark,
    updateBookmark,
    searchByTag,
    close,
  };
}

createBookmarkManager.REQUIRED_SERVICES = REQUIRED_SERVICES;
createBookmarkManager.PROVIDED_SERVICES = PROVIDED_SERVICES;

module.exports = createBookmarkManager;
