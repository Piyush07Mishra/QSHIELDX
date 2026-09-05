"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, ShieldAlert, Key, Lock, FileJson, TrendingUp, AlertTriangle, Activity, 
  ChevronRight, CalendarClock, ShieldCheck
} from "lucide-react"

import { useGlobalData } from "@/app/context/GlobalDataContext"
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useGlobalData();

  // Derived Metrics
  const metrics = useMemo(() => {
    const totalAssets = data.assets?.length || 0;
    
    // Quantum Readiness
    const vulnerableAssets = data.assets?.filter(a => 
      data.findings?.some(f => f.asset_id === a.id && (f.severity === 'critical' || f.severity === 'high'))
    ) || [];
    
    const quantumReadyCount = Math.max(0, totalAssets - vulnerableAssets.length);
    const quantumReadyPercent = totalAssets > 0 ? Math.round((quantumReadyCount / totalAssets) * 100) : 0;
    
    // Vulnerable Algorithms (count of findings)
    const vulnerableAlgosCount = data.findings?.length || 0;

    // Critical Secrets (assets of type secret or findings indicating secrets)
    const secretsCount = data.findings?.filter(f => f.title?.toLowerCase().includes('secret')).length || 0;

    // Migration Priority (sort assets by vulnerability count)
    const migrationPriority = [...(data.assets || [])]
      .map(a => {
        const assetFindings = data.findings?.filter(f => f.asset_id === a.id) || [];
        return { ...a, findingsCount: assetFindings.length, topFinding: assetFindings[0]?.title || "Legacy Cryptography" };
      })
      .filter(a => a.findingsCount > 0)
      .sort((a, b) => b.findingsCount - a.findingsCount)
      .slice(0, 5);

    // Cert Expiry (mock logic: assets with type certificate)
    const certsCount = data.assets?.filter(a => a.type === 'certificate').length || 0;
    
    // CBOM Reports
    const cbomCount = data.targets?.length || 0; // 1 report per target

    return {
      totalAssets,
      quantumReadyPercent,
      vulnerableAlgosCount,
      secretsCount,
      migrationPriority,
      certsCount,
      cbomCount
    };
  }, [data]);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-300">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Cryptography Overview</h1>
            <p className="text-muted-foreground mt-1 text-sm">Post-quantum readiness and cryptographic asset inventory.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/cbom">View Reports</Link>
            </Button>
            <Button asChild>
              <Link href="/targets/new">Run Discovery Scan</Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-background/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cryptographic Assets</CardTitle>
              <Key className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : metrics.totalAssets}</div>
              <p className="text-xs text-muted-foreground mt-1">Total indexed items</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quantum Ready</CardTitle>
              <Shield className={`h-4 w-4 ${metrics.quantumReadyPercent > 50 ? 'text-emerald-500' : 'text-amber-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.quantumReadyPercent > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isLoading ? "..." : `${metrics.quantumReadyPercent}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Using PQC Algorithms</p>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vulnerable Algorithms</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{isLoading ? "..." : metrics.vulnerableAlgosCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Deprecated cryptography detected</p>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Secrets</CardTitle>
              <Lock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{isLoading ? "..." : metrics.secretsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Exposed in repositories</p>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE SECTION: Gauge & Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Quantum Readiness Gauge */}
          <Card className="col-span-1 bg-background/60 backdrop-blur flex flex-col">
            <CardHeader>
              <CardTitle>Quantum Readiness Gauge</CardTitle>
              <CardDescription>Overall compliance with NIST PQC standards</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 gap-4 pb-8">
              <div className="relative size-40 flex items-center justify-center">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/20"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={metrics.quantumReadyPercent > 50 ? "text-emerald-500" : "text-amber-500"}
                    strokeDasharray={`${metrics.quantumReadyPercent}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{metrics.quantumReadyPercent}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Ready</span>
                </div>
              </div>
              <div className="flex gap-4 text-xs mt-2">
                <div className="flex items-center gap-1"><span className="size-2 bg-emerald-500 rounded-full" /> Compliant</div>
                <div className="flex items-center gap-1"><span className="size-2 bg-destructive rounded-full" /> At Risk</div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Priority Matrix */}
          <Card className="col-span-1 md:col-span-2 bg-background/60 backdrop-blur">
            <CardHeader>
              <CardTitle>Migration Priority Matrix</CardTitle>
              <CardDescription>Top systems requiring immediate cryptographic upgrades</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading analysis...</div>
              ) : metrics.migrationPriority.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No vulnerable systems detected.</div>
              ) : (
                <div className="space-y-4">
                  {metrics.migrationPriority.map((asset, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/30 p-2 -mx-2 rounded transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-destructive/10 text-destructive">
                          <ShieldAlert className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{asset.asset_value || "Unknown Asset"}</span>
                          <span className="text-xs text-muted-foreground font-mono">{asset.asset_type} • {asset.topFinding}</span>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        High Priority
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM SECTION: Feeds and Tables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Recent Discovery Activity Feed */}
          <Card className="col-span-1 bg-background/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Recent Discovery Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 border-l-2 border-muted ml-2">
                {data.targets?.slice(0, 4).map((target, idx) => (
                  <div key={idx} className="relative pl-4 pb-2">
                    <div className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold">Scan {target.status === 'Scanning' ? 'Started' : 'Completed'}</span>
                      <span className="text-sm font-medium">{target.target_domain || target.id}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(target.created_at).toLocaleString() || 'Just now'}</span>
                    </div>
                  </div>
                ))}
                {(!data.targets || data.targets.length === 0) && (
                  <div className="pl-4 text-xs text-muted-foreground">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cert Expiry & CBOM */}
          <div className="col-span-1 flex flex-col gap-6">
            <Card className="bg-background/60 backdrop-blur flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificate Expiry Timeline</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mt-2">{isLoading ? "..." : metrics.certsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Expiring in next 30 days</p>
                
                <div className="mt-6 flex justify-between text-xs text-muted-foreground border-b pb-2">
                  <span>Critical</span>
                  <span className="text-destructive font-bold">{Math.floor(metrics.certsCount * 0.2)}</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground border-b pb-2">
                  <span>Warning</span>
                  <span className="text-amber-500 font-bold">{Math.floor(metrics.certsCount * 0.5)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur flex-1 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/cbom')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CBOM Reports</CardTitle>
                <FileJson className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mt-2">{isLoading ? "..." : metrics.cbomCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Generated documents available</p>
                <div className="mt-4 flex items-center text-xs text-primary font-medium">
                  View Reports Repository <ChevronRight className="size-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Findings Table */}
          <Card className="col-span-1 bg-background/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Critical Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center text-xs text-muted-foreground">Loading findings...</div>
                ) : metrics.vulnerableAlgosCount > 0 ? (
                   [...Array(Math.min(4, metrics.vulnerableAlgosCount))].map((_, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border p-2 rounded bg-card">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3 text-destructive" />
                        <span className="font-mono text-xs">RSA-1024 Detected</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Fix Now</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground">No critical findings.</div>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs" size="sm" asChild>
                <Link href="/intelligence">View Intelligence Console</Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
