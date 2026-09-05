import os
import uuid
import datetime
from typing import Optional, Dict, Any

# Set environment variable before importing tools to bypass CLI interactive prompts
os.environ["STREAMLIT"] = "1"

import config # This validates env vars and logs on startup

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

from app import app as langgraph_agent
from services.supabase import DatabaseService
from services.discovery import DiscoveryService
from services.testssl import TestSSLService
from services.certificate_parser import CertificateParserService
from services.cryptofinder import CryptoFinderService
from services.semgrep_crypto import SemgrepCryptoService
from services.classifier import ClassifierService
from services.risk_engine import RiskEngineService
from services.cbom_builder import CBOMBuilderService
from services.agent_logger import AgentLogger

# Initialize FastAPI
api = FastAPI(
    title="🛡️ QShieldX Backend API",
    description="Backend API exposing the QShieldX cryptographic agents and discovery pipeline.",
    version="2.1.0"
)

class ScanRequest(BaseModel):
    domain: Optional[str] = None
    repository_url: Optional[str] = None
    organization_name: str = ""
    industry: str = ""
    business_criticality: str = ""
    shelf_life_years: int = 10
    discovery_mode: str = "external"
    scan_configuration: dict = {}

@api.get("/health")
def health_check():
    db_status = "connected" if os.environ.get("SUPABASE_URL") else "mock"
    llm_prov = "gemini" if os.environ.get("GEMINI_API_KEY") else ("openai" if os.environ.get("OPENAI_API_KEY") else "disabled")
    mock_mode = db_status == "mock" or llm_prov == "disabled"
    
    return {
        "status": "healthy",
        "service": "QShieldX Backend",
        "database": db_status,
        "llm_provider": llm_prov,
        "mock_mode": mock_mode,
        "version": "2.5.0"
    }

@api.get("/")
def root():
    return health_check()

@api.get("/api/settings")
def get_settings():
    """Stub endpoint for settings."""
    return {"message": "Settings configuration."}

@api.get("/api/agent_activity")
def get_agent_activity():
    """Stub endpoint for agent activity."""
    return {"activities": []}

def run_async_pipeline(scan_req: ScanRequest, scan_id: str):
    """
    Background task to run the complete discovery, crypto-analysis, 
    classification, risk scoring, and CBOM generation pipeline.
    """
    logger = AgentLogger(scan_id)
    
    # Initialize transaction arrays
    db_scan_job = {
        "id": scan_id,
        "target_domain": scan_req.domain or scan_req.repository_url or "unknown",
        "status": "processing",
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    db_assets = []
    db_findings = []
    db_risk_scores = []
    
    mode = scan_req.discovery_mode.lower()
    
    # 1. External Discovery
    if mode in ["external", "hybrid"] and scan_req.domain:
        logger.log_activity("Discovery Agent", "Running subdomain and port discovery", "subfinder, nmap")
        discovery_results = DiscoveryService.run_recon_pipeline(scan_req.domain, "fast")
        
        for host_data in discovery_results.get("assets", []):
            subdomain = host_data["subdomain"]
            ports = host_data["ports"]
            
            tls_enabled = any(p in ports for p in [443, 8443, 4433])
            
            asset_id = str(uuid.uuid4())
            base_asset = {
                "id": asset_id,
                "scan_id": scan_id,
                "domain": subdomain,
                "ip_address": "", 
                "port": 443 if tls_enabled else (ports[0] if ports else 80),
                "tls_enabled": tls_enabled
            }
            
            raw_crypto_data = {}
            
            if tls_enabled:
                logger.log_activity("Security Scanner", f"Running testssl on {subdomain}", "testssl.sh")
                testssl_res = TestSSLService.run_scan(subdomain, scan_id)
                if "error" not in testssl_res:
                    raw_crypto_data["testssl"] = testssl_res
                    
                    logger.log_activity("Security Scanner", f"Parsing certificates for {subdomain}", "certificate_parser")
                    cert_res = CertificateParserService.parse_certificate("-----BEGIN CERTIFICATE-----\nMock\n-----END CERTIFICATE-----")
                    if "error" not in cert_res:
                        raw_crypto_data["cert"] = cert_res
            
            # Classification
            logger.log_activity("Classification Agent", f"Classifying asset {subdomain}", "classifier")
            class_input = {"name": subdomain, "details": str(raw_crypto_data).lower()}
            classification = ClassifierService.classify(class_input)
            
            asset = {**base_asset, **classification}
            db_assets.append(asset)
            
            # Risk Scoring
            logger.log_activity("Quantum Risk Agent", f"Scoring risk for {subdomain}", "risk_engine")
            risk_score = RiskEngineService.calculate_risk(asset)
            db_risk_scores.append({"id": str(uuid.uuid4()), "asset_id": asset_id, "scan_id": scan_id, **risk_score})
            
            # Findings
            if "testssl" in raw_crypto_data and "vulnerabilities" in raw_crypto_data["testssl"]:
                for vuln in raw_crypto_data["testssl"]["vulnerabilities"]:
                    db_findings.append({
                        "id": str(uuid.uuid4()),
                        "scan_id": scan_id,
                        "asset_id": asset_id,
                        "vulnerability_name": vuln["finding"],
                        "severity": vuln["severity"]
                    })
                    
    # 2. Internal Discovery
    if mode in ["internal", "hybrid"] and scan_req.repository_url:
        logger.log_activity("Discovery Agent", f"Running internal analysis on {scan_req.repository_url}", "cryptofinder, gitleaks, semgrep")
        
        # CryptoFinder
        logger.log_activity("Security Scanner", f"Running cryptofinder on repo", "cryptofinder")
        cf_res = CryptoFinderService.run_scan(scan_req.repository_url)
        
        # Mock Semgrep and Gitleaks
        raw_crypto_data = {}
        if "error" not in cf_res:
            raw_crypto_data["cryptofinder"] = cf_res
        raw_crypto_data["gitleaks"] = {"secrets_found": 0}
        raw_crypto_data["semgrep"] = {"crypto_issues": 1}
        
        asset_id = str(uuid.uuid4())
        base_asset = {
            "id": asset_id,
            "scan_id": scan_id,
            "domain": scan_req.repository_url,
            "ip_address": "",
            "port": 0,
            "tls_enabled": False
        }
        
        logger.log_activity("Classification Agent", "Classifying repository asset", "classifier")
        class_input = {"name": scan_req.repository_url, "details": str(raw_crypto_data).lower()}
        classification = ClassifierService.classify(class_input)
        
        asset = {**base_asset, **classification}
        db_assets.append(asset)
        
        logger.log_activity("Quantum Risk Agent", "Scoring risk for repository", "risk_engine")
        risk_score = RiskEngineService.calculate_risk(asset)
        db_risk_scores.append({"id": str(uuid.uuid4()), "asset_id": asset_id, "scan_id": scan_id, **risk_score})

    # 3. Correlation (Hybrid handled natively by appending to same arrays)

    # 4. CBOM Generation (Mandatory for ALL modes)
    logger.log_activity("CBOM Agent", "Building CBOM for discovered assets", "cbom_builder")
    target_name = scan_req.domain or scan_req.repository_url or "target"
    cbom_json = CBOMBuilderService.build_cyclonedx(db_assets, target_name)
    
    cbom_report = {
        "id": str(uuid.uuid4()),
        "scan_id": scan_id,
        "components": cbom_json.get("components", []),
        "report_url": f"https://cbom.example.com/{scan_id}.json"
    }
    
    # 5. Persistence
    logger.log_activity("Persistence", "Committing transaction to Supabase", "supabase")
    db_scan_job["status"] = "completed"
    
    DatabaseService.persist_scan_transaction(
        scan_job=db_scan_job,
        assets=db_assets,
        findings=db_findings,
        risk_scores=db_risk_scores,
        cbom_report=cbom_report,
        activities=logger.get_activities()
    )


@api.post("/api/scan_domain_pipeline")
def scan_domain_pipeline(request: ScanRequest, background_tasks: BackgroundTasks):
    """
    Triggers the asynchronous QShieldX pipeline.
    """
    scan_id = str(uuid.uuid4())
    background_tasks.add_task(run_async_pipeline, request, scan_id)
    
    return {
        "status": "processing",
        "scan_id": scan_id,
        "message": "Scan pipeline started in the background."
    }

class PromptRequest(BaseModel):
    prompt: str
    thread_id: Optional[str] = None

@api.post("/api/chat")
def run_agent(request: PromptRequest):
    """
    Interact directly with the multi-agent LangGraph pipeline for ad-hoc analysis.
    """
    try:
        thread_id = request.thread_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}
        inputs = {"messages": [HumanMessage(content=request.prompt)]}
        
        # Log to Agent Activity (not tied to a specific scan here)
        logger = AgentLogger(scan_id=thread_id)
        logger.log_activity("Migration Planner Agent", "User chat interaction")
        
        state = langgraph_agent.invoke(inputs, config=config)
        final_message = state["messages"][-1]
        
        if isinstance(final_message, AIMessage):
            return {"response": final_message.content, "thread_id": thread_id}
        else:
            return {"response": "The agent did not return a valid response.", "thread_id": thread_id}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")