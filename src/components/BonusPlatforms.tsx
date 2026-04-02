import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Search, 
  Mic2, 
  Video, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  FileSearch,
  X,
  MessageSquare,
  Database,
  Sparkles,
  Gamepad2,
  Headphones,
  Globe,
  Mic,
  MousePointer2,
  CheckCircle,
  Calendar,
  Coffee,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Platform {
  name: string;
  category: 'AI Training' | 'Community Mod' | 'Micro-tasks' | 'Specialized';
  tier: 'Tier 1: Easy Start' | 'Tier 2: High Upside' | 'Tier 3: Waitlist';
  type: string;
  icon: React.ReactNode;
  payMethod: string;
  instructions: string[];
  advice: string[];
  url: string;
}

const platforms: Platform[] = [
  // AI DATA ANNOTATION
  {
    name: 'Toloka AI',
    category: 'AI Training',
    tier: 'Tier 1: Easy Start',
    type: 'AI/Data Annotation',
    icon: <Cpu className="w-5 h-5" />,
    payMethod: 'Payoneer',
    instructions: [
      'Create account (Nigeria/English)',
      'Fill profile completely (labeling/moderation)',
      'Connect Payoneer immediately',
      'Start with training tasks'
    ],
    advice: [
      'Constant high-volume tasks in 2026',
      'Accuracy builds your reputation rank',
      'API-friendly for potential app sync'
    ],
    url: 'https://toloka.ai/'
  },
  {
    name: 'Remotasks',
    category: 'AI Training',
    tier: 'Tier 1: Easy Start',
    type: 'Visual Annotation',
    icon: <Database className="w-5 h-5" />,
    payMethod: 'PayPal / AirTM',
    instructions: [
      'Register (Select Nigeria)',
      'Pass English proficiency test',
      'Start training courses (Lidar/2D)',
      'Join Discord group for tips'
    ],
    advice: [
      'Need steady internet for visual tasks',
      'Visual labeling pays more after training',
      'Highly active community in Nigeria'
    ],
    url: 'https://www.remotasks.com/'
  },
  {
    name: 'OneForma',
    category: 'AI Training',
    tier: 'Tier 1: Easy Start',
    type: 'Micro-projects',
    icon: <Globe className="w-5 h-5" />,
    payMethod: 'Payoneer / PayPal',
    instructions: [
      'Complete profile to 100%',
      'Pass ID/KYC verification',
      'Apply: Voice recordings & Image collection',
      'Check dashboard weekly'
    ],
    advice: [
      'Voice tasks pay best in US$ range',
      'Great for global users without a degree',
      'Respond quickly to recruiters'
    ],
    url: 'https://www.oneforma.com/'
  },
  {
    name: 'Outlier',
    category: 'AI Training',
    tier: 'Tier 2: High Upside',
    type: 'AI Reinforcement',
    icon: <Zap className="w-5 h-5" />,
    payMethod: 'Weekly Pay',
    instructions: [
      'Must be 18+ for registration',
      'Select specialty: Writing, Coding, Logic',
      'Complete location/ID verification',
      'Read manual before every task'
    ],
    advice: [
      '2026 leader for LLM training',
      'High pay but zero tolerance for VPNs',
      'Coding experts earn $25-50+/hr'
    ],
    url: 'https://outlier.ai/'
  },
  {
    name: 'DataAnnotation',
    category: 'AI Training',
    tier: 'Tier 2: High Upside',
    type: 'Premium AI Work',
    icon: <ShieldCheck className="w-5 h-5" />,
    payMethod: 'PayPal',
    instructions: [
      'Pass core assessment carefully',
      'Wait for email approval',
      'Maintain 100% accuracy'
    ],
    advice: [
      'Elite platform (Waitlist common)',
      'High pay ($20+/hr) once approved',
      'Best for English speaking specialists'
    ],
    url: 'https://www.dataannotation.tech/'
  },

  // CHAT & COMMUNITY MODERATION
  {
    name: 'ModSquad',
    category: 'Community Mod',
    tier: 'Tier 2: High Upside',
    type: 'Community/Chat Mod',
    icon: <MessageSquare className="w-5 h-5" />,
    payMethod: 'Payoneer',
    instructions: [
      'Apply for "Mod" position',
      'Pass basic background check',
      'Pick favorite brands/games',
      'Set your own schedule'
    ],
    advice: [
      'Official chat mods for big brands',
      'Work from phone or laptop',
      'Professional tone is important'
    ],
    url: 'https://modsquad.com/'
  },
  {
    name: 'The Mayeaux Found.',
    category: 'Community Mod',
    tier: 'Tier 2: High Upside',
    type: 'Discord Moderation',
    icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
    payMethod: 'AirTM / Crypto',
    instructions: [
      'Join Discord recruitment server',
      'Pass moderation assessment',
      'Assign yourself to projects'
    ],
    advice: [
      'Average pay around $12.50/hr',
      'Good for Discord native users',
      'Fast growing platform in 2026'
    ],
    url: 'https://mayeaux.org/'
  },
  {
    name: 'HostSEO Limited',
    category: 'Community Mod',
    tier: 'Tier 1: Easy Start',
    type: 'Chat Assistant',
    icon: <Headphones className="w-5 h-5" />,
    payMethod: 'Direct Deposit',
    instructions: [
      'Check "Remote Careers" page',
      'Submit CV (emphasize chat experience)',
      'Pass communication test'
    ],
    advice: [
      'Frequent "Chat Assistant" roles',
      'Remote-first hiring policy',
      'Good for non-video office roles'
    ],
    url: 'https://hostseo.com/careers'
  },
  {
    name: 'SocialStack',
    category: 'Community Mod',
    tier: 'Tier 2: High Upside',
    type: 'Web3/Crypto Mod',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    payMethod: 'USDT / Payoneer',
    instructions: [
      'Apply as Community Manager',
      'Pass Web3 knowledge test',
      'Engage in Discord/Telegram'
    ],
    advice: [
      'Specialized in Web3 communities',
      'Higher pay for niche crypto mods',
      'Best for early adopters'
    ],
    url: 'https://socialstack.ly/'
  },

  // MICRO-TASK PLATFORMS
  {
    name: 'Clickworker',
    category: 'Micro-tasks',
    tier: 'Tier 1: Easy Start',
    type: 'Global Giant',
    icon: <Search className="w-5 h-5" />,
    payMethod: 'Payoneer / PayPal',
    instructions: [
      'Fill profile + demographic info',
      'Pass language baseline tests',
      'Check UHRS options',
      'Frequent app testing tasks'
    ],
    advice: [
      'LXT/UHRS tasks pay more',
      'Refreshing feed often is key',
      'Most reliable micro-task site'
    ],
    url: 'https://www.clickworker.com/'
  },
  {
    name: 'Amazon MTurk',
    category: 'Micro-tasks',
    tier: 'Tier 2: High Upside',
    type: 'Human Intelligence',
    icon: <Database className="w-5 h-5 text-orange-500" />,
    payMethod: 'Bank / GiftCard',
    instructions: [
      'Apply (Acceptance varies by region)',
      'Search HITs (Human Intel Tasks)',
      'Complete 100 simple HITs first',
      'Unlock master qualifications'
    ],
    advice: [
      'Filter by Highest Reward amount',
      'Avoid low-pay batches initially',
      'Legacy giant, high trust'
    ],
    url: 'https://www.mturk.com/'
  },
  {
    name: 'SproutGigs',
    category: 'Micro-tasks',
    tier: 'Tier 1: Easy Start',
    type: 'Small Tasking',
    icon: <MousePointer2 className="w-5 h-5" />,
    payMethod: 'AirTM / Payoneer / Crypto',
    instructions: [
      'SignUp as a "Worker"',
      'Pick "Micro-jobs" section',
      'Submit proof screenshot as requested',
      'Maintain high success rate'
    ],
    advice: [
      'Fast for small digital actions',
      'Best for earning few dollars quickly',
      'Available globally in 2026'
    ],
    url: 'https://sproutgigs.com/'
  },
  {
    name: 'Microworkers',
    category: 'Micro-tasks',
    tier: 'Tier 1: Easy Start',
    type: 'Digital Actions',
    icon: <MousePointer2 className="w-5 h-5 text-blue-500" />,
    payMethod: 'Skrill / Payoneer',
    instructions: [
      'Register + confirm address',
      'Pick specific campaigns',
      'Follow instructions to the letter'
    ],
    advice: [
      'Available globally',
      'Good for small, repetitive tasks',
      'Regular withdrawal schedule'
    ],
    url: 'https://www.microworkers.com/'
  },

  // SPECIALIZED NO-EXPERIENCE
  {
    name: 'Cambly',
    category: 'Specialized',
    tier: 'Tier 2: High Upside',
    type: 'Chat Tutoring',
    icon: <BookOpen className="w-5 h-5 text-red-500" />,
    payMethod: 'Weekly Pay (PayPal)',
    instructions: [
      'Upload 1-min intro video',
      'Be native/fluent in English',
      'Start conversation sessions',
      'Maintain 4.7+ rating'
    ],
    advice: [
      'No certificate needed to start',
      'Work anytime by going online',
      'Best for natural conversationalists'
    ],
    url: 'https://www.cambly.com/'
  },
  {
    name: 'UserTesting',
    category: 'Specialized',
    tier: 'Tier 2: High Upside',
    type: 'Usability Testing',
    icon: <Video className="w-5 h-5" />,
    payMethod: 'PayPal',
    instructions: [
      'Complete practice test slowly',
      'Speak thoughts clearly ($10/20m)',
      'Keep notifications on for tests'
    ],
    advice: [
      'Highly competitive in Nigeria',
      'Speak slowly & provide deep insights',
      'Quiet room is non-negotiable'
    ],
    url: 'https://www.usertesting.com/'
  },
  {
    name: 'Trymata (TryMyUI)',
    category: 'Specialized',
    tier: 'Tier 2: High Upside',
    type: 'UX Feedback',
    icon: <Video className="w-5 h-5 text-green-500" />,
    payMethod: 'PayPal',
    instructions: [
      'Complete qualification video',
      'Download recorder software',
      'Review apps/sites as assigned'
    ],
    advice: [
      'Similar to UserTesting but smaller',
      'Honest feedback is rewarded',
      'Check dashboard often'
    ],
    url: 'https://www.trymata.com/'
  },
  {
    name: 'Freecash',
    category: 'Specialized',
    tier: 'Tier 1: Easy Start',
    type: 'Task Offerwall',
    icon: <Gamepad2 className="w-5 h-5 text-blue-500" />,
    payMethod: 'PayPal / Crypto',
    instructions: [
      'Select "Offers" or "Tasks"',
      'Search for "Game testing"',
      'Complete levels to earn reward',
      'Instant withdrawal options'
    ],
    advice: [
      'Surprisingly high payout for games',
      '2026 leader in offer-wall rewards',
      'Easy to start on mobile'
    ],
    url: 'https://freecash.com/'
  }
];

export const BonusPlatforms = () => {
  return (
    <div className="mt-10 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Extra Income Streams</h2>
          <p className="text-xs text-muted-foreground">High-signal micro-platforms for Nigerian workers</p>
        </div>
      </div>

      {/* 3-Week Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { title: 'Week 1: Setup', items: ['Payoneer', 'Toloka', 'OneForma', 'Clickworker'], color: 'border-green-500/20 bg-green-500/5' },
          { title: 'Week 2: Expand', items: ['Microworkers', 'SproutGigs', 'UserTesting'], color: 'border-primary/20 bg-primary/5' },
          { title: 'Week 3: High Upside', items: ['Trymata', 'Outlier', 'Cambly'], color: 'border-blue-500/20 bg-blue-500/5' }
        ].map((week, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${week.color}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {week.title}
            </h3>
            <ul className="space-y-1.5">
              {week.items.map(item => (
                <li key={item} className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Daily Schedule */}
      <div className="glass-card rounded-2xl p-5 mb-10 border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Coffee className="w-12 h-12" />
        </div>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Recommended Daily Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase block mb-1">Morning</span>
            <p className="text-[11px] text-muted-foreground">Check new tasks on Toloka, Clickworker & OneForma</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase block mb-1">Afternoon</span>
            <p className="text-[11px] text-muted-foreground">Complete assessments and perform usability tests</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase block mb-1">Evening</span>
            <p className="text-[11px] text-muted-foreground">Withdraw earnings, track progress & update profiles</p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {(['AI Training', 'Community Mod', 'Micro-tasks', 'Specialized'] as const).map(category => (
          <div key={category} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.filter(p => p.category === category).map((platform, idx) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-2xl p-5 border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative h-full flex flex-col"
                >
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl uppercase tracking-tighter ${
                    platform.tier.includes('Tier 1') ? 'bg-green-500/20 text-green-500' :
                    platform.tier.includes('Tier 2') ? 'bg-primary/20 text-primary' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {platform.tier}
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-0.5">{platform.name}</h3>
                      <p className="text-[10px] font-medium text-success uppercase tracking-widest">
                        {platform.payMethod}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 flex-1">
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1.5 uppercase opacity-60">
                        <ArrowRight className="w-2.5 h-2.5" />
                        Steps
                      </h4>
                      <ul className="space-y-1">
                        {platform.instructions.map((inst, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-tight">
                            <span className="text-primary font-bold">{i + 1}.</span>
                            {inst}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1.5 uppercase opacity-60">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Advice
                      </h4>
                      <p className="text-[11px] text-muted-foreground italic leading-snug">
                        {platform.advice[0]}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={platform.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-muted/50 rounded-xl text-[11px] font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    Visit {platform.name}
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ultimate Guide for Nigerians */}
      <div className="mt-20 space-y-8">
        <div className="relative p-8 rounded-3xl bg-primary/5 border border-primary/10 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <h2 className="text-2xl font-bold mb-4 relative z-10">Step-by-Step for Nigerians</h2>
          <p className="text-muted-foreground text-sm mb-8 relative z-10 leading-relaxed">
            The ultimate blueprint for making money on these platforms from Nigeria. Follow this order to avoid account bans and payment issues.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-base mb-1">Elite Identity Setup</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Prepare an **International Passport** or a verified **NIN Slip**. International passports have 99% success rate for global KYC (Know Your Customer) checks.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-base mb-1">Professional Workrails</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Use a **brand new Gmail account** strictly for work. Do not use your social/junk email. Verify your identity on **Payoneer** early as it is the most robust payout rail for AI platforms.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-base mb-1">Hardware & Tech</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Ensure you have a **stable internet connection**. Tasks like Lidar on Remotasks or voice recording on OneForma require high-quality data and quiet environments.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-base mb-1">Strict Location Compliance</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">**Never use a VPN.** Platforms like Outlier can detect VPNs instantly and will permanently ban your account. Always work from your registered home network.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="mt-8 space-y-4">
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Success Checklist for Nigerians
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] font-bold text-success uppercase block mb-2">Do This</span>
              <ul className="space-y-1.5">
                {[
                  'Complete profiles to 100%',
                  'Use one identity consistently',
                  'Connect payout (Payoneer) early',
                  'Pass tests with 100% focus',
                  'Stay on 3–5 platforms (don\'t overstretch)',
                  'Build a reputation for accuracy'
                ].map(item => (
                  <li key={item} className="text-[11px] text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-bold text-destructive uppercase block mb-2">Avoid This</span>
              <ul className="space-y-1.5">
                {[
                  'Fake location or VPN use',
                  'Using fake/borrowed IDs',
                  'Creating multiple accounts',
                  'Rushing qualification tests',
                  'Accepting tasks you don\'t understand'
                ].map(item => (
                  <li key={item} className="text-[11px] text-muted-foreground flex items-start gap-2">
                    <X className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
          <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
            Warning for Nigerians
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Platforms like **Outlier**, **Remotasks**, and **ModSquad** have very strict security. If you are caught using a VPN or faking your location, your account and all earned funds will be permanently frozen. Use your real data always.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};
