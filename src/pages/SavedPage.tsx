import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchScoreBar } from '@/components/MatchScoreBar';
import { Bookmark, Trash2, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedPage() {
  const { savedJobs, removeJob } = useApp();
  const navigate = useNavigate();
  const saved = savedJobs.filter(s => s.status === 'saved');

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Saved Jobs</h1>
          <p className="text-xs text-muted-foreground">{saved.length} saved</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl mb-2">📑</p>
          <p className="text-muted-foreground">No saved jobs yet</p>
          <p className="text-xs text-muted-foreground mt-1">Swipe right on jobs you like to save them</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {saved.map(({ job }) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200 }}
                className="glass-card rounded-xl p-4 cursor-pointer"
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg gradient-bg flex items-center justify-center text-xl shrink-0">{job.logo}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{job.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />{job.company}
                      <span className="mx-1">·</span>
                      <MapPin className="w-3 h-3" />{job.location}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <MatchScoreBar score={job.matchScore} size="sm" />
                      <span className="text-xs font-semibold text-primary shrink-0">{job.matchScore}%</span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeJob(job.id); toast('Removed'); }}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
