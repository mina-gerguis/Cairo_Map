from build_100_transit_routes import routes_data

with open("current_routes.txt", "w", encoding="utf-8") as f:
    for i, r in enumerate(routes_data):
        f.write(f"{i+1}. {r['from']} -> {r['to']}\n")
print(f"Total: {len(routes_data)}")
