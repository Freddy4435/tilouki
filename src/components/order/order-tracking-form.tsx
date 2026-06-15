"use client";

import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { ExternalLink, Package, Search } from "lucide-react";

import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  buildCarrierTrackingUrl,
  getCarrierTrackingLabel,
} from "@/lib/shipping/tracking";
import {
  readTrackingTokenFromBrowserUrl,
  resolveInitialTrackingToken,
  validateTrackingTokenLookup,
} from "@/lib/validations/tracking";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderTrackingInfo } from "@/types/catalog";

interface OrderTrackingFormProps {
  action: (token: string) => Promise<OrderTrackingInfo | null>;
  initialToken?: string;
}

const subscribeToClientMount = () => () => {};

export function OrderTrackingForm({ action, initialToken }: OrderTrackingFormProps) {
  const searchParams = useSearchParams();
  const tokenFromSearchParams = searchParams.get("token");
  const hasMounted = useSyncExternalStore(
    subscribeToClientMount,
    () => true,
    () => false,
  );
  const resolvedInitialToken = useMemo(
    () =>
      resolveInitialTrackingToken(
        initialToken,
        tokenFromSearchParams,
        hasMounted ? readTrackingTokenFromBrowserUrl() : null,
      ),
    [hasMounted, initialToken, tokenFromSearchParams],
  );
  const [token, setToken] = useState("");
  const [prevResolvedToken, setPrevResolvedToken] = useState(resolvedInitialToken);
  const [result, setResult] = useState<OrderTrackingInfo | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const autoLookupToken = useRef<string | null>(null);

  if (resolvedInitialToken !== prevResolvedToken) {
    setPrevResolvedToken(resolvedInitialToken);
    setToken(resolvedInitialToken);
  }

  const runLookup = (raw: string) => {
    const trimmed = raw.trim();
    setToken(trimmed);
    setError(null);
    setResult(undefined);

    const validation = validateTrackingTokenLookup(trimmed);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    startTransition(async () => {
      try {
        const order = await action(validation.token);
        setResult(order);
        if (!order) {
          setError("Aucune commande trouvée pour ce numéro de suivi.");
        }
      } catch {
        setError("Impossible de récupérer le suivi. Réessayez plus tard.");
      }
    });
  };

  useEffect(() => {
    const urlToken = resolveInitialTrackingToken(
      initialToken,
      tokenFromSearchParams,
      readTrackingTokenFromBrowserUrl(),
    );
    if (!urlToken) return;
    if (autoLookupToken.current === urlToken) return;
    autoLookupToken.current = urlToken;
    runLookup(urlToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-lookup piloté par le token URL
  }, [initialToken, tokenFromSearchParams]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runLookup(token);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="space-y-4 p-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Saisissez le numéro reçu par e-mail après votre commande. Vous y trouverez
            le statut d&apos;expédition et le suivi colis.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="tracking-token" className="text-sm font-semibold">
                Numéro de suivi
              </label>
              <Input
                id="tracking-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ex. reçu dans l'e-mail de confirmation"
                autoComplete="off"
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={isPending}>
              <Search className="size-4" />
              {isPending ? "Recherche…" : "Suivre ma commande"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <EmptyState
          icon={Package}
          title="Commande introuvable"
          description={error}
          showReassurance={false}
          action={{ label: "Voir livraison & retours", href: "/livraison-retours" }}
        />
      ) : null}

      {result ? (
        <Card className="border-primary/20 shadow-[var(--shadow-card)]">
          <CardContent className="space-y-4 p-6 text-sm">
            <p className="font-heading text-lg font-semibold">Votre commande</p>
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">N° commande</span>
                <span className="font-semibold">{result.orderNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Statut</span>
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {result.status}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(result.totalCents)}
                </span>
              </div>
              {result.trackingNumber ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Suivi colis</span>
                  <span className="font-medium">{result.trackingNumber}</span>
                </div>
              ) : null}
              {(() => {
                const carrierUrl = buildCarrierTrackingUrl(
                  result.shippingProvider,
                  result.shippingNumber,
                  result.relayPointZip,
                );
                return carrierUrl ? (
                  <a
                    href={carrierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full rounded-full",
                    )}
                  >
                    <ExternalLink className="size-4" />
                    Suivre mon colis {getCarrierTrackingLabel(result.shippingProvider)}
                  </a>
                ) : null;
              })()}
            </div>
            <p className="text-muted-foreground border-t pt-3 text-xs">
              Colis expédié depuis la France. Questions ? Consultez la page Livraison et
              retours.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!result && !error ? (
        <ReassuranceStrip variant="compact" className="pt-2" />
      ) : null}
    </div>
  );
}
