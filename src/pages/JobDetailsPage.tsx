import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { MatchExplanation } from '@/components/MatchExplanation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MatchScoreBar } from '@/components/MatchScoreBar';
import { SkillBadge } from '@/components/SkillBadge';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ArrowLeft, Sparkles, MapPin, Banknote, Building2, ExternalLink, FileText, MessageSquare, Wrench, BookOpen, ThumbsUp, ThumbsDown, Download, Share2 } from 'lucide-react';
// Removed: import { mockJobs } from '@/data/mockJobs';
import { matchJobs } from '@/lib/matching';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { generateJobAnalysis, generateFitCv, generateInterviewPrep, parseCvToStructure } from '@/lib/ai';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { jsPDF } from 'jspdf';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, matchedJobs, savedJobs, saveJob, allMatchedJobs, recordFeedback, incrementDailyCvFits, incrementDailyAiAnalysis, incrementDailyInterviewPrep, checkLimit } = useApp();
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'jobs' | 'cv'>('cv');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicInsight, setDynamicInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New states for Fit CV form
  const [showFitCvForm, setShowFitCvForm] = useState(false);
  const [cvText, setCvText] = useState(profile?.cvText || '');
  const [measurableAchievements, setMeasurableAchievements] = useState('');
  const [missingItems, setMissingItems] = useState('');

  let job = matchedJobs.find(j => j.id === id)
    || allMatchedJobs.find(j => j.id === id)
    || savedJobs.find(s => s.job.id === id)?.job;

  // Removed mock fallback
  // if (!job && profile) {
  //   const all = matchJobs(profile, mockJobs);
  //   job = all.find(j => j.id === id);
  // }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  const isSaved = savedJobs.some(s => s.job.id === job!.id);

  const aiTools = [
    { id: 'fit-cv', icon: FileText, label: 'Fit CV', description: 'Tailor your CV profile and summary to match this specific role' },
    { id: 'interview', icon: MessageSquare, label: 'Interview Prep', description: 'Practice with AI-generated questions specific to this role' },
  ];

  useEffect(() => {
    if (job && profile && !job.aiInsight && !dynamicInsight && !isLoadingInsight) {
      if (checkLimit('DAILY_AI_INSIGHTS')) {
        return;
      }
      setIsLoadingInsight(true);
      generateJobAnalysis(job, profile)
        .then(res => {
          setDynamicInsight(res);
          incrementDailyAiAnalysis();
        })
        .catch(() => setDynamicInsight("Couldn't generate AI insight at this time."))
        .finally(() => setIsLoadingInsight(false));
    }
  }, [job?.id, profile?.role]);

  const handleToolClick = async (toolId: string) => {
    if (!profile) {
      toast.error('Complete your profile first!');
      return;
    }
    
    setIsGenerating(true);
    setActiveAiTool(toolId);
    setAiResult(null);
    toast.info('AI is thinking...');

    try {
      let result = '';
      if (toolId === 'fit-cv') {
        setShowFitCvForm(true);
        setIsGenerating(false);
        return;
      } else if (toolId === 'interview' || toolId === 'qa') {
        if (checkLimit('DAILY_INTERVIEW_PREP')) {
          setUpgradeReason('cv');
          setShowUpgradeModal(true);
          return;
        }
        result = await generateInterviewPrep(job, profile);
        incrementDailyInterviewPrep();
      }
      setAiResult(result);
      toast.success('Generated!');
    } catch (err) {
      toast.error('AI processing failed. Check your API keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFitCv = async () => {
    if (!profile) return;
    
    // Check Premium limits
    if (checkLimit('DAILY_CV_FITS')) {
      setUpgradeReason('cv');
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setAiResult(null);
    incrementDailyCvFits(); // Burn the credit before starting the process
    toast.info('Analyzing & Structuring CV...');

    try {
      // Step 1: Combine raw inputs into a single text for structured parsing
      const fullRawContext = `
        PRIMARY CV TEXT:
        ${cvText}
        
        ACHIEVEMENTS:
        ${measurableAchievements}
        
        MISSITIVE TOOLS/PROJECTS:
        ${missingItems}
      `.trim();

      // Step 2: Parse into the required structure
      const structuredCv = await parseCvToStructure(fullRawContext);
      console.log('Structured CV Input for AI Fit:', JSON.stringify(structuredCv, null, 2));
      
      // Step 3: Generate the fit using the structured data
      const result = await generateFitCv(job, structuredCv);
      
      setAiResult(result);
      setShowFitCvForm(false);
      toast.success('CV Tailored Successfully!');
    } catch (err) {
      console.error('Fit CV Error:', err);
      toast.error('Failed to fit CV. Check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!aiResult || !job) return;
    
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const printableWidth = pageWidth - (margin * 2);
    const footerHeight = 15;
    
    // Branding Header
    const drawHeader = (pageDoc: jsPDF) => {
      pageDoc.setFontSize(24);
      pageDoc.setTextColor(67, 24, 255); // GigSpark Primary
      pageDoc.setFont('helvetica', 'bold');
      pageDoc.text('GigSpark', margin, 25);
      
      pageDoc.setFontSize(10);
      pageDoc.setTextColor(120, 120, 120);
      pageDoc.setFont('helvetica', 'normal');
      pageDoc.text(`Tailored CV Insight • ${job.company}`, margin, 32);
      
      pageDoc.setDrawColor(230, 230, 230);
      pageDoc.line(margin, 38, pageWidth - margin, 38);
    };

    drawHeader(doc);
    
    // Content Setup
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(aiResult, printableWidth);
    let cursorY = 48;
    const lineHeight = 6;

    lines.forEach((line: string) => {
      if (cursorY > pageHeight - footerHeight - lineHeight) {
        doc.addPage();
        drawHeader(doc);
        cursorY = 48;
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });
    
    // Add page numbers and footer to all pages
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(
        `Page ${i} of ${totalPages}  |  Generated by GigSpark AI on ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 10
      );
    }

    const safeCompanyName = job.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `GigSpark_CV_${safeCompanyName}.pdf`;
    doc.save(fileName);
    toast.success(`CV Exported: ${fileName}`);
  };

  return (
    <div className="pb-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-muted-foreground">Job Details</span>
          </div>
          <button
            onClick={() => {
              const shareData = {
                title: job!.title,
                text: `Check out this job: ${job!.title} at ${job!.company}`,
                url: window.location.origin + `/job/${job!.id}`
              };
              if (navigator.share) {
                navigator.share(shareData).catch(console.error);
              } else {
                navigator.clipboard.writeText(shareData.url);
                toast.success('Link copied to clipboard');
              }
            }}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4">
          {/* Job Info Card */}
          <div className="glass-card rounded-2xl p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-xl gradient-bg flex items-center justify-center text-3xl">{job.logo}</div>
              <MatchExplanation job={job} compact />
            </div>
            <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
              <Building2 className="w-4 h-4" /><span>{job.company}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" />{job.salary}</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{job.type}</span>
            </div>
            <MatchScoreBar score={job.matchScore} />
          </div>

          {/* Match Analysis */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-primary">Match Analysis</h3>
            </div>
            {isLoadingInsight ? (
              <div className="space-y-2 mb-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                {dynamicInsight || job.aiInsight || "No specific insight available."}
              </p>
            )}
            <MatchExplanation job={job} />
          </div>

          {/* Feedback */}
          <div className="glass-card rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Is this a good match?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { recordFeedback(job!.id, 'relevant'); toast.success('Marked as relevant'); }}
                className="flex-1 py-2 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-success/20 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Relevant
              </button>
              <button
                onClick={() => { recordFeedback(job!.id, 'not_relevant'); toast('Marked as not relevant'); }}
                className="flex-1 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-destructive/20 transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Not Relevant
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-bold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.matchedSkills.map(s => <SkillBadge key={s} skill={s} matched />)}
              {job.missingSkills.map(s => <SkillBadge key={s} skill={s} />)}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-bold mb-3">About This Role</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{job.description}</p>
            <h4 className="text-sm font-bold mb-2">Requirements</h4>
            <ul className="space-y-1.5">
              {job.requirements.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>{r}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Tools */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">AI Tools</h3>
            </div>
            
            {!showFitCvForm && !aiResult && (
              <div className="flex flex-col gap-2">
                {aiTools.map(tool => (
                  <button
                    key={tool.id}
                    disabled={isGenerating}
                    onClick={() => handleToolClick(tool.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left group",
                      activeAiTool === tool.id ? "bg-primary/10 border-primary" : "bg-muted border-border hover:border-primary/30"
                    )}
                  >
                    <tool.icon className={cn("w-4 h-4 mb-1.5 transition-colors", activeAiTool === tool.id ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                    <p className="text-xs font-semibold">{tool.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                  </button>
                ))}
              </div>
            )}
            
            {showFitCvForm && !aiResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 p-4 rounded-xl bg-card border border-border space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Enhance CV Fit</h4>
                  <button 
                    onClick={() => { setShowFitCvForm(false); setActiveAiTool(null); }} 
                    className="text-[10px] text-muted-foreground hover:text-foreground p-1"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current CV Text</label>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-[10px] font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isUploading ? 'Parsing...' : 'Upload PDF'}
                      </button>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          const tid = toast.loading('Extracting PDF text...');
                          try {
                            const text = await extractTextFromPdf(file);
                            setCvText(text);
                            toast.success('CV Updated!', { id: tid });
                          } catch (err) {
                            toast.error('Failed to parse PDF', { id: tid });
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                    <textarea 
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      placeholder="Paste your resume content or LinkedIn summary here..."
                      className="w-full h-32 text-xs bg-muted border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all resize-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">Any measurable achievements not already listed?</label>
                    <input 
                      type="text"
                      value={measurableAchievements}
                      onChange={(e) => setMeasurableAchievements(e.target.value)}
                      placeholder="e.g., Led 5 devs, saved $20k/year..."
                      className="w-full text-xs bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5 uppercase tracking-wider">Any tools/certifications/projects missing?</label>
                    <input 
                      type="text"
                      value={missingItems}
                      onChange={(e) => setMissingItems(e.target.value)}
                      placeholder="e.g., Docker, SQL Certification, Blog project..."
                      className="w-full text-xs bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleGenerateFitCv}
                  disabled={isGenerating || !cvText}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isGenerating ? "AI Processing..." : <><Sparkles className="w-3.5 h-3.5" /> Tailor CV Now</>}
                </button>
              </motion.div>
            )}

            {aiResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-5 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Personalized AI Result</h4>
                  </div>
                  <button 
                    onClick={() => { setAiResult(null); setActiveAiTool(null); setShowFitCvForm(false); }} 
                    className="text-[10px] text-muted-foreground hover:text-foreground p-1"
                  >
                    Clear
                  </button>
                </div>
                <div id="printable-cv" className="text-sm text-foreground whitespace-pre-wrap font-serif leading-relaxed h-72 overflow-y-auto pr-3 custom-scrollbar">
                  {aiResult}
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(aiResult); toast.success('Copied to clipboard!'); }}
                    className="flex-1 py-2.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors border border-primary/10"
                  >
                    Copy Text
                  </button>
                  <button 
                    onClick={handleDownloadPdf}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isSaved && (
              <button
                onClick={() => { saveJob(job!); toast.success('Job saved!'); }}
                className="flex-1 py-3.5 rounded-xl bg-muted border border-border text-foreground font-semibold hover:border-primary/30 transition-colors"
              >
                Save Job
              </button>
            )}
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-xl gradient-bg text-primary-foreground font-semibold text-center glow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />Apply Now
            </a>
          </div>
        </div>
      </motion.div>
      <UpgradeModal isOpen={showUpgradeModal} onOpenChange={setShowUpgradeModal} reason={upgradeReason} />
    </div>
  );
}
