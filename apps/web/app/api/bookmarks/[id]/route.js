import { NextResponse } from "next/server";
import path from "path";

function getBookmarkManagerFactory() {
  const runtimeRequire = eval("require");
  const managerPath = path.resolve(
    process.cwd(),
    "../../packages/bookmark-manager/index.js",
  );
  return runtimeRequire(managerPath);
}

function getBookmarkManager() {
  const createBookmarkManager = getBookmarkManagerFactory();
  const dbPath = path.resolve(
    process.cwd(),
    "../../packages/database/linklocker.db",
  );
  return createBookmarkManager({ dbPath });
}

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request, { params }) {
  try {
    const manager = getBookmarkManager();
    const result = await manager.getAllBookmarks();

    if (!result.success) {
      return errorResponse("Internal server error", 500);
    }

    const bookmark = result.data.find(
      (item) => String(item.id) === String(params.id),
    );
    if (!bookmark) {
      return errorResponse("Bookmark not found", 404);
    }

    return NextResponse.json(
      { success: true, data: bookmark },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const manager = getBookmarkManager();
    const body = await request.json();
    const result = await manager.updateBookmark(params.id, body);

    if (!result.success) {
      const status = result.error === "Bookmark not found" ? 404 : 400;
      return errorResponse(result.error || "Update failed", status);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const manager = getBookmarkManager();
    const result = await manager.deleteBookmark(params.id);

    if (!result.success) {
      const status = result.error === "Bookmark not found" ? 404 : 400;
      return errorResponse(result.error || "Delete failed", status);
    }

    if (result.data.changes === 0) {
      return errorResponse("Bookmark not found", 404);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}
