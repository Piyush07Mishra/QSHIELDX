"use client"

import * as React from "react"
import { 
  AlertTriangle, ShieldCheck, Activity, Network, 
  Key, CalendarClock, Zap, CheckCircle2, ShieldAlert,
  ArrowRight
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGlobalData } from "@/app/context/GlobalDataContext"

export default function QuantumRiskPage() {
  const { data, isLoading } = useGlobalData()

  React.useEffect(() => {
    document.title = "Quantum Risk Assessment | QShieldX Dashboard"
  }, [])

  // Derived mock data for advanced PQC visualizations based on existing assets
  const algorithms = React.useMemo(() => {
    if (!data.findings || data.findings.length === 0) {
      return [
        { algo: "RSA-1024", keySize: "1024-bit", tls: "TLS 1.2", cert: "api.acme.com", pqc: "ML-KEM (Kyber)", status: "Critical" },
        { algo: "RSA-2048", keySize: "2048-bit", tls: "TLS 1.3", cert: "dev.acme.com", pqc: "ML-KEM (Kyber)", status: "High" },
        { algo: "ECC P-256", keySize: "256-bit", tls: "TLS 1.3", cert: "admin.acme.local", pqc: "ML-DSA (Dilithium)", status: "Medium" },
        { algo: "SHA-1", keySize: "160-bit", tls: "N/A", cert: "Legacy Codebase", pqc: "SHA-3", status: "Critical" },
        { algo: "AES-256-GCM", keySize: "256-bit", tls: "TLS 1.3", cert: "database.acme.internal", pqc: "None Required", status: "Safe" },
      ];
    }
    return data.findings.map(f => ({
      algo: f.title,
      keySize: "Variable",
      tls: "Variable",
      cert: f.asset_id || "Unknown Component",
      pqc: f.severity === 'critical' || f.severity === 'high' ? "ML-KEM / ML-DSA" : "N/A",
      status: f.severity === 'critical' ? 'Critical' : f.severity === 'high' ? 'High' : 'Medium'
    }));
  }, [data.findings]);

  const recommendations = [
    { 
      title: "Migrate RSA Key Exchange to ML-KEM", 
      desc: "NIST standard FIPS 203 (Kyber) is finalized. Begin hybrid transitions on public endpoints.",
      impact: "High", effort: "Medium", type: "Key Encapsulation"
    },
    { 
      title: "Replace ECC Signatures with ML-DSA", 
      desc: "NIST standard FIPS 204 (Dilithium) finalized. Update internal PKI and code signing.",
      impact: "Critical", effort: "High", type: "Digital Signature"
    },
    { 
      title: "Upgrade Hashing to SHA-3", 
      desc: "Eliminate SHA-1 and MD5 completely. Ensure SHA-3 or SHA-256 is strictly enforced.",
      impact: "High", effort: "Low", type: "Hash Function"
    }
  ]

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Network className="size-6 text-primary" />
            Quantum Risk Assessment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze the vulnerability of your cryptographic assets against post-quantum threats (CRQC).
          </p>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="inventory">Algorithm Inventory</TabsTrigger>
          <TabsTrigger value="timeline">Mosca Timeline</TabsTrigger>
          <TabsTrigger value="pqc">PQC Recommendations</TabsTrigger>
        </TabsList>

        {/* TAB 1: Risk Matrix */}
        <TabsContent value="matrix" className="space-y-4">
          <Card className="bg-background/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Business Criticality × Quantum Risk</CardTitle>
              <CardDescription>Visual heat map prioritizing assets based on sensitivity and algorithmic vulnerability.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                {/* Header Row */}
                <div className="font-semibold p-2 border-b">Criticality \ Risk</div>
                <div className="font-semibold p-2 border-b text-emerald-500">Low (Quantum Safe)</div>
                <div className="font-semibold p-2 border-b text-amber-500">Medium (Harvest Now)</div>
                <div className="font-semibold p-2 border-b text-destructive">High (Imminent Risk)</div>

                {/* Critical Row */}
                <div className="font-semibold p-4 border-r flex items-center justify-end">Critical</div>
                <div className="p-4 bg-emerald-500/10 rounded border border-emerald-500/20">2 Assets</div>
                <div className="p-4 bg-amber-500/20 rounded border border-amber-500/40 font-bold">14 Assets</div>
                <div className="p-4 bg-destructive/30 rounded border border-destructive/50 font-bold text-destructive">8 Assets</div>

                {/* High Row */}
                <div className="font-semibold p-4 border-r flex items-center justify-end">High</div>
                <div className="p-4 bg-emerald-500/10 rounded border border-emerald-500/20">15 Assets</div>
                <div className="p-4 bg-amber-500/10 rounded border border-amber-500/20">32 Assets</div>
                <div className="p-4 bg-destructive/20 rounded border border-destructive/30 font-bold">12 Assets</div>

                {/* Medium Row */}
                <div className="font-semibold p-4 border-r flex items-center justify-end">Medium</div>
                <div className="p-4 bg-emerald-500/10 rounded border border-emerald-500/20">45 Assets</div>
                <div className="p-4 bg-muted rounded border">18 Assets</div>
                <div className="p-4 bg-destructive/10 rounded border border-destructive/20">4 Assets</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Algorithm Inventory */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="bg-background/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Cryptographic Algorithm Inventory</CardTitle>
              <CardDescription>Detailed breakdown of detected primitives and their PQC migration paths.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Key Size</TableHead>
                      <TableHead>Protocol / Context</TableHead>
                      <TableHead>Asset Origin</TableHead>
                      <TableHead>PQC Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {algorithms.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono font-medium">{item.algo}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{item.keySize}</TableCell>
                        <TableCell>{item.tls}</TableCell>
                        <TableCell className="truncate max-w-[150px]">{item.cert}</TableCell>
                        <TableCell className="font-mono text-primary">{item.pqc}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'Critical' ? 'destructive' : item.status === 'High' ? 'destructive' : item.status === 'Safe' ? 'outline' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Mosca Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-background/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Mosca's Theorem Timeline</CardTitle>
              <CardDescription>If x + y {'>'} z, then worry. (x = Shelf Life, y = Migration Time, z = Quantum Arrival)</CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <div className="relative">
                {/* Base Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full" />
                
                <div className="flex justify-between relative z-10">
                  {/* Point 1: Today */}
                  <div className="flex flex-col items-center">
                    <div className="size-4 rounded-full bg-primary ring-4 ring-background mb-2" />
                    <span className="text-xs font-bold">Today</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Start Migration (y)</span>
                  </div>

                  {/* Point 2: Data Shelf Life */}
                  <div className="flex flex-col items-center">
                    <div className="size-4 rounded-full bg-amber-500 ring-4 ring-background mb-2" />
                    <span className="text-xs font-bold text-amber-500">Data Shelf Life Ends</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Data Value Expires (x)</span>
                    <div className="absolute top-10 w-[200px] text-center text-xs text-amber-500/80 p-2 border border-amber-500/20 bg-amber-500/10 rounded">
                      "Harvest Now, Decrypt Later" window
                    </div>
                  </div>

                  {/* Point 3: CRQC Arrival */}
                  <div className="flex flex-col items-center">
                    <div className="size-4 rounded-full bg-destructive ring-4 ring-background mb-2" />
                    <span className="text-xs font-bold text-destructive">Q-Day</span>
                    <span className="text-[10px] text-muted-foreground mt-1">CRQC Available (z)</span>
                    <div className="absolute top-10 w-[200px] text-center text-xs text-destructive/80 p-2 border border-destructive/20 bg-destructive/10 rounded">
                      Legacy crypto broken
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-20 p-4 bg-muted/50 rounded-lg text-sm border-l-4 border-destructive">
                <strong>Analysis:</strong> For 22 of your assets, the combined required migration time (y ≈ 3 yrs) and data shelf life (x ≈ 7 yrs) exceeds the estimated arrival of a Cryptographically Relevant Quantum Computer (z ≈ 8 yrs). <strong>Immediate action is required.</strong>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: PQC Recommendations */}
        <TabsContent value="pqc" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <Card key={i} className="bg-background/50 backdrop-blur hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{rec.type}</Badge>
                    <Badge variant={rec.impact === 'Critical' ? 'destructive' : 'secondary'}>{rec.impact} Priority</Badge>
                  </div>
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{rec.desc}</p>
                  <div className="flex items-center text-xs gap-4 mt-auto border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>Effort: <strong>{rec.effort}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-primary cursor-pointer hover:underline ml-auto">
                      View Playbook <ArrowRight className="size-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
