---
name: cloudflare-management
description: Manage Cloudflare Workers, KV, R2, DNS, and cache via MCP. Use when asked to interact with Cloudflare infrastructure.
---

# Cloudflare Management via MCP

Use this skill when you need to manage Cloudflare zones, DNS records, Workers, KV storage, R2 buckets, or cache purging.

## Available Tools

| Tool               | What it does                       |
| ------------------ | ---------------------------------- |
| `cf_zones`         | List Cloudflare zones (domains)    |
| `cf_dns_list`      | List DNS records for a zone        |
| `cf_dns_create`    | Create a DNS record                |
| `cf_dns_delete`    | Delete a DNS record                |
| `cf_workers_list`  | List Workers scripts               |
| `cf_worker_delete` | Delete a Workers script            |
| `cf_kv_namespaces` | List KV namespaces                 |
| `cf_kv_keys`       | List keys in a KV namespace        |
| `cf_kv_get`        | Get a value from KV                |
| `cf_kv_put`        | Write a value to KV                |
| `cf_kv_delete`     | Delete a KV key                    |
| `cf_r2_buckets`    | List R2 storage buckets            |
| `cf_cache_purge`   | Purge cache (all or specific URLs) |

## Workflow

1. Start with `cf_zones` to discover available zones and get zone IDs
2. Use zone IDs for DNS operations (`cf_dns_list`, `cf_dns_create`, `cf_dns_delete`)
3. Workers, KV, and R2 use the account ID (configured via `CLOUDFLARE_ACCOUNT_ID`)
4. Cache purge requires a zone ID and optionally specific URLs

## Key Patterns

- DNS record creation requires `zone_id`, `type` (A, CNAME, MX, TXT), `name`, and `content`
- KV operations need a `namespace_id` — get it from `cf_kv_namespaces` first
- Cache purge with no URLs purges everything for the zone — confirm with the user before doing this
- All tools require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` env vars

## Safety

- Always confirm before deleting DNS records, Workers, or KV keys
- Always confirm before purging all cache (use specific URLs when possible)
- DNS propagation takes time — warn users that changes may not be instant
