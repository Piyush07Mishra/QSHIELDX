"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, Globe, Server, CheckCircle2, ChevronRight,
  ChevronLeft, ShieldCheck, Lock, Activity, Binary, Code, 
  Search, ScanLine, Key, Globe2, AlertTriangle, FileJson
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"

const steps = [
  { id: 1, name: "Organization Scope" },
  { id: 2, name: "Asset Discovery" },
  { id: 3, name: "Cryptographic Config" },
  { id: 4, name: "Planner Preview" },
]

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Step 1 Form Data
  const [orgName, setOrgName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [repoUrl, setRepoUrl] = React.useState("")
  const [industry, setIndustry] = React.useState("")
  const [shelfLife, setShelfLife] = React.useState([10])
  const [criticality, setCriticality] = React.useState("medium")
  
  // Enterprise Metadata
  const [complianceStandard, setComplianceStandard] = React.useState("")
  const [cloudProvider, setCloudProvider] = React.useState("aws")
  const [region, setRegion] = React.useState("")

  // Computed Discovery Mode
  const getDiscoveryMode = () => {
    if (domain && repoUrl) return "Hybrid"
    if (domain) return "External"
    if (repoUrl) return "Internal"
    return "None"
  }
  const discoveryMode = getDiscoveryMode()

  // Step 2 Form Data
  const [scope, setScope] = React.useState({
    external: true,
    internal: false,
    cloud: false,
    ctl: true,
    secrets: true,
    tls: true
  })
  const [subdomains, setSubdomains] = React.useState("")
  const [cidr, setCidr] = React.useState("")
  const [branch, setBranch] = React.useState("main")

  // Step 3 Form Data
  const [engines, setEngines] = React.useState({
    subfinder: true,
    nmap: true,
    testssl: true,
    certParser: true,
    cryptoFinder: false,
    gitLeaks: false,
    semgrep: false
  })

  // Auto-toggle engines based on mode
  React.useEffect(() => {
    if (discoveryMode === "External") {
      setEngines({subfinder: true, nmap: true, testssl: true, certParser: true, cryptoFinder: false, gitLeaks: false, semgrep: false})
    } else if (discoveryMode === "Internal") {
      setEngines({subfinder: false, nmap: false, testssl: false, certParser: false, cryptoFinder: true, gitLeaks: true, semgrep: true})
    } else if (discoveryMode === "Hybrid") {
      setEngines({subfinder: true, nmap: true, testssl: true, certParser: true, cryptoFinder: true, gitLeaks: true, semgrep: true})
    }
  }, [discoveryMode])

  const nextStep = () => {
    if (step === 1 && discoveryMode === "None") return
    setStep((s) => Math.min(s + 1, 4))
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleScopeToggle = (key: keyof typeof scope) => setScope(prev => ({ ...prev, [key]: !prev[key] }))
  const handleEngineToggle = (key: keyof typeof engines) => setEngines(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        organization_name: orgName,
        domain: domain,
        repository_url: repoUrl,
        industry: industry,
        shelf_life_years: shelfLife[0],
        business_criticality: criticality,
        discovery_mode: discoveryMode.toLowerCase(),
        status: "draft", // Save as draft before executing
        scan_configuration: {
          compliance_standard: complianceStandard,
          cloud_provider: cloudProvider,
          region: region,
          scope,
          engines,
          subdomains,
          cidr,
          branch
        }
      }

      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/targets")
      } else {
        alert("Failed to create scan job.")
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      alert("Error reaching API.")
      setIsSubmitting(false)
    }
  }

  // Define agents for Step 4 Planner Preview
  const pipelineAgents = [
    {
      name: "Planner Agent",
      goal: "Orchestrate discovery and sequence tasks",
      observe: "Target domain and repo",
      decide: "Determine execution branch",
      tool: "LangGraph Router",
      output: "Execution Plan",
      time: "< 1m",
      conf: "99%"
    },
    {
      name: "Security Discovery Agent",
      goal: "Enumerate attack surface",
      observe: "DNS, Ports, Codebases",
      decide: "Identify live TLS endpoints",
      tool: discoveryMode === "Internal" ? "CryptoFinder" : "Subfinder/Nmap",
      output: "Asset Inventory",
      time: "2-5m",
      conf: "95%"
    },
    {
      name: "Classification Agent",
      goal: "Identify cryptographic assets",
      observe: "Certificates, Cipher Suites",
      decide: "Categorize algorithms (Symmetric, Asymmetric)",
      tool: "Custom Classifier",
      output: "Crypto Primitives",
      time: "1m",
      conf: "90%"
    },
    {
      name: "Threat Intelligence Agent",
      goal: "Map vulnerabilities to assets",
      observe: "Discovered CVSS & CVEs",
      decide: "Determine exploitability",
      tool: "CVE Database",
      output: "Threat Findings",
      time: "1m",
      conf: "95%"
    },
    {
      name: "Quantum Risk Agent",
      goal: "Score quantum vulnerability",
      observe: "Algorithm lifespans",
      decide: "Determine Mosca risk score",
      tool: "Risk Engine",
      output: "Risk Metrics",
      time: "1m",
      conf: "85%"
    },
    {
      name: "CBOM Agent",
      goal: "Generate standard SBOM for Crypto",
      observe: "Unified Inventory",
      decide: "Format CycloneDX 1.7",
      tool: "CBOM Builder",
      output: "CycloneDX JSON",
      time: "1m",
      conf: "100%"
    },
    {
      name: "Migration Planner Agent",
      goal: "Recommend PQC algorithms",
      observe: "Risk Scores & Compliance",
      decide: "Select NIST PQC standards (Kyber/Dilithium)",
      tool: "LLM Synthesizer",
      output: "Migration Plan",
      time: "2m",
      conf: "80%"
    }
  ]

  return (
    <div className="flex h-full flex-col max-w-5xl mx-auto w-full p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cryptographic Discovery Wizard</h1>
        <p className="text-muted-foreground">Configure the intelligent agent pipeline for comprehensive cryptographic inventory mapping.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0"></div>
        <div className="relative z-10 flex justify-between">
          {steps.map((s) => {
            const isActive = step === s.id
            const isPast = step > s.id
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div className={`size-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-colors ${
                  isActive ? "border-primary bg-primary text-primary-foreground" : 
                  isPast ? "border-primary bg-primary text-primary-foreground" : 
                  "border-muted text-muted-foreground"
                }`}>
                  {isPast ? <CheckCircle2 className="size-5" /> : s.id}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{s.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative min-h-[500px]">
        <div className="absolute inset-0 transition-opacity duration-300 overflow-y-auto">
          {/* STEP 1: ORGANIZATION SCOPE */}
          {step === 1 && (
            <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Building2 className="size-5 text-primary"/> Organization Details</CardTitle>
                      <CardDescription>Primary identification and business context for risk scoring.</CardDescription>
                    </div>
                    {discoveryMode !== "None" && (
                      <Badge variant={discoveryMode === "External" ? "default" : discoveryMode === "Internal" ? "secondary" : "default"} 
                             className={discoveryMode === "External" ? "bg-green-600" : discoveryMode === "Internal" ? "bg-purple-600" : "bg-blue-600"}>
                        {discoveryMode} Discovery
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {discoveryMode === "None" && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-md flex items-center gap-2 text-sm">
                      <AlertTriangle className="size-4" /> Provide at least one discovery source — either a Primary Domain or a GitHub Repository URL to begin cryptographic discovery.
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organization Name <span className="text-destructive">*</span></label>
                      <Input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Industry <span className="text-destructive">*</span></label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={industry} onChange={e => setIndustry(e.target.value)}>
                        <option value="">Select Industry</option>
                        <option value="financial">Financial Services</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="technology">Technology</option>
                        <option value="government">Government / Defense</option>
                        <option value="retail">Retail / E-Commerce</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Domain</label>
                      <div className="relative">
                        <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">GitHub Repository URL</label>
                      <div className="relative">
                        <Code className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo" />
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2 pt-4 border-t">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Data Shelf Life (Years) <span className="text-destructive">*</span></label>
                        <span className="text-sm font-mono font-bold text-primary">{shelfLife[0]} Years</span>
                      </div>
                      <Slider value={shelfLife} onValueChange={setShelfLife} max={30} min={1} step={1} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Business Criticality <span className="text-destructive">*</span></label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={criticality} onChange={e => setCriticality(e.target.value)}>
                        <option value="low">Low (Internal tools, non-sensitive)</option>
                        <option value="medium">Medium (Standard business apps)</option>
                        <option value="high">High (Customer data, PII)</option>
                        <option value="critical">Critical (Financial data, PHI, Core IP)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t">
                      <label className="text-sm font-medium">Compliance Standard</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={complianceStandard} onChange={e => setComplianceStandard(e.target.value)}>
                        <option value="">None specified</option>
                        <option value="pci-dss">PCI-DSS</option>
                        <option value="hipaa">HIPAA</option>
                        <option value="rbi">RBI</option>
                        <option value="iso27001">ISO27001</option>
                        <option value="nist">NIST</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t">
                      <label className="text-sm font-medium">Cloud Provider</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={cloudProvider} onChange={e => setCloudProvider(e.target.value)}>
                        <option value="aws">AWS</option>
                        <option value="azure">Azure</option>
                        <option value="gcp">Google Cloud</option>
                        <option value="on-prem">On-Premises</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Region / Deployment Geography</label>
                      <Input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. us-east-1, eu-central-1" />
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2: ASSET DISCOVERY SCOPE */}
          {step === 2 && (
            <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Server className="size-5 text-primary"/> Discovery Scope</CardTitle>
                  <CardDescription>Select the attack surface and repositories to include in this scan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(scope).map(([k, val]) => (
                      <HoverCard key={k}>
                        <HoverCardTrigger asChild>
                          <div onClick={() => handleScopeToggle(k as any)} className={`flex items-start space-x-3 rounded-md border p-4 cursor-pointer transition-colors ${val ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                            <Checkbox checked={val} />
                            <div className="space-y-1 leading-none">
                              <label className="text-sm font-medium cursor-pointer capitalize">{k} Discovery</label>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent>Discover {k} related cryptographic assets and misconfigurations.</HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Additional Subdomains</label>
                      <Textarea value={subdomains} onChange={e => setSubdomains(e.target.value)} className="h-24 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Repository Branch</label>
                      <Input value={branch} onChange={e => setBranch(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: CRYPTOGRAPHIC DISCOVERY CONFIG */}
          {step === 3 && (
            <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ScanLine className="size-5 text-primary"/> Cryptographic Engines</CardTitle>
                  <CardDescription>Select the specialized discovery and parsing engines for the scan job. Toggled based on {discoveryMode} mode.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(engines).map(([k, val]) => (
                    <HoverCard key={k}>
                      <HoverCardTrigger asChild>
                        <div onClick={() => handleEngineToggle(k as any)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${val ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm capitalize">{k}</span>
                            {val && <CheckCircle2 className="size-4 text-primary" />}
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent>Engine: {k}</HoverCardContent>
                    </HoverCard>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 4: PLANNER PREVIEW */}
          {step === 4 && (
            <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle2 className="size-5 text-primary"/> Agent Execution Planner Preview</CardTitle>
                  <CardDescription>Review the AI Planner Agent's execution strategy before initializing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-8">
                    {pipelineAgents.map((agent, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[37px] bg-primary text-primary-foreground size-7 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-background">
                          {i + 1}
                        </div>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-bold text-sm text-primary mb-1">{agent.name}</h4>
                                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Goal:</span> {agent.goal}</p>
                                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Observe:</span> {agent.observe}</p>
                                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Decide:</span> {agent.decide}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                  <div className="text-xs font-mono bg-muted inline-block px-2 py-1 rounded">Tool: {agent.tool}</div>
                                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Expected Output:</span> {agent.output}</p>
                                  <div className="flex justify-end gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px]">Est: {agent.time}</Badge>
                                    <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">Conf: {agent.conf}</Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <div className="text-sm font-semibold">{agent.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">Responsible for executing {agent.tool} to achieve {agent.output}.</div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    ))}
                  </div>

                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:relative md:border-0 md:bg-transparent md:p-0 flex justify-between items-center z-50">
        <Button variant="outline" onClick={prevStep} disabled={step === 1 || isSubmitting}>
          <ChevronLeft className="size-4 mr-2" /> Back
        </Button>
        
        {step < 4 ? (
          <Button onClick={nextStep} disabled={step === 1 && discoveryMode === "None"}>
            Next Step <ChevronRight className="size-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || discoveryMode === "None" || !orgName}>
            {isSubmitting ? (
              <span className="flex items-center gap-2"><Activity className="size-4 animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Save Target to Monitored List</span>
            )}
          </Button>
        )}
      </div>

    </div>
  )
}
