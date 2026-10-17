import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), "public", "images", "busStations");
    
    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return NextResponse.json([]);
    }
    
    const files = fs.readdirSync(dirPath);
    
    // Filter only image files
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];
    const logos = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    return NextResponse.json(logos);
  } catch (error) {
    console.error("Error reading bus logos:", error);
    return NextResponse.json({ error: "Failed to read logos" }, { status: 500 });
  }
}
