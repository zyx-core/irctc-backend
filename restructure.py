import os
import re
import shutil

BASE_DIR = r"d:\project\irctc\frontend\src\app"

MAPPINGS = {
    "components/booking/booking.component.ts": "pages/booking/booking.ts",
    "components/cancel-ticket/cancel-ticket.component.ts": "pages/cancel-ticket/cancel-ticket.ts",
    "components/coming-soon/coming-soon.component.ts": "shared/coming-soon/coming-soon.ts",
    "components/footer/footer.ts": "shared/footer/footer.ts",
    "components/footer/footer.html": "shared/footer/footer.html",
    "components/footer/footer.scss": "shared/footer/footer.scss",
    "components/header/header.ts": "shared/header/header.ts",
    "components/header/header.html": "shared/header/header.html",
    "components/header/header.scss": "shared/header/header.scss",
    "components/login/login.component.ts": "auth/login/login.ts",
    "components/meals/meals.component.ts": "pages/meals/meals.ts",
    "components/pnr-enquiry/pnr-enquiry.component.ts": "pages/pnr-enquiry/pnr-enquiry.ts",
    "components/train-search/train-search.ts": "pages/train-search/train-search.ts",
    "components/train-search/train-search.html": "pages/train-search/train-search.html",
    "components/train-search/train-search.scss": "pages/train-search/train-search.scss",
    "components/wallet/wallet.component.ts": "pages/wallet/wallet.ts",
}

for src_rel, dest_rel in MAPPINGS.items():
    src = os.path.join(BASE_DIR, src_rel)
    dest = os.path.join(BASE_DIR, dest_rel)
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if not os.path.exists(dest):
            shutil.copy2(src, dest)
            print(f"Copied {src_rel} to {dest_rel}")

# Now, for all newly copied .ts files, extract template and style
for dest_rel in MAPPINGS.values():
    if dest_rel.endswith(".ts"):
        dest = os.path.join(BASE_DIR, dest_rel)
        if not os.path.exists(dest): continue
        with open(dest, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if there is an inline template
        template_match = re.search(r'template:\s*`([\s\S]*?)`', content)
        if template_match:
            template_content = template_match.group(1).strip()
            # replace template: `...` with templateUrl: './filename.html'
            base_name = os.path.basename(dest_rel)[:-3]
            html_rel = dest_rel.replace(".ts", ".html")
            
            with open(os.path.join(BASE_DIR, html_rel), "w", encoding="utf-8") as f:
                f.write(template_content)
            
            content = content[:template_match.start()] + f"templateUrl: './{base_name}.html'" + content[template_match.end():]
            
            with open(dest, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Extracted template for {dest_rel}")

        # Check if there are inline styles
        style_match = re.search(r'styles:\s*\[\s*`([\s\S]*?)`\s*\]', content)
        if style_match:
            style_content = style_match.group(1).strip()
            base_name = os.path.basename(dest_rel)[:-3]
            scss_rel = dest_rel.replace(".ts", ".scss")
            
            with open(os.path.join(BASE_DIR, scss_rel), "w", encoding="utf-8") as f:
                f.write(style_content)
            
            content = content[:style_match.start()] + f"styleUrl: './{base_name}.scss'" + content[style_match.end():]
            
            with open(dest, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Extracted style for {dest_rel}")

print("Done phase 1")
