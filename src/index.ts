import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  listZones,
  listDnsRecords,
  createDnsRecord,
  deleteDnsRecord,
  listWorkers,
  deleteWorker,
  listKvNamespaces,
  listKvKeys,
  getKvValue,
  putKvValue,
  deleteKvKey,
  listR2Buckets,
  purgeCache,
} from "./cloudflare-api.js";

function getConfig(): { token: string; accountId: string } {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error("Missing CLOUDFLARE_API_TOKEN environment variable.");
  }
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
  return { token, accountId };
}

const server = new McpServer({
  name: "mcp-server-cloudflare",
  version: "0.1.0",
});

server.tool(
  "cf_zones",
  "List Cloudflare zones (domains)",
  {
    page: z.number().int().min(1).default(1).describe("Page number"),
    perPage: z.number().int().min(1).max(50).default(20).describe("Per page"),
  },
  async ({ page, perPage }) => {
    const { token } = getConfig();
    const { zones, totalCount } = await listZones(token, page, perPage);
    const text = [
      `Zones (${totalCount} total):`,
      ...zones.map(
        (z) => `  ${z.name} (${z.id}) — ${z.status} — ${z.plan.name}`,
      ),
    ].join("\n");
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "cf_dns_list",
  "List DNS records for a zone",
  {
    zoneId: z.string().describe("Zone ID"),
    page: z.number().int().min(1).default(1).describe("Page"),
    perPage: z.number().int().min(1).max(100).default(50).describe("Per page"),
  },
  async ({ zoneId, page, perPage }) => {
    const { token } = getConfig();
    const records = await listDnsRecords(token, zoneId, page, perPage);
    const text = records
      .map(
        (r) =>
          `${r.type.padEnd(6)} ${r.name.padEnd(40)} → ${r.content} (TTL: ${r.ttl}, proxied: ${r.proxied})`,
      )
      .join("\n");
    return {
      content: [{ type: "text", text: text || "No DNS records found." }],
    };
  },
);

server.tool(
  "cf_dns_create",
  "Create a DNS record",
  {
    zoneId: z.string().describe("Zone ID"),
    type: z.string().describe("Record type (A, AAAA, CNAME, TXT, MX, etc.)"),
    name: z.string().describe("Record name (e.g. 'www' or '@')"),
    content: z.string().describe("Record content (IP, hostname, text)"),
    ttl: z.number().int().default(1).describe("TTL (1 = auto)"),
    proxied: z.boolean().default(false).describe("Proxied through Cloudflare"),
  },
  async ({ zoneId, type, name, content, ttl, proxied }) => {
    const { token } = getConfig();
    const record = await createDnsRecord(token, zoneId, {
      type,
      name,
      content,
      ttl,
      proxied,
    });
    return {
      content: [
        {
          type: "text",
          text: `DNS record created: ${record.type} ${record.name} → ${record.content} (ID: ${record.id})`,
        },
      ],
    };
  },
);

server.tool(
  "cf_dns_delete",
  "Delete a DNS record",
  {
    zoneId: z.string().describe("Zone ID"),
    recordId: z.string().describe("DNS record ID"),
  },
  async ({ zoneId, recordId }) => {
    const { token } = getConfig();
    await deleteDnsRecord(token, zoneId, recordId);
    return {
      content: [{ type: "text", text: `DNS record ${recordId} deleted.` }],
    };
  },
);

server.tool(
  "cf_workers_list",
  "List Workers scripts",
  {
    accountId: z
      .string()
      .optional()
      .describe("Account ID (uses env var if not provided)"),
  },
  async ({ accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [
          {
            type: "text",
            text: "Account ID required. Set CLOUDFLARE_ACCOUNT_ID or provide accountId parameter.",
          },
        ],
        isError: true,
      };
    }
    const workers = await listWorkers(token, acctId);
    const text = workers
      .map((w) => `${w.id} — modified: ${w.modified_on}`)
      .join("\n");
    return {
      content: [{ type: "text", text: text || "No Workers found." }],
    };
  },
);

server.tool(
  "cf_worker_delete",
  "Delete a Workers script",
  {
    scriptName: z.string().describe("Worker script name"),
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ scriptName, accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    await deleteWorker(token, acctId, scriptName);
    return {
      content: [{ type: "text", text: `Worker "${scriptName}" deleted.` }],
    };
  },
);

server.tool(
  "cf_kv_namespaces",
  "List KV namespaces",
  {
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    const namespaces = await listKvNamespaces(token, acctId);
    const text = namespaces.map((ns) => `${ns.title} (${ns.id})`).join("\n");
    return {
      content: [{ type: "text", text: text || "No KV namespaces found." }],
    };
  },
);

server.tool(
  "cf_kv_keys",
  "List keys in a KV namespace",
  {
    namespaceId: z.string().describe("KV namespace ID"),
    prefix: z.string().optional().describe("Key prefix filter"),
    limit: z.number().int().min(1).max(1000).default(100).describe("Limit"),
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ namespaceId, prefix, limit, accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    const keys = await listKvKeys(token, acctId, namespaceId, prefix, limit);
    const text = keys.map((k) => k.name).join("\n");
    return {
      content: [{ type: "text", text: text || "No keys found." }],
    };
  },
);

server.tool(
  "cf_kv_get",
  "Get a value from KV",
  {
    namespaceId: z.string().describe("KV namespace ID"),
    key: z.string().describe("Key to read"),
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ namespaceId, key, accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    const value = await getKvValue(token, acctId, namespaceId, key);
    return { content: [{ type: "text", text: value }] };
  },
);

server.tool(
  "cf_kv_put",
  "Write a value to KV",
  {
    namespaceId: z.string().describe("KV namespace ID"),
    key: z.string().describe("Key to write"),
    value: z.string().describe("Value to store"),
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ namespaceId, key, value, accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    await putKvValue(token, acctId, namespaceId, key, value);
    return {
      content: [
        { type: "text", text: `KV key "${key}" written successfully.` },
      ],
    };
  },
);

server.tool(
  "cf_kv_delete",
  "Delete a key from KV",
  {
    namespaceId: z.string().describe("KV namespace ID"),
    key: z.string().describe("Key to delete"),
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ namespaceId, key, accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    await deleteKvKey(token, acctId, namespaceId, key);
    return {
      content: [{ type: "text", text: `KV key "${key}" deleted.` }],
    };
  },
);

server.tool(
  "cf_r2_buckets",
  "List R2 buckets",
  {
    accountId: z.string().optional().describe("Account ID"),
  },
  async ({ accountId: inputAccountId }) => {
    const { token, accountId: envAccountId } = getConfig();
    const acctId = inputAccountId ?? envAccountId;
    if (!acctId) {
      return {
        content: [{ type: "text", text: "Account ID required." }],
        isError: true,
      };
    }
    const buckets = await listR2Buckets(token, acctId);
    const text = buckets
      .map((b) => `${b.name} — created: ${b.creation_date}`)
      .join("\n");
    return {
      content: [{ type: "text", text: text || "No R2 buckets found." }],
    };
  },
);

server.tool(
  "cf_cache_purge",
  "Purge Cloudflare cache (all or specific URLs)",
  {
    zoneId: z.string().describe("Zone ID"),
    purgeAll: z
      .boolean()
      .default(false)
      .describe("Purge everything (use with caution)"),
    urls: z.array(z.string()).optional().describe("Specific URLs to purge"),
  },
  async ({ zoneId, purgeAll, urls }) => {
    const { token } = getConfig();
    if (purgeAll) {
      await purgeCache(token, zoneId, { purge_everything: true });
      return {
        content: [{ type: "text", text: "Full cache purge initiated." }],
      };
    }
    if (urls && urls.length > 0) {
      await purgeCache(token, zoneId, { files: urls });
      return {
        content: [
          {
            type: "text",
            text: `Cache purged for ${urls.length} URL(s).`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: "Specify purgeAll=true or provide URLs to purge.",
        },
      ],
      isError: true,
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
