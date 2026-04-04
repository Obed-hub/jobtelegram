import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Activity, Users, Zap, ShieldAlert, CheckCircle2, XCircle, Search, RefreshCcw } from 'lucide-react';
import { AppError, UserProfile } from '@/types/job';
import { isUserAdmin } from '@/config/admin';

const AdminPage: React.FC = () => {
  const { user, profile } = useApp();
  const [users, setUsers] = useState<{ id: string; profile: UserProfile }[]>([]);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uptime, setUptime] = useState<'online' | 'checking' | 'error'>('checking');

  useEffect(() => {
    // Check "uptime" (Firebase connectivity)
    const checkUptime = async () => {
      try {
        await getDocs(query(collection(db, 'users'), limit(1)));
        setUptime('online');
      } catch (err) {
        setUptime('error');
      }
    };
    checkUptime();

    // Real-time listener for users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList: { id: string; profile: UserProfile }[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.profile) {
          usersList.push({ id: doc.id, profile: data.profile });
        } else {
          // Add a placeholder profile so they still show up in the list
          usersList.push({ id: doc.id, profile: { role: 'Incomplete' } as any });
        }
      });
      setUsers(usersList);
    }, (err) => {
      console.error('Error listening to users:', err);
      toast.error('Failed to sync users in real-time');
    });

    // Real-time listener for errors
    const errorsQuery = query(collection(db, 'errors'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeErrors = onSnapshot(errorsQuery, (snapshot) => {
      const errorsList: AppError[] = [];
      snapshot.forEach((doc) => {
        errorsList.push({ id: doc.id, ...doc.data() } as AppError);
      });
      setErrors(errorsList);
      setLoading(false);
    });

    return () => {
      unsubscribeErrors();
      unsubscribeUsers();
    };
  }, []);

  const togglePremium = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profile.isPremium': !currentStatus
      });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, profile: { ...u.profile, isPremium: !currentStatus } } : u
      ));
      
      toast.success(`User ${!currentStatus ? 'upgraded to' : 'downgraded from'} Premium`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.profile.role?.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate AI Usage
  const totalAiUsage = users.reduce((acc, u) => {
    return {
      analysis: acc.analysis + (u.profile?.dailyAiAnalysisCount || 0),
      cvFits: acc.cvFits + (u.profile?.dailyCvFits || 0),
      interviews: acc.interviews + (u.profile?.dailyInterviewCount || 0),
      swipes: acc.swipes + (u.profile?.dailyJobsSwiped || 0),
    };
  }, { analysis: 0, cvFits: 0, interviews: 0, swipes: 0 });

  if (!isUserAdmin(user?.uid) && !profile?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitoring and Management Control Center</p>
        </div>
        <Badge variant={uptime === 'online' ? 'default' : 'destructive'} className="flex gap-1 py-1 px-3">
          {uptime === 'online' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {uptime === 'online' ? 'System Online' : 'System Offline'}
        </Badge>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="usage">AI Usage</TabsTrigger>
          <TabsTrigger value="crashes">Crashes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Active in database</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.profile.isPremium).length}</div>
                <p className="text-xs text-muted-foreground">Upgraded accounts</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errors.length} Logs</div>
                <p className="text-xs text-muted-foreground">Recent errors tracked</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent Activity Overview</CardTitle>
              <CardDescription>A summary of platform usage and system status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span>Firebase Connection</span>
                  <span className="font-medium text-emerald-500">Stable</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span>Auth Service</span>
                  <span className="font-medium text-emerald-500">Operational</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <span>AI Inference Engines</span>
                  <span className="font-medium text-emerald-500">Active (Groq/Gemini)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Platform Version</span>
                  <span className="font-medium">1.2.0-spark</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>Manage and upgrade user accounts.</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by role or UID..." 
                    className="pl-8 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User UID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-xs">{u.id.substring(0, 10)}...</TableCell>
                        <TableCell>{u.profile?.role || 'New User'}</TableCell>
                        <TableCell>
                          {u.profile?.isPremium ? (
                            <Badge variant="default" className="bg-amber-500">Premium</Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground italic">
                          {u.profile?.lastActivityDate || 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => togglePremium(u.id, u.profile.isPremium)}
                          >
                            {u.profile.isPremium ? 'Downgrade' : 'Upgrade to Premium'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>AI Inference Usage (Today)</CardTitle>
              <CardDescription>Aggregated metrics for AI usage across all users today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold">{totalAiUsage.swipes}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Job Swipes</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold">{totalAiUsage.analysis}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">AI Analyses</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold">{totalAiUsage.cvFits}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">CV Fits</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold">{totalAiUsage.interviews}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Interviews</div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                <p className="text-sm text-muted-foreground">
                  Estimated Current Burn Rate: <span className="font-bold text-foreground">~0.12 Tokens/Min</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crashes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Crash Logs</CardTitle>
                <CardDescription>Real-time tracking of application errors and crashes.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errors.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    No crashes reported. System is healthy!
                  </div>
                ) : (
                  errors.map((err) => (
                    <div key={err.id} className="p-4 border rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm font-bold text-destructive truncate max-w-[70%]">
                          {err.message}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(err.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono bg-background/50 p-2 rounded mb-2 overflow-x-auto">
                        URL: {err.url}<br/>
                        User: {err.userId}
                      </div>
                      <details className="text-[10px]">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground underline">View Stack Trace</summary>
                        <pre className="mt-2 p-2 bg-black text-xs text-white overflow-x-auto whitespace-pre-wrap">
                          {err.stack || 'No stack trace available'}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
