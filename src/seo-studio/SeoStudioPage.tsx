import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Database,
  ExternalLink,
  FileSearch,
  Home,
  Link2,
  LoaderCircle,
  Monitor,
  Pause,
  RefreshCcw,
  Search,
  Send,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { findPostBySlug, type BlogBlock, type BlogPost } from '@/data/seo/blog';
import { useSeoMeta } from '@/lib/seo';
import { fetchManagement, fetchPackages, recordPublished, saveReview } from './api';
import {
  PLATFORM_DEFINITIONS,
  chooseDefaultPackage,
  currentKstDate,
  instagramAssets,
  instagramSlides,
  packageDocument,
  parseCsv,
  platformDocument,
  platformReviewStatus,
  platformTitle,
  primaryKeyword,
  progressForPackage,
  qualityScore,
  targetBlogSlug,
} from './dailyPackage';
import type {
  ManagementFiles,
  ParsedDocument,
  ReviewStatus,
  StudioPackage,
  StudioPlatformId,
  StudioReviewState,
} from './types';

type StudioView =
  | 'today'
  | 'brief'
  | 'serp'
  | 'sources'
  | 'internal-links'
  | 'calendar'
  | 'keywords'
  | 'published'
  | 'backlinks';

type PreviewViewport = 'mobile' | 'tablet' | 'desktop';

const EMPTY_MANAGEMENT: ManagementFiles = {
  calendar: '',
  keywords: '',
  published: '',
  backlinks: '',
};

const STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
  APPROVED: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  NEEDS_REVISION: 'border-rose-400/35 bg-rose-400/10 text-rose-200',
  HOLD: 'border-slate-500/50 bg-slate-500/10 text-slate-300',
  PUBLISHED: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-200',
};

export default function SeoStudioPage() {
  const [packages, setPackages] = useState<StudioPackage[]>([]);
  const [management, setManagement] = useState<ManagementFiles>(EMPTY_MANAGEMENT);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<StudioPlatformId>('blog');
  const [view, setView] = useState<StudioView>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useSeoMeta({
    title: 'QuestDP Content Studio — Local only',
    description: 'QuestDP SEO 일일 패키지를 검토하는 로컬 운영 도구입니다.',
    noIndex: true,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPackages(), fetchManagement()])
      .then(([nextPackages, nextManagement]) => {
        if (cancelled) return;
        setPackages(nextPackages);
        setManagement(nextManagement);
        const preferred = chooseDefaultPackage(nextPackages, currentKstDate());
        setSelectedDate((current) => current || preferred?.date || '');
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Studio 데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dailyPackage = useMemo(
    () => packages.find((item) => item.date === selectedDate) ?? null,
    [packages, selectedDate],
  );

  useEffect(() => {
    const item = dailyPackage?.review.items[selectedPlatform];
    setFeedback(item?.feedback ?? '');
    setPublishedUrl(item?.publishedUrl ?? '');
  }, [dailyPackage, selectedPlatform]);

  const replaceReview = (review: StudioReviewState) => {
    setPackages((current) => current.map((item) => (
      item.date === review.date ? { ...item, review } : item
    )));
  };

  const handleReview = async (status: Exclude<ReviewStatus, 'PUBLISHED'>) => {
    if (!dailyPackage) return;
    setSaving(true);
    setMessage('');
    try {
      const review = await saveReview({
        date: dailyPackage.date,
        platform: selectedPlatform,
        status,
        feedback,
      });
      replaceReview(review);
      setMessage(status === 'APPROVED' ? '승인 상태를 저장했습니다.' : '검토 상태와 메모를 저장했습니다.');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : '검토 상태 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublished = async () => {
    if (!dailyPackage || selectedPlatform === 'blog') return;
    const document = platformDocument(dailyPackage, selectedPlatform);
    setSaving(true);
    setMessage('');
    try {
      const result = await recordPublished({
        date: dailyPackage.date,
        platform: selectedPlatform,
        keyword: primaryKeyword(dailyPackage),
        title: platformTitle(document, selectedPlatform),
        url: publishedUrl,
      });
      replaceReview(result.review);
      setManagement(await fetchManagement());
      setMessage(result.appended ? '게시 URL을 Published Log에 기록했습니다.' : '이미 기록된 게시 URL입니다.');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : '게시 URL 기록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} 복사 완료`);
    } catch {
      setMessage('클립보드 권한을 확인해주세요.');
    }
  };

  return (
    <div className="relative z-[80] min-h-screen bg-[#090c12] text-slate-100">
      <div className="flex min-h-screen">
        <StudioSidebar
          view={view}
          selectedPlatform={selectedPlatform}
          onView={setView}
          onPlatform={(platform) => {
            setSelectedPlatform(platform);
            setView('today');
          }}
        />

        <main className="min-w-0 flex-1 lg:pl-[244px]">
          <StudioHeader
            packages={packages}
            selectedDate={selectedDate}
            dailyPackage={dailyPackage}
            onDate={setSelectedDate}
          />

          <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-5 md:px-7 lg:px-10">
            {loading ? <LoadingState /> : null}
            {error ? <ErrorState message={error} /> : null}
            {!loading && !error && !dailyPackage ? <EmptyPackageState /> : null}

            {dailyPackage && view === 'today' ? (
              <TodayReview
                dailyPackage={dailyPackage}
                selectedPlatform={selectedPlatform}
                feedback={feedback}
                publishedUrl={publishedUrl}
                saving={saving}
                message={message}
                onPlatform={setSelectedPlatform}
                onFeedback={setFeedback}
                onPublishedUrl={setPublishedUrl}
                onReview={handleReview}
                onPublished={handlePublished}
                onCopy={handleCopy}
              />
            ) : null}

            {dailyPackage && view === 'brief' ? (
              <BriefPanel dailyPackage={dailyPackage} />
            ) : null}
            {dailyPackage && view === 'serp' ? (
              <TextPanel
                eyebrow="SERP"
                title="검색 결과 패턴"
                text={packageDocument(dailyPackage, '00-daily-brief.md').fields['TOP SERP PATTERNS'] || 'SERP 패턴이 아직 입력되지 않았습니다.'}
              />
            ) : null}
            {dailyPackage && view === 'sources' ? (
              <SourcesPanel dailyPackage={dailyPackage} />
            ) : null}
            {dailyPackage && view === 'internal-links' ? (
              <InternalLinksPanel dailyPackage={dailyPackage} />
            ) : null}

            {view === 'calendar' ? <ManagementTable title="Content Calendar" raw={management.calendar} /> : null}
            {view === 'keywords' ? <ManagementTable title="Keyword Database" raw={management.keywords} /> : null}
            {view === 'published' ? <ManagementTable title="Published Log" raw={management.published} /> : null}
            {view === 'backlinks' ? <ManagementTable title="Backlink Prospects" raw={management.backlinks} /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function StudioHeader({
  packages,
  selectedDate,
  dailyPackage,
  onDate,
}: {
  packages: StudioPackage[];
  selectedDate: string;
  dailyPackage: StudioPackage | null;
  onDate: (date: string) => void;
}) {
  const progress = dailyPackage ? progressForPackage(dailyPackage) : { approved: 0, total: 0 };
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090c12]/95 px-4 py-4 backdrop-blur md:px-7 lg:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-300">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1">Local only</span>
            <span>QuestDP Content Studio</span>
          </div>
          <h1 className="text-xl font-black tracking-tight md:text-2xl">
            {dailyPackage ? `${dailyPackage.date.replaceAll('-', '.')} 발행 예정` : 'Daily Package 대기 중'}
          </h1>
          {dailyPackage ? (
            <p className="mt-1 text-sm text-slate-400">오늘의 Keyword · {primaryKeyword(dailyPackage)}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400" htmlFor="studio-date">Package</label>
          <select
            id="studio-date"
            value={selectedDate}
            onChange={(event) => onDate(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-slate-100 outline-none focus:border-cyan-400/50"
          >
            {packages.length === 0 ? <option value="">날짜 없음</option> : null}
            {packages.map((item) => <option key={item.date} value={item.date}>{item.date}</option>)}
          </select>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold">
            {progress.approved} / {progress.total} 승인
          </div>
        </div>
      </div>
    </header>
  );
}

function StudioSidebar({
  view,
  selectedPlatform,
  onView,
  onPlatform,
}: {
  view: StudioView;
  selectedPlatform: StudioPlatformId;
  onView: (view: StudioView) => void;
  onPlatform: (platform: StudioPlatformId) => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] overflow-y-auto border-r border-white/10 bg-[#0d1119] p-4 lg:block">
      <div className="mb-7 flex items-center gap-3 px-2 pt-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-lg font-black text-[#081018]">Q</div>
        <div>
          <div className="text-sm font-black">Content Studio</div>
          <div className="text-[11px] text-slate-500">DEV WORKSPACE</div>
        </div>
      </div>

      <SidebarGroup label="TODAY">
        <SidebarButton active={view === 'today'} icon={<Home size={15} />} label="오늘의 패키지" onClick={() => onView('today')} />
      </SidebarGroup>
      <SidebarGroup label="CONTENT">
        {PLATFORM_DEFINITIONS.map((item) => (
          <SidebarButton
            key={item.id}
            active={view === 'today' && selectedPlatform === item.id}
            icon={<ChevronRight size={14} />}
            label={item.label}
            onClick={() => onPlatform(item.id)}
          />
        ))}
      </SidebarGroup>
      <SidebarGroup label="SEO">
        <SidebarButton active={view === 'brief'} icon={<FileSearch size={15} />} label="Keyword Brief" onClick={() => onView('brief')} />
        <SidebarButton active={view === 'serp'} icon={<Search size={15} />} label="SERP" onClick={() => onView('serp')} />
        <SidebarButton active={view === 'sources'} icon={<BookOpen size={15} />} label="Sources" onClick={() => onView('sources')} />
        <SidebarButton active={view === 'internal-links'} icon={<Link2 size={15} />} label="Internal Links" onClick={() => onView('internal-links')} />
      </SidebarGroup>
      <SidebarGroup label="MANAGEMENT">
        <SidebarButton active={view === 'calendar'} icon={<CalendarDays size={15} />} label="Content Calendar" onClick={() => onView('calendar')} />
        <SidebarButton active={view === 'keywords'} icon={<Database size={15} />} label="Keyword Database" onClick={() => onView('keywords')} />
        <SidebarButton active={view === 'published'} icon={<Send size={15} />} label="Published Log" onClick={() => onView('published')} />
        <SidebarButton active={view === 'backlinks'} icon={<ExternalLink size={15} />} label="Backlink" onClick={() => onView('backlinks')} />
      </SidebarGroup>
    </aside>
  );
}

function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-2 text-[10px] font-black tracking-[0.18em] text-slate-600">{label}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SidebarButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-bold transition ${
        active ? 'bg-cyan-300 text-[#081018]' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
      }`}
    >
      {icon}{label}
    </button>
  );
}

function TodayReview({
  dailyPackage,
  selectedPlatform,
  feedback,
  publishedUrl,
  saving,
  message,
  onPlatform,
  onFeedback,
  onPublishedUrl,
  onReview,
  onPublished,
  onCopy,
}: {
  dailyPackage: StudioPackage;
  selectedPlatform: StudioPlatformId;
  feedback: string;
  publishedUrl: string;
  saving: boolean;
  message: string;
  onPlatform: (platform: StudioPlatformId) => void;
  onFeedback: (value: string) => void;
  onPublishedUrl: (value: string) => void;
  onReview: (status: Exclude<ReviewStatus, 'PUBLISHED'>) => Promise<void>;
  onPublished: () => Promise<void>;
  onCopy: (text: string, label: string) => Promise<void>;
}) {
  const document = platformDocument(dailyPackage, selectedPlatform);
  const status = platformReviewStatus(dailyPackage, selectedPlatform);
  const score = qualityScore(document);
  const sourceText = dailyPackage.files['09-sources.md'] ?? '';
  const missingSourceWarning = status !== 'HOLD' && sourceText.trim().length < 30;

  return (
    <div className="space-y-6">
      <BriefStrip dailyPackage={dailyPackage} />

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Daily review</p>
            <h2 className="mt-1 text-xl font-black">플랫폼별 검토 상태</h2>
          </div>
          <div className="text-xs text-slate-500">카드를 선택하면 아래에서 실제 원고를 검토합니다.</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PLATFORM_DEFINITIONS.map((definition) => {
            const hasFile = Boolean(dailyPackage.files[definition.fileName]);
            const platformStatus = hasFile ? platformReviewStatus(dailyPackage, definition.id) : 'HOLD';
            const platformDoc = platformDocument(dailyPackage, definition.id);
            const platformScore = qualityScore(platformDoc);
            const draftAction = platformDoc.fields.ACTION || platformDoc.fields.STATUS || 'PENDING';
            return (
              <button
                key={definition.id}
                type="button"
                onClick={() => onPlatform(definition.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedPlatform === definition.id
                    ? 'border-cyan-300/70 bg-cyan-300/[0.07]'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/20'
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-2">
                  <span className="text-sm font-black">{definition.label}</span>
                  <StatusBadge status={platformStatus} />
                </div>
                <div className="line-clamp-2 min-h-10 text-[13px] font-bold text-slate-300">
                  {hasFile ? platformTitle(platformDoc, definition.id) : '원고 파일 없음'}
                </div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">{draftAction}</div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Quality {platformScore ?? '—'} / 100</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1119]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black">
              {PLATFORM_DEFINITIONS.find((item) => item.id === selectedPlatform)?.label}
            </h2>
            <StatusBadge status={status} />
            <ScoreBadge score={score} />
          </div>
          {score !== null && score < 80 ? (
            <div className="flex items-center gap-2 text-xs font-black text-rose-300">
              <AlertTriangle size={15} /> NOT READY TO PUBLISH
            </div>
          ) : null}
        </div>

        <div className="p-4 md:p-6">
          {missingSourceWarning ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 shrink-0" size={17} />
              <span>발행 후보인데 `09-sources.md`가 비어 있습니다. 시험 사실이 있다면 승인 전에 출처를 추가하세요.</span>
            </div>
          ) : null}

          {selectedPlatform === 'blog' ? (
            <BlogReview dailyPackage={dailyPackage} document={document} onCopy={onCopy} />
          ) : (
            <ExternalPreview
              platform={selectedPlatform}
              packageDate={dailyPackage.date}
              document={document}
              onCopy={onCopy}
            />
          )}

          <ReviewControls
            platform={selectedPlatform}
            status={status}
            feedback={feedback}
            publishedUrl={publishedUrl}
            saving={saving}
            message={message}
            onFeedback={onFeedback}
            onPublishedUrl={onPublishedUrl}
            onReview={onReview}
            onPublished={onPublished}
          />
        </div>
      </section>
    </div>
  );
}

function BriefStrip({ dailyPackage }: { dailyPackage: StudioPackage }) {
  const fields = packageDocument(dailyPackage, '00-daily-brief.md').fields;
  const items = [
    ['Primary Keyword', fields['PRIMARY KEYWORD']],
    ['Intent', fields['SEARCH INTENT']],
    ['Demand', fields['DEMAND SIGNAL']],
    ['Priority', fields.PRIORITY],
    ['Coverage', fields['CURRENT QUESTDP COVERAGE']],
    ['SERP Pattern', fields['TOP SERP PATTERNS']],
    ['Decision', fields.ACTION],
    ['Cannibalization', fields.CANNIBALIZATION],
  ];
  return (
    <section className="rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-cyan-300/[0.07] to-violet-400/[0.05] p-5">
      <p className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">Why are we writing this?</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
            <div className="mt-1 text-[13px] font-black text-slate-200">{value || '미입력'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlogReview({
  dailyPackage,
  document,
  onCopy,
}: {
  dailyPackage: StudioPackage;
  document: ParsedDocument;
  onCopy: (text: string, label: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'content' | 'preview'>('content');
  const [viewport, setViewport] = useState<PreviewViewport>('mobile');
  const slug = targetBlogSlug(document);
  const post = slug ? findPostBySlug(slug) : undefined;
  const previewWidth = viewport === 'mobile' ? 390 : viewport === 'tablet' ? 820 : 1280;
  const sources = dailyPackage.files['09-sources.md'] ?? '';

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
          <ModeButton active={mode === 'content'} label="Content Mode" onClick={() => setMode('content')} />
          <ModeButton active={mode === 'preview'} label="Real Preview" onClick={() => setMode('preview')} />
        </div>
        <button
          type="button"
          onClick={() => onCopy(document.raw, 'QuestDP Blog 검토 파일')}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-cyan-300/40"
        >
          <Clipboard size={14} /> 검토 파일 복사
        </button>
      </div>

      {mode === 'content' ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <MetadataGrid document={document} post={post} />
            {post ? <BlogContentInspector post={post} /> : (
              <TextPanel eyebrow="Draft" title="Repository Blog 데이터 없음" text={document.raw || '01-questdp-blog.md가 비어 있습니다.'} compact />
            )}
          </div>
          <aside className="space-y-4">
            <TextCard title="Internal Links" text={document.fields['INTERNAL LINKS ADDED'] || collectInternalLinks(post).join('\n') || '미입력'} />
            <TextCard title="Sources" text={document.fields.SOURCES || sources || '미입력'} warn={!sources.trim()} />
            <TextCard title="CTA" text={collectCtas(post).join('\n') || '미입력'} />
            <QualityScorePanel document={document} />
          </aside>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
              <ViewportButton active={viewport === 'mobile'} icon={<Smartphone size={14} />} label="Mobile" onClick={() => setViewport('mobile')} />
              <ViewportButton active={viewport === 'tablet'} icon={<Tablet size={14} />} label="Tablet" onClick={() => setViewport('tablet')} />
              <ViewportButton active={viewport === 'desktop'} icon={<Monitor size={14} />} label="Desktop" onClick={() => setViewport('desktop')} />
            </div>
            <span className="text-xs text-slate-500">{previewWidth}px viewport · 실제 Blog route iframe</span>
          </div>
          {slug && post ? (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#05070b] p-3">
              <iframe
                title={`${post.title} ${viewport} preview`}
                src={`/blog/${encodeURI(slug)}/?seoStudioPreview=1`}
                style={{ width: previewWidth, height: 900 }}
                className="mx-auto block max-w-none rounded-lg border-0 bg-white"
              />
            </div>
          ) : (
            <ErrorState message="TARGET URL에 연결된 실제 QuestDP Blog 글을 찾을 수 없습니다. CREATE 작업이라면 repository 구현을 먼저 완료해야 합니다." />
          )}
        </div>
      )}
    </div>
  );
}

function MetadataGrid({ document, post }: { document: ParsedDocument; post?: BlogPost }) {
  const values = [
    ['Primary Keyword', document.fields['PRIMARY KEYWORD'] || post?.primaryKeyword],
    ['Secondary Keywords', document.fields['SECONDARY KEYWORDS']],
    ['Search Intent', document.fields['SEARCH INTENT']],
    ['Action', document.fields.ACTION],
    ['Title', document.fields.TITLE || post?.title],
    ['Meta Description', document.fields['META DESCRIPTION'] || post?.metaDescription],
    ['H1', document.fields.H1 || post?.title],
    ['Target URL', document.fields['TARGET URL']],
  ];
  return (
    <section className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
      {values.map(([label, value]) => (
        <div key={label} className="bg-[#10151f] p-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</div>
          <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">{value || '미입력'}</div>
        </div>
      ))}
    </section>
  );
}

function QualityScorePanel({ document }: { document: ParsedDocument }) {
  const fields = [
    ['Search Intent', 'SEARCH INTENT MATCH'],
    ['Information', 'INFORMATION QUALITY'],
    ['Original Value', 'ORIGINAL VALUE'],
    ['Search Demand', 'SEARCH DEMAND'],
    ['Readability', 'READABILITY'],
    ['QuestDP', 'QUESTDP RELEVANCE'],
    ['Platform Fit', 'PLATFORM FIT'],
  ] as const;
  const total = qualityScore(document);
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">SEO Content Score</h3>
        <ScoreBadge score={total} />
      </div>
      <div className="mt-3 space-y-2">
        {fields.map(([label, key]) => (
          <div key={key} className="flex justify-between gap-4 text-xs">
            <span className="text-slate-500">{label}</span>
            <span className="font-bold text-slate-300">{document.fields[key] || '—'}</span>
          </div>
        ))}
      </div>
      {total !== null && total < 80 ? <div className="mt-3 rounded-lg bg-rose-400/10 px-3 py-2 text-center text-[10px] font-black text-rose-300">NOT READY TO PUBLISH</div> : null}
    </section>
  );
}

function BlogContentInspector({ post }: { post: BlogPost }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.025] p-5 md:p-7">
      <div className="mb-6 border-b border-white/10 pb-5">
        <div className="text-[11px] font-black uppercase tracking-wider text-cyan-300">전체 본문 · Repository source</div>
        <h2 className="mt-2 text-2xl font-black leading-tight">{post.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{post.subtitle}</p>
      </div>
      <div className="space-y-4">
        {post.blocks.map((block, index) => <InspectorBlock key={`${block.kind}-${index}`} block={block} />)}
      </div>
      {post.faqs?.length ? (
        <section className="mt-8 border-t border-white/10 pt-6">
          <h3 className="mb-4 text-lg font-black">FAQ</h3>
          <div className="space-y-3">
            {post.faqs.map((faq) => (
              <div key={faq.q} className="rounded-lg border border-white/10 p-4">
                <div className="font-black">Q. {faq.q}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function InspectorBlock({ block }: { block: BlogBlock }) {
  if (block.kind === 'h2') return <h3 className="pt-5 text-xl font-black">{block.text}</h3>;
  if (block.kind === 'h3') return <h4 className="pt-3 text-base font-black text-slate-200">{block.text}</h4>;
  if (block.kind === 'p') return <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-300">{block.text}</p>;
  if (block.kind === 'ul' || block.kind === 'ol') {
    const List = block.kind;
    return <List className="space-y-2 pl-5 text-sm leading-6 text-slate-300">{block.items.map((item) => <li key={item}>{item}</li>)}</List>;
  }
  if (block.kind === 'callout') {
    return <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.05] p-4"><strong>{block.title}</strong><p className="mt-2 text-sm leading-6 text-slate-300">{block.body}</p></div>;
  }
  if (block.kind === 'table') {
    return (
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="bg-white/[0.06]"><tr>{block.headers.map((header) => <th key={header} className="p-3">{header}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, index) => <tr key={index} className="border-t border-white/10">{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 align-top text-slate-300">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  if (block.kind === 'quote') return <blockquote className="border-l-2 border-cyan-300 pl-4 text-slate-300">{block.text}</blockquote>;
  return <div className="rounded-lg bg-orange-400 px-4 py-3 text-sm font-black text-[#171006]">CTA · {block.label} → {block.href}</div>;
}

function ExternalPreview({
  platform,
  packageDate,
  document,
  onCopy,
}: {
  platform: Exclude<StudioPlatformId, 'blog'>;
  packageDate: string;
  document: ParsedDocument;
  onCopy: (text: string, label: string) => Promise<void>;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const title = platformTitle(document, platform);
  const body = document.fields.BODY || document.fields['PRIMARY POST'] || document.fields.POST || document.raw;
  const slides = instagramSlides(document);
  const assets = instagramAssets(document);

  if (document.fields.STATUS?.trim().toUpperCase() === 'HOLD') {
    return (
      <div className="rounded-2xl border border-slate-500/30 bg-slate-500/[0.06] p-7 text-center">
        <Pause className="mx-auto text-slate-400" size={26} />
        <h3 className="mt-3 text-lg font-black">STATUS: HOLD</h3>
        <p className="mx-auto mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-slate-400">{document.fields.REASON || '이번 Keyword와 플랫폼의 적합성이 낮습니다.'}</p>
      </div>
    );
  }

  if (platform === 'naver') {
    return (
      <div className="mx-auto max-w-[760px] rounded-2xl bg-white p-6 text-[#222] shadow-2xl md:p-10">
        <div className="mb-6 text-xs font-bold text-[#03c75a]">NAVER BLOG READING PREVIEW</div>
        <h3 className="text-2xl font-black leading-tight">{title}</h3>
        <div className="mt-2 text-sm text-slate-500">썸네일 · {document.fields['THUMBNAIL TEXT'] || '미입력'}</div>
        <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-2"><span><strong>검색 Keyword</strong><br />{document.fields['TARGET KEYWORD'] || '미입력'}</span><span><strong>QuestDP Link</strong><br />{document.fields['LINK TARGET'] || document.fields['QUESTDP LINK'] || '미입력'}</span></div>
        <div className="mt-8 whitespace-pre-wrap text-[15px] leading-8">{body}</div>
        <div className="mt-8 rounded-xl bg-slate-50 p-4 text-sm"><strong>추천 이미지 위치</strong><div className="mt-2 whitespace-pre-wrap text-slate-600">{document.fields['RECOMMENDED IMAGE LOCATIONS'] || '미입력'}</div></div>
        <div className="mt-5 text-sm text-slate-600">Tags · {document.fields.TAGS || '미입력'}</div>
        <CopyRow onCopy={() => onCopy(title, 'Naver 제목')} onCopyBody={() => onCopy(body, 'Naver 본문')} />
      </div>
    );
  }

  if (platform === 'threads') {
    return (
      <div className="mx-auto max-w-[600px] rounded-3xl border border-white/15 bg-black p-6 shadow-2xl md:p-8">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-white font-black text-black">Q</div><div><div className="font-black">QuestDP</div><div className="text-xs text-slate-500">@questdp</div></div></div>
        <div className="mt-6 whitespace-pre-wrap text-[16px] leading-7">{document.fields['PRIMARY POST'] || body}</div>
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500"><span>{(document.fields['PRIMARY POST'] || body).length}자</span><span>Keyword · {document.fields['TARGET KEYWORD'] || '미입력'}</span><span>Link · {document.fields['QUESTDP LINK'] || '미입력'}</span></div>
        <CopyRow onCopy={() => onCopy(document.fields['PRIMARY POST'] || body, 'Threads 원고')} />
      </div>
    );
  }

  if (platform === 'instagram') {
    const slideCount = assets.length || slides.length;
    const safeIndex = Math.min(slideIndex, Math.max(0, slideCount - 1));
    const asset = assets[safeIndex];
    const assetUrl = asset
      ? `/__seo-studio/asset?date=${encodeURIComponent(packageDate)}&file=${encodeURIComponent(asset)}`
      : '';
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,520px)_minmax(0,1fr)]">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#08152a] via-[#172a4d] to-[#4d286d] shadow-2xl">
            {assetUrl ? (
              <img
                src={assetUrl}
                alt={slides[safeIndex] || `QuestDP Instagram carousel slide ${safeIndex + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col justify-between p-12">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">QuestDP · Slide {safeIndex + 1}</div>
                <div className="whitespace-pre-wrap text-center text-3xl font-black leading-tight">{slides[safeIndex] || 'SLIDE 원고 미입력'}</div>
                <div className="text-center text-xs text-white/60">{safeIndex + 1} / {Math.max(slideCount, 1)}</div>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button type="button" aria-label="Previous slide" disabled={safeIndex === 0} onClick={() => setSlideIndex((index) => Math.max(0, index - 1))} className="rounded-full border border-white/10 p-2 text-slate-300 disabled:opacity-25"><ChevronLeft size={15} /></button>
            <div className="flex gap-2">{Array.from({ length: slideCount }, (_, index) => <button key={index} type="button" aria-label={`Slide ${index + 1}`} onClick={() => setSlideIndex(index)} className={`h-2.5 w-2.5 rounded-full ${safeIndex === index ? 'bg-cyan-300' : 'bg-white/20'}`} />)}</div>
            <button type="button" aria-label="Next slide" disabled={safeIndex >= slideCount - 1} onClick={() => setSlideIndex((index) => Math.min(slideCount - 1, index + 1))} className="rounded-full border border-white/10 p-2 text-slate-300 disabled:opacity-25"><ChevronRight size={15} /></button>
          </div>
        </div>
        <div className="space-y-4">
          <TextCard title="Caption" text={document.fields.CAPTION || '미입력'} />
          <TextCard title="Alt Text" text={document.fields['ALT TEXT'] || '미입력'} />
          <TextCard title="Hashtags" text={document.fields.HASHTAGS || '미입력'} />
          <TextCard title="CTA / URL" text={`${document.fields.CTA || '미입력'}\n${document.fields['QUESTDP URL'] || ''}`} />
          <button type="button" onClick={() => onCopy(document.fields.CAPTION || '', 'Instagram Caption')} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold"><Clipboard size={14} /> Caption 복사</button>
        </div>
      </div>
    );
  }

  if (platform === 'community') {
    return <TextPanel eyebrow="Community" title={document.fields.PLATFORM || 'Community Opportunities'} text={document.raw || 'NO ACTION TODAY'} />;
  }

  if (platform === 'linkedin') {
    return (
      <div className="mx-auto max-w-[680px] rounded-2xl bg-white p-7 text-[#1f2328] shadow-2xl md:p-9">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#0a66c2] font-black text-white">Q</div><div><div className="font-black">QuestDP</div><div className="text-xs text-slate-500">Product · Education</div></div></div>
        <div className="mt-5 rounded-lg bg-[#f3f6f8] p-4 text-sm"><strong>Product / Business Angle</strong><p className="mt-1 text-slate-600">{document.fields['PRODUCT / BUSINESS ANGLE'] || '미입력'}</p></div>
        <div className="mt-6 whitespace-pre-wrap text-[15px] leading-7">{document.fields.POST || body}</div>
        <div className="mt-6 text-sm text-[#0a66c2]">{document.fields.CTA || 'CTA 미입력'} · {document.fields['QUESTDP LINK'] || 'Link 미입력'}</div>
        <CopyRow onCopy={() => onCopy(document.fields.POST || body, 'LinkedIn 원고')} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-9">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{platform}</div>
      <h3 className="mt-3 text-2xl font-black">{title}</h3>
      <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
        {[
          ['Keyword', document.fields['TARGET KEYWORD']],
          ['Unique Angle', document.fields['UNIQUE ANGLE'] || document.fields.REASON],
          ['QuestDP Link', document.fields['QUESTDP LINK']],
        ].map(([label, value]) => <div key={label} className="bg-[#10151f] p-4"><div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-sm text-slate-300">{value || '미입력'}</div></div>)}
      </div>
      <div className="mt-7 whitespace-pre-wrap text-[15px] leading-8 text-slate-300">{body}</div>
      <div className="mt-7 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] p-4">
        <div className="text-xs font-black uppercase tracking-wider text-violet-200">Why this does not duplicate QuestDP Blog</div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{document.fields['WHY THIS DOES NOT DUPLICATE QUESTDP BLOG'] || document.fields['UNIQUE ANGLE'] || '미입력'}</p>
      </div>
      <CopyRow onCopy={() => onCopy(title, `${platform} 제목`)} onCopyBody={() => onCopy(body, `${platform} 본문`)} />
    </div>
  );
}

function ReviewControls({
  platform,
  status,
  feedback,
  publishedUrl,
  saving,
  message,
  onFeedback,
  onPublishedUrl,
  onReview,
  onPublished,
}: {
  platform: StudioPlatformId;
  status: ReviewStatus;
  feedback: string;
  publishedUrl: string;
  saving: boolean;
  message: string;
  onFeedback: (value: string) => void;
  onPublishedUrl: (value: string) => void;
  onReview: (status: Exclude<ReviewStatus, 'PUBLISHED'>) => Promise<void>;
  onPublished: () => Promise<void>;
}) {
  return (
    <section className="mt-8 border-t border-white/10 pt-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <label htmlFor="studio-feedback" className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">수정 의견</label>
          <textarea
            id="studio-feedback"
            value={feedback}
            onChange={(event) => onFeedback(event.target.value)}
            rows={5}
            placeholder="도입부를 더 짧게. 모바일 표 폭 확인. CTA 하나 제거..."
            className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton icon={<Check size={15} />} label="APPROVE" disabled={saving} onClick={() => onReview('APPROVED')} tone="approve" />
            <ActionButton icon={<RefreshCcw size={15} />} label="REQUEST REVISION" disabled={saving} onClick={() => onReview('NEEDS_REVISION')} tone="revise" />
            <ActionButton icon={<Pause size={15} />} label="HOLD" disabled={saving} onClick={() => onReview('HOLD')} tone="hold" />
            {saving ? <LoaderCircle className="animate-spin text-slate-400" size={18} /> : null}
          </div>
          {message ? <p className="mt-3 text-sm font-bold text-cyan-200">{message}</p> : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-black"><ExternalLink size={15} /> 게시 기록</div>
          {platform === 'blog' ? (
            <p className="mt-3 text-sm leading-6 text-slate-400">Blog는 승인 후 CODE GENERATED → DESIGN REVIEWED → TEST → DEPLOY 순서로 처리합니다.</p>
          ) : (
            <>
              <input
                value={publishedUrl}
                onChange={(event) => onPublishedUrl(event.target.value)}
                placeholder="https://게시된-URL"
                className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/40"
              />
              <button
                type="button"
                disabled={saving || status !== 'APPROVED'}
                onClick={onPublished}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-black text-[#071016] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Send size={15} /> 게시 완료 + Log 기록
              </button>
              {status !== 'APPROVED' && status !== 'PUBLISHED' ? <p className="mt-2 text-xs text-slate-600">승인된 원고만 게시 기록할 수 있습니다.</p> : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function BriefPanel({ dailyPackage }: { dailyPackage: StudioPackage }) {
  const document = packageDocument(dailyPackage, '00-daily-brief.md');
  return (
    <div className="space-y-5">
      <BriefStrip dailyPackage={dailyPackage} />
      <TextPanel eyebrow="Keyword Brief" title={document.fields['PRIMARY KEYWORD'] || '미입력'} text={document.raw || '00-daily-brief.md가 비어 있습니다.'} />
    </div>
  );
}

function SourcesPanel({ dailyPackage }: { dailyPackage: StudioPackage }) {
  const raw = dailyPackage.files['09-sources.md'] ?? '';
  return <TextPanel eyebrow="Evidence" title="Sources" text={raw || '09-sources.md가 비어 있습니다.'} />;
}

function InternalLinksPanel({ dailyPackage }: { dailyPackage: StudioPackage }) {
  const document = platformDocument(dailyPackage, 'blog');
  const slug = targetBlogSlug(document);
  const post = slug ? findPostBySlug(slug) : undefined;
  const links = document.fields['INTERNAL LINKS ADDED'] || collectInternalLinks(post).join('\n');
  return <TextPanel eyebrow="SEO" title="Internal Links" text={links || '내부 링크가 입력되지 않았습니다.'} />;
}

function ManagementTable({ title, raw }: { title: string; raw: string }) {
  const rows = parseCsv(raw);
  if (rows.length === 0) return <TextPanel eyebrow="Management" title={title} text="기록이 없습니다." />;
  const [headers, ...body] = rows;
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1119]">
      <div className="border-b border-white/10 p-5"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">Management</p><h2 className="mt-1 text-xl font-black">{title}</h2><p className="mt-1 text-xs text-slate-500">{body.length} rows</p></div>
      <div className="max-h-[72vh] overflow-auto">
        <table className="min-w-max w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#141a25] text-slate-300"><tr>{headers.map((header) => <th key={header} className="border-b border-white/10 px-3 py-3 font-black">{header}</th>)}</tr></thead>
          <tbody>{body.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-white/[0.06] hover:bg-white/[0.025]">{headers.map((_, cellIndex) => <td key={cellIndex} className="max-w-[300px] whitespace-pre-wrap px-3 py-3 align-top text-slate-400">{row[cellIndex] || ''}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function TextPanel({ eyebrow, title, text, compact = false }: { eyebrow: string; title: string; text: string; compact?: boolean }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#0d1119] ${compact ? 'p-5' : 'p-6 md:p-8'}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black md:text-2xl">{title}</h2>
      <pre className="mt-5 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">{text}</pre>
    </section>
  );
}

function TextCard({ title, text, warn = false }: { title: string; text: string; warn?: boolean }) {
  return (
    <section className={`rounded-xl border p-4 ${warn ? 'border-amber-400/25 bg-amber-400/[0.06]' : 'border-white/10 bg-black/20'}`}>
      <h3 className={`text-xs font-black uppercase tracking-wider ${warn ? 'text-amber-200' : 'text-slate-400'}`}>{title}</h3>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{text}</p>
    </section>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`rounded-full border px-2 py-1 text-[9px] font-black tracking-wider ${STATUS_STYLES[status]}`}>{status.replace('_', ' ')}</span>;
}

function ScoreBadge({ score }: { score: number | null }) {
  const color = score === null ? 'text-slate-500' : score >= 80 ? 'text-emerald-300' : 'text-rose-300';
  return <span className={`text-xs font-black ${color}`}>Quality {score ?? '—'} / 100</span>;
}

function ModeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg px-3 py-2 text-xs font-black ${active ? 'bg-white text-black' : 'text-slate-400'}`}>{label}</button>;
}

function ViewportButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black ${active ? 'bg-cyan-300 text-[#081018]' : 'text-slate-400'}`}>{icon}{label}</button>;
}

function ActionButton({ icon, label, disabled, onClick, tone }: { icon: React.ReactNode; label: string; disabled: boolean; onClick: () => void; tone: 'approve' | 'revise' | 'hold' }) {
  const style = tone === 'approve' ? 'bg-emerald-400 text-[#07140d]' : tone === 'revise' ? 'bg-rose-400 text-[#170709]' : 'border border-white/15 text-slate-300';
  return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-black disabled:opacity-40 ${style}`}>{icon}{label}</button>;
}

function CopyRow({ onCopy, onCopyBody }: { onCopy: () => void; onCopyBody?: () => void }) {
  return <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 text-xs font-black"><Clipboard size={14} /> {onCopyBody ? '제목 복사' : '복사'}</button>{onCopyBody ? <button type="button" onClick={onCopyBody} className="inline-flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 text-xs font-black"><Clipboard size={14} /> 본문 복사</button> : null}</div>;
}

function LoadingState() {
  return <div className="grid min-h-[50vh] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-slate-400"><LoaderCircle className="animate-spin" size={20} /> Content Studio 불러오는 중</div></div>;
}

function EmptyPackageState() {
  return (
    <section className="mx-auto mt-16 max-w-2xl rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
      <BookOpen className="mx-auto text-slate-500" size={30} />
      <h2 className="mt-4 text-xl font-black">검토할 Daily Package가 없습니다</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">`seo-ops/04-daily-content/YYYY-MM-DD/`가 생성되면 새로고침 없이 다음 실행부터 날짜 선택 목록에 표시됩니다.</p>
      <div className="mt-5 rounded-xl bg-black/20 p-4 font-mono text-sm text-cyan-200">내일 SEO Daily Package 생성해줘.</div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.07] p-5 text-sm font-bold text-rose-200"><AlertTriangle className="mr-2 inline" size={17} />{message}</div>;
}

function collectInternalLinks(post?: BlogPost): string[] {
  if (!post) return [];
  const source = JSON.stringify(post.blocks);
  const links = [...source.matchAll(/\]\((\/(?!\/)[^)]+)\)/g)].map((match) => match[1]);
  return [...new Set(links)];
}

function collectCtas(post?: BlogPost): string[] {
  if (!post) return [];
  return post.blocks
    .filter((block): block is Extract<BlogBlock, { kind: 'cta' }> => block.kind === 'cta')
    .map((block) => `${block.label} → ${block.href}`);
}
