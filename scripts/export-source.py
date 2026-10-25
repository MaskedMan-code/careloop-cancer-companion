"""Export only known source directories/files; never open local environment files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_DIRS = {"app", "components", "lib", "docs", "tests", "e2e", "scripts", "public"}
ALLOWED_FILES = {"package.json", "package-lock.json", "README.md", ".env.example", ".gitignore", ".eslintrc.json", "next.config.mjs", "next-env.d.ts", "tailwind.config.ts", "postcss.config.js", "tsconfig.json", "vitest.config.ts", "vitest.live.config.ts", "playwright.config.ts"}
EXCLUDED = {"node_modules", ".next", ".git", "__pycache__", "test-results", "playwright-report"}

def source_files():
    for item in sorted(ROOT.iterdir()):
        if item.name in ALLOWED_FILES and item.is_file():
            yield item
        elif item.name in ALLOWED_DIRS and item.is_dir():
            for path in sorted(item.rglob("*")):
                if path.is_symlink() or not path.is_file():
                    continue
                if any(part in EXCLUDED for part in path.relative_to(ROOT).parts):
                    continue
                if path.name.startswith(".env") or path.suffix in {".pem", ".key", ".log", ".zip", ".pyc"}:
                    continue
                yield path

if __name__ == "__main__":
    destination = ROOT / "careloop-phase2-fixed.zip"
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for path in source_files():
            archive.write(path, path.relative_to(ROOT))
    with ZipFile(destination) as archive:
        assert all(not name.startswith(".env") or name == ".env.example" for name in archive.namelist())
        print(f"Exported {len(archive.namelist())} source files to {destination.name}")
