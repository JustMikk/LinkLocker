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

export async function GET(request) {
  const manager = getBookmarkManager();
  const requestUrl = new URL(request.url);
  const tag = requestUrl.searchParams.get("tag");
  const result = tag
    ? await manager.searchByTag(tag)
    : await manager.getAllBookmarks();

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function POST(request) {
  const manager = getBookmarkManager();
  const body = await request.json();
  const result = await manager.addBookmark(
    body.url,
    body.title,
    body.tags,
    body.notes,
  );

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request) {
  const manager = getBookmarkManager();
  const body = await request.json();
  const result = await manager.deleteBookmark(body.id);

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
