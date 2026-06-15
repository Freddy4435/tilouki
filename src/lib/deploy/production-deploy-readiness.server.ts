import "server-only";

import {
  runProductionEnvChecks,
  summarizeDeployChecks,
} from "@/lib/deploy/verify-deploy-checks";

export interface DeployCheckSummary {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: Array<{ id: string; message: string; fix?: string }>;
  warnings: Array<{ id: string; message: string; fix?: string }>;
}

/**
 * Contrôles variables d'environnement (alignés sur `npm run verify:deploy:prod`).
 * Les vérifications dépôt (fichiers, vercel.json, .gitignore) restent dans le script CLI.
 */
export function runProductionDeployReadiness(
  env: NodeJS.ProcessEnv = process.env,
): DeployCheckSummary {
  const envRecord = env as Record<string, string | undefined>;
  const summary = summarizeDeployChecks(runProductionEnvChecks(envRecord));

  return {
    valid: summary.valid,
    errorCount: summary.errorCount,
    warningCount: summary.warningCount,
    errors: summary.errors.map((check) => ({
      id: check.id,
      message: check.message,
      fix: check.fix,
    })),
    warnings: summary.warnings.map((check) => ({
      id: check.id,
      message: check.message,
      fix: check.fix,
    })),
  };
}
