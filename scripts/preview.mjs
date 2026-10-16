import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('dist')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' }
const server = http.createServer((req, res) => {
  let file
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)) } catch { res.writeHead(400); res.end(); return }
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return }
  if (file === root || file.endsWith(path.sep)) file = path.join(root, 'index.html')
  fs.readFile(file, (error, content) => { if (error) { res.writeHead(404); res.end('Not found'); return } res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' }); res.end(content) })
})
const port = Number(process.argv[2]) || 4173
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`))
