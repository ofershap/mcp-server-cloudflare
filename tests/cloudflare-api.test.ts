import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  listZones,
  listDnsRecords,
  createDnsRecord,
  deleteDnsRecord,
  listWorkers,
  listKvNamespaces,
  listKvKeys,
  listR2Buckets,
  purgeCache,
} from "../src/cloudflare-api.js";

const TOKEN = "test-cf-token";
const ACCOUNT_ID = "test-account-id";
const ZONE_ID = "test-zone-id";

function cfResponse<T>(result: T, totalCount?: number) {
  return new Response(
    JSON.stringify({
      success: true,
      errors: [],
      result,
      result_info: totalCount
        ? { page: 1, per_page: 20, total_count: totalCount }
        : undefined,
    }),
    { status: 200 },
  );
}

function cfError(message: string) {
  return new Response(
    JSON.stringify({
      success: false,
      errors: [{ code: 1000, message }],
      result: null,
    }),
    { status: 400 },
  );
}

describe("cloudflare-api", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("lists zones", async () => {
    fetchSpy.mockResolvedValueOnce(
      cfResponse(
        [
          {
            id: "z1",
            name: "example.com",
            status: "active",
            plan: { name: "Free" },
          },
        ],
        1,
      ),
    );

    const { zones, totalCount } = await listZones(TOKEN);
    expect(zones).toHaveLength(1);
    expect(zones[0]?.name).toBe("example.com");
    expect(totalCount).toBe(1);
  });

  it("lists DNS records", async () => {
    fetchSpy.mockResolvedValueOnce(
      cfResponse([
        {
          id: "r1",
          type: "A",
          name: "example.com",
          content: "1.2.3.4",
          ttl: 1,
          proxied: true,
        },
      ]),
    );

    const records = await listDnsRecords(TOKEN, ZONE_ID);
    expect(records).toHaveLength(1);
    expect(records[0]?.type).toBe("A");
  });

  it("creates DNS record", async () => {
    fetchSpy.mockResolvedValueOnce(
      cfResponse({
        id: "r2",
        type: "CNAME",
        name: "www.example.com",
        content: "example.com",
        ttl: 1,
        proxied: true,
      }),
    );

    const record = await createDnsRecord(TOKEN, ZONE_ID, {
      type: "CNAME",
      name: "www",
      content: "example.com",
    });
    expect(record.id).toBe("r2");
  });

  it("deletes DNS record", async () => {
    fetchSpy.mockResolvedValueOnce(cfResponse({ id: "r1" }));
    await deleteDnsRecord(TOKEN, ZONE_ID, "r1");
    const call = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(call[1].method).toBe("DELETE");
  });

  it("lists workers", async () => {
    fetchSpy.mockResolvedValueOnce(
      cfResponse([
        {
          id: "my-worker",
          created_on: "2026-01-01",
          modified_on: "2026-01-02",
          etag: "abc",
        },
      ]),
    );

    const workers = await listWorkers(TOKEN, ACCOUNT_ID);
    expect(workers).toHaveLength(1);
    expect(workers[0]?.id).toBe("my-worker");
  });

  it("lists KV namespaces", async () => {
    fetchSpy.mockResolvedValueOnce(cfResponse([{ id: "ns1", title: "MY_KV" }]));

    const namespaces = await listKvNamespaces(TOKEN, ACCOUNT_ID);
    expect(namespaces).toHaveLength(1);
    expect(namespaces[0]?.title).toBe("MY_KV");
  });

  it("lists KV keys", async () => {
    fetchSpy.mockResolvedValueOnce(
      cfResponse([{ name: "key1" }, { name: "key2" }]),
    );

    const keys = await listKvKeys(TOKEN, ACCOUNT_ID, "ns1");
    expect(keys).toHaveLength(2);
  });

  it("lists R2 buckets", async () => {
    fetchSpy.mockResolvedValueOnce(
      cfResponse({
        buckets: [{ name: "my-bucket", creation_date: "2026-01-01" }],
      }),
    );

    const buckets = await listR2Buckets(TOKEN, ACCOUNT_ID);
    expect(buckets).toHaveLength(1);
    expect(buckets[0]?.name).toBe("my-bucket");
  });

  it("purges cache", async () => {
    fetchSpy.mockResolvedValueOnce(cfResponse({ id: "purge1" }));

    await purgeCache(TOKEN, ZONE_ID, { purge_everything: true });
    const call = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(call[1].method).toBe("POST");
    expect(call[0]).toContain("purge_cache");
  });

  it("throws on API error", async () => {
    fetchSpy.mockResolvedValueOnce(cfError("Invalid token"));

    await expect(listZones(TOKEN)).rejects.toThrow(
      "Cloudflare API error: Invalid token",
    );
  });
});
