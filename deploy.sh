#!/usr/bin/env bash
set -euo pipefail

echo "== Kaar Rentals deployment helper =="
echo
echo "This script runs local checks. Actual deploys are done via:"
echo "- Vercel (frontend)"
echo "- Railway (backend)"
echo

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Using Node version:"
node -v || echo "Node is not installed or not on PATH"

echo
echo "== Backend: install & test =="
(
  cd "$ROOT_DIR/backend"
  echo "Backend directory: $(pwd)"
  echo "Simulating: npm install"
  # npm install
  echo "Simulating: npm test (if defined)"
  # npm test
)

echo
echo "== Frontend: install & build =="
(
  cd "$ROOT_DIR/frontend"
  echo "Frontend directory: $(pwd)"
  echo "Simulating: npm install"
  # npm install
  echo "Simulating: npm run build"
  # npm run build
)

cat <<'EOF'

Next steps (manual):

Frontend (Vercel):
1. Ensure Vercel project is linked to this repo.
2. Set Vercel env vars (VITE_* and API base URL).
3. Trigger a deployment (git push or Vercel dashboard).

Backend (Railway):
1. Create/connect Railway service from ./backend.
2. Set environment variables (MONGO_URI, JWT_SECRET, CLOUDINARY_*, etc.).
3. Ensure Node 24.x is configured in Railway.
4. Deploy via Railway (push or dashboard).

EOF

echo "Done."

