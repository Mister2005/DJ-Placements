"""
PlaceHub - One-click launcher (no Docker)
Starts PostgreSQL-free backend (SQLite) + frontend dev server, opens browser.
"""

import subprocess
import time
import webbrowser
import sys
import os
import signal

FRONTEND_PORT = 3000
BACKEND_PORT = 5000
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

processes = []


def kill_port(port):
    """Kill any process using the given port on Windows."""
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True,
            text=True,
            shell=True,
        )
        for line in result.stdout.splitlines():
            if f":{port}" in line and "LISTENING" in line:
                parts = line.strip().split()
                pid = parts[-1]
                if pid and pid != "0":
                    subprocess.run(
                        ["taskkill", "/F", "/PID", pid],
                        capture_output=True,
                        shell=True,
                    )
                    print(f"  Killed PID {pid} on port {port}")
    except Exception as e:
        print(f"  Could not clear port {port}: {e}")


def clear_ports():
    """Clear required ports."""
    print("Clearing ports...")
    kill_port(FRONTEND_PORT)
    kill_port(BACKEND_PORT)
    print("Ports cleared.\n")


def start_backend():
    """Start the Flask backend."""
    print("Starting backend...")
    venv_python = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        print("ERROR: Backend venv not found. Run: python -m venv backend/venv && backend\\venv\\Scripts\\pip install -r backend\\requirements.txt")
        sys.exit(1)

    proc = subprocess.Popen(
        [venv_python, "run.py"],
        cwd=BACKEND_DIR,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )
    processes.append(proc)
    print(f"  Backend starting on http://localhost:{BACKEND_PORT}")
    return proc


def start_frontend():
    """Start the Vite dev server."""
    print("Starting frontend...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )
    processes.append(proc)
    print(f"  Frontend starting on http://localhost:{FRONTEND_PORT}")
    return proc


def wait_for_app():
    """Wait until the frontend is responding."""
    import urllib.request
    import urllib.error

    print("\nWaiting for app to be ready...", end="", flush=True)
    for _ in range(30):
        try:
            urllib.request.urlopen(f"http://localhost:{FRONTEND_PORT}")
            print(" Ready!")
            return True
        except (urllib.error.URLError, ConnectionRefusedError, OSError):
            print(".", end="", flush=True)
            time.sleep(2)

    print("\nWARNING: App may not be fully ready, opening browser anyway.")
    return False


def open_browser():
    """Open the frontend in the default browser."""
    url = f"http://localhost:{FRONTEND_PORT}"
    print(f"\nOpening browser at {url}")
    webbrowser.open(url)


def cleanup():
    """Kill all child processes."""
    print("\nShutting down...")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
    print("Done. Goodbye!")


def main():
    print("=" * 50)
    print("  PlaceHub - Placement Portal Launcher")
    print("=" * 50)
    print()

    clear_ports()
    start_backend()
    time.sleep(3)
    start_frontend()
    wait_for_app()
    open_browser()

    print("\n" + "=" * 50)
    print(f"  Frontend: http://localhost:{FRONTEND_PORT}")
    print(f"  Backend:  http://localhost:{BACKEND_PORT}")
    print("=" * 50)
    print("\nPress Ctrl+C to stop.\n")

    try:
        while True:
            time.sleep(2)
            for proc in processes:
                if proc.poll() is not None:
                    print(f"\nProcess (PID {proc.pid}) exited. Shutting down...")
                    cleanup()
                    sys.exit(1)
    except KeyboardInterrupt:
        cleanup()


if __name__ == "__main__":
    main()
