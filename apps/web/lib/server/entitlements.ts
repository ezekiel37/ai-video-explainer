export type Plan = "free" | "pro" | "team";

export type Entitlement = {
  plan: Plan;
  /** Free renders get a watermark; paid plans don't. */
  watermark: boolean;
  /** Videos per month; null = unlimited. */
  monthlyVideoLimit: number | null;
};

const ENTITLEMENTS: Record<Plan, Omit<Entitlement, "plan">> = {
  free: { watermark: true, monthlyVideoLimit: 3 },
  pro: { watermark: false, monthlyVideoLimit: null },
  team: { watermark: false, monthlyVideoLimit: null }
};

/**
 * Resolve a user's plan. Billing isn't wired yet, so everyone is "free"; this is the
 * single place to swap in a real lookup (a `plan` column / Stripe entitlement) later.
 */
export function getPlan(_userId: string | null): Plan {
  return "free";
}

export function getEntitlement(userId: string | null): Entitlement {
  const plan = getPlan(userId);
  return { plan, ...ENTITLEMENTS[plan] };
}
