import { guardApiRequest, jsonError, parseJsonBody } from "@/lib/security/api";
import { subscribeToNewsletter } from "@/lib/newsletter/service";
import { newsletterSubscribeSchema } from "@/lib/validations/newsletter";

export async function POST(request: Request) {
  const blocked = await guardApiRequest(request, {
    rateLimit: { route: "newsletter", limit: 5, windowSec: 3600 },
  });
  if (blocked) return blocked;

  const parsed = await parseJsonBody(request, newsletterSubscribeSchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.website) {
    return Response.json({
      success: true,
      message: "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.",
    });
  }

  const result = await subscribeToNewsletter(parsed.data);
  if (!result.ok) {
    return jsonError(result.error, 400);
  }

  return Response.json({ success: true, message: result.message });
}
