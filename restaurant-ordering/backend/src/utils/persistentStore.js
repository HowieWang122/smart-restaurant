const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_DIR = path.join(__dirname, '../../data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const MANAGED_FILES = [
  'users.json',
  'orders.json',
  'recharge-requests.json',
  'heart-transactions.json',
  'daily-discounts.json',
  'heart-value.json',
  'heart-values.json',
];

const TABLE_NAME = 'file_store';

function isInsideDataDir(targetPath) {
  const relative = path.relative(DATA_DIR, path.resolve(targetPath));
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function stringifyJson(data) {
  if (Buffer.isBuffer(data)) {
    return data.toString('utf8');
  }
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data);
}

async function init() {
  if (!process.env.DATABASE_URL) {
    console.log('[persistentStore] DATABASE_URL 未设置，使用本地文件存储');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === 'false'
        ? false
        : { rejectUnauthorized: false },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      name TEXT PRIMARY KEY,
      content JSONB,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  async function saveContent(name, data) {
    // 确保数据是有效的 JSON 字符串格式传递给 PostgreSQL
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    await pool.query(
      `
      INSERT INTO ${TABLE_NAME}(name, content, updated_at)
      VALUES($1, $2::jsonb, NOW())
      ON CONFLICT(name) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    `,
      [name, jsonString]
    );
  }

  async function loadContent(name) {
    const { rows } = await pool.query(
      `SELECT content FROM ${TABLE_NAME} WHERE name = $1`,
      [name]
    );
    return rows.length ? rows[0].content : null;
  }

  // 同步数据库内容到本地文件
  for (const file of MANAGED_FILES) {
    const dbContent = await loadContent(file);
    const filePath = path.join(DATA_DIR, file);

    if (dbContent) {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(dbContent, null, 2),
        'utf8'
      );
    } else if (fs.existsSync(filePath)) {
      try {
        const localContent = JSON.parse(
          await fs.promises.readFile(filePath, 'utf8')
        );
        await saveContent(file, localContent);
      } catch (error) {
        console.error(`[persistentStore] 读取本地文件 ${file} 失败:`, error);
      }
    }
  }

  // 打补丁，拦截后续写入
  const originalWriteFileSync = fs.writeFileSync;
  fs.writeFileSync = function patchedWriteFileSync(target, data, options) {
    const result = originalWriteFileSync.apply(fs, [target, data, options]);

    if (isInsideDataDir(target)) {
      const fileName = path.relative(DATA_DIR, path.resolve(target));
      if (MANAGED_FILES.includes(fileName)) {
        const jsonString = stringifyJson(data);
        try {
          const parsed = JSON.parse(jsonString);
          saveContent(fileName, parsed).catch((error) => {
            console.error(
              `[persistentStore] 持久化 ${fileName} 失败:`,
              error
            );
          });
        } catch (error) {
          console.error(
            `[persistentStore] 解析 ${fileName} JSON 失败，跳过持久化`,
            error
          );
        }
      }
    }

    return result;
  };

  console.log('[persistentStore] 已启用 PostgreSQL 文件持久化');
}

module.exports = { init, DATA_DIR };

