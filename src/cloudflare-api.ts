const API_BASE = "https://api.cloudflare.com/client/v4";

interface CloudflareResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
  result_info?: { page: number; per_page: number; total_count: number };
}

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<CloudflareResponse<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = (await response.json()) as CloudflareResponse<T>;

  if (!data.success) {
    const errMsg = data.errors.map((e) => e.message).join("; ");
    throw new Error(`Cloudflare API error: ${errMsg}`);
  }

  return data;
}

export interface Zone {
  id: string;
  name: string;
  status: string;
  plan: { name: string };
}

export async function listZones(
  token: string,
  page = 1,
  perPage = 20,
): Promise<{ zones: Zone[]; totalCount: number }> {
  const data = await request<Zone[]>(
    `/zones?page=${page}&per_page=${perPage}`,
    token,
  );
  return {
    zones: data.result,
    totalCount: data.result_info?.total_count ?? data.result.length,
  };
}

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export async function listDnsRecords(
  token: string,
  zoneId: string,
  page = 1,
  perPage = 50,
): Promise<DnsRecord[]> {
  const data = await request<DnsRecord[]>(
    `/zones/${zoneId}/dns_records?page=${page}&per_page=${perPage}`,
    token,
  );
  return data.result;
}

export async function createDnsRecord(
  token: string,
  zoneId: string,
  record: {
    type: string;
    name: string;
    content: string;
    ttl?: number;
    proxied?: boolean;
  },
): Promise<DnsRecord> {
  const data = await request<DnsRecord>(`/zones/${zoneId}/dns_records`, token, {
    method: "POST",
    body: JSON.stringify(record),
  });
  return data.result;
}

export async function deleteDnsRecord(
  token: string,
  zoneId: string,
  recordId: string,
): Promise<void> {
  await request<{ id: string }>(
    `/zones/${zoneId}/dns_records/${recordId}`,
    token,
    { method: "DELETE" },
  );
}

export interface Worker {
  id: string;
  created_on: string;
  modified_on: string;
  etag: string;
}

export async function listWorkers(
  token: string,
  accountId: string,
): Promise<Worker[]> {
  const data = await request<Worker[]>(
    `/accounts/${accountId}/workers/scripts`,
    token,
  );
  return data.result;
}

export async function deleteWorker(
  token: string,
  accountId: string,
  scriptName: string,
): Promise<void> {
  await request<undefined>(
    `/accounts/${accountId}/workers/scripts/${scriptName}`,
    token,
    { method: "DELETE" },
  );
}

export interface KvNamespace {
  id: string;
  title: string;
}

export async function listKvNamespaces(
  token: string,
  accountId: string,
  page = 1,
  perPage = 20,
): Promise<KvNamespace[]> {
  const data = await request<KvNamespace[]>(
    `/accounts/${accountId}/storage/kv/namespaces?page=${page}&per_page=${perPage}`,
    token,
  );
  return data.result;
}

export interface KvKey {
  name: string;
  expiration?: number;
}

export async function listKvKeys(
  token: string,
  accountId: string,
  namespaceId: string,
  prefix?: string,
  limit = 100,
): Promise<KvKey[]> {
  let url = `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?limit=${limit}`;
  if (prefix) url += `&prefix=${encodeURIComponent(prefix)}`;
  const data = await request<KvKey[]>(url, token);
  return data.result;
}

export async function getKvValue(
  token: string,
  accountId: string,
  namespaceId: string,
  key: string,
): Promise<string> {
  const response = await fetch(
    `${API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    throw new Error(`Cloudflare API error (${response.status})`);
  }
  return response.text();
}

export async function putKvValue(
  token: string,
  accountId: string,
  namespaceId: string,
  key: string,
  value: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: value,
    },
  );
  if (!response.ok) {
    throw new Error(`Cloudflare API error (${response.status})`);
  }
}

export async function deleteKvKey(
  token: string,
  accountId: string,
  namespaceId: string,
  key: string,
): Promise<void> {
  await request<undefined>(
    `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
    token,
    { method: "DELETE" },
  );
}

export interface R2Bucket {
  name: string;
  creation_date: string;
}

export async function listR2Buckets(
  token: string,
  accountId: string,
): Promise<R2Bucket[]> {
  const data = await request<{ buckets: R2Bucket[] }>(
    `/accounts/${accountId}/r2/buckets`,
    token,
  );
  return data.result.buckets;
}

export async function purgeCache(
  token: string,
  zoneId: string,
  options: { purge_everything?: boolean; files?: string[] },
): Promise<void> {
  await request<{ id: string }>(`/zones/${zoneId}/purge_cache`, token, {
    method: "POST",
    body: JSON.stringify(options),
  });
}
