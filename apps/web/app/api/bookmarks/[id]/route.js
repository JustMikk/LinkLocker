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

export async function GET(request, { params }) {
  const manager = getBookmarkManager();
  const result = await manager.getAllBookmarks();

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  const bookmark = result.data.find(
    (item) => String(item.id) === String(params.id),
  );
  if (!bookmark) {
    return NextResponse.json(
      { success: false, error: "Bookmark not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: bookmark });
}

export async function PUT(request, { params }) {
  const manager = getBookmarkManager();
  const body = await request.json();
  const result = await manager.updateBookmark(params.id, body);

  if (!result.success) {
    const status = result.error === "Bookmark not found" ? 404 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

export async function DELETE(request, { params }) {
  const manager = getBookmarkManager();
  const result = await manager.deleteBookmark(params.id);

  if (!result.success) {
    const status = result.error === "Bookmark not found" ? 404 : 400;
    return NextResponse.json(result, { status });
  }

  if (result.success && result.data.changes === 0) {
    return NextResponse.json(
      { success: false, error: "Bookmark not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
