import fs from 'node:fs';
import path from 'node:path';

const RECORDS_DIR = path.resolve(process.cwd(), 'records');

function ensureDir() {
  if (!fs.existsSync(RECORDS_DIR)) {
    fs.mkdirSync(RECORDS_DIR, { recursive: true });
  }
}

function isValidId(id) {
  return /^\d{8}-\d{6}(-\d+)?$/.test(id);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function handleRecordsApi(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/records')) {
    return next();
  }

  ensureDir();

  const idMatch = pathname.match(/^\/api\/records\/([a-zA-Z0-9_-]+)$/);
  const idParam = idMatch ? idMatch[1] : null;

  // GET /api/records/:id
  if (req.method === 'GET' && idParam) {
    if (!isValidId(idParam)) {
      return sendJson(res, 400, { error: 'Invalid ID format' });
    }
    const filePath = path.join(RECORDS_DIR, `${idParam}.json`);
    if (!fs.existsSync(filePath)) {
      return sendJson(res, 404, { error: 'Record not found' });
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return sendJson(res, 200, data);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // GET /api/records
  if (req.method === 'GET' && !idParam) {
    try {
      const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json'));
      const records = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(RECORDS_DIR, file), 'utf-8');
          const json = JSON.parse(content);
          records.push({
            id: json.id,
            question: json.question || '',
            startedAt: json.startedAt,
            finishedAt: json.finishedAt,
            primary: json.primary,
            changed: json.changed,
            movingLines: json.movingLines || [],
            lines: json.lines || [],
          });
        } catch (e) {
          // ignore corrupted files
        }
      }
      records.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));
      return sendJson(res, 200, records);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/records
  if (req.method === 'POST' && !idParam) {
    parseJsonBody(req)
      .then(body => {
        let id = body.id;
        if (!id || !isValidId(id)) {
          const now = new Date();
          const dStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 8);
          const tStr = now.toTimeString().replace(/[: ]/g, '').slice(0, 6);
          id = `${dStr}-${tStr}`;
        }

        let finalId = id;
        let counter = 1;
        while (fs.existsSync(path.join(RECORDS_DIR, `${finalId}.json`))) {
          finalId = `${id}-${counter++}`;
        }

        body.id = finalId;

        const jsonPath = path.join(RECORDS_DIR, `${finalId}.json`);
        const mdPath = path.join(RECORDS_DIR, `${finalId}.md`);

        fs.writeFileSync(jsonPath, JSON.stringify(body, null, 2), 'utf-8');
        if (body.markdown) {
          fs.writeFileSync(mdPath, body.markdown, 'utf-8');
        }

        return sendJson(res, 201, { ok: true, id: finalId });
      })
      .catch(err => sendJson(res, 400, { error: err.message }));
    return;
  }

  // PUT /api/records/:id
  if (req.method === 'PUT' && idParam) {
    if (!isValidId(idParam)) {
      return sendJson(res, 400, { error: 'Invalid ID format' });
    }
    const jsonPath = path.join(RECORDS_DIR, `${idParam}.json`);
    const mdPath = path.join(RECORDS_DIR, `${idParam}.md`);
    if (!fs.existsSync(jsonPath)) {
      return sendJson(res, 404, { error: 'Record not found' });
    }

    parseJsonBody(req)
      .then(body => {
        const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const updated = { ...existing, ...body, id: idParam };
        fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), 'utf-8');
        if (body.markdown) {
          fs.writeFileSync(mdPath, body.markdown, 'utf-8');
        }
        return sendJson(res, 200, { ok: true });
      })
      .catch(err => sendJson(res, 400, { error: err.message }));
    return;
  }

  // DELETE /api/records/:id
  if (req.method === 'DELETE' && idParam) {
    if (!isValidId(idParam)) {
      return sendJson(res, 400, { error: 'Invalid ID format' });
    }
    const jsonPath = path.join(RECORDS_DIR, `${idParam}.json`);
    const mdPath = path.join(RECORDS_DIR, `${idParam}.md`);

    let deleted = false;
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
      deleted = true;
    }
    if (fs.existsSync(mdPath)) {
      fs.unlinkSync(mdPath);
      deleted = true;
    }

    if (!deleted) {
      return sendJson(res, 404, { error: 'Record not found' });
    }
    return sendJson(res, 200, { ok: true });
  }

  return next();
}

export function recordsPlugin() {
  return {
    name: 'vite-plugin-shicao-records',
    configureServer(server) {
      server.middlewares.use(handleRecordsApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRecordsApi);
    },
  };
}
