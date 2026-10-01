import os
import sys
from PIL import Image

def run():
    print("Starting conversion...", flush=True)
    target_dir = os.path.abspath(r"public\images")
    converted_count = 0
    total_saved = 0

    for root, _, files in os.walk(target_dir):
        for file in files:
            name, ext = os.path.splitext(file)
            ext = ext.lower()
            if ext in [".png", ".jpg", ".jpeg"]:
                src_path = os.path.join(root, file)
                dst_path = os.path.join(root, f"{name}.webp")
                
                try:
                    src_size = os.path.getsize(src_path)
                    with Image.open(src_path) as im:
                        if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
                            im = im.convert("RGBA")
                        else:
                            im = im.convert("RGB")
                        im.save(dst_path, "WEBP", quality=85)
                    
                    dst_size = os.path.getsize(dst_path)
                    saved = src_size - dst_size
                    total_saved += saved
                    converted_count += 1
                    print(f"[{converted_count}] {file}: {src_size // 1024}KB -> {dst_size // 1024}KB", flush=True)
                except Exception as e:
                    print(f"Failed {file}: {e}", flush=True)

    print(f"\nDone! Converted {converted_count} images. Total saved: {total_saved / (1024*1024):.2f} MB", flush=True)

if __name__ == "__main__":
    run()
