# -*- coding: utf-8 -*-
"""
Assembler script to merge and generate 100+ comprehensive transit routes:
Outputs:
1. src/data/directions_routes.ts (TypeScript dataset for web app instant offline search)
2. supabase/seed_transit_routes_100.sql (SQL migration for Supabase DB)
"""

import json
import os
from build_100_transit_routes import routes_data as p1_routes
from routes_part2 import more_routes as p2_routes

all_routes = []
seen_pairs = set()

# Add Part 1
for r in p1_routes:
    key = (r["from"].strip(), r["to"].strip())
    if key not in seen_pairs:
        seen_pairs.add(key)
        all_routes.append(r)

# Add Part 2
for r in p2_routes:
    key = (r["from"].strip(), r["to"].strip())
    if key not in seen_pairs:
        seen_pairs.add(key)
        all_routes.append(r)
    else:
        print(f"Skipping duplicate pair: {key}")

# Ensure every option has steps
for r in all_routes:
    for opt in r["options"]:
        if "steps" not in opt or not opt["steps"]:
            all_s = []
            if opt.get("legs"):
                for leg in opt["legs"]:
                    all_s.extend(leg.get("steps", []))
            opt["steps"] = all_s

print(f"Total Unique Routes: {len(all_routes)}")
total_options = sum(len(r["options"]) for r in all_routes)
print(f"Total Transit Options: {total_options}")

# Output paths
ts_output_path = r"d:\Development\Project\Cairo Map\src\data\directions_routes.ts"
sql_output_path = r"d:\Development\Project\Cairo Map\supabase\seed_transit_routes_100.sql"

# 1. Generate TypeScript file
print("Writing TypeScript dataset...")
with open(ts_output_path, "w", encoding="utf-8") as f:
    f.write('// Auto-generated comprehensive Transit Routes dataset for "ازاي اروح"\n')
    f.write('// Contains detailed multi-modal routes for top Egyptian destinations.\n\n')
    f.write('export interface RouteLeg {\n')
    f.write('  title: string;\n')
    f.write('  vehicleType?: string;\n')
    f.write('  cost?: number;\n')
    f.write('  duration?: string;\n')
    f.write('  steps: string[];\n')
    f.write('}\n\n')
    f.write('export interface RouteOption {\n')
    f.write('  type: "microbus" | "bus" | "car" | "train" | "monorail" | "metro" | "plane" | "ship" | "multi";\n')
    f.write('  typeName: string;\n')
    f.write('  icon: string;\n')
    f.write('  cost: number;\n')
    f.write('  duration: string;\n')
    f.write('  steps: string[];\n')
    f.write('  legs?: RouteLeg[];\n')
    f.write('  tips?: string;\n')
    f.write('  map_link?: string;\n')
    f.write('}\n\n')
    f.write('export interface RouteData {\n')
    f.write('  from: string;\n')
    f.write('  to: string;\n')
    f.write('  from_aliases?: string;\n')
    f.write('  to_aliases?: string;\n')
    f.write('  options: RouteOption[];\n')
    f.write('}\n\n')
    f.write('export const comprehensiveRoutesDataset: RouteData[] = ')
    f.write(json.dumps(all_routes, ensure_ascii=False, indent=2))
    f.write(';\n')

# 2. Generate Supabase SQL migration
print("Writing Supabase SQL seed...")
with open(sql_output_path, "w", encoding="utf-8") as f:
    f.write('-- ==============================================================================\n')
    f.write('-- Cairo Map - Transit Routes (ازاي اروح) Database Seed (100+ Routes)\n')
    f.write('-- دليل مواصلات القاهرة والمحافظات والمدن الجديدة\n')
    f.write('-- ==============================================================================\n\n')
    f.write('ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS legs JSONB DEFAULT \'[]\'::jsonb;\n')
    f.write('ALTER TABLE public.transit_routes ADD COLUMN IF NOT EXISTS map_link TEXT;\n\n')

    for r in all_routes:
        from_loc = r["from"].replace("'", "''")
        to_loc = r["to"].replace("'", "''")
        from_aliases = (r.get("from_aliases") or "").replace("'", "''")
        to_aliases = (r.get("to_aliases") or "").replace("'", "''")

        for opt in r["options"]:
            t_type = opt["type"]
            t_name = opt["typeName"].replace("'", "''")
            icon = opt["icon"]
            cost = opt["cost"]
            duration = opt["duration"].replace("'", "''")
            tips = (opt.get("tips") or "").replace("'", "''")
            
            # Combine all steps for flat steps field
            all_steps = []
            if opt.get("legs"):
                for leg in opt["legs"]:
                    all_steps.extend(leg.get("steps", []))
            elif opt.get("steps"):
                all_steps = opt["steps"]
                
            steps_json = json.dumps(all_steps, ensure_ascii=False).replace("'", "''")
            legs_json = json.dumps(opt.get("legs", []), ensure_ascii=False).replace("'", "''")

            f.write(f"INSERT INTO public.transit_routes (from_location, to_location, type, type_name, icon, cost, duration, steps, legs, tips, from_aliases, to_aliases)\n")
            f.write(f"VALUES ('{from_loc}', '{to_loc}', '{t_type}', '{t_name}', '{icon}', {cost}, '{duration}', '{steps_json}'::jsonb, '{legs_json}'::jsonb, '{tips}', '{from_aliases}', '{to_aliases}')\n")
            f.write(f"ON CONFLICT DO NOTHING;\n\n")

print("Done! Files successfully generated.")
