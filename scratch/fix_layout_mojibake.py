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

# Target file
target_path = r"D:\Development\Project\Cairo Map\src\app\admin\layout.tsx"
if not os.path.exists(target_path):
    print("Error: file does not exist")
    sys.exit(1)

with open(target_path, "r", encoding="utf-8") as f:
    content = f.read()

fixed_content = fix_mojibake_robust(content)

# Save the fixed content back to the file
with open(target_path, "w", encoding="utf-8") as f:
    f.write(fixed_content)

print("Successfully fixed mojibake in", target_path)
