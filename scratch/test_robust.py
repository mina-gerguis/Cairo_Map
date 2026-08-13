# -*- coding: utf-8 -*-
import sys
import io

# Force stdout to use utf-8
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

    # Now let's map each character of the text to its byte value.
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
                # If we encounter a character that is outside 0-255 range and not in cp1252_to_byte,
                # it might be a valid UTF-8 character or a double-encoded UTF-8 character.
                # Let's decode what we have so far, add this character, and continue.
                # Actually, wait. What if we just encode it to utf-8 bytes?
                # If we do c.encode('utf-8'), it will give the utf-8 representation of that character.
                # But wait, if it was a valid character in the original file (like a special arrow or symbol),
                # and we decode it as utf-8, it should remain the same.
                # Let's try encoding to utf-8.
                byte_list.extend(c.encode('utf-8'))
                i += 1

    # Now let's try to decode the byte_list as utf-8.
    try:
        return byte_list.decode('utf-8')
    except Exception as e:
        # If it fails to decode the entire byte_list, let's try a fallback or decoding with ignore/replace.
        return byte_list.decode('utf-8', errors='replace')

sample = "Ø§Ù„Ø§Ø´ØªØ±Ø§ÙƒØ§Øª Ø§Ù„Ù…Ù…ÙŠØ²Ø©"
print("Sample fix:", fix_mojibake_robust(sample))

with open(r"D:\Development\Project\Cairo Map\src\app\admin\layout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()
print("\nLines 50-70 fixed:")
for i in range(50, 70):
    if i < len(lines):
        print(f"{i+1}: {fix_mojibake_robust(lines[i])}")
