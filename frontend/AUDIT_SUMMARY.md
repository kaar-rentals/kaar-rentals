# Frontend Dependency Audit Summary

## npm audit (before)

```
# npm audit report

esbuild  <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
fix available via `npm audit fix --force`
Will install vite@7.3.0, which is a breaking change
node_modules/esbuild
  vite  0.11.0 - 6.1.6
  Depends on vulnerable versions of esbuild
  node_modules/vite

2 moderate severity vulnerabilities
```

## npm audit fix

```
changed 0 packages, and audited 944 packages in 5s
2 moderate severity vulnerabilities
```

**Note:** Vulnerabilities remain because fix requires `--force` (breaking vite upgrade to v7.3.0)

## Build Status

✅ **BUILD_SUCCESS**

```
vite v5.4.21 building for production...
transforming...
✓ 1799 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                            1.73 kB │ gzip:   0.64 kB
...
✓ built in 5.80s
```

## Deprecated Packages Check

### npm ls q inflight glob

```
vite_react_shadcn_ts@0.0.0 /Users/shahzaibsanaullah/kaar-rentals/frontend
+-- babel-jest@30.2.0
| `-- babel-plugin-istanbul@7.0.1
|   `-- test-exclude@6.0.0
|     `-- glob@7.2.3
|       `-- inflight@1.0.6
+-- cloudinary@2.7.0
| `-- q@1.5.1
+-- jest@30.2.0
| `-- @jest/core@30.2.0
|   +-- @jest/reporters@30.2.0
|   | `-- glob@10.5.0 deduped
|   +-- jest-config@30.2.0
|   | `-- glob@10.5.0 deduped
|   `-- jest-runtime@30.2.0
|     `-- glob@10.5.0 deduped
`-- tailwindcss@3.4.17
  `-- sucrase@3.35.0
    `-- glob@10.5.0
```

**Result:** 
- `q@1.5.1` present (via cloudinary@2.7.0)
- `inflight@1.0.6` present (via glob@7.2.3 -> babel-plugin-istanbul)
- `glob@7.2.3` and `glob@10.5.0` present (via jest, tailwindcss)

## Summary

- **Vulnerabilities:** 2 moderate (before and after - require breaking vite upgrade)
- **Build:** ✅ Success
- **Deprecated packages:** `q`, `inflight`, `glob` remain (all transitive dependencies)

