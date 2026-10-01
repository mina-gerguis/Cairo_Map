import os
import re

def update_code_references():
    public_dir = os.path.abspath("public")
    src_dir = os.path.abspath("src")
    
    # Collect all webp files that were converted from png/jpg
    converted_bases = set()
    for root, _, files in os.walk(public_dir):
        for f in files:
            if f.endswith(".webp"):
                base_name = os.path.splitext(f)[0]
                converted_bases.add(base_name)

    print(f"Found {len(converted_bases)} converted base names.")

    updated_files = 0
    total_replacements = 0

    for root, _, files in os.walk(src_dir):
        for f in files:
            if f.endswith((".ts", ".tsx", ".css")):
                file_path = os.path.join(root, f)
                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()

                new_content = content
                file_replacements = 0

                for base in converted_bases:
                    # Replace base.png / base.jpg with base.webp (ignore apple-touch-icon and PWA icons)
                    if base in ["icon-192x192", "icon-512x512", "apple-touch-icon"]:
                        continue

                    pattern = re.compile(re.escape(base) + r'\.(png|jpg|jpeg)', re.IGNORECASE)
                    
                    matches = len(pattern.findall(new_content))
                    if matches > 0:
                        new_content = pattern.sub(f"{base}.webp", new_content)
                        file_replacements += matches

                if file_replacements > 0:
                    with open(file_path, "w", encoding="utf-8") as file:
                        file.write(new_content)
                    updated_files += 1
                    total_replacements += file_replacements
                    print(f"Updated {f}: {file_replacements} replacements")

    print(f"\nCompleted: {total_replacements} references updated across {updated_files} files.")

if __name__ == "__main__":
    update_code_references()
