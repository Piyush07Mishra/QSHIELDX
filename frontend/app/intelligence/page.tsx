"use client"

import * as React from "react"
import { 
  Activity, Terminal, Cpu, Network, ShieldCheck, 
  FileJson, CheckCircle2, AlertCircle, Clock, Database, ChevronRight, ChevronDown, ChevronUp, Binary, BrainCircuit
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { createClient } from "@/lib/supabase"

// Type Definitions
type AgentActivity = {
  id: string
  scan_job_id: string
  tool_used: string
  command_executed: string
  output_summary: string
  status: string
  executed_at: string
}

export default function IntelligencePage() {
  const [expandedEvent, setExpandedEvent] = React.useState<string | null>(null)
  const [activities, setActivities] = React.useState<AgentActivity[]>([])
  const [loading, setLoading] = React.useState(true)
  
  const supabase = createClient()

  React.useEffect(() => {
    document.title = "Intelligence Console | QShieldX Dashboard";

    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('agent_activity')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20)
      
      if (data) {
        setActivities(data)
      }
      setLoading(false)
    }

    fetchActivities()

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('agent_activity_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_activity' },
        (payload) => {
          const newActivity = payload.new as AgentActivity
          setActivities(prev => [newActivity, ...prev].slice(0, 50)) // Keep last 50
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Derive agent queue state from recent activities
  const activeAgents = Array.from(new Set(activities.map(a => a.tool_used)))
  
  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BrainCircuit className="size-6 text-primary" />
          Intelligence Command Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time LangGraph agent orchestration and execution telemetry.
        </p>
      </div>

      {/* Main Grid: 3 Columns for top sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT PANEL: Agent Queue */}
        <Card className="col-span-1 border-primary/20 bg-background/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Network className="size-4 text-primary" />
              Active Tools / Agents
            </CardTitle>
            <CardDescription className="text-xs">Tools recently executed in pipelines.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {activeAgents.length === 0 && <p className="text-xs text-muted-foreground">No recent activity.</p>}
            {activeAgents.map((tool, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-md border bg-card text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-amber-500 animate-pulse" />
                  <span className="font-medium capitalize">{tool}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">Active</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CENTER PANEL: Live Agent Timeline */}
        <Card className="col-span-1 lg:col-span-2 border-primary/20 bg-background/50 backdrop-blur overflow-hidden flex flex-col h-[500px]">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Cpu className="size-4 text-primary" />
                  Live Agent Timeline
                </CardTitle>
                <CardDescription className="text-xs">Real-time graph transitions and decisions.</CardDescription>
              </div>
              <Badge variant="outline" className="animate-pulse bg-emerald-500/10 text-emerald-500 border-emerald-500/20">LIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-sm text-muted-foreground">No activities found. Start a scan to see timeline.</div>
            ) : activities.map((ev, idx) => (
              <div key={ev.id} className="relative pl-6 pb-2">
                {/* Timeline line */}
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-border" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-[7px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />

                <div className="rounded-lg border bg-card p-3 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Badge variant="secondary" className="text-[10px] uppercase font-mono cursor-pointer hover:bg-primary/20 transition-colors">{ev.tool_used}</Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 bg-background/95 backdrop-blur border-primary/20">
                          <div className="flex justify-between space-x-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold capitalize flex items-center gap-2">
                                <BrainCircuit className="size-4 text-primary" />
                                {ev.tool_used} Agent
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Autonomous agent executing `{ev.command_executed.split(' ')[0]}` instructions within the QShieldX LangGraph workflow.
                              </p>
                              <div className="flex items-center pt-2">
                                <Clock className="mr-2 h-3 w-3 opacity-70" />
                                <span className="text-xs text-muted-foreground">
                                  Executed at {new Date(ev.executed_at).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <ChevronRight className="size-3 text-muted-foreground" />
                      <Badge variant="outline" className={`text-[10px] uppercase font-mono border-primary/30 bg-primary/5 ${ev.status === 'failed' ? 'text-destructive border-destructive/30 bg-destructive/5' : 'text-primary'}`}>{ev.status}</Badge>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{new Date(ev.executed_at).toLocaleTimeString()}</span>
                  </div>
                  
                  <p className="text-sm font-medium mb-1">{ev.command_executed}</p>
                  
                  <div className="mt-3 p-2 bg-muted/50 rounded text-xs border-l-2 border-primary">
                    <span className="font-semibold text-foreground/80">Output: </span>
                    {ev.output_summary}
                  </div>

                  {/* JSON Payload Drawer Toggle */}
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-muted-foreground gap-1"
                      onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)}
                    >
                      <FileJson className="size-3" /> {expandedEvent === ev.id ? 'Hide Details' : 'View Details'} 
                      {expandedEvent === ev.id ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </Button>
                  </div>
                  
                  {expandedEvent === ev.id && (
                    <div className="mt-2 p-2 bg-black/90 dark:bg-black/40 rounded-md overflow-x-auto text-green-400 font-mono text-[10px] border border-primary/20">
                      <pre>{JSON.stringify(ev, null, 2)}</pre>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RIGHT PANEL: Live Scan Progress */}
        <Card className="col-span-1 border-primary/20 bg-background/50 backdrop-blur h-[500px] flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Scan Progress
            </CardTitle>
            <CardDescription className="text-xs">Real-time asset discovery metrics.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Overall Progress</span>
                <span className="text-primary font-mono">Real-time</span>
              </div>
              <Progress value={activities.length > 0 ? 50 : 0} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 border-b pb-1">Current Statistics</div>
              
              <div className="flex justify-between items-center bg-card p-2 rounded border shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-emerald-500" />
                  <span className="text-sm font-medium">Total Events</span>
                </div>
                <span className="font-mono font-bold">{activities.length}</span>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* BOTTOM PANEL: Streaming Terminal */}
      <Card className="flex-1 min-h-[250px] border-primary/20 bg-black text-green-400 font-mono shadow-inner overflow-hidden flex flex-col rounded-lg">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/60 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-green-400/80">Agent Console Activity</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] text-green-400/60 uppercase">Streaming WebSocket</span>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto text-[11px] leading-relaxed custom-scrollbar flex flex-col-reverse">
          {/* Blinking cursor at bottom (flex-col-reverse makes first item bottom) */}
          <div className="inline-block w-2 h-3 bg-green-400 animate-pulse ml-1 mt-1" />
          {activities.slice(0, 15).map((log, i) => (
            <div key={log.id} className="hover:bg-white/5 px-1 rounded transition-colors break-all flex gap-2">
              <span className="text-green-600">[{new Date(log.executed_at).toLocaleTimeString()}]</span>
              <span className="text-green-500">[{log.tool_used.toUpperCase()}]</span>
              <span>{log.command_executed} - {log.status}</span>
            </div>
          ))}
        </div>
      </Card>
      
    </div>
  )
}
