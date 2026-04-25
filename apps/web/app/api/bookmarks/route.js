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

export async function GET(request) {
  try {
    const manager = getBookmarkManager();
    const requestUrl = new URL(request.url);
    const tag = requestUrl.searchParams.get("tag");
    const result = tag
      ? await manager.searchByTag(tag)
      : await manager.getAllBookmarks();

    if (!result.success) {
      const status = result.error === "Bookmark not found" ? 404 : 500;
      const message = status === 500 ? "Internal server error" : result.error;
      return errorResponse(message, status);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request) {
  try {
    const manager = getBookmarkManager();
    const body = await request.json();
    const result = await manager.addBookmark(
      body.url,
      body.title,
      body.tags,
      body.notes,
    );

    if (!result.success) {
      return errorResponse(result.error || "Invalid bookmark", 400);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request) {
  try {
    const manager = getBookmarkManager();
    const body = await request.json();
    const result = await manager.deleteBookmark(body.id);

    if (!result.success) {
      const status = result.error === "Bookmark not found" ? 404 : 400;
      return errorResponse(result.error || "Delete failed", status);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}
