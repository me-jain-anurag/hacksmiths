# Toolchain and Dependency Notes (hacksmiths)

## Local toolchain used
- Node.js: v24.13.0
- npm: 11.6.2

## Project runtime standard
- Pinned Node version: 22 LTS via `.nvmrc`
- Supported engines for all package roots: Node `>=22 <23`, npm `>=10`

Local development may use a newer Node release, but CI and team setup should target Node 22 LTS.

## Node package locations
This repository contains four Node.js package roots:

1. `/`
2. `hapi-loader/`
3. `EMR/emr-frontend-clean/`
4. `EMR/terminology-service/`

Each of these directories has both a `package.json` and a `package-lock.json`.

## Clean install commands
Run from repository root:

```bash
npm ci
(cd hapi-loader && npm ci)
(cd EMR/emr-frontend-clean && npm ci)
(cd EMR/terminology-service && npm ci)
```

## Guardrails
- `node_modules/` must never be committed.
- Keep `package-lock.json` committed for each package root.
- After cloning fresh, prefer `npm ci` over `npm install` for reproducible installs.
