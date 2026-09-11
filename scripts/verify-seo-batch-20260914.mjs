import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
function parse(raw) {
  const out = {}; let key;
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z][A-Z0-9 _/()?&-]{1,80}):(?:\s*(.*))?$/);
    if (m) { key = m[1]; out[key] = m[2] || ''; }
    else if (key) out[key] += '\n' + line;
  }
  return Object.fromEntries(Object.entries(out).map(([k,v]) => [k,v.trim()]));
}
const active = new Set(['2026-08-31','2026-09-01','2026-09-02','2026-09-03','2026-09-05','2026-09-06','2026-09-07','2026-09-09','2026-09-14']);
const required = ['00-daily-brief.md','01-questdp-blog.md','02-naver-blog.md','03-threads.md','04-instagram.md','05-velog.md','06-tistory.md','07-linkedin.md','08-community-opportunities.md','09-sources.md','10-review-checklist.md','review-state.json'];
const raw = read('src/data/seo/blog.ts');
const posts = [...raw.matchAll(/const (POST_\w+): BlogPostDraft = (\{[\s\S]*?\n\});/g)].map(m => ({ id:m[1], ...Function('return ('+m[2]+')')() }));
const slugs = new Set(posts.map(p => p.slug));
assert.equal(slugs.size, posts.length);
const counts = { dates:0, naver:0, threads:0, instagramPrompts:0, velog:0, tistory:0, linkedin:0, holdDates:0 };
for(let i=0;i<15;i++) {
  const date = new Date(Date.UTC(2026,7,31+i)).toISOString().slice(0,10);
  const dir = 'seo-ops/04-daily-content/'+date+'/';
  for(const f of required) assert(existsSync(path.join(root,dir,f)), date+': '+f);
  const brief = parse(read(dir+required[0]));
  assert.equal(brief['TARGET DATE'],date);
  assert(brief['CREATED AT'].startsWith('2026-09-12'));
  const blog = parse(read(dir+required[1]));
  assert(slugs.has(decodeURIComponent(new URL(blog['TARGET URL']).pathname.split('/')[2])));
  const state = JSON.parse(read(dir+'review-state.json'));
  assert.equal(state.date,date);
  for(const [channel,file,field] of [['naver',required[2],'BODY'],['threads',required[3],'PRIMARY POST'],['velog',required[5],'BODY'],['tistory',required[6],'BODY'],['linkedin',required[7],'BODY']]) {
    const doc=parse(read(dir+file));
    if(doc.STATUS==='HOLD') { assert(doc.REASON.length>20); continue; }
    counts[channel]++;
    assert(doc[field]?.length>=100,date+channel);
    assert(!/여기에 정리해놨습니다|저희 공식 블로그/.test(doc[field]));
    assert.equal(state.items[channel].status,'PENDING');
    if(channel==='naver') { assert(doc.BODY.length>=1200); assert(doc.BODY.includes(blog['TARGET URL'])); }
    if(channel==='threads') { assert(doc[field].length<=500); assert(doc['FIRST COMMENT SUGGESTION'].includes(blog['TARGET URL'])); }
  }
  const ig=parse(read(dir+required[4]));
  assert(!Object.keys(ig).some(k=>/^ASSET /.test(k)));
  if(active.has(date)) {
    assert.equal(Object.keys(ig).filter(k=>/^SLIDE \d+$/.test(k)).length,6);
    const prompt=read(dir+'11-instagram-image-prompts.md').match(/```text\n([\s\S]*?)\n```/)[1];
    assert.equal(ig['GENERATION PROMPT'],prompt);
    assert(prompt.includes('[불변 요소]'));
    assert(prompt.includes('[6장]'));
    assert(ig['GENERATION STATUS'].startsWith('NOT_GENERATED'));
    counts.instagramPrompts++;
  } else { assert.equal(ig.STATUS,'HOLD'); counts.holdDates++; }
  assert(read(dir+'09-sources.md').includes('https://'));
  counts.dates++;
}
assert.deepEqual(counts,{dates:15,naver:8,threads:9,instagramPrompts:9,velog:2,tistory:4,linkedin:1,holdDates:6});
const updated=posts.filter(p=>p.updatedAt==='2026-09-12');
assert.equal(updated.length,7);
for(const p of updated) {
  assert.equal(p.reviewedAt,'2026-09-12');
  assert(p.publishedAt<='2026-08-30');
  assert(p.faqs.length>=3);
  for(const s of p.relatedSlugs) assert(slugs.has(s),s);
  for(const m of JSON.stringify(p).matchAll(/\/blog\/([^/)\s]+)\//g)) assert(slugs.has(m[1]),m[1]);
  if(existsSync(path.join(root,'dist'))) {
    const html=read('dist/blog/'+p.slug+'/index.html');
    assert.equal((html.match(/<h1\b/g)||[]).length,1,p.slug);
    assert(html.includes(p.title),p.title);
    assert(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    assert.equal(decodeURIComponent(canonical || ''), 'https://quest-dp.com/blog/'+p.slug+'/');
  }
}
const db=new DatabaseSync(':memory:');
db.exec('CREATE TABLE orders(id INTEGER, discount INTEGER); INSERT INTO orders VALUES(1,0),(2,NULL),(3,2000);');
assert.deepEqual({...db.prepare('SELECT COUNT(*) total,COUNT(discount) present FROM orders').get()},{total:3,present:2});
assert.equal(db.prepare('SELECT COUNT(*) n FROM orders WHERE discount>0').get().n,1);
db.exec('INSERT INTO orders VALUES(4,0)');
assert.deepEqual({...db.prepare('SELECT COUNT(*) total,COUNT(discount) present FROM orders').get()},{total:4,present:3});
db.exec("CREATE TABLE c(id INTEGER,name TEXT); CREATE TABLE p(id TEXT,customer_id INTEGER); INSERT INTO c VALUES(1,'민지'),(2,'준호'),(3,'수아'); INSERT INTO p VALUES('A',1),('B',1),('C',2);");
assert.equal(db.prepare('SELECT COUNT(*) n FROM c JOIN p ON c.id=p.customer_id').get().n,3);
assert.equal(db.prepare('SELECT COUNT(*) n FROM c LEFT JOIN p ON c.id=p.customer_id').get().n,4);
db.close();
assert.equal([2,3,3,4,18].reduce((a,b)=>a+b)/5,6);
assert.equal([2,3,3,4,38].reduce((a,b)=>a+b)/5,10);
assert.equal((3+4)/2,3.5);
assert.equal((10+0)/2,5);
assert(Math.abs((10+0+10)/3-6.666666666666667)<1e-10);
console.log(JSON.stringify({status:'PASS',...counts,updatedBlogUrls:updated.length,exampleCheck:'SQLite cross-check + primary PostgreSQL/Microsoft docs; not actual PostgreSQL/Excel execution'},null,2));
