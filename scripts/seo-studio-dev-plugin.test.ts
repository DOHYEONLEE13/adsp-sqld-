import { promises as fs } from 'node:fs';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { seoStudioDevPlugin } from './seo-studio-dev-plugin';

const servers: ViteDevServer[] = [];
const roots: string[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  await Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});

async function createFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'questdp-seo-studio-'));
  roots.push(root);
  const daily = path.join(root, 'seo-ops', '04-daily-content', '2026-08-25');
  await fs.mkdir(daily, { recursive: true });
  await fs.writeFile(
    path.join(daily, '00-daily-brief.md'),
    '# Daily Brief\n\nPRIMARY KEYWORD: ADsP 공부법\n',
    'utf8',
  );
  await fs.writeFile(
    path.join(daily, '02-threads.md'),
    'PLATFORM: Threads\nSTATUS: PUBLISH\nBODY:\n테스트 본문\n',
    'utf8',
  );
  await fs.mkdir(path.join(daily, 'assets'));
  await fs.writeFile(path.join(daily, 'assets', 'instagram-01.png'), Buffer.from('test-png'));
  return { root, daily };
}

async function startServer(root: string) {
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    plugins: [seoStudioDevPlugin(root)],
    server: { host: '127.0.0.1', port: 0 },
  });
  servers.push(server);
  await server.listen();
  const address = server.httpServer?.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}/__seo-studio`;
}

async function post(baseUrl: string, route: string, body: Record<string, string>) {
  return fetch(`${baseUrl}/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('SEO Studio development API', () => {
  it('discovers dated Daily Packages and returns management files', async () => {
    const { root } = await createFixture();
    const baseUrl = await startServer(root);

    const packagesResponse = await fetch(`${baseUrl}/packages`);
    const packages = await packagesResponse.json();
    expect(packagesResponse.status).toBe(200);
    expect(packagesResponse.headers.get('x-robots-tag')).toContain('noindex');
    expect(packages.packages).toHaveLength(1);
    expect(packages.packages[0].date).toBe('2026-08-25');
    expect(packages.packages[0].files['02-threads.md']).toContain('테스트 본문');

    const managementResponse = await fetch(`${baseUrl}/management`);
    expect(managementResponse.status).toBe(200);
    expect(await managementResponse.json()).toEqual({
      calendar: '',
      keywords: '',
      published: '',
      backlinks: '',
    });
  });

  it('serves only package-scoped Instagram PNG assets', async () => {
    const { root } = await createFixture();
    const baseUrl = await startServer(root);

    const assetResponse = await fetch(
      `${baseUrl}/asset?date=2026-08-25&file=instagram-01.png`,
    );
    expect(assetResponse.status).toBe(200);
    expect(assetResponse.headers.get('content-type')).toBe('image/png');
    expect(await assetResponse.text()).toBe('test-png');

    const traversalResponse = await fetch(
      `${baseUrl}/asset?date=2026-08-25&file=../review-state.json`,
    );
    expect(traversalResponse.status).toBe(400);
  });

  it('persists approvals and revision feedback beside the package', async () => {
    const { root, daily } = await createFixture();
    const baseUrl = await startServer(root);

    const missingFeedback = await post(baseUrl, 'review', {
      date: '2026-08-25',
      platform: 'threads',
      status: 'NEEDS_REVISION',
      feedback: '',
    });
    expect(missingFeedback.status).toBe(400);

    const approved = await post(baseUrl, 'review', {
      date: '2026-08-25',
      platform: 'threads',
      status: 'APPROVED',
      feedback: '문장 길이 확인 완료',
    });
    expect(approved.status).toBe(200);

    const state = JSON.parse(await fs.readFile(path.join(daily, 'review-state.json'), 'utf8'));
    const feedback = await fs.readFile(path.join(daily, 'review-feedback.md'), 'utf8');
    expect(state.items.threads.status).toBe('APPROVED');
    expect(feedback).toContain('문장 길이 확인 완료');
  });

  it('requires approval, records external URLs once, and never publishes blog drafts', async () => {
    const { root } = await createFixture();
    const baseUrl = await startServer(root);
    const publishBody = {
      date: '2026-08-25',
      platform: 'threads',
      keyword: 'ADsP 공부법',
      title: 'ADsP 공부법 테스트',
      url: 'https://www.threads.net/@questdp/post/example',
    };

    expect((await post(baseUrl, 'publish', publishBody)).status).toBe(400);
    expect((await post(baseUrl, 'review', {
      date: '2026-08-25',
      platform: 'threads',
      status: 'APPROVED',
      feedback: '',
    })).status).toBe(200);

    const firstPublish = await post(baseUrl, 'publish', publishBody);
    expect(firstPublish.status).toBe(200);
    expect((await firstPublish.json()).appended).toBe(true);

    await post(baseUrl, 'review', {
      date: '2026-08-25',
      platform: 'threads',
      status: 'APPROVED',
      feedback: '',
    });
    const duplicatePublish = await post(baseUrl, 'publish', publishBody);
    expect((await duplicatePublish.json()).appended).toBe(false);

    const log = await fs.readFile(
      path.join(root, 'seo-ops', '07-reports', 'published-log.csv'),
      'utf8',
    );
    expect(log.match(/threads\.net/g)).toHaveLength(1);

    const blogPublish = await post(baseUrl, 'publish', { ...publishBody, platform: 'blog' });
    expect(blogPublish.status).toBe(400);
    expect((await blogPublish.json()).error).toContain('Git');
  });
});
