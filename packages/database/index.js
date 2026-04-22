const sqlite3 = require("sqlite3").verbose();

function createDatabase(dbPath = "./linklocker.db") {
  const db = new sqlite3.Database(dbPath);

  function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function onRun(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  }

  return {
    async init() {
      try {
        const sql = `
          CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY,
            url TEXT NOT NULL,
            title TEXT,
            tags TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `;

        await run(sql);
        return { success: true, data: { initialized: true } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async save(url, title, tags, notes) {
      try {
        const sql = `
          INSERT INTO bookmarks (url, title, tags, notes)
          VALUES (?, ?, ?, ?)
        `;
        const result = await run(sql, [url, title, tags, notes]);
        return {
          success: true,
          data: {
            id: result.lastID,
            url,
            title,
            tags,
            notes,
          },
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async getAll() {
      try {
        const rows = await all(
          "SELECT * FROM bookmarks ORDER BY created_at DESC",
        );
        return { success: true, data: rows };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async delete(id) {
      try {
        const result = await run("DELETE FROM bookmarks WHERE id = ?", [id]);
        return {
          success: true,
          data: {
            deletedId: id,
            changes: result.changes,
          },
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async update(id, url, title, tags, notes) {
      try {
        const sql = `
          UPDATE bookmarks
          SET url = ?, title = ?, tags = ?, notes = ?
          WHERE id = ?
        `;
        const result = await run(sql, [url, title, tags, notes, id]);
        return {
          success: true,
          data: {
            updatedId: id,
            changes: result.changes,
            url,
            title,
            tags,
            notes,
          },
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  };
}

module.exports = createDatabase;
