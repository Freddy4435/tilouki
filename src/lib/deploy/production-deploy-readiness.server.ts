import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  runProductionEnvChecks,
  summarizeDeployChecks,
  verifyGitignoreCoversSecrets,
  verifyStripeWebhookEventsInSource,
  verifyVercelCronConfig,
} from "../../../scripts/lib/verify-deploy-checks.mjs";

export interface DeployCheckSummary {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: Array<{ id: string; message: string; fix?: string }>;
  warnings: Array<{ id: string; message: string; fix?: string }>;
}

type DeployCheck = {
  id: string;
  level: "error" | "warn" | "ok";
  message: string;
  fix?: string;
};

function projectRoot(): string {
  return resolve(process.cwd());
}

/**
 * Reprend les mêmes contrôles que `npm run verify:deploy:prod` (variables + dépôt).
 * Utilisable côté admin pour l'état « prêt à encaisser ».
 */
export function runProductionDeployReadiness(
  env: NodeJS.ProcessEnv = process.env,
): DeployCheckSummary {
  const root = projectRoot();
  const envRecord = env as Record<string, string | undefined>;

  const checks: DeployCheck[] = runProductionEnvChecks(envRecord) as DeployCheck[];

  const pushCheck = (check: DeployCheck) => {
    checks.push(check);
  };

  const stripeRoute = resolve(root, "src/app/api/webhooks/stripe/route.ts");
  if (existsSync(stripeRoute)) {
    pushCheck({
      id: "stripe-route",
      level: "ok",
      message: "Route API /api/webhooks/stripe présente",
    });
  } else {
    pushCheck({
      id: "stripe-route",
      level: "error",
      message: "Route API /api/webhooks/stripe introuvable",
      fix: "Vérifiez src/app/api/webhooks/stripe/route.ts dans le dépôt.",
    });
  }

  const eventsPath = resolve(root, "src/lib/stripe/webhook/events.ts");
  if (existsSync(eventsPath)) {
    checks.push(
      ...(verifyStripeWebhookEventsInSource(
        readFileSync(eventsPath, "utf8"),
      ) as DeployCheck[]),
    );
  } else {
    pushCheck({
      id: "webhook-events-file",
      level: "error",
      message: "Fichier src/lib/stripe/webhook/events.ts introuvable",
    });
  }

  const vercelPath = resolve(root, "vercel.json");
  if (existsSync(vercelPath)) {
    try {
      checks.push(
        ...(verifyVercelCronConfig(
          JSON.parse(readFileSync(vercelPath, "utf8")),
        ) as DeployCheck[]),
      );
    } catch {
      pushCheck({
        id: "vercel-json",
        level: "error",
        message: "vercel.json illisible ou JSON invalide",
      });
    }
  } else {
    pushCheck({
      id: "vercel-json",
      level: "error",
      message: "vercel.json introuvable",
    });
  }

  const gitignorePath = resolve(root, ".gitignore");
  if (existsSync(gitignorePath)) {
    checks.push(
      ...(verifyGitignoreCoversSecrets(
        readFileSync(gitignorePath, "utf8"),
      ) as DeployCheck[]),
    );
  } else {
    pushCheck({
      id: "gitignore",
      level: "error",
      message: ".gitignore introuvable",
    });
  }

  const summary = summarizeDeployChecks(checks);

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
