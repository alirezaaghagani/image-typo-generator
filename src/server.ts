import { serve } from "bun";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

const IMAGE_DIR = join(process.cwd(), "assets", "images");

export function startImageServer() {
  return serve({
    port: 3000,
    fetch(req) {
      const url = new URL(req.url);
      const imagePath = decodeURIComponent(url.pathname.replace(/^\//, ""));
      const fullPath = join(IMAGE_DIR, imagePath);

      if (existsSync(fullPath)) {
        const ext = fullPath.split(".").pop()?.toLowerCase();
        if (ext === "jpg" || ext === "jpeg" || ext === "png") {
          const mime =
            ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
          return new Response(readFileSync(fullPath), {
            headers: { "Content-Type": mime },
          });
        }
        // If not jpeg or png, return 403 Forbidden
        return new Response("Forbidden", { status: 403 });
      }
      return new Response("Not found", { status: 404 });
    },
  });
}
