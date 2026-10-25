"""Compatibility entry point: the maintained suite is now npm test:e2e.
Requires npm install and a production build. Providers are mocked/disabled.
"""
import os
import subprocess
import sys

if __name__ == "__main__":
    command = "npm.cmd" if os.name == "nt" else "npm"
    sys.exit(subprocess.call([command, "run", "test:e2e"], cwd=__import__("pathlib").Path(__file__).resolve().parents[1]))
