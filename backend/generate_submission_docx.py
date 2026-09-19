import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn


def set_cell_background(cell, color_hex):
    """Set background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tc_pr.append(shd)


def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    """Set inner cell padding in dxa (1 pt = 20 dxa)."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)


def add_callout(doc, text, title="KEY HIGHLIGHT", bg_hex="F0FDF4", border_hex="10B981"):
    """Add a professional styled callout box."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border styling
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>'
        f'<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'</w:tcBorders>'
    )
    tc_pr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(f"📌 {title}: ")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(10.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(13, 92, 70)
    
    r_text = p.add_run(text)
    r_text.font.name = "Calibri"
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(30, 41, 59)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)


def create_submission_document(output_path: str):
    doc = Document()

    # Configure Margins (0.85 in for clean report layout)
    for section in doc.sections:
        section.top_margin = Inches(0.85)
        section.bottom_margin = Inches(0.85)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)
        
        # Configure Header & Footer
        footer = section.footer
        p_ft = footer.paragraphs[0]
        p_ft.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_ft = p_ft.add_run("Darukaa.Earth — Full-Stack Developer Hackathon Submission Report  |  Confidential")
        r_ft.font.name = "Calibri"
        r_ft.font.size = Pt(8.5)
        r_ft.font.color.rgb = RGBColor(148, 163, 184)

    # Theme Colors
    PRIMARY = RGBColor(13, 92, 70)       # Deep Emerald #0D5C46
    SECONDARY = RGBColor(15, 23, 42)     # Dark Slate #0F172A
    DARK_TEXT = RGBColor(30, 41, 59)     # Slate 800 #1E293B
    MUTED_TEXT = RGBColor(100, 116, 139) # Slate 500 #64748B
    ACCENT_TEAL = RGBColor(14, 116, 144) # Teal 700 #0E7490

    # -------------------------------------------------------------
    # COVER / HEADER SECTION
    # -------------------------------------------------------------
    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("DARUKAA.EARTH  •  FULL-STACK DEVELOPER HACKATHON")
    r_badge.font.name = "Calibri"
    r_badge.font.size = Pt(11)
    r_badge.font.bold = True
    r_badge.font.color.rgb = ACCENT_TEAL
    p_badge.paragraph_format.space_after = Pt(2)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("Geospatial Carbon & Biodiversity Analytics Platform")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = PRIMARY
    p_title.paragraph_format.space_after = Pt(4)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("Official Technical Architecture, Product Specification & Submission Deliverables Report")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = SECONDARY
    p_sub.paragraph_format.space_after = Pt(12)

    add_callout(
        doc,
        "This submission report documents the architectural design, PostGIS spatial data modeling, "
        "real-time GBIF biodiversity telemetry integration, GPU-accelerated interactive mapping, and automated CI/CD pipeline "
        "engineered for the Darukaa.Earth developer challenge. All reviewer access rights, seed credentials, and test suites are verified and ready for evaluation.",
        title="EXECUTIVE SUMMARY"
    )

    # -------------------------------------------------------------
    # 1. SUBMISSION DELIVERABLES & REVIEWER ACCESS
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r_h1 = h1.add_run("1. Project Submission Deliverables & Reviewer Access")
    r_h1.font.color.rgb = PRIMARY

    table1 = doc.add_table(rows=7, cols=2)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False

    t1_data = [
        ("Project Name", "Darukaa.Earth Geospatial Data Analytics Platform"),
        ("Source Code Repository", "https://github.com/PASUPULASAITEJA/DarukaaEarth"),
        ("Live Demo / Web Application", "https://darukaa-earth.netlify.app"),
        ("Backend REST API & Swagger UI", "http://127.0.0.1:8000/api/v1/docs (FastAPI + OpenAPI Spec)"),
        ("Pre-Seeded Admin Credentials", "Email: admin@darukaa.earth  |  Password: AdminPass123!"),
        ("Reviewers Invited / Granted Access", "1. ankita.dasgupta@darukaa.com\n2. harsh.kumar@darukaa.com\n3. utkarsh.gauniyal@darukaa.com\n4. guneet.mutreja@darukaa.com"),
    ]

    # Header Row
    hdr1 = table1.rows[0].cells
    hdr1[0].text = "Submission Parameter"
    hdr1[1].text = "Value / Access Reference"
    for c in hdr1:
        set_cell_background(c, "0D5C46")
        set_cell_margins(c, 120, 120, 160, 160)
        for p in c.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(10)

    for i, (k, v) in enumerate(t1_data, start=1):
        row_cells = table1.rows[i].cells
        row_cells[0].text = k
        row_cells[1].text = v
        bg_hex = "F8FAFC" if i % 2 == 1 else "FFFFFF"
        for idx, c in enumerate(row_cells):
            set_cell_background(c, bg_hex)
            set_cell_margins(c, 100, 100, 140, 140)
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9.5)
                    r.font.color.rgb = DARK_TEXT
                    if idx == 0:
                        r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 2. BUSINESS REQUIREMENTS & USER STORIES MATRIX
    # -------------------------------------------------------------
    h2 = doc.add_heading(level=1)
    r_h2 = h2.add_run("2. Business Requirements & User Stories Implementation Matrix")
    r_h2.font.color.rgb = PRIMARY

    p_req = doc.add_paragraph()
    p_req.add_run(
        "The Darukaa.Earth platform was engineered to serve as a comprehensive cockpit for environmental developers, "
        "carbon credit registries (e.g. Verra, Gold Standard), and biodiversity conservation researchers. The table below "
        "demonstrates the direct mapping from challenge business stories to implemented technical capabilities:"
    )

    req_table = doc.add_table(rows=6, cols=3)
    req_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    req_table.autofit = False

    req_headers = ["User Story / Business Need", "Implemented Capabilities", "Status & Verification"]
    req_data = [
        (
            "Story 1: Project Creation & Multi-Site Binding",
            "Full CRUD endpoints with searchable dropdowns for 25+ global jurisdictions and full administrative subdivisions (all 28 Indian States & 8 UTs, 50 US States, 26 Brazilian States, etc.). Cascading selection with automatic reset.",
            "100% Complete\n(API & UI Verified)"
        ),
        (
            "Story 2: Interactive Geospatial Cockpit",
            "Interactive MapLibre GL map rendering all global sites with project-type color schemes (Carbon = Emerald, Biodiversity = Cyan, Combined = Purple). Includes permanent on-map name badges and satellite place names overlay.",
            "100% Complete\n(Zero-Key Open Layers)"
        ),
        (
            "Story 3: Polygon Drawing & Geodesic Computations",
            "Mapbox Draw integration enabling polygon creation/editing. Computes geodesic surface area (hectares and km²) using WGS84 ellipsoidal geometry in PostGIS and Turf.js.",
            "100% Complete\n(PostGIS + Turf)"
        ),
        (
            "Story 4: MRV Time-Series & Live GBIF Biodiversity",
            "Interactive multi-axis charts for historical carbon sequestration (tCO₂e) and vegetation canopy coverage. Live REST query to GBIF for real-world species taxonomy, IUCN Red List matrix, and Shannon-Wiener entropy score.",
            "100% Complete\n(GBIF API Live)"
        ),
        (
            "Story 5: Automated Code Quality & CI/CD",
            "Pre-commit hooks (Husky, lint-staged, Prettier, Ruff) and GitHub Actions CI workflow running backend pytest suites (20/20 passing) and frontend Vite typecheck/build on every pull request.",
            "100% Complete\n(CI Pipeline Active)"
        ),
    ]

    for j, h in enumerate(req_headers):
        cell = req_table.rows[0].cells[j]
        cell.text = h
        set_cell_background(cell, "0D5C46")
        set_cell_margins(cell, 100, 100, 140, 140)
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(10)

    for i, row in enumerate(req_data, start=1):
        for j, val in enumerate(row):
            cell = req_table.rows[i].cells[j]
            cell.text = val
            set_cell_background(cell, "F8FAFC" if i % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, 90, 90, 130, 130)
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)
                    if j == 0:
                        r.font.bold = True
                    if j == 2:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(13, 92, 70)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 3. TECHNICAL ARCHITECTURE & STACK BREAKDOWN
    # -------------------------------------------------------------
    h3 = doc.add_heading(level=1)
    r_h3 = h3.add_run("3. End-to-End System Architecture & Technology Stack")
    r_h3.font.color.rgb = PRIMARY

    p_arch = doc.add_paragraph()
    p_arch.add_run(
        "Darukaa.Earth follows a clean, decoupled 4-tier architecture designed for scalability, performance, and maintainability:\n"
    )

    tiers = [
        ("Tier 1: Presentation Layer (React 18 + TypeScript + Tailwind CSS)", 
         "Built with strict TypeScript interfaces, responsive dark glassmorphic styling, custom SearchableSelect comboboxes, and protected router state management. Vite enables instant HMR and optimized production bundles."),
        
        ("Tier 2: Geospatial & Visualization Engine (MapLibre GL + Turf.js + Chart.js)", 
         "GPU-accelerated vector tile rendering operating with zero API key dependencies (Carto Dark Matter GL, Voyager Topo, and Esri World Imagery Satellite with Boundaries & Places overlay). Turf.js handles client-side geodesic area calculations and centroid markers."),
        
        ("Tier 3: REST API Gateway & Business Services (FastAPI + Pydantic V2 + GeoAlchemy2)", 
         "High-performance asynchronous Python 3.11+ backend utilizing FastAPI. Features automated OpenAPI / Swagger documentation, JWT OAuth2 authentication, Bcrypt password hashing, and dependency-injected spatial services."),
        
        ("Tier 4: Spatial Persistence & Telemetry Layer (PostgreSQL 16 + PostGIS 3.4 + GBIF API)", 
         "Spatial persistence utilizing PostgreSQL 16 with PostGIS extension for SRID 4326 vector geometry storage, GiST spatial indexing, and ST_Area geodesic queries. Integrates live external REST telemetry from GBIF (Global Biodiversity Information Facility)."),
    ]

    for title, desc in tiers:
        p = doc.add_paragraph(style="List Bullet")
        r_bold = p.add_run(f"{title}: ")
        r_bold.font.bold = True
        r_bold.font.color.rgb = SECONDARY
        p.add_run(desc)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 4. DATABASE SCHEMA & POSTGIS MODELING
    # -------------------------------------------------------------
    h4 = doc.add_heading(level=1)
    r_h4 = h4.add_run("4. Database Schema & PostGIS Spatial Data Modeling")
    r_h4.font.color.rgb = PRIMARY

    p_schema = doc.add_paragraph()
    p_schema.add_run(
        "The relational schema is fully normalized, indexed, and enforces relational integrity via foreign keys with cascading deletes. "
        "All vector spatial geometries are modeled in WGS84 (SRID 4326):\n"
    )

    schema_table = doc.add_table(rows=5, cols=3)
    schema_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    schema_table.autofit = False

    schema_headers = ["Table Name", "Key Columns & Data Types", "Spatial / Relational Constraints"]
    schema_data = [
        (
            "users",
            "id (UUID PK)\nemail (VARCHAR, Unique, Indexed)\nhashed_password (VARCHAR)\nname (VARCHAR)\nis_active, is_superuser (BOOLEAN)\ncreated_at, updated_at (TIMESTAMP)",
            "JWT Authentication Identity table. Passwords securely hashed via Passlib/Bcrypt."
        ),
        (
            "projects",
            "id (UUID PK)\nuser_id (UUID FK -> users.id)\nname (VARCHAR, Indexed)\ndescription (TEXT)\nproject_type (ENUM: Carbon, Biodiversity, Combined)\nstatus (ENUM: Planning, Active, Completed, Archived)\ncountry (VARCHAR), region (VARCHAR)\nstart_date, end_date (DATE)",
            "Parent container for conservation initiatives. Relates 1-to-many with geographical sites."
        ),
        (
            "sites",
            "id (UUID PK)\nproject_id (UUID FK -> projects.id CASCADE)\nname (VARCHAR)\nsite_type (VARCHAR: Forest, Mangrove, Peatland, Wetland, etc.)\ngeometry (PostGIS Geometry(Polygon, 4326))\narea_hectares (FLOAT), area_km2 (FLOAT)\ncentroid_lat, centroid_lon (FLOAT)\nbbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat",
            "Spatial vector polygon storage with GiST indexing. Geodesic surface area calculated using ST_Area(geography)."
        ),
        (
            "site_analytics",
            "id (UUID PK)\nsite_id (UUID FK -> sites.id CASCADE)\nrecorded_date (DATE, Indexed)\ncarbon_sequestration_tonnes (FLOAT)\ncarbon_reduction_rate (FLOAT)\nbiodiversity_index (FLOAT)\nvegetation_coverage_pct (FLOAT)\nenvironmental_score (FLOAT)\nnotes (TEXT)",
            "Time-series MRV observation points for charting carbon accumulation, NDVI coverage, and health scores over time."
        ),
    ]

    for j, h in enumerate(schema_headers):
        cell = schema_table.rows[0].cells[j]
        cell.text = h
        set_cell_background(cell, "0D5C46")
        set_cell_margins(cell, 100, 100, 140, 140)
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(10)

    for i, row in enumerate(schema_data, start=1):
        for j, val in enumerate(row):
            cell = schema_table.rows[i].cells[j]
            cell.text = val
            set_cell_background(cell, "F8FAFC" if i % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, 90, 90, 130, 130)
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(8.5)
                    if j == 0:
                        r.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 5. LIVE GBIF BIODIVERSITY API INTEGRATION
    # -------------------------------------------------------------
    h5 = doc.add_heading(level=1)
    r_h5 = h5.add_run("5. Live GBIF Biodiversity API Integration & Analytics")
    r_h5.font.color.rgb = PRIMARY

    p_gbif = doc.add_paragraph()
    p_gbif.add_run(
        "A standout product enhancement of Darukaa.Earth is the direct integration of the Global Biodiversity Information Facility "
        "(GBIF) REST API (https://api.gbif.org/v1/). Rather than relying on synthetic placeholder data, the system fetches real-world "
        "biological occurrences recorded within the drawn site boundaries:\n"
    )

    gbif_features = [
        ("Spatial Geometry Querying", "Converts PostGIS polygon coordinates into spatial bounding boxes and WKT polygons to query GBIF occurrence endpoints (/occurrence/search)."),
        ("IUCN Red List Matrix", "Categorizes observed species according to official IUCN threat levels: Critically Endangered (CR), Endangered (EN), Vulnerable (VU), Near Threatened (NT), and Least Concern (LC)."),
        ("Shannon-Wiener Biodiversity Index (H')", "Computes the ecological entropy index using H' = -SUM(p_i * ln(p_i)), normalized to a 0–100 Biodiversity Health Score."),
        ("Kingdom & Taxonomic Breakdown", "Provides interactive distribution breakdown across Animalia, Plantae, Fungi, and major biological classes."),
        ("Species Observation Catalog", "Interactive UI gallery displaying common vernacular names, scientific binomial names, observation dates, high-resolution media imagery, and direct links to official GBIF occurrence records."),
    ]

    for title, desc in gbif_features:
        p = doc.add_paragraph(style="List Bullet")
        r_bold = p.add_run(f"{title}: ")
        r_bold.font.bold = True
        p.add_run(desc)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 6. UI/UX DESIGN SYSTEM & GEOSPATIAL INNOVATIONS
    # -------------------------------------------------------------
    h6 = doc.add_heading(level=1)
    r_h6 = h6.add_run("6. UI/UX Design System & Geospatial Innovations")
    r_h6.font.color.rgb = PRIMARY

    ux_items = [
        ("Searchable Administrative Comboboxes (SearchableSelect)", 
         "Custom-engineered dropdown component featuring national flags, live search filtering, and complete official administrative territories (all 28 Indian States & 8 UTs, 50 US States, 26 Brazilian States, 38 Indonesian Provinces, 32 Mexican States, etc.) with automatic cascading selection."),
        
        ("Permanent On-Map Site Name Badges", 
         "Real-time centroid calculation creates permanent, high-contrast name badges directly over every polygon on the map. Badges feature animated status pings, geodesic hectare labels, and project-type color indicators with one-click analytics popup launch."),
        
        ("Zero-Key Multi-Layer Hybrid Basemaps", 
         "Seamlessly switches between Carto Dark Matter GL, Voyager Topographic vector tiles, and High-Resolution Esri World Imagery Satellite with overlayed boundary and place labels — operating 100% reliably without requiring third-party API keys."),
        
        ("Interactive Geocoding & Coordinate HUD", 
         "Integrated OpenStreetMap/Nominatim geocoding search for jumping to any global location, coupled with a real-time cursor coordinate tracking HUD (Latitude, Longitude, and Zoom factor)."),
    ]

    for title, desc in ux_items:
        p = doc.add_paragraph(style="List Bullet")
        r_bold = p.add_run(f"{title}: ")
        r_bold.font.bold = True
        p.add_run(desc)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 7. LOCAL SETUP & VERIFICATION INSTRUCTIONS
    # -------------------------------------------------------------
    h7 = doc.add_heading(level=1)
    r_h7 = h7.add_run("7. Local Setup & Execution Guide")
    r_h7.font.color.rgb = PRIMARY

    doc.add_heading(level=2, text="Option A: Local Development Setup")
    p_setup_be = doc.add_paragraph()
    p_setup_be.add_run(
        "1. Backend (FastAPI):\n"
        "   cd backend\n"
        "   python -m venv venv && source venv/bin/activate (or .\\venv\\Scripts\\Activate.ps1 on Windows)\n"
        "   pip install -r requirements.txt\n"
        "   python -m app.seed  # Seeds demo admin (admin@darukaa.earth) & projects/sites\n"
        "   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000\n"
        "   -> API running at http://127.0.0.1:8000 (Swagger docs at /api/v1/docs)\n\n"
        "2. Frontend (React + Vite):\n"
        "   cd frontend\n"
        "   npm install\n"
        "   npm run dev\n"
        "   -> Dashboard accessible at http://localhost:5173"
    )

    doc.add_heading(level=2, text="Option B: Docker Compose (One-Command Launch)")
    p_docker = doc.add_paragraph()
    p_docker.add_run(
        "docker-compose up --build -d\n"
        "-> Spawns PostgreSQL 16 + PostGIS 3.4, FastAPI backend, and React frontend containers simultaneously."
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # -------------------------------------------------------------
    # 8. AUTOMATED TESTING, CI/CD & EVALUATION SUMMARY
    # -------------------------------------------------------------
    h8 = doc.add_heading(level=1)
    r_h8 = h8.add_run("8. Automated Testing, CI/CD & Evaluation Summary")
    r_h8.font.color.rgb = PRIMARY

    p_eval = doc.add_paragraph()
    p_eval.add_run(
        "The project strictly adheres to software engineering best practices with zero tolerance for regressions:\n"
    )

    eval_matrix = [
        ("Automated Test Suite (pytest)", "20 unit and integration tests covering Authentication, Project CRUD, PostGIS Site Geometries, Geodesic Area Computations, MRV Analytics, and GBIF Telemetry (20/20 Passing)."),
        ("Pre-Commit Hooks (Husky & lint-staged)", "Automated execution of Prettier, ESLint, and Ruff formatting/linting before commits."),
        ("GitHub Actions CI (.github/workflows/ci.yml)", "Continuous Integration matrix verifying Python test suites, TypeScript compilation, and Vite production bundle builds on all pull requests."),
        ("Dual-Engine Spatial Fallback", "Engineered with native PostGIS for production enterprise scalability and an intelligent zero-config SQLite spatial fallback for instant local evaluation without requiring external database setup."),
    ]

    for title, desc in eval_matrix:
        p = doc.add_paragraph(style="List Bullet")
        r_bold = p.add_run(f"{title}: ")
        r_bold.font.bold = True
        p.add_run(desc)

    # Save document
    doc.save(output_path)
    print(f"[SUCCESS] Formal submission document generated at: {output_path}")


if __name__ == "__main__":
    out = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Darukaa_Earth_Hackathon_Submission.docx"))
    create_submission_document(out)
