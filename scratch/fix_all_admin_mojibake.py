# -*- coding: utf-8 -*-
import os
import sys

# Force output encoding to UTF-8
if sys.stdout is not None:
    sys.stdout.reconfigure(encoding='utf-8')

def fix_mojibake_robust(text):
    # Map CP1252 characters back to bytes
    cp1252_to_byte = {}
    for b in range(256):
        try:
            c = bytes([b]).decode('cp1252')
            cp1252_to_byte[c] = b
        except Exception:
            pass

    byte_list = bytearray()
    i = 0
    n = len(text)
    while i < n:
        c = text[i]
        if c in cp1252_to_byte:
            byte_list.append(cp1252_to_byte[c])
            i += 1
        else:
            o = ord(c)
            if o < 256:
                byte_list.append(o)
                i += 1
            else:
                byte_list.extend(c.encode('utf-8'))
                i += 1

    try:
        return byte_list.decode('utf-8')
    except Exception:
        return byte_list.decode('utf-8', errors='replace')

# Directory to scan
admin_dir = r"D:\Development\Project\Cairo Map\src\app\admin"

# Recursively find all files containing mojibake indicator "Ø"
fixed_files = []
for root, dirs, files in os.walk(admin_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Check if file has mojibake indicator
                if "Ø" in content:
                    print(f"Fixing mojibake in: {file_path}")
                    fixed_content = fix_mojibake_robust(content)
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(fixed_content)
                    fixed_files.append(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

print(f"\nFinished! Fixed {len(fixed_files)} files:")
for f in fixed_files:
    print(f" - {f}")
