import os

file_path = 'src/app/admin/places/page.tsx'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# CP1252 specific unicode characters that map to bytes 128-159
cp1252_set = {
    0x20AC, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0x017D,
    0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x017E, 0x0178
}

def is_mojibake_char(c):
    o = ord(c)
    if 128 <= o <= 255:
        return True
    if o in cp1252_set:
        return True
    return False

def fix_mixed_mojibake(text):
    result = []
    i = 0
    n = len(text)
    while i < n:
        if is_mojibake_char(text[i]):
            # Collect contiguous mojibake characters
            start = i
            while i < n and is_mojibake_char(text[i]):
                i += 1
            segment = text[start:i]
            
            # Convert characters to bytes using CP1252 / Latin-1
            byte_list = bytearray()
            for c in segment:
                try:
                    b = c.encode('cp1252')
                    byte_list.extend(b)
                except Exception:
                    try:
                        b = c.encode('latin-1')
                        byte_list.extend(b)
                    except Exception:
                        byte_list.append(ord(c) & 0xFF)
            
            # Try to decode the bytes as UTF-8
            try:
                decoded = byte_list.decode('utf-8')
                result.append(decoded)
            except Exception:
                # If decoding the whole segment fails, try to decode sub-segments or fallback
                result.append(segment)
        else:
            result.append(text[i])
            i += 1
            
    return "".join(result)

fixed_content = fix_mixed_mojibake(content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("Mixed mojibake fix completed successfully!")
