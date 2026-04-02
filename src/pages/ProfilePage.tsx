import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserProfile, ScoreWeights, DEFAULT_WEIGHTS } from '@/types/job';
import { generateKeywordsFromRole, extractBioSignals, ALL_SUGGESTED_ROLES } from '@/lib/keywords';
import { generateProfileSuggestions } from '@/lib/ai';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { matchJobs } from '@/lib/matching';
import { mockJobs } from '@/data/mockJobs';
import { SYNONYM_DICTIONARY } from '@/lib/synonyms';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, MapPin, Code2, FileText, Sparkles, Check, X,
  Zap, ShieldOff, Eye, BarChart3, Target, LogOut, Globe, ChevronRight, Activity, MessageSquare
} from 'lucide-react';
import { LIMITS } from '@/config/limits';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UpgradeModal } from '@/components/UpgradeModal';
import { UpgradeCard } from '@/components/UpgradeCard';
import { Lock } from 'lucide-react';

const experienceLevels = ['junior', 'mid', 'senior'] as const;
const workTypes = ['remote', 'freelance', 'full-time', 'contract', 'part-time'] as const;

function TagInput({ tags, onAdd, onRemove, placeholder, colorClass }: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
  colorClass: string;
}) {
  const [input, setInput] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors min-h-[48px]">
      <AnimatePresence>
        {tags.map(tag => (
          <motion.span
            key={tag}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${colorClass}`}
          >
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  );
}



function UsageStats({ profile }: { profile: Partial<UserProfile> }) {
  const stats = [
    { label: 'Daily Swipes', current: profile.dailyJobsSwiped || 0, max: LIMITS.FREE.DAILY_SWIPES, color: 'bg-primary' },
    { label: 'AI Insights', current: profile.dailyAiAnalysisCount || 0, max: LIMITS.FREE.DAILY_AI_INSIGHTS, color: 'bg-accent' },
    { label: 'CV Fits', current: profile.dailyCvFits || 0, max: LIMITS.FREE.DAILY_CV_FITS, color: 'bg-success' },
    { label: 'Interview Preps', current: profile.dailyInterviewCount || 0, max: LIMITS.FREE.DAILY_INTERVIEW_PREP, color: 'bg-warning' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 mb-8 border-primary/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Daily Usage & Limits
        </h3>
        {profile.isPremium ? (
          <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">Unlimited Access</span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Free Plan</span>
        )}
      </div>
      
      <div className="space-y-4">
        {stats.map(stat => {
          const pct = profile.isPremium ? 0 : Math.min(Math.round((stat.current / stat.max) * 100), 100);
          return (
            <div key={stat.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">{stat.label}</span>
                <span className="text-[11px] font-bold">
                  {stat.current} <span className="text-muted-foreground font-normal">/ {profile.isPremium ? '∞' : stat.max}</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: profile.isPremium ? '100%' : `${pct}%` }}
                  className={`h-full rounded-full ${profile.isPremium ? 'bg-gradient-to-r from-primary to-accent' : stat.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {!profile.isPremium && (
        <p className="mt-4 text-[10px] text-muted-foreground text-center italic">
          Usage resets every 24 hours. Get unlimited access with Premium.
        </p>
      )}
    </div>
  );
}

function ProfileCompleteness({ profile }: { profile: Partial<UserProfile> }) {
  const checks = [
    { label: 'Role', done: !!profile.role },
    { label: 'Primary Keywords', done: (profile.primaryKeywords?.length || 0) > 0 },
    { label: 'Core Skills', done: (profile.coreSkills?.length || 0) > 0 },
    { label: 'Experience', done: !!profile.experience_level },
    { label: 'Work Type', done: (profile.workTypes?.length || 0) > 0 },
    { label: 'Location', done: (profile.locationPreferences?.length || 0) > 0 },
    { label: 'Bio', done: !!profile.bio },
  ];
  const completed = checks.filter(c => c.done).length;
  const pct = Math.round((completed / checks.length) * 100);

  return (
    <div className="glass-card rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">Profile Completeness</span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="match-bar h-2 mb-3">
        <div className="match-bar-fill h-2" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${c.done ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
            {c.done ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}


export default function ProfilePage() {
  const { profile, setProfile, profileComplete, user, loginWithGoogle, logout, userAvatarUrl } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    role: profile?.role || '',
    experience_level: profile?.experience_level || 'mid' as const,
    years: profile?.years || 2,
    bio: profile?.bio || '',
    cvText: profile?.cvText || '',
  });

  const [primaryKeywords, setPrimaryKeywords] = React.useState<string[]>(profile?.primaryKeywords || []);
  const [coreSkills, setCoreSkills] = React.useState<string[]>(profile?.coreSkills || []);
  const [optionalSkills, setOptionalSkills] = React.useState<string[]>(profile?.optionalSkills || []);
  const [excludedKeywords, setExcludedKeywords] = React.useState<string[]>(profile?.excludedKeywords || []);
  const [workTypes_, setWorkTypes] = React.useState<string[]>(profile?.workTypes || ['remote']);
  const [locationPrefs, setLocationPrefs] = React.useState<string[]>(profile?.locationPreferences || []);
  const [synonymMap, setSynonymMap] = React.useState<Record<string, string[]>>(profile?.synonymMap || SYNONYM_DICTIONARY);
  const [weights, setWeights] = React.useState<ScoreWeights>(profile?.scoreWeights || DEFAULT_WEIGHTS);
  const [threshold, setThreshold] = React.useState(profile?.matchThreshold ?? 20);
  const [showPreview, setShowPreview] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<'jobs' | 'cv' | 'networks'>('networks');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Suggestions state
  const [roleSuggestions, setRoleSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const suggestionRef = React.useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = (val: string) => {
    setForm(f => ({ ...f, role: val }));
    if (val.trim()) {
      const filtered = ALL_SUGGESTED_ROLES.filter(r => 
        r.toLowerCase().includes(val.toLowerCase()) && 
        r.toLowerCase() !== val.toLowerCase()
      ).slice(0, 5);
      setRoleSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectRole = (role: string) => {
    setForm(f => ({ ...f, role }));
    setShowSuggestions(false);
    
    // Auto-generate keywords, skills & exclusions on selection
    const generated = generateKeywordsFromRole(role);
    setPrimaryKeywords(prev => [...new Set([...prev, ...generated.primaryKeywords])]);
    setCoreSkills(prev => [...new Set([...prev, ...generated.coreSkills])]);
    setOptionalSkills(prev => [...new Set([...prev, ...generated.optionalSkills])]);
    if (generated.suggestedExclusions.length > 0) {
      setExcludedKeywords(prev => [...new Set([...prev, ...generated.suggestedExclusions])]);
    }
    toast.info(`Selected ${role}. Standard profile attributes suggested!`);
  };

  const handleAutoGenerate = async () => {
    if (!form.role) {
      toast.error('Enter a role first');
      return;
    }
    
    setIsGenerating(true);
    const id = toast.loading('AI is crafting your profile keywords & skills...');
    
    try {
      // Get AI suggestions from Groq
      const { primaryKeywords: aiKeywords, coreSkills: aiSkills, optionalSkills: aiOptSkills, excludedKeywords: aiExclusions } = await generateProfileSuggestions(form.role);
      
      // Merge with existing logic (optionally) or just set the new ones
      setPrimaryKeywords(prev => [...new Set([...prev, ...aiKeywords])]);
      setCoreSkills(prev => [...new Set([...prev, ...aiSkills])]);
      setOptionalSkills(prev => [...new Set([...prev, ...aiOptSkills])]);
      setExcludedKeywords(prev => [...new Set([...prev, ...aiExclusions])]);
      
      toast.success('AI generation complete! Profile enhanced with Groq.', { id });
    } catch (err) {
      console.error('[AI/Profile] generation failed, falling back to static logic:', err);
      // Fallback to static logic
      const generated = generateKeywordsFromRole(form.role);
      setPrimaryKeywords(prev => [...new Set([...prev, ...generated.primaryKeywords])]);
      setCoreSkills(prev => [...new Set([...prev, ...generated.coreSkills])]);
      setOptionalSkills(prev => [...new Set([...prev, ...generated.optionalSkills])]);
      if (generated.suggestedExclusions.length > 0) {
        setExcludedKeywords(prev => [...new Set([...prev, ...generated.suggestedExclusions])]);
      }
      toast.error('AI was unavailable. Used standard suggestions instead.', { id });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentProfileSnapshot: UserProfile = React.useMemo(() => ({
    role: form.role,
    normalizedRole: form.role.toLowerCase().trim(),
    primaryKeywords,
    coreSkills,
    optionalSkills,
    excludedKeywords,
    experience_level: form.experience_level,
    years: form.years,
    workTypes: workTypes_ as UserProfile['workTypes'],
    locationPreferences: locationPrefs,
    bio: form.bio,
    inferredTags: extractBioSignals(form.bio),
    synonymMap,
    scoreWeights: weights,
    matchThreshold: threshold,
    cvText: form.cvText,
    joinedAt: profile?.joinedAt || new Date().toISOString(),
  }), [form, primaryKeywords, coreSkills, optionalSkills, excludedKeywords, workTypes_, locationPrefs, synonymMap, weights, threshold, profile?.joinedAt]);

  const previewMatches = React.useMemo(() => {
    if (!showPreview || !form.role) return [];
    return matchJobs(currentProfileSnapshot, mockJobs).slice(0, 5);
  }, [showPreview, currentProfileSnapshot]);



  const handleSave = () => {
    if (!form.role || coreSkills.length === 0) {
      toast.error('Please enter your role and at least one core skill');
      return;
    }
    setProfile(currentProfileSnapshot);
    toast.success('Profile saved! Discover your matches.');
  };

  const toggleWorkType = (type: string) => {
    setWorkTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 gradient-bg opacity-10 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          {!user ? (
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-primary/20 mb-3 shadow-lg">
                <img src={userAvatarUrl} alt="Random Avatar" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-lg font-bold mb-1">Sign in to save progress</h2>
              <p className="text-xs text-muted-foreground mb-4">Keep your profile and matches across all devices</p>
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                Continue with Google
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20" />
                ) : (
                  <img src={userAvatarUrl} alt={user.displayName || 'User'} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20" />
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{user.displayName || 'Job Searcher'}</h2>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <button
                  onClick={logout}
                  className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-destructive hover:opacity-80 transition-opacity uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
              {profileComplete && (
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                    <Check className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-success uppercase">Verified</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-border">
            <img src={userAvatarUrl} alt="Settings Icon" className="w-full h-full object-cover grayscale opacity-80" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Matching Settings</h1>
            <p className="text-xs text-muted-foreground">Adjust your core preferences</p>
          </div>
        </div>

        <ProfileCompleteness profile={currentProfileSnapshot} />

        <UsageStats profile={profile || {}} />


        {/* Premium Upgrade Card */}
        <div className="mb-10">
          <UpgradeCard 
            title="Premium Access" 
            description="Boost your hunt with advanced AI & exclusive platforms."
          />
        </div>

        <div className="space-y-5">
          {/* 1. Preferred Role */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Briefcase className="w-4 h-4 text-primary" /> Preferred Role
            </label>
            <div className="relative" ref={suggestionRef}>
              <input
                value={form.role}
                onChange={e => handleRoleChange(e.target.value)}
                onFocus={() => {
                  if (form.role.trim() && roleSuggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="e.g. Frontend Developer"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 left-0 right-0 mt-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl overflow-hidden"
                  >
                    {roleSuggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSelectRole(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0 flex items-center justify-between group"
                      >
                        <span className="font-medium">{suggestion}</span>
                        <Sparkles className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className={`flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity uppercase tracking-wider ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? (
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGenerating ? 'AI is generating...' : 'Auto-generate keywords, skills & exclusions'}
              </button>
            </div>
          </div>

          {/* 2. Primary Role Keywords */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <Target className="w-4 h-4 text-primary" /> Primary Role Keywords
            </label>
            <p className="text-xs text-muted-foreground mb-2">High-priority role phrases matched against job titles.</p>
            <TagInput
              tags={primaryKeywords}
              onAdd={tag => setPrimaryKeywords(prev => prev.includes(tag) ? prev : [...prev, tag])}
              onRemove={tag => setPrimaryKeywords(prev => prev.filter(t => t !== tag))}
              placeholder="e.g. frontend developer, react developer"
              colorClass="bg-primary/20 text-primary"
            />
          </div>

          {/* 3. Core Skills */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <Code2 className="w-4 h-4 text-success" /> Core Skills
            </label>
            <p className="text-xs text-muted-foreground mb-2">Must-have technologies. These heavily influence your match score.</p>
            <TagInput
              tags={coreSkills}
              onAdd={tag => setCoreSkills(prev => prev.includes(tag) ? prev : [...prev, tag])}
              onRemove={tag => setCoreSkills(prev => prev.filter(t => t !== tag))}
              placeholder="e.g. react, typescript, javascript"
              colorClass="bg-success/15 text-success"
            />
          </div>

          {/* 4. Optional Skills */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-accent" /> Optional Skills
            </label>
            <p className="text-xs text-muted-foreground mb-2">Nice-to-have. These provide a small score boost.</p>
            <TagInput
              tags={optionalSkills}
              onAdd={tag => setOptionalSkills(prev => prev.includes(tag) ? prev : [...prev, tag])}
              onRemove={tag => setOptionalSkills(prev => prev.filter(t => t !== tag))}
              placeholder="e.g. vue, angular, tailwind"
              colorClass="bg-accent/15 text-accent"
            />
          </div>

          {/* 5. Excluded Keywords */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <ShieldOff className="w-4 h-4 text-destructive" /> Excluded Keywords
            </label>
            <p className="text-xs text-muted-foreground mb-2">Jobs containing these will be completely filtered out.</p>
            <TagInput
              tags={excludedKeywords}
              onAdd={tag => setExcludedKeywords(prev => prev.includes(tag) ? prev : [...prev, tag])}
              onRemove={tag => setExcludedKeywords(prev => prev.filter(t => t !== tag))}
              placeholder="e.g. wordpress, php, firmware"
              colorClass="bg-destructive/15 text-destructive"
            />
          </div>

          {/* 6. Experience Level */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Experience Level</label>
            <div className="flex gap-2">
              {experienceLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setForm(f => ({ ...f, experience_level: level }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    form.experience_level === level
                      ? 'gradient-bg text-primary-foreground glow'
                      : 'bg-muted text-muted-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Years of Experience */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
              <span>Years of Experience</span>
              <span className="text-primary font-bold">{form.years}</span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={form.years}
              onChange={e => setForm(f => ({ ...f, years: parseInt(e.target.value) }))}
              className="w-full accent-primary"
            />
          </div>

          {/* 8. Work Type (multi-select) */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Work Type (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {workTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleWorkType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    workTypes_.includes(type)
                      ? 'gradient-bg text-primary-foreground glow'
                      : 'bg-muted text-muted-foreground border border-border hover:border-primary/30'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 9. Location Preference */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4 text-primary" /> Location Preferences
            </label>
            <TagInput
              tags={locationPrefs}
              onAdd={tag => setLocationPrefs(prev => prev.includes(tag) ? prev : [...prev, tag])}
              onRemove={tag => setLocationPrefs(prev => prev.filter(t => t !== tag))}
              placeholder="e.g. remote, europe, us"
              colorClass="bg-primary/15 text-primary"
            />
          </div>

          {/* 10. Short Bio */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-primary" /> Short Bio
            </label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell us about your experience, tools, and what you're looking for..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
            {form.bio && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Inferred:</span>
                {extractBioSignals(form.bio).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{tag}</span>
                ))}
                {extractBioSignals(form.bio).length === 0 && (
                  <span className="text-[10px] text-muted-foreground">No signals detected</span>
                )}
              </div>
            )}
          </div>

          {/* 11. CV / Resume */}
          <div>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-primary" /> CV / Resume
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isUploading ? 'Parsing PDF...' : 'Upload CV (PDF)'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.type !== 'application/pdf') {
                      toast.error('Please upload a PDF file');
                      return;
                    }
                    setIsUploading(true);
                    const id = toast.loading('Extracting text from PDF...');
                    try {
                      const text = await extractTextFromPdf(file);
                      setForm(f => ({ ...f, cvText: text }));
                      toast.success('CV text extracted successfully!', { id });
                    } catch (err) {
                      console.error('PDF parsing error:', err);
                      toast.error('Failed to parse PDF. Try pasting text instead.', { id });
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  accept=".pdf"
                  className="hidden"
                />
              </div>
              <textarea
                value={form.cvText}
                onChange={e => setForm(f => ({ ...f, cvText: e.target.value }))}
                placeholder="Paste your CV text here or upload a PDF above..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none text-xs leading-relaxed"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Providing your CV helps the AI tailor your applications perfectly.
            </p>
          </div>

          {/* 12. Match Preview */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-3 rounded-xl bg-muted border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Eye className="w-4 h-4 text-primary" />
              {showPreview ? 'Hide' : 'Show'} Match Preview
            </button>
            {showPreview && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                {!form.role && (
                  <p className="text-xs text-muted-foreground text-center py-4">Enter a role to see preview matches.</p>
                )}
                {form.role && previewMatches.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No matches above threshold. Try lowering threshold or adding more skills.</p>
                )}
                {previewMatches.map(job => (
                  <div key={job.id} className="glass-card rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{job.logo}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground">{job.company}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold ${
                          job.matchLabel === 'strong' ? 'text-success' :
                          job.matchLabel === 'good' ? 'text-primary' :
                          job.matchLabel === 'partial' ? 'text-warning' :
                          'text-muted-foreground'
                        }`}>
                          {job.matchScore}%
                        </span>
                        <p className="text-[10px] text-muted-foreground capitalize">{job.matchLabel} match</p>
                      </div>
                    </div>
                    {job.strongSignals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.strongSignals.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">✓ {s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl gradient-bg text-primary-foreground font-semibold text-base glow hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {profileComplete ? 'Update & Re-match' : 'Save & Find Matches'}
            </span>
          </button>
        </div>
      </motion.div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        reason={upgradeReason}
      />
    </div>
  );
}
