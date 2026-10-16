#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Each task already has an isolated checkout. Do not create a Git worktree.
export npm_config_cache="${npm_config_cache:-/workspace/.npm-cache}"
npm ci --no-fund --no-audit
if [ ! -f .env ]; then
node --input-type=module <<'JS'
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
let config=readFileSync('.env.example','utf8');
config=config.replace('DB_PASSWORD=','DB_PASSWORD='+randomBytes(24).toString('hex'));
config+='\nDB_ROOT_PASSWORD='+randomBytes(24).toString('hex')+'\nSEED_ADMIN_PASSWORD='+randomBytes(18).toString('base64url')+'\nSEED_USER_PASSWORD='+randomBytes(18).toString('base64url')+'\n';
writeFileSync('.env',config,{mode:0o600,flag:'wx'});
JS
fi
docker compose up -d db
node --input-type=module <<'JS'
import {pool} from './server/db.js';
let ready=false;
for(let attempt=0;attempt<60;attempt++){try{await pool.query('SELECT 1');ready=true;break;}catch{await new Promise(r=>setTimeout(r,1000));}}
await pool.end();
if(!ready)throw Error('MySQL did not become ready; inspect docker compose logs db.');
JS
npm run db:migrate
npm run db:seed
npm run build
