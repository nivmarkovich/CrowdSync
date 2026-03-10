import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { useMockData } from "@/context/MockDataContext"
import { useLocalCrate } from "@/context/LocalCrateContext"
import { guess } from "web-audio-beat-detector"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Toaster, toast } from "sonner"
import {
  BarChart3,
  ListMusic,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Music,
  Zap,
  Play,
  Pause,
  X,
  Link2,
  Upload,
  AlertTriangle,
  ArrowDown,
  Check,
  Loader2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Dna,
  ListVideo,
  FlaskConical,
  Radio,
  Settings,
  Activity,
  Flame,
  LayoutList,
  PlayCircle,
  SkipForward,
  SkipBack,
  QrCode,
  Users,
  RefreshCw,
  FolderOpen,
  ListOrdered
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

// ─── Types ────────────────────────────────────────────────────────────────────

const camelotWheel = [
  "1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B",
  "7A", "7B", "8A", "8B", "9A", "9B", "10A", "10B", "11A", "11B", "12A", "12B"
];

const FAMOUS_ARTISTS = [
  "Calvin Harris", "Drake", "Rihanna", "Avicii", "David Guetta", "Tiesto", "The Weeknd", "Dua Lipa", "Eminem", "Bruno Mars",
  "Billie Eilish", "Ed Sheeran", "Justin Bieber", "Ariana Grande", "Bad Bunny", "Taylor Swift", "Post Malone", "Martin Garrix",
  "Skrillex", "Diplo", "DJ Snake", "Adele", "Beyonce", "Kanye West", "Kendrick Lamar", "Fisher", "Chris Lake", "Peggy Gou",
  "Fred again", "Oasis", "Coldplay", "Odesza", "Flume", "Disclosure", "Zedd", "Marshmello", "Kygo", "Afrojack", "Alesso",
  "Armin van Buuren", "Deadmau5", "Swedish House Mafia", "Dom Dolla", "John Summit", "Rüfüs Du Sol", "Gorgon City", "CamelPhat",
  "Illenium", "The Chainsmokers", "Major Lazer", "Eric Prydz", "Hardwell", "Steve Aoki", "Alan Walker", "Don Diablo", "Kaskade",
  "Dillon Francis", "Oliver Heldens", "Tchami", "Malaa", "Rezz", "Alison Wonderland", "Carl Cox", "Charlotte de Witte",
  "Amelie Lens", "Nina Kraviz", "Paul van Dyk", "Above & Beyond", "Daft Punk", "Justice", "R3hab", "W&W", "Galantis",
  "Timmy Trumpet", "Alok"
].map(a => a.toLowerCase());

function getCamelotDistance(key1: string, key2: string) {
  if (!key1 || !key2 || key1 === "N/A" || key2 === "N/A" || key1 === "Unknown" || key2 === "Unknown") return 999;

  const idx1 = camelotWheel.indexOf(key1.toUpperCase());
  const idx2 = camelotWheel.indexOf(key2.toUpperCase());

  if (idx1 === -1 || idx2 === -1) return 999;

  const num1 = parseInt(key1);
  const letter1 = key1.replace(/[0-9]/g, '').toUpperCase();
  const num2 = parseInt(key2);
  const letter2 = key2.replace(/[0-9]/g, '').toUpperCase();

  let dist = 0;
  // Penalty for major/minor change
  if (letter1 !== letter2) dist += 1;
  // Penalty for step distance on circle
  let stepDiff = Math.abs(num1 - num2);
  if (stepDiff > 6) stepDiff = 12 - stepDiff;
  dist += stepDiff;

  return dist;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "crowd-dna", label: "Crowd Intelligence", icon: Dna },
  { id: "setlist-builder", label: "Setlist Builder", icon: ListVideo },
  { id: "track-lab", label: "Track Lab", icon: FlaskConical },
  { id: "live-performance", label: "Live Performance", icon: Radio },
  { id: "integrations", label: "Integrations & Settings", icon: Settings },
]

function AppSidebar({
  activeView,
  onViewChange,
}: {
  activeView: string
  onViewChange: (view: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              CrowdSync
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              DJ Toolkit
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-green"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full rounded-xl py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  )
}


// ─── View 1: Crowd DNA Baseline ───────────────────────────────────────────────

function CrowdIntelligenceView() {
  const copyLink = () => {
    toast.success("Link copied to clipboard!");
  }

  const { localLibrary } = useLocalCrate()

  // Calculated real BPM stats from imported tracks
  const bpmStats = useMemo(() => {
    const bpms = localLibrary.map((t: any) => t.bpm || 0).filter((b: number) => b > 0);
    if (bpms.length === 0) return null;
    const min = Math.min(...bpms);
    const max = Math.max(...bpms);
    const avg = Math.round(bpms.reduce((a: number, b: number) => a + b, 0) / bpms.length);
    return { min, max, avg };
  }, [localLibrary]);

  // BPM-based genre heuristics
  const genreData = useMemo(() => {
    const total = localLibrary.filter((t: any) => (t.bpm || 0) > 0).length;
    if (total === 0) return [];
    const houseDisco = localLibrary.filter((t: any) => (t.bpm || 0) >= 120 && (t.bpm || 0) <= 125).length;
    const techHouse = localLibrary.filter((t: any) => (t.bpm || 0) >= 126 && (t.bpm || 0) <= 130).length;
    const techno = localLibrary.filter((t: any) => (t.bpm || 0) > 130).length;
    const other = total - houseDisco - techHouse - techno;
    const pct = (n: number) => Math.round((n / total) * 100);
    return [
      { label: 'Tech House (126-130)', val: pct(techHouse), color: 'bg-primary' },
      { label: 'House / Disco (120-125)', val: pct(houseDisco), color: 'bg-chart-2' },
      { label: 'Techno (131+)', val: pct(techno), color: 'bg-chart-4' },
      ...(other > 0 ? [{ label: 'Other', val: pct(other), color: 'bg-chart-3' }] : []),
    ].filter(g => g.val > 0);
  }, [localLibrary]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Dna className="w-6 h-6 text-primary" /> Crowd Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prepare your gig by analyzing the venue, cloning vibes, and collecting advance requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-Event Request Link */}
        <div className="glass rounded-3xl p-6 border border-border/50 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Pre-Event Request Link</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6 relative z-10">
            Share on Instagram Stories to collect crowd requests before the gig.
          </p>

          <div className="flex items-center gap-3 mb-6 relative z-10 mt-auto">
            <div className="flex-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl flex items-center gap-2 text-sm font-mono text-muted-foreground overflow-hidden">
              <span className="truncate">crowdsync.app/req/Friday_Mainstage</span>
            </div>
            <button onClick={copyLink} className="h-10 px-4 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors shrink-0">
              Copy Link
            </button>
          </div>

          <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 flex items-center justify-center gap-2 text-sm font-medium relative z-10">
            <span className="text-xl">📥</span> {localLibrary.length > 0 ? `${localLibrary.length} Tracks In Memory` : "Awaiting Live Server Connection"}
          </div>
        </div>

        {/* Vibe Cloning -> Local DNA Analysis */}
        <div className="glass rounded-3xl p-6 border border-border/50 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-chart-2/5 rounded-full blur-3xl group-hover:bg-chart-2/10 transition-colors"></div>

          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Dna className="w-5 h-5 text-chart-2" />
            <h2 className="text-lg font-bold text-foreground">Local DNA Analysis</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6 relative z-10">
            Calculate the aggregate energy and average BPM of your imported tracks.
          </p>

          <div className="flex gap-3 mt-auto relative z-10">
            <button
              onClick={() => {
                if (localLibrary.length === 0) {
                  toast.error("Local Library is empty!");
                  return;
                }
                const avgBpm = Math.round(localLibrary.reduce((sum: number, t: any) => sum + (t.bpm || 0), 0) / localLibrary.length);
                const computedVibe = avgBpm > 120 ? "High Energy ⚡" : "Chill Vibes 🌊";
                toast.success(`Local DNA Analyzed! Your crate has ${localLibrary.length} tracks with an average tempo of ${avgBpm} BPM. Vibe: ${computedVibe}`);
              }}
              className="h-10 w-full rounded-xl bg-chart-2 hover:bg-chart-2/90 text-black font-semibold transition-opacity whitespace-nowrap border border-chart-2/30"
            >
              Analyze Local Crate
            </button>
          </div>
        </div>
      </div>

      {/* Target Output Diagram */}
      <div className={`transition-all duration-1000 opacity-100 translate-y-0`}>
        <div className="glass rounded-3xl p-6 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <Dna className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-xl font-bold text-foreground">Calculated Crowd DNA Output</h2>
          </div>

          {localLibrary.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
              Import tracks to analyze crowd energy
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center items-center p-6 bg-card/50 rounded-2xl border border-border/50">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">BPM Range</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{bpmStats?.min ?? '—'}</span>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <span className="text-5xl font-bold text-primary drop-shadow-[0_0_15px_oklch(0.82_0.19_145/0.4)]">{bpmStats?.max ?? '—'}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-4 bg-secondary/50 px-3 py-1 rounded-full border border-border">Avg {bpmStats?.avg ?? '—'} BPM across {localLibrary.length} tracks</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Genre Heuristics (by BPM)</p>
                {genreData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No BPM data detected in imported tracks.</p>
                ) : (
                  <div className="space-y-4">
                    {genreData.map((genre, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-foreground">{genre.label}</span>
                          <span className="text-muted-foreground">{genre.val}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${genre.color} transition-all duration-1000 ease-out`}
                            style={{ width: `${genre.val}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function DashboardView() {
  const { localLibrary } = useLocalCrate()

  // 1. Calculate Real Metrics (v2)
  const mixPotential = useMemo(() => {
    if (localLibrary.length < 2) return 0;
    let pairs = 0;
    const sorted = [...localLibrary].sort((a, b) => (a.bpm || 0) - (b.bpm || 0));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].bpm && sorted[i + 1].bpm && Math.abs(sorted[i].bpm - sorted[i + 1].bpm) <= 2) {
        pairs++;
      }
    }
    return pairs;
  }, [localLibrary]);

  const tempoRange = useMemo(() => {
    if (localLibrary.length === 0) return { min: 0, max: 0 };
    const bpms = localLibrary.map((t: any) => t.bpm || 0).filter((b: number) => b > 0);
    if (bpms.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...bpms), max: Math.max(...bpms) };
  }, [localLibrary]);

  // 2. Tempo Distribution Chart Data
  const tempoData = useMemo(() => {
    const bins = [
      { range: '110-115', count: 0 },
      { range: '116-120', count: 0 },
      { range: '121-125', count: 0 },
      { range: '126-130', count: 0 },
      { range: '131+', count: 0 },
    ];

    localLibrary.forEach((t: any) => {
      const b = t.bpm || 0;
      if (b >= 110 && b <= 115) bins[0].count++;
      else if (b >= 116 && b <= 120) bins[1].count++;
      else if (b >= 121 && b <= 125) bins[2].count++;
      else if (b >= 126 && b <= 130) bins[3].count++;
      else if (b >= 131) bins[4].count++;
    });
    return bins;
  }, [localLibrary]);

  // 3. Crate Profile distribution
  const profileData = useMemo(() => {
    const total = localLibrary.length || 1;
    const highEnergy = localLibrary.filter((t: any) => (t.bpm || 0) >= 126).length;
    const midEnergy = localLibrary.filter((t: any) => (t.bpm || 0) < 126 && (t.bpm || 0) >= 118).length;
    const lowEnergy = localLibrary.filter((t: any) => (t.bpm || 0) < 118 && (t.bpm || 0) > 0).length;

    return [
      { label: 'High Peak (126+)', val: Math.round((highEnergy / total) * 100), color: 'bg-primary' },
      { label: 'Groove (118-125)', val: Math.round((midEnergy / total) * 100), color: 'bg-chart-2' },
      { label: 'Warmup (<118)', val: Math.round((lowEnergy / total) * 100), color: 'bg-chart-3' },
    ];
  }, [localLibrary]);

  // 4. Harmonic Profile Data
  const harmonicData = useMemo(() => {
    if (localLibrary.length === 0) return [];

    const keyCounts = localLibrary.reduce((acc: Record<string, number>, track: any) => {
      const key = track.key || track.camelot_key;
      if (key && typeof key === 'string' && key.trim() !== '') {
        const normalizedKey = key.trim().toUpperCase();
        acc[normalizedKey] = (acc[normalizedKey] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(keyCounts)
      .map(([key, count]) => ({ key, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }, [localLibrary]);

  // 5. Crate Integrity Data
  const crateIntegrity = useMemo(() => {
    const hasBpmCount = localLibrary.filter((t: any) => t.bpm && t.bpm > 0).length;
    const allAnalyzed = localLibrary.length > 0 && hasBpmCount === localLibrary.length;
    const highEnergyGems = localLibrary.filter((t: any) => (t.bpm || 0) > 128).length;

    // Find the max count of a single key
    const keyCounts: Record<string, number> = {};
    localLibrary.forEach((t: any) => {
      const k = t.key || t.camelot_key;
      if (k) {
        keyCounts[k] = (keyCounts[k] || 0) + 1;
      }
    });
    const maxKeyMatchCount = Object.keys(keyCounts).length > 0
      ? Math.max(...Object.values(keyCounts))
      : 0;

    return { allAnalyzed, highEnergyGems, maxKeyMatchCount };
  }, [localLibrary]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            DJ Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your performance, crowd matching and stats.
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
          <Activity className="w-3.5 h-3.5 mr-1" /> Live Sync Active
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-border/50 hover:border-primary/30 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
          <p className="text-sm font-medium text-muted-foreground relative z-10 flex items-center gap-2">
            <LayoutList className="w-4 h-4" /> Total Library Tracks
          </p>
          <div className="mt-4 relative z-10">
            <h2 className="text-4xl font-bold text-foreground">{localLibrary.length}</h2>
            <p className="text-xs text-primary mt-1">Ready for analysis</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-border/50 hover:border-chart-2/30 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-chart-2/10 rounded-full blur-2xl group-hover:bg-chart-2/20 transition-colors"></div>
          <p className="text-sm font-medium text-muted-foreground relative z-10 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Prime Mix Opportunities
          </p>
          <div className="mt-4 relative z-10">
            <h2 className="text-4xl font-bold text-foreground">{mixPotential}</h2>
            <p className="text-xs text-chart-2 mt-1">Pairs with &le; 2 BPM difference</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-border/50 hover:border-chart-3/30 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-chart-3/10 rounded-full blur-2xl group-hover:bg-chart-3/20 transition-colors"></div>
          <p className="text-sm font-medium text-muted-foreground relative z-10 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Tempo Range
          </p>
          <div className="mt-4 relative z-10">
            <h2 className="text-4xl font-bold text-foreground">{tempoRange.min}-{tempoRange.max}</h2>
            <p className="text-xs text-chart-3 mt-1">BPM spread in current crate</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart: Tempo Distribution */}
        <div className="glass rounded-2xl p-6 border border-border/50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">BPM Distribution</h3>
            <p className="text-xs text-muted-foreground mt-1">Count of tracks across BPM ranges</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" vertical={false} />
                <XAxis
                  dataKey="range"
                  stroke="oklch(0.5 0 0)"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="oklch(0.5 0 0)"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <RechartsTooltip
                  cursor={{ fill: 'oklch(0.2 0 0)' }}
                  contentStyle={{
                    backgroundColor: 'oklch(0.13 0 0)',
                    borderColor: 'oklch(0.25 0 0)',
                    borderRadius: '12px',
                    color: 'oklch(0.9 0 0)',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.82 0.19 145)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crate Profile sidebar */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Crate Profile</h3>
            <p className="text-xs text-muted-foreground mt-1">Energy distribution of your local tracks</p>
          </div>

          <div className="space-y-5">
            {profileData.map((energy, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-foreground">{energy.label}</span>
                  <span className="text-muted-foreground font-mono">{energy.val}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${energy.color} transition-all duration-1000`}
                    style={{ width: `${energy.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Harmonic Profile */}
        <div className="glass rounded-2xl p-6 border border-border/50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Harmonic Profile</h3>
            <p className="text-xs text-muted-foreground mt-1">Key distribution across your crate</p>
          </div>
          {localLibrary.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
              Import tracks to generate your harmonic profile
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={harmonicData} layout="vertical" margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="oklch(0.5 0 0)"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="key"
                    type="category"
                    stroke="oklch(0.5 0 0)"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    dx={-5}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'oklch(0.2 0 0)' }}
                    contentStyle={{
                      backgroundColor: 'oklch(0.13 0 0)',
                      borderColor: 'oklch(0.25 0 0)',
                      borderRadius: '12px',
                      color: 'oklch(0.9 0 0)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.65 0.25 10)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Crate Integrity Widget */}
        <div className="glass rounded-2xl p-6 border border-border/50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Crate Integrity</h3>
            <p className="text-xs text-muted-foreground mt-1">Library readiness and health</p>
          </div>

          <div className="flex flex-col gap-4 flex-1 justify-center">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", crateIntegrity.allAnalyzed ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                  {crateIntegrity.allAnalyzed ? <Check className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">BPM Analyzed</p>
                  <p className="text-xs text-muted-foreground">{crateIntegrity.allAnalyzed ? "All tracks ready" : "Analysis pending"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10 text-chart-2">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">High-Energy Gems</p>
                  <p className="text-xs text-muted-foreground">Tracks &gt; 128 BPM</p>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{crateIntegrity.highEnergyGems}</h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Mashup Ready</p>
                  <p className="text-xs text-muted-foreground">Highest shared harmonic key</p>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{crateIntegrity.maxKeyMatchCount}</h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── View 5: Live Performance ───────────────────────────────────────────────────

function LivePerformanceView({
  activeTrack,
  togglePlay,
  handleNextTrack,
  handlePrevTrack,
  formatTime,
  currentTime,
  setCurrentTime,
  duration,
  playingAudio,
  playingTrackId,
  playQueue
}: {
  activeTrack: any,
  togglePlay: (track: any) => void,
  handleNextTrack: () => void,
  handlePrevTrack: () => void,
  formatTime: (secs: number) => string,
  currentTime: number,
  setCurrentTime: (time: number) => void,
  duration: number,
  playingAudio: HTMLAudioElement | null,
  playingTrackId: string | null,
  playQueue: any[]
}) {
  const [vibe, setVibe] = useState<"harmonic" | "chillin" | "crazy">("chillin")
  const { localLibrary } = useLocalCrate()
  const { smartRequests: mockRequests, library } = useMockData()
  const [hiddenRequests, setHiddenRequests] = useState<Set<string>>(new Set())
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);

  // Vibe change toast
  useEffect(() => {
    if (vibe !== "chillin") {
      toast(`AI adjusting suggestions based on crowd vibe...`, {
        icon: <Sparkles className="w-4 h-4 text-primary" />,
      })
    }
  }, [vibe])

  // Suggested Tracks Logic
  const suggestedTracks = useMemo(() => {
    const trackSource = localLibrary && localLibrary.length > 0 ? localLibrary : library;
    if (!trackSource || trackSource.length === 0) return [];

    let filtered = [...trackSource];
    const activeTrackBpm = activeTrack?.bpm || 126;

    if (vibe === "crazy") {
      filtered = filtered.filter((t: any) => t.bpm && t.bpm >= activeTrackBpm + 3 && t.bpm <= activeTrackBpm + 10);
    } else if (vibe === "chillin") {
      filtered = filtered.filter((t: any) => t.bpm && t.bpm <= activeTrackBpm - 3 && t.bpm >= activeTrackBpm - 10);
    } else if (vibe === "harmonic") {
      filtered = filtered.filter((t: any) => t.bpm && Math.abs(t.bpm - activeTrackBpm) <= 1);
    }

    // Exclude the active track if it exists
    let matches = filtered.filter((t: any) => t.id !== activeTrack?.id);
    matches = matches.sort(() => Math.random() - 0.5);

    // Padding logic: ALWAYS return exactly 5 tracks
    if (matches.length < 5) {
      const remaining = [...trackSource]
        .filter((t: any) => t.id !== activeTrack?.id && !matches.find(m => m.id === t.id))
        .sort(() => Math.random() - 0.5);
      matches = [...matches, ...remaining.slice(0, 5 - matches.length)];
    }

    return matches.slice(0, 5).map((t: any, idx) => ({
      id: t.id || `mock-${idx}`,
      title: t.title,
      artist: t.artist,
      bpm: t.bpm || activeTrackBpm,
      key: t.camelot_key || t.key || "8A",
      file: t.file,
      image: `https://lastfm.freetls.fastly.net/i/u/300x300/${idx === 0 ? 'e9a28e75e53e4c4ba9414c19fe5dc62e' : idx === 1 ? '42e8cf3a88ba88f34dfbd5f0db2c6ba1' : '8d89e5fc6d5b4a8e99ab60aeb87ae199'}.png`
    }));
  }, [vibe, library, localLibrary, activeTrack])

  const handleActivateSession = () => {
    if (sessionActive) return;
    setTimeout(() => {
      // Pick 3 random tracks from localLibrary
      const source = localLibrary.length > 0 ? localLibrary : library;
      const shuffled = [...source].sort(() => Math.random() - 0.5);
      const selectedTracks = shuffled.slice(0, 3);

      const newRequests = selectedTracks.map((t: any) => ({
        id: `request-${Math.random().toString(36).substr(2, 9)}`,
        title: t.title,
        artist: t.artist,
        status: ['perfect', 'neutral', 'bad'][Math.floor(Math.random() * 3)],
        statusBadge: ['98% Match (Perfect Key)', '65% Match (Tempo Jump)', '12% Match (Vibe Killer)'][Math.floor(Math.random() * 3)]
      }));
      setSessionRequests(newRequests);
      setSessionActive(true);
      toast.success("Live Room Active! Audience connected.");
    }, 1000);
  };

  // Clear hidden requests when new mock data is injected
  useEffect(() => {
    setHiddenRequests(new Set())
  }, [mockRequests])

  const displayRequests = sessionActive
    ? sessionRequests.filter(req => !hiddenRequests.has(req.id))
    : [];

  const handleQueue = (id: string, title: string) => {
    setHiddenRequests(prev => new Set(prev).add(id))
    toast.success(`Track Queued: ${title}`, {
      icon: <Check className="w-4 h-4" />
    })
  }

  const handleDecline = (id: string) => {
    setHiddenRequests(prev => new Set(prev).add(id))
    toast(`Request Declined`, {
      icon: <X className="w-4 h-4" />
    })
  }

  const currentIndex = playQueue.findIndex(t => t.id === activeTrack?.id);
  const upNextTrack = (currentIndex !== -1 && currentIndex < playQueue.length - 1)
    ? playQueue[currentIndex + 1]
    : null;

  return (
    <div className={`flex flex-col gap-6 w-full h-full animate-in fade-in duration-500`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Radio className="w-8 h-8 text-destructive animate-pulse" /> Live Performance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gig mode active. Keep your eyes on the crowd.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 text-sm font-mono border-primary/30 text-primary bg-primary/10">
            01:45:22
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 text-sm border-chart-2/30 text-chart-2 bg-chart-2/10 flex items-center gap-2">
            <Radio className="w-4 h-4" /> ON AIR
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Side: Now Playing & Up Next */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden flex-1 border border-primary/20 shadow-[0_0_30px_oklch(0.82_0.19_145/0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>

            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-6 flex items-center gap-2 relative z-10">
              <PlayCircle className="w-5 h-5 fill-current" /> Now Playing
            </p>

            {!activeTrack ? (
              <div className="text-center text-muted-foreground relative z-10 py-12">
                <p className="text-xl font-medium mb-2">No Active Track</p>
                <p className="text-sm">Import your DJ Crate in the Track Lab to start playing.</p>
              </div>
            ) : (
              <>
                <div className={cn(
                  "relative group w-64 h-64 rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border-[12px] border-zinc-900 mb-8 relative z-10 flex items-center justify-center",
                  playingAudio && !playingAudio.paused ? "animate-[spin_4s_linear_infinite]" : ""
                )}>
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <div className="flex items-center gap-6">
                      <button onClick={handlePrevTrack} className="p-2 text-white/70 hover:text-white transition-colors">
                        <SkipBack className="w-8 h-8 fill-current" />
                      </button>
                      <button
                        onClick={() => togglePlay(activeTrack)}
                        className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {playingAudio && !playingAudio.paused ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                      </button>
                      <button onClick={handleNextTrack} className="p-2 text-white/70 hover:text-white transition-colors">
                        <SkipForward className="w-8 h-8 fill-current" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 mix-blend-overlay z-10 rounded-full" style={{ background: 'repeating-radial-gradient(#111 0px, #000 2px, #111 4px)' }}></div>
                  <div className="w-2/3 h-2/3 rounded-full z-20 border-4 border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {activeTrack.artwork ? (
                      <img src={activeTrack.artwork} alt={activeTrack.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-16 h-16 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="absolute w-6 h-6 bg-zinc-900 border-2 border-zinc-700 rounded-full z-30"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent mix-blend-overlay z-40 rounded-full"></div>
                </div>

                <div className="text-center relative z-10 w-full max-w-md">
                  <h2 className="text-4xl font-bold text-foreground mb-8 truncate">{activeTrack.title}</h2>

                  <div className="w-full max-w-md mx-auto mt-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-10 text-right font-mono">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          if (playingAudio) {
                            playingAudio.currentTime = Number(e.target.value);
                            setCurrentTime(Number(e.target.value));
                          }
                        }}
                        className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xs text-muted-foreground w-10 font-mono">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-8 flex items-center gap-4 text-xs font-mono text-muted-foreground relative z-10">
                  <Badge variant="secondary" className="bg-secondary/50 text-foreground">{activeTrack.bpm} BPM</Badge>
                  <Badge variant="secondary" className="bg-secondary/50 text-foreground">{activeTrack.key || activeTrack.camelot_key || "8A"}</Badge>
                </div>
              </>
            )}
          </div>

          <div className="glass rounded-2xl p-5 border border-border/50 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-secondary/50 border border-border shrink-0 flex items-center justify-center overflow-hidden relative group/next">
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 opacity-0 group-hover/next:opacity-100 transition-opacity">
                <SkipForward className="w-6 h-6 text-white" />
              </div>
              {upNextTrack?.artwork ? (
                <img src={upNextTrack.artwork} alt="Up Next Artwork" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-8 h-8 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-xs font-bold text-chart-2 tracking-widest uppercase mb-1">Up Next</p>
              <h3 className="text-lg font-semibold text-foreground truncate">
                {upNextTrack?.title || "End of Queue"}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-mono text-foreground">{upNextTrack?.bpm || "---"} BPM</p>
              <p className="text-xs font-mono text-muted-foreground">{upNextTrack?.key || upNextTrack?.camelot_key || "---"}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Preparation Readiness & Vibe Control */}
        <div className="flex flex-col gap-6">
          <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center border border-primary/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>

            <div className="text-center mb-8 relative z-10">
              <h3 className="text-lg font-bold text-primary">Gig Preparation</h3>
              <p className="text-xs text-muted-foreground mt-1 px-4">Your library is analyzed and ready for the floor. Focus on the energy.</p>
            </div>

            <div className="relative w-40 h-40 rounded-full flex items-center justify-center z-10">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute inset-2 bg-zinc-900 rounded-full border border-primary/30 flex flex-col items-center justify-center">
                <Dna className="w-12 h-12 text-primary mb-1" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Ready</span>
              </div>
            </div>

            <p className="mt-8 font-bold text-primary tracking-widest uppercase text-sm relative z-10">Library Insights</p>
          </div>

          <div className="glass rounded-2xl p-6 border border-border/50 flex flex-col flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Crowd Vibe Check
            </h3>

            <div className="flex flex-col gap-3 flex-1 justify-center">
              <button
                onClick={() => setVibe("crazy")}
                className={`flex-1 min-h-[60px] border flex items-center justify-center gap-3 font-semibold transition-all whitespace-nowrap px-4 py-2 text-sm rounded-full ${vibe === "crazy" ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_oklch(0.82_0.19_145/0.4)]" : "bg-card border-border text-muted-foreground hover:bg-secondary"}`}
              >
                <Flame className={`w-5 h-5 ${vibe === 'crazy' ? 'fill-current' : ''}`} /> Going Crazy
              </button>

              <button
                onClick={() => setVibe("chillin")}
                className={`flex-1 min-h-[60px] border flex items-center justify-center gap-3 font-semibold transition-all whitespace-nowrap px-4 py-2 text-sm rounded-full ${vibe === "chillin" ? "bg-chart-2 border-chart-2 text-chart-2-foreground shadow-[0_0_15px_oklch(0.82_0.17_80/0.4)] text-black" : "bg-card border-border text-muted-foreground hover:bg-secondary"}`}
              >
                <Activity className="w-5 h-5" /> Chillin
              </button>

              <button
                onClick={() => setVibe("harmonic")}
                className={`flex-1 min-h-[60px] border flex items-center justify-center gap-3 font-semibold transition-all whitespace-nowrap px-4 py-2 text-sm rounded-full ${vibe === "harmonic" ? "bg-chart-3 border-chart-3 text-white shadow-[0_0_15px_var(--color-chart-3)]" : "bg-card border-border text-muted-foreground hover:bg-secondary"}`}
              >
                <ArrowDown className="w-5 h-5" /> Harmonic Match
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Live Crowd Requests (Refined) */}
      <div className="glass rounded-3xl p-6 border border-border/50 h-auto min-h-fit flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Live Crowd Requests</h2>
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">3 New</Badge>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={handleActivateSession}
                className={cn(
                  "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border transition-all",
                  sessionActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-secondary hover:bg-secondary/80 text-foreground border-border/50 ring-2 ring-emerald-500/50 animate-[pulse_2s_ease-in-out_infinite]"
                )}
              >
                {sessionActive ? (
                  <>
                    <Check className="w-4 h-4" /> ✅ Session Active
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" /> Generate Booth QR
                  </>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border/50 glass">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">Crowd Requests Active</DialogTitle>
                <DialogDescription className="text-center">
                  Scan to request a track. AI will filter the bad ones.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-6 gap-6">
                <div className="p-4 bg-white rounded-xl shadow-2xl relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-colors rounded-xl -z-10"></div>
                  <QrCode className="w-48 h-48 text-black" />
                </div>
                <p className="text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg font-mono tracking-wider">
                  crowdsync.app/req/dj-niv
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative min-h-[400px] flex flex-col">
          {!sessionActive && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl border border-primary/10 p-12 text-center animate-in fade-in duration-500">
              <div className="flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Crowd Logic Locked</h3>
                  <p className="text-muted-foreground">
                    Connect your live room using the "Generate Booth QR" button to start receiving real-time audience requests.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", !sessionActive && "opacity-20 pointer-events-none")}>
            {displayRequests.length > 0 ? (
              displayRequests.map((req) => (
                <div key={req.id} className="bg-secondary/30 border border-border/50 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:bg-secondary/50 transition-colors">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${req.status === 'perfect' ? 'bg-primary/5' : req.status === 'neutral' ? 'bg-chart-2/5' : 'bg-destructive/5'} rounded-bl-full -z-10`}></div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1 pr-4 flex flex-col justify-center">
                      <h3 className="text-base font-bold text-foreground truncate whitespace-nowrap overflow-hidden">{req.title}</h3>
                    </div>
                    <Badge variant="outline" className={`${req.status === 'perfect' ? 'bg-primary/10 text-primary border-primary/20' : req.status === 'neutral' ? 'bg-chart-2/10 text-chart-2 border-chart-2/20 text-black' : 'bg-destructive/10 text-destructive border-destructive/20'} shrink-0 flex gap-1 items-center`}>
                      {req.status === 'perfect' && <Sparkles className="w-3 h-3" />}
                      {req.statusBadge}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-end mt-auto pt-2 border-t border-border/50">
                    <div className="flex gap-2">
                      {req.status === "bad" ? (
                        <>
                          <button onClick={() => handleDecline(req.id)} className="h-8 px-3 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
                            <X className="w-4 h-4" /> Decline
                          </button>
                          <button onClick={() => handleQueue(req.id, req.title)} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleDecline(req.id)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleQueue(req.id, req.title)} className={`h-8 px-3 rounded-full ${req.status === 'perfect' ? 'bg-primary/10 text-primary' : 'bg-secondary'} hover:bg-primary hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors`}>
                            <Check className="w-4 h-4" /> Queue
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty/Placeholder requests when active but no data
              <div className="col-span-full py-8 text-center text-muted-foreground italic">
                Awaiting incoming requests from the floor...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Co-Pilot Section */}
      <div className="glass rounded-3xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">AI Suggested Next Tracks</h2>
          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">Harmonic Match</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedTracks.length > 0 ? suggestedTracks.map((track, idx) => (
            <div key={idx} className="bg-secondary/30 border border-border/50 rounded-2xl p-4 flex items-center gap-4 group hover:bg-secondary/50 transition-colors">
              <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 rounded-md border border-zinc-700 flex items-center justify-center relative overflow-hidden">
                {track.image ? (
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:opacity-30 transition-opacity"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <Music className="w-6 h-6 text-zinc-400 group-hover:opacity-30 transition-opacity" />
                )}
                <button
                  onClick={() => togglePlay(track)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                >
                  {playingTrackId === track.id && playingAudio && !playingAudio.paused ? (
                    <Pause className="w-6 h-6 text-white fill-current" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5 fill-current" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-foreground truncate">{track.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-secondary/50 text-foreground text-[10px] px-1.5 py-0 border-border">{track.bpm} BPM</Badge>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[10px] px-1.5 py-0">{track.key}</Badge>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground col-span-3 text-center py-4">No suggestions found.</p>
          )}
        </div>
      </div>

      <div className="hidden">
        {/* Bangers and Emergency Logic Removed */}
      </div>
    </div>
  )
}

// ─── Setlist Builder View ───────────────────────────────────────────────────────

export function generateMixingOptions() {
  const techniques = [
    "Drop Swap: Phrase match 16 bars before. Swap the basslines exactly on the drop.",
    "Stem Mashup: Isolate the vocal (Acapella) of this track and loop it over the instrumental breakdown of the playing track.",
    "Outro to Intro (Classic): Standard EQ mix. Layer the 32-beat intro of this track over the 32-beat outro of the current track, slowly fading the lows.",
    "Wordplay / Cut-in: Echo out the current track on a key vocal phrase, and slam this track in right at the hook.",
    "Build-up Tease: Loop a 4-beat instrumental stem from this track during the current track's build-up to build tension before the drop.",
    "Vocal Intro: If this track starts with vocals, filter out the lows and bring it in right as the current track hits a quiet breakdown.",
    "Double Drop: Align the build-ups of both tracks so they hit the drop at the exact same time. Play the highs of track A and the lows of track B."
  ];
  return shuffleArray(techniques).slice(0, 2);
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function calculatePhraseTimes(bpm: number) {
  if (!bpm || bpm <= 0) return { bar16: '00:00', bar32: '00:00', raw32: 0 };
  const secondsPerBeat = 60 / bpm;
  const secondsPer16Bars = secondsPerBeat * 4 * 16;
  const secondsPer32Bars = secondsPerBeat * 4 * 32;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    bar16: formatTime(secondsPer16Bars),
    bar32: formatTime(secondsPer32Bars),
    raw32: secondsPer32Bars
  };
}

function TrackLabView({
  activeTrack,
  setActiveTrack,
  togglePlay,
  setPlayQueue
}: {
  activeTrack: any,
  setActiveTrack: (track: any) => void,
  togglePlay: (track: any) => void,
  setPlayQueue: (list: any[]) => void
}) {
  const { localLibrary, addToLocalLibrary, analyzeProgress, setAnalyzeProgress } = useLocalCrate()
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null)
  const [activeMashup, setActiveMashup] = useState<any | null>(null)

  // Mashup Integration States
  const [expandedMashupTrackId, setExpandedMashupTrackId] = useState<string | null>(null)
  const [isFetchingMashupUrl, setIsFetchingMashupUrl] = useState(false)
  const [mashupMatches, setMashupMatches] = useState<any[]>([])
  const [isShuffling, setIsShuffling] = useState(false)

  const fetchTrackAnalysis = async (track: any) => {
    setSelectedTrack(track)
    setExpandedMashupTrackId(null)
    setMashupMatches([])

    try {
      setSelectedAnalysis({
        bpm: track.bpm || "Unknown",
        key: track.key || "Unknown",
        rawKey: undefined,
        rawMode: undefined,
        matchScore: Math.floor(Math.random() * (98 - 75 + 1)) + 75,
        tempoFit: Math.floor(Math.random() * (98 - 75 + 1)) + 75,
        harmonicSynergy: Math.floor(Math.random() * (98 - 75 + 1)) + 75,
        crowdEnergy: Math.floor(Math.random() * (98 - 75 + 1)) + 75,
        genre: "Electronic"
      })
    } catch (err: any) {
      console.warn("Analysis Failed:", err)
      toast.error("Track analysis data unavailable.")
      setSelectedAnalysis(null)
    }
  }

  const handleFolderImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|aiff|flac|m4a)$/i));
    if (validFiles.length === 0) {
      toast.error("No valid audio files found in selection.");
      return;
    }

    setAnalyzeProgress({ current: 0, total: validFiles.length, analyzing: true });

    // Using a single AudioContext to prevent memory leaks
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const newLibrary: any[] = [];

    // Process sequentially to prevent browser crash from concurrent huge buffer allocations
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        let { bpm: detectedBpm } = await guess(audioBuffer);
        let finalBpm = Math.round(detectedBpm);

        // Double time signature correction for halftempo detected beats
        if (finalBpm > 0 && finalBpm < 70) {
          finalBpm = finalBpm * 2;
        }

        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";
        let title = nameWithoutExt;

        if (nameWithoutExt.includes('-')) {
          const parts = nameWithoutExt.split('-');
          artist = parts[0].trim();
          title = parts.slice(1).join('-').trim();
        }

        newLibrary.push({
          id: `local-${Math.random().toString(36).substr(2, 9)}`,
          title,
          artist,
          bpm: finalBpm || 128,
          filename: file.name,
          file: file
        });

      } catch (error) {
        console.warn(`Failed to analyze audio for ${file.name}`, error);
      }

      setAnalyzeProgress({ current: i + 1, total: validFiles.length, analyzing: true });
    }

    addToLocalLibrary(newLibrary);

    if (newLibrary.length > 0) {
      if (!activeTrack) {
        setActiveTrack(newLibrary[0]);
      }
      toast.success(`Imported and strictly analyzed ${newLibrary.length} tracks to your Local Crate!`);
    } else {
      toast.error("Failed to analyze any audio files.");
    }

    setAnalyzeProgress({ current: validFiles.length, total: validFiles.length, analyzing: false });
  };



  const handleFindMashupMatch = async (track: any, customTargetFeatures?: { bpm: number, rawKey?: number, rawMode?: number }) => {
    if (expandedMashupTrackId === track.id && !customTargetFeatures) {
      setExpandedMashupTrackId(null)
      return
    }

    setExpandedMashupTrackId(track.id)
    setIsFetchingMashupUrl(true)
    setMashupMatches([])

    try {
      let activeBpm: number;

      if (customTargetFeatures) {
        activeBpm = customTargetFeatures.bpm;
      } else if (selectedAnalysis && selectedAnalysis.bpm !== "Unknown" && selectedAnalysis.bpm !== "N/A") {
        activeBpm = Number(selectedAnalysis.bpm);
      } else {
        throw new Error("Requires a valid BPM to fetch mashups.");
      }

      let matches: any[] = [];

      if (localLibrary.length === 0) {
        throw new Error("Local Crate is empty. Please import a folder first.");
      }

      const rawMatches = localLibrary.filter(t =>
        Math.abs(t.bpm - activeBpm) <= 3 &&
        t.title !== track.name // Exclude the song from matching with itself
      );

      if (rawMatches.length > 0) {
        matches = rawMatches.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          image: "",
          bpm: t.bpm,
          key: "Unknown", // Local crate doesn't have key parsing yet
          mixingOptions: generateMixingOptions()
        }));
      }

      // Relevance Sorting & Harmonic Match Override
      const activeKey = selectedAnalysis?.key;

      matches.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        const artistA = (a.artist || "").toLowerCase();
        const artistB = (b.artist || "").toLowerCase();
        const titleA = (a.title || "").toLowerCase();
        const titleB = (b.title || "").toLowerCase();

        if (FAMOUS_ARTISTS.some(p => artistA.includes(p))) scoreA += 1000;
        if (FAMOUS_ARTISTS.some(p => artistB.includes(p))) scoreB += 1000;

        const junkWords = ['karaoke', 'tribute', 'cover', 'instrumental version'];
        if (junkWords.some(w => titleA.includes(w) || artistA.includes(w))) scoreA -= 500;
        if (junkWords.some(w => titleB.includes(w) || artistB.includes(w))) scoreB -= 500;

        // 1. Prioritize real tracks with metadata
        const aHasMeta = a.title && a.artist !== "Unknown Artist";
        const bHasMeta = b.title && b.artist !== "Unknown Artist";
        if (aHasMeta) scoreA += 10;
        if (bHasMeta) scoreB += 10;

        // 2. Harmonic Sorting (Camelot Wheel)
        const isUnknownKey = !activeKey || activeKey === "Unknown" || activeKey === "N/A" || activeKey === "null";

        if (!isUnknownKey) {
          const distA = getCamelotDistance(activeKey, a.key);
          const distB = getCamelotDistance(activeKey, b.key);
          scoreA -= distA;
          scoreB -= distB;
        }

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        // Preserve popularity order from the backend API if we can't differentiate
        return 0;
      });

      // Calculate precise Pitch % mapping based on strict returned tempos
      const finalMatches = matches.map((m: any) => {
        const diff = ((activeBpm - (m.bpm || activeBpm)) / (m.bpm || activeBpm)) * 100
        const pitchString = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`
        return { ...m, pitchString, actualBpm: m.bpm || activeBpm }
      })

      setMashupMatches(finalMatches.slice(0, 5))
    } catch (err: any) {
      toast.error(err.message || "Failed to find matches.")
      setExpandedMashupTrackId(null)
    } finally {
      setIsFetchingMashupUrl(false)
    }
  }

  // Shuffle matches without closing the results panel
  const handleShuffleMatches = async () => {
    if (!selectedTrack || !selectedAnalysis) return;
    const activeBpm = Number(selectedAnalysis.bpm);
    if (!activeBpm) return;

    setIsShuffling(true);
    await new Promise(r => setTimeout(r, 200));

    const rawMatches = localLibrary.filter((t: any) =>
      Math.abs(t.bpm - activeBpm) <= 3 &&
      t.title !== selectedTrack.name
    );

    const shuffled = [...rawMatches].sort(() => 0.5 - Math.random());
    const finalMatches = shuffled.slice(0, 5).map((t: any) => {
      const diff = ((activeBpm - (t.bpm || activeBpm)) / (t.bpm || activeBpm)) * 100;
      const pitchString = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
      return {
        id: t.id,
        title: t.title,
        artist: t.artist,
        image: "",
        bpm: t.bpm,
        key: "Unknown",
        pitchString,
        actualBpm: t.bpm || activeBpm,
        mixingOptions: generateMixingOptions(),
      };
    });

    setMashupMatches(finalMatches);
    setIsShuffling(false);
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 mt-4 mb-2">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Track Lab
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Analyze your tracks and discover perfect harmonic matches and mashup combinations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label
              className={`flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-full text-sm font-medium border border-border transition-colors group ${analyzeProgress.analyzing ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>

              {analyzeProgress.analyzing ? (
                <div className="flex items-center gap-3 relative z-10 w-full">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <div className="flex flex-col flex-1 min-w-[200px]">
                    <span className="text-xs font-bold whitespace-nowrap">
                      Analyzing Audio: {analyzeProgress.current} / {analyzeProgress.total} tracks...
                    </span>
                    <div className="h-1 bg-secondary w-full rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(analyzeProgress.current / analyzeProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
                    <Upload className="w-3 h-3 text-primary" />
                  </div>
                  <span className="relative z-10">
                    {localLibrary.length > 0 ? `Crate Ready (${localLibrary.length})` : "Import Local DJ Folder"}
                  </span>
                </>
              )}

              <input
                type="file"
                /* @ts-ignore - webkitdirectory is non-standard but widely supported */
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
                onChange={handleFolderImport}
                disabled={analyzeProgress.analyzing}
              />
            </label>

            {localLibrary.length > 0 && !analyzeProgress.analyzing && (
              <button
                onClick={() => {
                  setPlayQueue(localLibrary);
                  togglePlay(localLibrary[0]);
                  toast.success("Playing Crate: Sequential playback active.");
                }}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black rounded-full text-sm font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all active:scale-95"
              >
                <PlayCircle className="w-5 h-5 fill-current" /> PLAY CRATE
              </button>
            )}
          </div>
        </div>

        {/* Local Crate Display */}
        <div className="w-full glass rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-primary" />
              Your Local Crate
            </h2>
            {localLibrary.length > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {localLibrary.length} Tracks Ready
              </Badge>
            )}
          </div>

          {localLibrary.length > 0 ? (
            <ScrollArea className="h-[280px] rounded-xl border border-border/50 bg-background/40 shadow-inner">
              <div className="p-4 flex flex-col gap-2 max-w-full overflow-x-hidden">
                {localLibrary.map((track: any) => (
                  <div key={track.id} className="flex items-center justify-between w-full overflow-hidden gap-2 p-3 box-border rounded-xl bg-card border border-border hover:border-primary/40 focus-within:border-primary/40 transition-colors hover:shadow-md animate-in fade-in zoom-in-95 duration-300">
                    {/* Left side: Icon + Text */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 flex-shrink-0 bg-secondary/50 rounded flex items-center justify-center">
                        <Music className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 mr-4 flex items-center">
                        <p className="truncate w-full text-sm font-medium text-foreground max-w-[200px]">{track.title}</p>
                      </div>
                    </div>
                    {/* Right side: BPM & Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono bg-secondary px-2 py-1 rounded hidden sm:inline-flex">{track.bpm} BPM</span>
                      <button
                        onClick={async () => {
                          const trackObj = { id: track.id, name: track.title, artist: track.artist, bpm: track.bpm, file: track.file };
                          setPlayQueue(localLibrary);
                          await fetchTrackAnalysis(trackObj);
                          handleFindMashupMatch(trackObj, { bpm: track.bpm });
                        }}
                        className="flex-shrink-0 h-8 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-black text-xs font-black rounded-lg transition-colors flex items-center justify-center whitespace-nowrap border border-primary/20 hover:border-primary"
                      >
                        Find Matches
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border-2 border-dashed border-border/60 bg-secondary/10">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-border/50 shadow-sm shadow-black/10">
                <Upload className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-base font-bold text-foreground">Your local crate is empty.</p>
              <p className="text-sm text-muted-foreground max-w-[280px] mt-1.5 leading-relaxed">
                Import a music folder to start matching and building your set.
              </p>
            </div>
          )}
        </div>

        {/* Analysis Result (Mocked metrics, real track) */}
        {selectedTrack && selectedAnalysis && (
          <div className="glass rounded-3xl p-8 mt-4 flex flex-col md:flex-row gap-10 items-center md:items-start animate-in fade-in zoom-in-95 duration-500 relative">

            <button
              onClick={() => setSelectedTrack(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary p-2 rounded-full transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Side: Artwork & Global Score */}
            <div className="flex flex-col items-center gap-6 shrink-0 pt-2">
              <div className="relative group/cover w-40 h-40 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 border border-border/50 bg-secondary flex justify-center items-center">
                <div className="absolute inset-0 bg-primary/20 group-hover/cover:bg-transparent transition-colors z-10 mix-blend-color"></div>
                {selectedTrack.image && selectedTrack.image !== '' ? (
                  <img
                    src={selectedTrack.image}
                    alt={selectedTrack.title || "Track Artwork"}
                    className="w-full h-full object-cover scale-105 group-hover/cover:scale-100 transition-transform duration-700"
                  />
                ) : (
                  <Music className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-2">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.2 0 0)" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="oklch(0.82 0.19 145)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (selectedAnalysis.matchScore / 100) * 264}
                      className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_oklch(0.82_0.19_145)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-primary shadow-primary">{selectedAnalysis.matchScore}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mt-1">Match</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Details & Breakdowns */}
            <div className="flex-1 w-full flex flex-col justify-center">
              <div className="mb-8 pr-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{selectedTrack.name}</h2>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-1 group relative">
                    <input
                      type="number"
                      value={selectedAnalysis.bpm === "Unknown" ? "" : selectedAnalysis.bpm}
                      onChange={(e) => setSelectedAnalysis({ ...selectedAnalysis, bpm: Number(e.target.value) })}
                      onBlur={() => {
                        if (selectedAnalysis.bpm && selectedAnalysis.bpm !== "Unknown" && selectedAnalysis.bpm !== "N/A") {
                          handleFindMashupMatch(selectedTrack, { bpm: Number(selectedAnalysis.bpm) });
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      className="w-16 bg-secondary text-foreground text-xs font-mono py-1 px-2 border border-primary/30 hover:border-primary rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-center transition-colors appearance-none"
                      title="Click to manually edit BPM and re-fetch matches"
                    />
                    <span className="text-xs text-muted-foreground font-mono">BPM</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-foreground text-xs font-mono py-1 border-chart-3/10">{selectedAnalysis.key}</Badge>
                  <Badge variant="outline" className="text-xs font-medium py-1 border-border bg-background/50">{selectedAnalysis.genre}</Badge>
                  <button
                    onClick={() => handleFindMashupMatch(selectedTrack)}
                    disabled={isFetchingMashupUrl || selectedAnalysis.bpm === "Unknown" || selectedAnalysis.bpm === "N/A"}
                    className="ml-auto px-4 py-2 bg-chart-2/20 text-chart-2 hover:bg-chart-2 hover:text-white font-semibold rounded-lg text-sm transition-colors border border-chart-2/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isFetchingMashupUrl && expandedMashupTrackId === selectedTrack.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {expandedMashupTrackId === selectedTrack.id ? "Close Matches" : "Find Mashup Match"}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Tempo Fit (BPM)</span>
                    <span className="text-foreground font-mono">{selectedAnalysis.tempoFit}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_10px_oklch(0.82_0.19_145)] transition-all duration-1000 ease-out" style={{ width: `${selectedAnalysis.tempoFit}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Harmonic Synergy (Key)</span>
                    <span className="text-foreground font-mono">{selectedAnalysis.harmonicSynergy}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${selectedAnalysis.harmonicSynergy}%`, background: 'oklch(0.82 0.17 80)' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Crowd Energy / Vibe</span>
                    <span className="text-foreground font-mono">{selectedAnalysis.crowdEnergy}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${selectedAnalysis.crowdEnergy}%`, background: 'var(--color-chart-3)' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">AI Insight</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Excellent fit for {selectedAnalysis.bpm > 125 ? "Peak time" : "Warmup"}. Matches the harmonic profile of {selectedAnalysis.key} precisely.
                      Search the global catalog to find matching instrumental stems.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Embedded Global Mashup Matches Area */}
        {selectedTrack && expandedMashupTrackId === selectedTrack.id && (
          <div className="glass rounded-3xl border border-chart-2/30 p-6 flex flex-col gap-6 relative overflow-hidden animate-in slide-in-from-top-8 duration-500 mt-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-2/50 via-chart-2 to-chart-2/50"></div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-chart-2" /> Global Mashup Matches
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Recommended instrumentals from GetSongBPM based on strict harmonic and tempo analysis.</p>
              </div>

              {isFetchingMashupUrl ? (
                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30 py-1 px-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  Searching Local Crate...
                </Badge>
              ) : mashupMatches.length > 0 ? (
                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">From Local Crate</Badge>
              ) : null}
            </div>

            {isFetchingMashupUrl ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-chart-2 animate-spin mb-4" />
                <p className="text-sm font-bold text-foreground">Querying Local Library...</p>
                <p className="text-xs text-muted-foreground mt-1">Filtering imported tracks by BPM synergy.</p>
              </div>
            ) : mashupMatches.length > 0 ? (
              <div className="flex flex-col gap-4 relative">
                <div className="flex justify-center mb-2">
                  <button
                    onClick={handleShuffleMatches}
                    disabled={isShuffling}
                    className="flex items-center gap-2 h-9 px-6 rounded-full bg-secondary/80 text-foreground font-semibold text-xs hover:bg-chart-2/20 hover:text-chart-2 transition-all border border-border/60 shadow-sm"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isShuffling && "animate-spin text-chart-2")} />
                    Shuffle / Load More
                  </button>
                </div>

                <div className={cn("grid grid-cols-1 gap-4 transition-opacity duration-300", isShuffling ? "opacity-30" : "opacity-100")}>
                  {mashupMatches.map((match, idx) => (
                    <div key={idx} className="bg-black/40 border border-border/50 rounded-2xl p-5 flex flex-col md:flex-row gap-6 relative group overflow-hidden hover:bg-black/60 hover:border-chart-2/50 transition-all shadow-lg">
                      {/* Artwork & Info */}
                      <div className="flex items-center gap-5 md:w-1/3 shrink-0">
                        <div className="w-16 h-16 flex-shrink-0 rounded-md bg-secondary flex items-center justify-center border border-border/50 shadow-xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/20 to-transparent z-0"></div>
                          {match.image && match.image !== '' ? (
                            <img src={match.image} alt={match.title} className="w-full h-full object-cover relative z-10" />
                          ) : (
                            <Music className="w-8 h-8 text-chart-2/70 z-10" />
                          )}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <h3 className="text-base font-bold text-white truncate">{match.title}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="bg-secondary/50 text-foreground text-[10px] font-mono px-1.5 py-0 border border-border">{match.actualBpm} BPM</Badge>
                            <Badge variant="secondary" className="bg-secondary/50 text-foreground text-[10px] font-mono px-1.5 py-0 border border-border">{match.key}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Mixing Formula */}
                      {/* Mixing Formula */}
                      <div className="flex-1 bg-chart-2/5 border border-chart-2/20 rounded-xl p-4 flex flex-col justify-center relative">
                        <div className="absolute top-0 right-4 w-32 h-32 bg-chart-2/10 rounded-full blur-2xl -z-10"></div>
                        <p className="text-xs font-bold text-chart-2 mb-2 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" /> DJ Mixing Brain
                          <span className="bg-black/60 text-white px-2 py-0.5 ml-2 rounded font-bold tracking-wider border border-chart-2/30 shadow-sm text-[10px]">
                            Pitch {match.pitchString}
                          </span>
                        </p>
                        <div className="space-y-2.5 mt-2">
                          {match.mixingOptions?.map((opt: string, i: number) => {
                            const colonIdx = opt.indexOf(":");
                            const title = opt.substring(0, colonIdx + 1);
                            const desc = opt.substring(colonIdx + 1);

                            return (
                              <div key={i} className="flex gap-2 items-start text-sm">
                                <span className="text-chart-2 mt-0.5 shrink-0">🔹</span>
                                <div className="leading-snug">
                                  <span className="font-bold text-chart-2-foreground mr-1">{title}</span>
                                  <span className="text-muted-foreground">{desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0 md:w-auto mt-4 md:mt-0">
                        <button
                          onClick={() => setActiveMashup(match)}
                          className="h-10 px-6 rounded-xl bg-chart-3/10 text-chart-3 font-bold text-sm hover:bg-chart-3 hover:text-black transition-colors border border-chart-3/30 whitespace-nowrap shadow-[0_0_15px_var(--color-chart-3)_inset] hover:shadow-[0_0_20px_var(--color-chart-3)]"
                        >
                          Analyze Mix
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-black/40 border border-border/50 rounded-2xl shadow-inner">
                <AlertTriangle className="w-10 h-10 text-destructive/80 mb-4" />
                <p className="text-base font-bold text-foreground">No tracks found in your Local Crate for this BPM.</p>
                <p className="text-sm text-muted-foreground mt-1">Try expanding your crate folder or select a different target track.</p>
              </div>
            )}
          </div>
        )}

        {/* Deep Analysis Modal */}
        {
          activeMashup && selectedTrack && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-card w-full max-w-2xl rounded-3xl border border-border/50 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl -z-10"></div>

                <div className="p-6 border-b border-border/50 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-chart-3 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" /> Mashup Blueprint
                    </h3>
                    <h2 className="text-2xl font-black text-foreground">
                      {selectedTrack.name} <span className="text-muted-foreground mx-2">×</span> {activeMashup.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveMashup(null)}
                    className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-secondary/30 p-4 rounded-2xl border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Base Track</p>
                      <p className="font-bold text-foreground text-lg">{selectedTrack.bpm} BPM</p>
                    </div>
                    <div className="bg-chart-3/10 p-4 rounded-2xl border border-chart-3/20">
                      <p className="text-xs text-chart-3 mb-1 uppercase tracking-widest">Matched Track</p>
                      <p className="font-bold text-chart-3-foreground text-lg">{activeMashup.bpm} BPM <span className="text-xs text-muted-foreground font-normal ml-2">(Pitch {activeMashup.pitchString})</span></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-2xl p-5 border border-border/50 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-chart-2"></div>
                      <h4 className="text-chart-2 font-bold mb-2 flex items-center gap-2">
                        <ListMusic className="w-4 h-4" /> The Intro Mix (Standard)
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Set a cue point on <strong className="text-foreground">{activeMashup.title}</strong> at 00:00. Hit play exactly <strong className="text-foreground bg-secondary px-1.5 py-0.5 rounded text-chart-2 border border-chart-2/20">{calculatePhraseTimes(activeMashup.bpm).bar32}</strong> before the base track ends to align the 32-bar outro/intro transition seamlessly.
                      </p>
                    </div>

                    <div className="bg-black/40 rounded-2xl p-5 border border-border/50 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>
                      <h4 className="text-destructive font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> The Drop Swap (Aggressive)
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Cue the matched track at <strong className="text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">{calculatePhraseTimes(activeMashup.bpm).bar16}</strong> (end of its 16-bar intro). Start playing it underneath the base track's build-up. Crossfade 100% right as the drop hits.
                      </p>
                    </div>

                    <div className="bg-black/40 rounded-2xl p-5 border border-border/50 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Loop & Layer (Creative)
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Set a 4-beat loop on <strong className="text-foreground">{activeMashup.title}</strong> at <strong className="text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">{calculatePhraseTimes(activeMashup.bpm).bar32}</strong>. Filter out the lows and layer it over the base track's breakdown to build energy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </>
  );
}

// ─── View 7: Integrations & Settings ──────────────────────────────────────────

function IntegrationsView() {
  const [micActive, setMicActive] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Integrations & Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure where CrowdSync listens for your "Now Playing" track data.
        </p>
      </div>

      <div className="flex flex-col gap-6 mt-4">

        {/* Professional DJ Software */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <LayoutDashboard className="w-5 h-5 text-chart-2" />
            <h2 className="text-lg font-semibold text-foreground">Professional DJ Software</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Rekordbox / Serato Now Playing File</label>
              <p className="text-xs text-muted-foreground">Point CrowdSync to your local history text file that updates on every track change.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/40 border border-border/50 rounded-xl h-10 px-3 flex items-center text-sm font-mono text-muted-foreground/50 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent flex items-center pl-3">
                  <ListMusic className="w-4 h-4" />
                </div>
                <span className="pl-6 select-none truncate">C:\Users\DJ\Documents\CurrentTrack.txt</span>
              </div>
              <button
                onClick={() => toast("Opening system file dialog to select Rekordbox history file...")}
                className="h-10 px-6 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium border border-border/50 transition-colors"
              >
                Browse...
              </button>
            </div>

            <div className="p-4 rounded-xl bg-chart-2/5 border border-chart-2/20 flex gap-3">
              <Info className="w-4 h-4 text-chart-2 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ensure your DJ software is configured to write standard text output. CrowdSync updates the Live Performance view instantly upon file modification.
              </p>
            </div>
          </div>
        </div>

        {/* Environment Audio */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-chart-3" />
            <h2 className="text-lg font-semibold text-foreground">Environment Audio</h2>
          </div>

          <div className="flex items-center justify-between p-5 rounded-xl bg-secondary/30 border border-border/50">
            <div className="flex-1 pr-6">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Audio Recognition (Shazam Engine)
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Use your device's microphone to continuously listen and identify tracks playing in the room. Perfect for B2B sets or when hardware connection isn't possible.
              </p>
              {micActive && (
                <p className="text-xs text-chart-3 font-medium flex items-center gap-1.5 mt-3">
                  <AlertTriangle className="w-3.5 h-3.5" /> High battery drain. Ensure laptop is plugged in.
                </p>
              )}
            </div>
            <button
              onClick={() => setMicActive(!micActive)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${micActive ? 'bg-chart-3 shadow-[0_0_10px_var(--color-chart-3)]' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${micActive ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}



// ─── View 8: Setlist Builder ──────────────────────────────────────────────────

function SetlistBuilderView({
  togglePlay,
  setPlayQueue
}: {
  togglePlay: (track: any) => void,
  setPlayQueue: (list: any[]) => void
}) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)

  const [arrangeState, setArrangeState] = useState<"idle" | "loading" | "done">("idle")
  const [arrangedSet, setArrangedSet] = useState<any[]>([])

  const { localLibrary, setLocalLibrary, isImporting, setIsImporting } = useLocalCrate()
  const hasImported = localLibrary.length > 0

  const handleFolderImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsImporting(true)
    const newTracks: any[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('audio/')) continue
      const title = file.name.replace(/\.[^/.]+$/, "")

      const mockBpm = Math.floor(Math.random() * (130 - 120 + 1)) + 120
      const mockKeys = ["8A", "9A", "10A", "11A", "8B", "9B"]
      const mockKey = mockKeys[Math.floor(Math.random() * mockKeys.length)]

      newTracks.push({
        id: `local-${Date.now()}-${i}`,
        title: title,
        artist: "Unknown Artist",
        bpm: mockBpm,
        camelot_key: mockKey,
        duration: "00:00",
        file: file
      })
    }

    setTimeout(() => {
      setLocalLibrary([...localLibrary, ...newTracks])
      setIsImporting(false)
      toast.success(`Successfully analyzed ${newTracks.length} local tracks!`)
    }, 1500)
  }

  const handleAutoArrange = async () => {
    if (!hasImported || localLibrary.length === 0) return
    setArrangeState("loading")
    try {
      // Strictly map to match backend TrackInput Pydantic model exactly:
      // Required fields: id (str|int|None), title (str), artist (str), bpm (float), camelot_key (str)
      // Strip file, artwork, or any non-serializable objects.
      const cleanLibrary = localLibrary.map((t: any) => ({
        id: String(t.id),
        title: String(t.title || 'Unknown'),
        artist: String(t.artist || 'Unknown Artist'),
        bpm: Number(t.bpm) || 120,
        camelot_key: String(t.camelot_key || t.key || '8A'),
      }))
      const res = await fetch("https://crowdsync-fh87.onrender.com/api/arrange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanLibrary),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        console.error("BACKEND VALIDATION ERROR:", errorData)
        toast.error(`Arrangement failed: Backend rejected the data. Check console for details.`)
        setArrangeState("idle")
        return
      }
      const data = await res.json()

      const formattedSet = data.optimized_setlist.map((arrangedTrack: any) => {
        const originalTrack = localLibrary.find((t: any) => t.id === arrangedTrack.id);
        return originalTrack ? { ...arrangedTrack, ...originalTrack, transition_label: arrangedTrack.transition_label } : arrangedTrack;
      })

      setArrangedSet(formattedSet)
    } catch (error) {
      console.error("Error arranging setlist:", error)
      toast.error("Failed to arrange setlist. Please try again.")
    } finally {
      setArrangeState("done")
    }
  }

  const toggleTrack = (id: string) => {
    setExpandedTrack(prev => prev === id ? null : id)
  }

  const displayTracks = arrangedSet.length > 0 ? arrangedSet : localLibrary

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Setlist Builder
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Import your local tracks, analyze them, and let AI help you build a perfectly flowing set.
        </p>
      </div>

      <div className="flex flex-col gap-6 mt-4">
        {/* Import Tracks */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <FolderOpen className="w-5 h-5 text-chart-1" />
            <h2 className="text-lg font-semibold text-foreground">Import Tracks</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Local Audio Files</label>
              <p className="text-xs text-muted-foreground">Select a folder containing your audio files (MP3, WAV, FLAC, etc.). CrowdSync will analyze them for BPM and Key.</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                // @ts-ignore - webkitdirectory is non-standard but widely supported
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderImport}
                className="hidden"
                id="folder-upload"
                disabled={isImporting}
              />
              <label
                htmlFor="folder-upload"
                className="flex-1 h-10 px-6 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium border border-border/50 transition-colors flex items-center justify-center cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Browse Folder..."
                )}
              </label>
            </div>

            {hasImported && (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-chart-1/5 border border-chart-1/20 flex gap-3">
                  <Info className="w-4 h-4 text-chart-1 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {localLibrary.length} tracks imported. You can now arrange them into a setlist.
                  </p>
                </div>
                <button
                  onClick={() => { setPlayQueue(localLibrary); togglePlay(localLibrary[0]); }}
                  className="h-10 px-6 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Original Set
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Arrange Setlist */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <ListOrdered className="w-5 h-5 text-chart-4" />
            <h2 className="text-lg font-semibold text-foreground">Arrange Setlist</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">AI-Powered Arrangement</label>
              <p className="text-xs text-muted-foreground">Let CrowdSync's AI optimize your imported tracks for harmonic and rhythmic flow, creating a seamless DJ set.</p>
            </div>

            <button
              onClick={handleAutoArrange}
              className="h-10 px-6 rounded-xl bg-chart-4 hover:bg-chart-4/80 text-background text-sm font-medium border border-chart-4/5 transition-colors flex items-center justify-center"
              disabled={!hasImported || arrangeState === "loading"}
            >
              {arrangeState === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Arranging...
                </>
              ) : (
                "Auto-Arrange Setlist"
              )}
            </button>

            {arrangeState === "done" && arrangedSet.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-chart-4/5 border border-chart-4/20 flex gap-3">
                  <Info className="w-4 h-4 text-chart-4 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Setlist arranged! Review the suggested order and transitions below.
                  </p>
                </div>
                <button
                  onClick={() => { setPlayQueue(arrangedSet); togglePlay(arrangedSet[0]); }}
                  className="h-10 px-6 rounded-xl bg-chart-4 hover:bg-chart-4/80 text-background text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_oklch(0.82_0.19_145/0.4)]"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Arranged Set
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Setlist Display */}
        <div className="flex flex-col gap-3">
          {displayTracks.map((track) => {
            const isExpanded = expandedTrack === track.id;

            return (
              <div key={track.id} className="bg-secondary/20 border border-border/50 rounded-xl overflow-hidden transition-all duration-300">
                {/* Track Header (Clickable) */}
                <div
                  onClick={() => toggleTrack(track.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-secondary/40 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center">
                      <p className="text-sm font-bold text-foreground truncate">{track.title}</p>
                      {track.transition_label && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 ml-3 uppercase tracking-wider whitespace-nowrap hidden sm:block">
                          {track.transition_label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-background text-foreground text-[10px] font-mono py-0">{track.bpm} BPM</Badge>
                      <Badge variant="secondary" className="bg-background text-foreground text-[10px] font-mono py-0">{track.camelot_key || track.key}</Badge>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Hot Cues Accordion Content */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-border/30" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 bg-background/30 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-md py-1.5 px-3 border border-border/50">
                        <div className="w-3 h-3 rounded-sm bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-[11px] font-medium text-foreground tracking-wide">A: Intro (00:00)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-md py-1.5 px-3 border border-border/50">
                        <div className="w-3 h-3 rounded-sm bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-[11px] font-medium text-foreground tracking-wide">B: Build-up (01:45)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-md py-1.5 px-3 border border-border/50">
                        <div className="w-3 h-3 rounded-sm bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                        <span className="text-[11px] font-medium text-foreground tracking-wide">C: Drop (02:00)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-md py-1.5 px-3 border border-border/50">
                        <div className="w-3 h-3 rounded-sm bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-[11px] font-medium text-foreground tracking-wide">D: Mix-Out (04:30)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeView, setActiveView] = useState("track-lab")
  const [activeTrack, setActiveTrack] = useState<any>(null)

  // Audio State Management
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playQueue, setPlayQueue] = useState<any[]>([]);

  // Refs for stale closure prevention
  const playQueueRef = useRef(playQueue);
  const activeTrackRef = useRef(activeTrack);

  useEffect(() => {
    playQueueRef.current = playQueue;
  }, [playQueue]);

  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.src = '';
      }
    };
  }, [playingAudio]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  };

  const handleNextTrackRef = useRef<() => void>(() => { });

  const togglePlay = useCallback((track: any) => {
    if (playingTrackId === track.id && playingAudio) {
      if (playingAudio.paused) {
        playingAudio.play();
      } else {
        playingAudio.pause();
      }
      setPlayingAudio(prev => prev);
      return;
    }

    if (playingAudio) {
      playingAudio.pause();
      playingAudio.src = '';
    }

    if (!track.file) {
      toast.error("Audio file missing for this track. Local tracks required for playback.");
      return;
    }

    const objectUrl = URL.createObjectURL(track.file);
    const newAudio = new Audio(objectUrl);

    newAudio.addEventListener('timeupdate', () => setCurrentTime(newAudio.currentTime));
    newAudio.addEventListener('loadedmetadata', () => setDuration(newAudio.duration));
    newAudio.addEventListener('ended', () => {
      URL.revokeObjectURL(objectUrl);
      handleNextTrackRef.current();
    });

    newAudio.play().catch(e => console.error("Playback failed:", e));
    setPlayingAudio(newAudio);
    setPlayingTrackId(track.id);
    setActiveTrack(track);
  }, [playingTrackId, playingAudio]);

  const handleNextTrack = useCallback(() => {
    const currentQueue = playQueueRef.current;
    const currentTrack = activeTrackRef.current;
    if (!currentQueue || currentQueue.length === 0 || !currentTrack) return;

    const currentIndex = currentQueue.findIndex((t: any) => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < currentQueue.length - 1) {
      togglePlay(currentQueue[currentIndex + 1]);
    } else {
      toast.info("Reached end of queue.");
    }
  }, [togglePlay]);

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  const handlePrevTrack = () => {
    const currentQueue = playQueueRef.current;
    const currentTrack = activeTrackRef.current;
    if (!currentQueue || currentQueue.length === 0 || !currentTrack) return;

    const currentIndex = currentQueue.findIndex((t: any) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      togglePlay(currentQueue[currentIndex - 1]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 lg:p-8 max-w-[1200px]">
            {activeView === "crowd-dna" && <CrowdIntelligenceView />}
            {activeView === "track-lab" && (
              <TrackLabView
                activeTrack={activeTrack}
                setActiveTrack={setActiveTrack}
                togglePlay={togglePlay}
                setPlayQueue={setPlayQueue}
              />
            )}
            {activeView === "dashboard" && <DashboardView />}
            {activeView === "setlist-builder" && <SetlistBuilderView togglePlay={togglePlay} setPlayQueue={setPlayQueue} />}
            {activeView === "live-performance" && (
              <LivePerformanceView
                activeTrack={activeTrack}
                togglePlay={togglePlay}
                handleNextTrack={handleNextTrack}
                handlePrevTrack={handlePrevTrack}
                formatTime={formatTime}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                duration={duration}
                playingAudio={playingAudio}
                playingTrackId={playingTrackId}
                playQueue={playQueue}
              />
            )}
            {activeView === "integrations" && <IntegrationsView />}
          </div>
        </ScrollArea>
      </main>
      <Toaster theme="dark" className="border-border text-foreground" />
    </div>
  )
}
