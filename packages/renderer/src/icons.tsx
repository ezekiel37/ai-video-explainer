import type { ReactNode } from "react";
import type { SceneNode } from "@explainmotion/schema";

export type IconKind =
  | "user"
  | "device"
  | "browser"
  | "server"
  | "auth"
  | "warning"
  | "database"
  | "queue"
  | "dashboard"
  | "bell"
  | "check"
  | "payment"
  | "cloud"
  | "email"
  | "cart"
  | "gear"
  | "chart"
  | "file"
  | "globe"
  | "clock"
  | "lock"
  | "key"
  | "wallet"
  | "box";

/**
 * Resolve which built-in pack icon a node should use. Priority: pack `asset` id,
 * then node type, then label keywords — so the asset packs (and the words the user
 * wrote) actually drive the visual instead of every node being a blank card.
 */
export function nodeIconKind(node: SceneNode): IconKind {
  const asset = (node.asset ?? "").toLowerCase();
  const hay = `${asset} ${node.label.toLowerCase()}`;
  const has = (re: RegExp) => re.test(hay);

  if (node.type === "avatar-card" || has(/user|customer|person|sender|receiver|client/)) return "user";
  if (node.type === "database-card" || has(/database|ledger|postgres|sql|storage|\bdata\b/)) return "database";
  if (has(/fraud|warning|alert|risk|error|fail|decline/)) return "warning";
  if (has(/auth|identity|login|sign in|verification|2fa|otp/)) return "auth";
  if (has(/payment|\bpay\b|charge|billing|invoice|transaction/)) return "payment";
  if (has(/wallet|balance|fund|payout|account\b/)) return "wallet";
  if (has(/cart|order|purchase|shop|basket|checkout/)) return "cart";
  if (has(/email|\bmail\b|inbox|smtp|newsletter/)) return "email";
  if (has(/notification|notify|push|sms|message/)) return "bell";
  if (has(/queue|worker|job|async|broker|kafka|stream/)) return "queue";
  if (has(/api|server|backend|gateway|microservice|endpoint|request/)) return "server";
  if (has(/cloud|aws|azure|gcp|s3|bucket|cdn/)) return "cloud";
  if (has(/analytics|chart|metric|report|stats|insight/)) return "chart";
  if (has(/dashboard|home|console|admin|product\b/)) return "dashboard";
  if (has(/settings|config|engine|process|pipeline|build/)) return "gear";
  if (has(/file|document|record|log\b|pdf|report doc/)) return "file";
  if (has(/encrypt|secure|private|protected|\block\b/)) return "lock";
  if (has(/\bkey\b|token|credential|secret|api key/)) return "key";
  if (has(/globe|internet|network|dns|web service|worldwide/)) return "globe";
  if (has(/time|clock|delay|schedule|wait|timeout|cron/)) return "clock";
  if (has(/success|complete|verified|approved|\bdone\b|confirm/) || node.type === "badge") return "check";
  if (has(/browser|frontend|website|\bweb\b|page/)) return "browser";
  if (node.type === "device-card" || has(/mobile|app\b|phone|device|tablet/)) return "device";
  return "box";
}

const PATHS: Record<IconKind, ReactNode> = {
  user: (
    <>
      <circle cx={12} cy={9} r={3.4} />
      <path d="M5.5 19c0-3.6 3-5.6 6.5-5.6s6.5 2 6.5 5.6" />
    </>
  ),
  device: (
    <>
      <rect x={7} y={3} width={10} height={18} rx={2.2} />
      <path d="M10.5 18h3" />
    </>
  ),
  browser: (
    <>
      <rect x={3} y={5} width={18} height={14} rx={2} />
      <path d="M3 9h18" />
      <path d="M6 7h.01M8.5 7h.01" />
    </>
  ),
  server: (
    <>
      <rect x={4} y={4} width={16} height={7} rx={1.6} />
      <rect x={4} y={13} width={16} height={7} rx={1.6} />
      <path d="M7.5 7.5h.01M7.5 16.5h.01" />
    </>
  ),
  auth: (
    <>
      <path d="M12 3.2l7 3v4.8c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6.2z" />
      <path d="M9.2 12l1.9 1.9L15 10" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.2l8.4 14.8H3.6z" />
      <path d="M12 10v4" />
      <path d="M12 16.6h.01" />
    </>
  ),
  database: (
    <>
      <ellipse cx={12} cy={6} rx={7} ry={3} />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  queue: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  dashboard: (
    <>
      <rect x={3} y={3} width={7} height={7} rx={1.4} />
      <rect x={14} y={3} width={7} height={7} rx={1.4} />
      <rect x={3} y={14} width={7} height={7} rx={1.4} />
      <rect x={14} y={14} width={7} height={7} rx={1.4} />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1112 0c0 4.8 2 6 2 6H4s2-1.2 2-6" />
      <path d="M10 20a2 2 0 004 0" />
    </>
  ),
  check: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M8 12.5l2.6 2.6L16 9.4" />
    </>
  ),
  payment: (
    <>
      <rect x={3} y={6} width={18} height={12} rx={2.2} />
      <path d="M3 10h18" />
      <path d="M6.5 14.5h3" />
    </>
  ),
  cloud: <path d="M7.5 18h9a3.5 3.5 0 00.3-7 5 5 0 00-9.7-1.3A3.6 3.6 0 007.5 18z" />,
  email: (
    <>
      <rect x={3} y={5} width={18} height={14} rx={2.2} />
      <path d="M3.6 6.8L12 13l8.4-6.2" />
    </>
  ),
  cart: (
    <>
      <circle cx={9.5} cy={20} r={1.3} />
      <circle cx={17} cy={20} r={1.3} />
      <path d="M3 4h2.2l2.3 11h10l2-7.5H6.4" />
    </>
  ),
  gear: (
    <>
      <circle cx={12} cy={12} r={3.2} />
      <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <rect x={5.5} y={12} width={3} height={6} rx={0.6} />
      <rect x={10.5} y={7} width={3} height={11} rx={0.6} />
      <rect x={15.5} y={14} width={3} height={4} rx={0.6} />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
    </>
  ),
  globe: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.6 2.6 15 0 18M12 3c-2.6 2.6-2.6 15 0 18" />
    </>
  ),
  clock: (
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x={5} y={11} width={14} height={9} rx={2} />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  key: (
    <>
      <circle cx={8} cy={15} r={3} />
      <path d="M10.2 12.8L19 4M16 5l2.2 2.2M14 7l2.2 2.2" />
    </>
  ),
  wallet: (
    <>
      <rect x={3} y={6} width={18} height={12} rx={2.4} />
      <path d="M16.5 12h.01" />
      <path d="M3 9.5h12" />
    </>
  ),
  box: <rect x={4} y={4} width={16} height={16} rx={3} />
};

export function NodeIcon({ kind, color, size = 18 }: { kind: IconKind; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[kind]}
    </svg>
  );
}
