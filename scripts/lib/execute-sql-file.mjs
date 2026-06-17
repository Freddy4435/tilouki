/**
 * Exécute un fichier SQL contre le projet Supabase lié.
 * Compatible CLI récente (`db query --linked -f`) et ancienne (`db execute --file`).
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function runSpawn(command, args, cwd) {
  if (process.platform === "win32") {
    const quotedArgs = args.map((arg) =>
      /[\s"]/u.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg,
    );
    return spawnSync(`${command} ${quotedArgs.join(" ")}`, {
      cwd,
      stdio: "inherit",
      shell: true,
    });
  }

  return spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });
}

/**
 * @param {string} sqlFilePath
 * @param {{ cwd: string }} [options]
 * @returns {number} exit code (0 = success)
 */
export function executeSqlFile(sqlFilePath, { cwd } = {}) {
  if (!existsSync(sqlFilePath)) {
    console.error(`  ✗ Fichier SQL introuvable : ${sqlFilePath}`);
    return 1;
  }

  const attempts = [
    [
      "npx",
      [
        "--yes",
        "supabase@2.107.0",
        "db",
        "query",
        "--linked",
        "--file",
        sqlFilePath,
      ],
    ],
    ["supabase", ["db", "query", "--linked", "--file", sqlFilePath]],
    ["supabase", ["db", "execute", "--file", sqlFilePath]],
  ];

  let lastStatus = 1;

  for (const [command, args] of attempts) {
    const result = runSpawn(command, args, cwd);
    if (result.status === 0) {
      return 0;
    }
    lastStatus = result.status ?? 1;
  }

  return lastStatus;
}

/**
 * Lit un fichier SQL (pour exécution distante via API / MCP).
 * @param {string} sqlFilePath
 */
export function readSqlFile(sqlFilePath) {
  return readFileSync(sqlFilePath, "utf8");
}
