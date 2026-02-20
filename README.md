# MCP Server Cloudflare — Workers, KV, R2, DNS & Cache for AI Assistants

[![npm version](https://img.shields.io/npm/v/mcp-server-cloudflare.svg)](https://www.npmjs.com/package/mcp-server-cloudflare)
[![npm downloads](https://img.shields.io/npm/dm/mcp-server-cloudflare.svg)](https://www.npmjs.com/package/mcp-server-cloudflare)
[![CI](https://github.com/ofershap/mcp-server-cloudflare/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/mcp-server-cloudflare/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP server that lets your AI assistant manage Cloudflare Workers, KV, R2, DNS, and cache purging. Vercel, Railway, and Netlify all have MCP servers — now Cloudflare does too.

```
You: "List my Workers and purge cache for example.com"
AI:  Found 3 Workers: api-gateway, auth-worker, image-resizer
     ✅ Cache purged for https://example.com
```

> Works with Claude Desktop, Cursor, and VS Code Copilot.

![MCP server Cloudflare demo — listing Workers and purging cache from Claude Desktop](assets/demo.gif)

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

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
