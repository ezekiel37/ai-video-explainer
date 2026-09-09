export type AssetType = "icon" | "avatar" | "card" | "arrow";

export type AssetDefinition = {
  id: string;
  name: string;
  type: AssetType;
  tags: string[];
  compatibleNodeTypes: string[];
};

export const coreAssets: AssetDefinition[] = [
  {
    id: "core/user",
    name: "User",
    type: "avatar",
    tags: ["person", "customer", "sender", "receiver"],
    compatibleNodeTypes: ["avatar-card"]
  },
  {
    id: "core/mobile-app",
    name: "Mobile App",
    type: "icon",
    tags: ["mobile", "app", "device"],
    compatibleNodeTypes: ["device-card", "icon-card"]
  },
  {
    id: "core/browser",
    name: "Browser",
    type: "icon",
    tags: ["web", "frontend", "browser"],
    compatibleNodeTypes: ["device-card", "icon-card"]
  },
  {
    id: "core/check",
    name: "Check",
    type: "icon",
    tags: ["success", "verified", "complete"],
    compatibleNodeTypes: ["icon-card", "badge"]
  },
  {
    id: "core/warning",
    name: "Warning",
    type: "icon",
    tags: ["alert", "risk", "error"],
    compatibleNodeTypes: ["icon-card", "badge"]
  },
  {
    id: "core/notification",
    name: "Notification",
    type: "icon",
    tags: ["message", "push", "email"],
    compatibleNodeTypes: ["icon-card"]
  }
];

export const techProductAssets: AssetDefinition[] = [
  {
    id: "tech-product/api-server",
    name: "API Server",
    type: "icon",
    tags: ["api", "backend", "server", "request"],
    compatibleNodeTypes: ["service-card", "icon-card"]
  },
  {
    id: "tech-product/auth-service",
    name: "Auth Service",
    type: "icon",
    tags: ["auth", "identity", "verification"],
    compatibleNodeTypes: ["service-card", "icon-card"]
  },
  {
    id: "tech-product/database",
    name: "Database",
    type: "icon",
    tags: ["data", "postgres", "storage"],
    compatibleNodeTypes: ["database-card"]
  },
  {
    id: "tech-product/queue",
    name: "Queue",
    type: "icon",
    tags: ["worker", "job", "async"],
    compatibleNodeTypes: ["service-card", "icon-card"]
  },
  {
    id: "tech-product/dashboard",
    name: "Dashboard",
    type: "icon",
    tags: ["product", "home", "ui"],
    compatibleNodeTypes: ["device-card", "icon-card"]
  }
];

export const assetPacks = [
  {
    id: "core",
    name: "Core",
    assets: coreAssets
  },
  {
    id: "tech-product",
    name: "Tech/Product",
    assets: techProductAssets
  }
];

export const allAssets = [...coreAssets, ...techProductAssets];

export function findAssetByTag(tag: string) {
  const normalizedTag = tag.toLowerCase();
  return allAssets.find((asset) => asset.tags.some((assetTag) => normalizedTag.includes(assetTag)));
}
