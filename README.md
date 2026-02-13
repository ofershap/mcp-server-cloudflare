# mcp-server-cloudflare

[![npm version](https://img.shields.io/npm/v/mcp-server-cloudflare.svg)](https://www.npmjs.com/package/mcp-server-cloudflare)
[![CI](https://github.com/ofershap/mcp-server-cloudflare/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/mcp-server-cloudflare/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> MCP server to manage Cloudflare Workers, KV, R2, DNS, and cache from your IDE. Vercel, Railway, and Netlify all have MCP servers — now Cloudflare does too.

<p align="center">
  <img src="assets/demo.gif" alt="mcp-server-cloudflare demo" width="600" />
</p>

## Tools

| Tool               | What it does                         |
| ------------------ | ------------------------------------ |
| `cf_zones`         | List your Cloudflare zones (domains) |
| `cf_dns_list`      | List DNS records for a zone          |
| `cf_dns_create`    | Create a DNS record                  |
| `cf_dns_delete`    | Delete a DNS record                  |
| `cf_workers_list`  | List Workers scripts                 |
| `cf_worker_delete` | Delete a Workers script              |
| `cf_kv_namespaces` | List KV namespaces                   |
| `cf_kv_keys`       | List keys in a KV namespace          |
| `cf_kv_get`        | Get a value from KV                  |
| `cf_kv_put`        | Write a value to KV                  |
| `cf_kv_delete`     | Delete a KV key                      |
| `cf_r2_buckets`    | List R2 storage buckets              |
| `cf_cache_purge`   | Purge cache (all or specific URLs)   |

## Quick Start

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "mcp-server-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_api_token",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id"
      }
    }
  }
}
```

### With Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "mcp-server-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_api_token",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id"
      }
    }
  }
}
```

## Authentication

1. Go to [Cloudflare Dashboard > API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create a token with the permissions you need:
   - **Zone:Read** — for listing zones and DNS
   - **Zone:Edit** — for creating/deleting DNS records
   - **Workers Scripts:Edit** — for managing Workers
   - **Workers KV Storage:Edit** — for KV operations
   - **Zone:Cache Purge** — for cache purging
3. Set `CLOUDFLARE_API_TOKEN` environment variable
4. Set `CLOUDFLARE_ACCOUNT_ID` for Workers, KV, and R2 operations

## Examples

Ask your AI assistant:

- "List my Cloudflare zones"
- "Show DNS records for zone xyz"
- "Create an A record pointing to 1.2.3.4"
- "List my Workers"
- "Show KV keys in namespace abc"
- "Purge the cache for https://example.com/page"
- "List my R2 buckets"

## Development

```bash
npm install
npm test
npm run build
```

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
