import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ShieldCheck, Sparkles, MapPin, Briefcase, Globe, Star, Search, Copy, Check, Filter, Lock, Loader2, Share } from 'lucide-react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useApp } from '@/context/AppContext';
import { UpgradeModal } from '@/components/UpgradeModal';

export type Network = {
  name: string;
  url: string;
  description: string;
  tags?: string[];
};

export type Category = {
  title: string;
  isPremium: boolean;
  networks: Network[];
};

export const networkCategories: Category[] = [
  {
    title: "Elite Vetted Networks",
    isPremium: true,
    networks: [
      { name: "Toptal", url: "https://www.toptal.com", description: "Accepts top 3% talent in tech, design, and finance.", tags: ["Top 3%", "Enterprise"] },
      { name: "Arc.dev", url: "https://arc.dev", description: "AI-powered vetting with 72-hour matching for devs & marketers.", tags: ["Developers", "Marketers"] },
      { name: "Gun.io", url: "https://gun.io", description: "High-end service handling administrative overhead for senior engineers.", tags: ["Senior", "Engineers"] },
      { name: "Turing", url: "https://turing.com", description: "AI-vetted network for long-term software contracts.", tags: ["AI-Vetted", "Long-term"] },
      { name: "Gigster", url: "https://gigster.com", description: "Assembles managed teams of top 1% talent for enterprise.", tags: ["Teams", "Enterprise"] },
      { name: "A.team", url: "https://a.team", description: "Exclusive builder network for high-impact missions.", tags: ["Missions", "Invite Only"] },
      { name: "Flexiple", url: "https://flexiple.com", description: "Platform for top 1% devs and designers focusing on compatibility.", tags: ["Top 1%", "Designers"] },
      { name: "Lemon.io", url: "https://lemon.io", description: "Matching vetted Eastern European & LatAm devs with startups.", tags: ["Startups", "Fast Match"] },
    ]
  },
  {
    title: "Creative & Portfolio-Centric",
    isPremium: false,
    networks: [
      { name: "Contra", url: "https://contra.com", description: "Commission-free network matching via visual Discovery Scores.", tags: ["0% Commission", "Visual"] },
      { name: "Dribbble", url: "https://dribbble.com", description: "Visual portfolio community generating passive inbound leads.", tags: ["Design", "Passive Leads"] },
      { name: "Behance", url: "https://www.behance.net", description: "Adobe-backed creative social hybrid for detailed case studies.", tags: ["Case Studies", "Creative"] },
      { name: "Artstation", url: "https://www.artstation.com", description: "Industry standard for gaming and entertainment 4K showreels.", tags: ["Gaming", "3D/Art"] },
      { name: "Cara", url: "https://cara.app", description: "Artist-led, ad-free platform protecting visual artists from AI.", tags: ["Anti-AI", "Artists"] },
    ]
  },
  {
    title: "Industry-Specific Specialists",
    isPremium: false,
    networks: [
      { name: "MarketerHire", url: "https://marketerhire.com", description: "Vets top 5% marketers for high-budget projects.", tags: ["Marketing", "Top 5%"] },
      { name: "Wripple", url: "https://wripple.com", description: "Digital marketing marketplace requiring 8+ years experience.", tags: ["Digital", "Senior"] },
      { name: "Codeable", url: "https://codeable.io", description: "WordPress experts utilizing a single-price algorithm.", tags: ["WordPress", "Fixed Price"] },
      { name: "Problogger", url: "https://problogger.com", description: "High-signal board prioritizing domain expertise for writers.", tags: ["Writers", "High-Signal"] },
      { name: "Twine", url: "https://twine.net", description: "Creative marketplace manually reviewing project pitches.", tags: ["Video/Audio", "Creative"] },
      { name: "Rev", url: "https://rev.com", description: "Platform for freelance transcriptionists and captioners.", tags: ["Transcription", "Flexible"] },
      { name: "Mandy.com", url: "https://mandy.com", description: "Dedicated hub for film, TV, and theatre cast and crew.", tags: ["Film/TV", "Crew"] },
      { name: "ProductionHub", url: "https://productionhub.com", description: "Veteran community for localized media production leads.", tags: ["Media", "Local"] },
    ]
  },
  {
    title: "Web3 & Decentralized",
    isPremium: false,
    networks: [
      { name: "Braintrust", url: "https://www.usebraintrust.com", description: "User-owned network where you keep 100% earnings + tokens.", tags: ["0% Fee", "Web3"] },
      { name: "Bondex", url: "https://bondex.app", description: "Career ecosystem using a reputation-based earn-to-refer model.", tags: ["Crypto", "Referrals"] },
      { name: "LaborX", url: "https://laborx.com", description: "Blockchain jobs using smart contracts & crypto escrow.", tags: ["Crypto Pay", "Smart Contracts"] },
    ]
  },
  {
    title: "Zero-Commission & Modern Networking",
    isPremium: false,
    networks: [
      { name: "Jobbers.io", url: "https://jobbers.io", description: "Global freelance marketplace operating without commission.", tags: ["0% Commission"] },
      { name: "Read.cv", url: "https://read.cv", description: "Visual-first alternative to LinkedIn with clean aesthetics.", tags: ["Networking", "Visual"] },
      { name: "Polywork", url: "https://polywork.com", description: "Network to build a brand around fractional and diverse roles.", tags: ["Fractional", "Modern"] },
      { name: "ListAllExperts", url: "https://listallexperts.com", description: "Directory where clients contact you via phone/email natively.", tags: ["Direct Contact"] },
    ]
  },
  {
    title: "High-Signal Job Boards",
    isPremium: true,
    networks: [
      { name: "WeWorkRemotely", url: "https://weworkremotely.com", description: "Premium board ensuring high-quality, serious remote roles.", tags: ["Premium", "Remote"] },
      { name: "WorkingNomads", url: "https://www.workingnomads.com", description: "Curated board offering premium hidden job postings.", tags: ["Curated", "Remote"] },
      { name: "Remotive", url: "https://remotive.com", description: "Vetted remote community eliminating ghost jobs via screening.", tags: ["No Ghost Jobs", "Remote"] },
      { name: "Wellfound", url: "https://wellfound.com", description: "Primary platform for finding roles in high-growth startups.", tags: ["Startups", "Equity"] },
      { name: "FlexJobs", url: "https://www.flexjobs.com", description: "Subscription service manually vetting listings against scams.", tags: ["Subscription", "Vetted"] },
    ]
  }
];

export const CATEGORY_ICONS: Record<string, JSX.Element> = {
  "Elite Vetted Networks": <ShieldCheck className="w-5 h-5 text-primary" />,
  "Creative & Portfolio-Centric": <Sparkles className="w-5 h-5 text-accent" />,
  "Industry-Specific Specialists": <Briefcase className="w-5 h-5 text-success" />,
  "Web3 & Decentralized": <Globe className="w-5 h-5 text-warning" />,
  "Zero-Commission & Modern Networking": <Star className="w-5 h-5 text-purple-400" />,
  "High-Signal Job Boards": <MapPin className="w-5 h-5 text-blue-400" />
};

export default function FreelanceNetworksPage() {
  const { profile } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    async function loadPlatforms() {
      try {
        const querySnapshot = await getDocs(collection(db, 'freelancePlatforms'));
        if (querySnapshot.empty) {
          // Self-seed
          const batch = writeBatch(db);
          networkCategories.forEach(cat => {
            const docRef = doc(collection(db, 'freelancePlatforms'), cat.title);
            batch.set(docRef, {
              title: cat.title,
              isPremium: cat.isPremium,
              networks: cat.networks,
            });
          });
          await batch.commit();
          setCategoriesData(networkCategories);
        } else {
          const loadedCategories: Category[] = [];
          querySnapshot.forEach(docSnap => {
            loadedCategories.push(docSnap.data() as Category);
          });
          setCategoriesData(loadedCategories);
        }
      } catch (error) {
        console.error("Error loading platforms:", error);
        setCategoriesData(networkCategories); // fallback
      } finally {
        setLoading(false);
      }
    }
    loadPlatforms();
  }, []);

  const categories = useMemo(() => ["All", ...categoriesData.map(c => c.title)], [categoriesData]);

  const filteredCategories = useMemo(() => {
    return categoriesData.map(category => {
      const filteredNetworks = category.networks.filter(network => {
        const matchesSearch = network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          network.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          network.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === "All" || category.title === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });

      return {
        ...category,
        networks: filteredNetworks
      };
    }).filter(category => category.networks.length > 0);
  }, [searchQuery, selectedCategory]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleShare = async (network: Network) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: network.name,
          text: `Check out ${network.name}: ${network.description}`,
          url: network.url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopy(network.url);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card rounded-2xl p-5 mb-6 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
          <h1 className="text-2xl font-bold gradient-text mb-2 relative">Hidden Gig Platforms</h1>
          <p className="text-sm text-muted-foreground leading-relaxed relative">
            Position yourself on exclusive, vetted, and zero-commission platforms to bypass saturated marketplaces.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search networks, skills, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Loading premium networks...</p>
          </div>
        ) : (
          <>
            {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="p-2 rounded-lg bg-muted border border-border shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                selectedCategory === category 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-muted text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <motion.div 
                  key={category.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <h2 className="text-sm font-bold flex items-center gap-2 mb-4 px-1">
                    <div className="p-1.5 rounded-lg bg-muted border border-border shadow-sm">
                      {CATEGORY_ICONS[category.title] || <Star className="w-5 h-5 text-primary" />}
                    </div>
                    {category.title}
                    <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {category.networks.length}
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {category.networks.map(network => (
                      <motion.div 
                        key={network.name}
                        layout
                        className={`glass-card rounded-2xl p-5 border transition-all group relative overflow-hidden ${
                          category.isPremium ? 'border-primary/20 bg-primary/5' : 'border-border hover:border-primary/30'
                        }`}
                      >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />
                        
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                            {network.name}
                            {category.isPremium && <Lock className="w-4 h-4 text-primary opacity-60" />}
                          </h3>
                        </div>
                        
                        <p className={`text-xs mb-4 leading-relaxed line-clamp-2 transition-all ${category.isPremium && !profile?.isPremium ? 'text-transparent bg-clip-text bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/5 select-none blur-[3px]' : 'text-muted-foreground'}`}>
                          {category.isPremium && !profile?.isPremium ? "Full access to this elite vetted platform is reserved for premium members. Gain matching priority and direct application routes." : network.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-5 transition-all">
                          {network.tags?.map(tag => (
                            <span key={tag} className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border transition-all ${category.isPremium && !profile?.isPremium ? 'bg-muted/50 text-muted-foreground/50 border-border/50 blur-[1px]' : 'bg-primary/5 text-primary border-primary/10'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        {category.isPremium && !profile?.isPremium ? (
                          <div className="grid grid-cols-1 gap-3">
                            <button 
                              onClick={() => setShowUpgradeModal(true)}
                              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 w-full"
                            >
                              <Lock className="w-3.5 h-3.5" /> Unlock Premium Platform
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                            <button 
                              onClick={() => handleCopy(network.url)}
                              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold bg-muted hover:bg-muted/80 transition-all active:scale-95"
                            >
                              {copiedUrl === network.url ? (
                                <><Check className="w-3.5 h-3.5 text-success" /> Copied</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copy</>
                              )}
                            </button>
                            <a 
                              href={network.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                              Visit <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button 
                              onClick={() => handleShare(network)}
                              className="flex items-center justify-center aspect-square h-full rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-95 text-muted-foreground hover:text-foreground"
                              aria-label="Share"
                            >
                              <Share className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-foreground mb-1">No networks found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-4 text-xs font-bold text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onOpenChange={setShowUpgradeModal} reason="jobs" />
        </>
        )}
      </motion.div>
    </div>
  );
}
