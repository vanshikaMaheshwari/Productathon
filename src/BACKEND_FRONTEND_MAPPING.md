# Backend-Frontend Architecture Mapping
## Lead Intelligence System: FastAPI ↔ Wix Frontend Integration

---

## 📋 Executive Summary

This document maps the FastAPI backend architecture to the Wix frontend pages, showing how data flows from backend services through API endpoints to frontend components. Each page correlates with specific backend models, services, and API routes.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Wix React)                      │
├─────────────────────────────────────────────────────────────┤
│  HomePage │ LeadsPage │ LeadDetailPage │ DashboardPage      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [API Layer - REST]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
├─────────────────────────────────────────────────────────────┤
│  Services │ Models │ Database │ LLM Integration              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 Page-to-Backend Mapping

### 1. **HomePage** (Landing & System Overview)

#### Frontend Components:
- Hero Section with system stats
- Feature cards (6 modules)
- Process flow visualization
- System status indicators

#### Backend Correlation:

**Data Source:** `app/core/config.py` + `app/services/`

| Frontend Variable | Backend Source | Type | Purpose |
|---|---|---|---|
| `SYSTEM_STATS` | Dashboard aggregation | Array | Real-time system metrics |
| `SYSTEM_STATS[0].value` (Active Sources) | `Sources` collection | Number | Count of active data sources |
| `SYSTEM_STATS[1].value` (Leads Discovered) | `Lead` model count | Number | Total leads in system |
| `SYSTEM_STATS[2].value` (Conversion Rate) | `Lead.status == "ACCEPTED"` | Percentage | Conversion funnel metric |
| `SYSTEM_STATS[3].value` (Avg Response Time) | `ScoringEngine` latency | Duration | System performance KPI |

**Backend Endpoints:**
```python
# GET /dashboard/stats
{
  "total_leads": 1834,
  "active_sources": 247,
  "conversion_rate": 34.2,
  "avg_response_time_ms": 2400
}
```

**Data Flow:**
```
HomePage → GET /dashboard/stats → DashboardPage (FastAPI)
         → Aggregates Lead + Source data
         → Returns JSON metrics
         → Renders SYSTEM_STATS array
```

---

### 2. **LeadsPage** (Lead Discovery & Filtering)

#### Frontend Components:
- Lead list/grid view
- Search & filter controls
- Company cards (CompanyCard.tsx)
- Pagination controls
- Status badges

#### Backend Correlation:

**Data Source:** `app/models/lead.py` + `app/api/leads.py`

| Frontend Variable | Backend Source | Type | Purpose |
|---|---|---|---|
| `leads[]` | `Lead` model | Array | All discovered leads |
| `lead.companyName` | `Lead.company_id` → `CompanyProfile.name` | String | Company identifier |
| `lead.industryType` | `CompanyProfile.industry` | String | Industry classification |
| `lead.leadScore` | `ScoringEngine.calculate_lead_score()` | Float | Lead quality metric (0-100) |
| `lead.trustScore` | `Source.trust_score` | Float | Source credibility (0-100) |
| `lead.status` | `Lead.status` | Enum | Lead state (NEW, HOT, WARM, COLD, ACCEPTED, REJECTED) |
| `lead.plantLocations` | `CompanyProfile.size_proxy` | String | Geographic/facility info |
| `lead.contactInformation` | `Lead.source_url` | String | Contact details extracted |
| `lead.productRecommendations` | `IntelligenceService.analyze()` | String | LLM-generated product match |
| `lead.lastUpdated` | `Lead.created_at` | DateTime | Lead discovery timestamp |

**Backend Endpoints:**
```python
# GET /leads/new
# Query Parameters: skip=0, limit=50
{
  "items": [
    {
      "id": 1,
      "company_id": 5,
      "company": {
        "name": "ABC Industries",
        "industry": "Manufacturing",
        "size_proxy": 500
      },
      "source_url": "https://example.com/tender",
      "intent": "High",
      "recommended_product": "FO",
      "score": 85.5,
      "status": "NEW",
      "created_at": "2024-02-07T10:30:00Z"
    }
  ],
  "total_count": 1834,
  "has_next": true,
  "current_page": 0,
  "page_size": 50
}
```

**Filtering Logic (Frontend):**
```typescript
// LeadsPage.tsx - Line 59-76
filteredLeads = leads
  .filter(lead => {
    // Search: companyName OR industryType
    const matchesSearch = lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    // Status filter: Hot, Warm, Cold, All
    const matchesStatus = statusFilter === 'all' || lead.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    // Sort by: leadScore, trustScore, or lastUpdated
    if (sortBy === 'score') return (b.leadScore || 0) - (a.leadScore || 0);
  });
```

**Backend Scoring Logic:**
```python
# app/services/scoring_engine.py
def calculate_lead_score(
    created_at: datetime,
    keyword_density: float,
    company_size: int
) -> float:
    freshness_score = 1 / max((datetime.utcnow() - created_at).days, 1)
    size_score = log(company_size + 1)
    return (keyword_density * 40) + (freshness_score * 30) + (size_score * 30)
```

**Data Flow:**
```
LeadsPage (Load)
  ↓
GET /leads/new?skip=0&limit=50
  ↓
BaseCrudService.getAll('leads', [], { limit: 50, skip: 0 })
  ↓
Backend: Query Lead table + JOIN CompanyProfile
  ↓
Return paginated results with scores
  ↓
Frontend: Render CompanyCard components
  ↓
User filters/sorts → Client-side filtering (no new API call)
```

---

### 3. **LeadDetailPage** (Lead Deep-Dive & Actions)

#### Frontend Components:
- Lead header with scores
- Company information panel
- Product recommendations
- Sales officer feedback form
- Quick action buttons (Call, Email, Schedule)

#### Backend Correlation:

**Data Source:** `app/models/lead.py` + `app/services/intelligence_service.py`

| Frontend Variable | Backend Source | Type | Purpose |
|---|---|---|---|
| `lead._id` | `Lead.id` | String | Lead unique identifier |
| `lead.companyName` | `CompanyProfile.name` | String | Company name |
| `lead.industryType` | `CompanyProfile.industry` | String | Industry sector |
| `lead.leadScore` | `ScoringEngine` output | Float | Calculated lead quality |
| `lead.trustScore` | `Source.trust_score` | Float | Source reliability |
| `lead.plantLocations` | Extracted from HTML | String | Facility locations |
| `lead.contactInformation` | `Lead.source_url` | String | Contact details |
| `lead.productRecommendations` | `IntelligenceService.analyze()` | String | LLM-generated recommendation |
| `lead.reasonCodes` | `IntelligenceService` output | String | Why this product recommended |
| `lead.status` | `Lead.status` | Enum | Current lead state |

**Backend Endpoints:**
```python
# GET /leads/{lead_id}
{
  "id": 1,
  "company_id": 5,
  "company": {
    "name": "ABC Industries",
    "industry": "Manufacturing",
    "size_proxy": 500
  },
  "source_url": "https://example.com/tender/123",
  "intent": "High",
  "recommended_product": "FO",
  "score": 85.5,
  "status": "NEW",
  "created_at": "2024-02-07T10:30:00Z",
  "analysis": {
    "company_name": "ABC Industries",
    "intent": "High",
    "recommended_product": "FO",
    "reason_codes": "New plant commission + solvent demand"
  }
}

# POST /leads/{lead_id}/action
# Body: { "action": "ACCEPTED" | "REJECTED" }
{
  "status": "updated",
  "lead_id": 1,
  "new_status": "ACCEPTED"
}
```

**Frontend Action Handlers:**
```typescript
// LeadDetailPage.tsx - Line 36-61
handleFeedback(accepted: boolean) {
  // Optimistic update
  setLead({ ...lead, status: accepted ? 'Accepted' : 'Rejected' });
  
  // API call
  await BaseCrudService.update('leads', {
    _id: lead._id,
    status: newStatus
  });
}
```

**Backend Intelligence Service:**
```python
# app/services/intelligence_service.py
class IntelligenceService:
    def analyze(self, html_text: str) -> dict:
        # LLM call (OpenAI or Llama)
        return {
            "company_name": "ABC Industries",
            "intent": "High",
            "recommended_product": "FO",
            "reason_codes": "New plant commission"
        }
```

**Data Flow:**
```
LeadDetailPage (Load)
  ↓
GET /leads/{id}
  ↓
BaseCrudService.getById('leads', id)
  ↓
Backend: Query Lead + CompanyProfile + Analysis
  ↓
Return enriched lead object
  ↓
Frontend: Render LeadDetailPage with all sections
  ↓
User clicks "Accept Lead"
  ↓
POST /leads/{id}/action { action: "ACCEPTED" }
  ↓
Backend: Update Lead.status, log feedback
  ↓
Frontend: Show toast notification
```

---

### 4. **DashboardPage** (Executive Analytics & KPIs)

#### Frontend Components:
- Key metrics cards (6 metrics)
- Status distribution pie chart
- Industry distribution bar chart
- Lead score distribution
- Geographic distribution heatmap
- Conversion funnel
- Lead quality matrix (scatter plot)
- Top opportunities list

#### Backend Correlation:

**Data Source:** `app/api/dashboard.py` + Aggregated `Lead` + `RegionalOffices`

| Frontend Variable | Backend Source | Type | Purpose |
|---|---|---|---|
| `totalLeads` | COUNT(Lead.id) | Number | Total leads in system |
| `hotLeads` | COUNT(Lead WHERE status='HOT') | Number | High-priority leads |
| `acceptedLeads` | COUNT(Lead WHERE status='ACCEPTED') | Number | Converted leads |
| `conversionRate` | acceptedLeads / totalLeads | Percentage | Sales funnel metric |
| `avgLeadScore` | AVG(Lead.score) | Float | Average lead quality |
| `statusData[]` | GROUP BY Lead.status | Array | Status distribution |
| `industryData[]` | GROUP BY CompanyProfile.industry | Array | Industry breakdown |
| `scoreRanges[]` | HISTOGRAM(Lead.score, 5 buckets) | Array | Score distribution |
| `regionData[]` | JOIN Lead + RegionalOffices | Array | Geographic distribution |
| `scatterData[]` | Lead[leadScore, trustScore] | Array | Quality matrix |

**Backend Endpoints:**
```python
# GET /dashboard/stats
{
  "total_leads": 1834,
  "hot_leads": 156,
  "accepted_leads": 628,
  "conversion_rate": 34.2,
  "avg_lead_score": 62.5,
  "regional_offices": 12
}

# GET /dashboard/status-distribution
{
  "hot": 156,
  "warm": 420,
  "cold": 650,
  "accepted": 628,
  "rejected": 180
}

# GET /dashboard/industry-distribution
{
  "Manufacturing": 450,
  "Chemical": 380,
  "Petrochemical": 320,
  "Energy": 280,
  ...
}

# GET /dashboard/score-distribution
{
  "0-20": 120,
  "21-40": 280,
  "41-60": 450,
  "61-80": 620,
  "81-100": 364
}

# GET /dashboard/regional-distribution
{
  "Maharashtra": 320,
  "Gujarat": 280,
  "Uttar Pradesh": 240,
  ...
}

# GET /dashboard/lead-quality-matrix
[
  { "leadScore": 85, "trustScore": 92 },
  { "leadScore": 72, "trustScore": 68 },
  ...
]

# GET /dashboard/top-opportunities
[
  {
    "id": 1,
    "company_name": "ABC Industries",
    "industry": "Manufacturing",
    "score": 95,
    "status": "HOT"
  },
  ...
]
```

**Frontend Aggregation Logic:**
```typescript
// DashboardPage.tsx - Line 34-99
const totalLeads = leads.length;
const hotLeads = leads.filter(l => l.status?.toLowerCase() === 'hot').length;
const acceptedLeads = leads.filter(l => l.status?.toLowerCase() === 'accepted').length;
const conversionRate = totalLeads > 0 ? ((acceptedLeads / totalLeads) * 100).toFixed(1) : '0.0';

// Status distribution
const statusData = [
  { name: 'Hot', value: hotLeads, color: '#00FFFF' },
  { name: 'Warm', value: warmLeads, color: '#FF00FF' },
  ...
];

// Industry distribution
const industryMap = new Map<string, number>();
leads.forEach(lead => {
  const industry = lead.industryType || 'Unknown';
  industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
});
```

**Data Flow:**
```
DashboardPage (Load)
  ↓
Promise.all([
  GET /leads (limit: 1000),
  GET /regionaloffices (limit: 100)
])
  ↓
Backend: Query all leads + offices
  ↓
Return full datasets
  ↓
Frontend: Client-side aggregation
  ↓
Calculate metrics, distributions, trends
  ↓
Render 8 chart visualizations
```

---

## 🔄 Data Model Correlation

### Frontend Entity: `CustomerLeads`
```typescript
// src/entities/index.ts
export interface CustomerLeads {
  _id: string;
  companyName?: string;           // ← CompanyProfile.name
  industryType?: string;          // ← CompanyProfile.industry
  plantLocations?: string;        // ← Extracted from HTML
  contactInformation?: string;    // ← Extracted from HTML
  leadScore?: number;             // ← ScoringEngine output
  trustScore?: number;            // ← Source.trust_score
  status?: string;                // ← Lead.status
  productRecommendations?: string; // ← IntelligenceService output
  reasonCodes?: string;           // ← IntelligenceService output
  lastUpdated?: Date | string;    // ← Lead.created_at
}
```

### Backend Model: `Lead` (SQLAlchemy)
```python
# app/models/lead.py
class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("company_profiles.id"))
    source_url = Column(String)              # ← Where lead came from
    intent = Column(String)                  # ← LLM analysis
    recommended_product = Column(String)     # ← Product match
    score = Column(Float)                    # ← Lead score
    created_at = Column(DateTime)            # ← Discovery time
    status = Column(String, default="NEW")   # ← Lead state
    
    company = relationship("CompanyProfile")
```

### Backend Model: `CompanyProfile` (SQLAlchemy)
```python
# app/models/company.py
class CompanyProfile(Base):
    __tablename__ = "company_profiles"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)        # → companyName
    industry = Column(String)                # → industryType
    size_proxy = Column(Integer)             # → plantLocations (proxy)
```

### Backend Model: `Source` (SQLAlchemy)
```python
# Implicit in scraper_service.py
class Source:
    url: str                                 # Source domain
    trust_score: float                       # Credibility (0-100)
    last_crawled: datetime                   # Last update
    is_active: bool                          # Active status
```

---

## 🔌 API Endpoint Reference

### Lead Management Endpoints

| Method | Endpoint | Frontend Usage | Backend Handler |
|--------|----------|---|---|
| GET | `/leads/new` | LeadsPage load | `app/api/leads.py:get_new_leads()` |
| GET | `/leads/{id}` | LeadDetailPage load | `app/api/leads.py:get_lead()` |
| POST | `/leads/{id}/action` | LeadDetailPage feedback | `app/api/leads.py:lead_action()` |
| GET | `/leads?skip=0&limit=50` | Pagination | `app/api/leads.py:list_leads()` |

### Dashboard Endpoints

| Method | Endpoint | Frontend Usage | Backend Handler |
|--------|----------|---|---|
| GET | `/dashboard/stats` | HomePage metrics | `app/api/dashboard.py:dashboard_stats()` |
| GET | `/dashboard/status-distribution` | DashboardPage pie chart | Aggregation |
| GET | `/dashboard/industry-distribution` | DashboardPage bar chart | Aggregation |
| GET | `/dashboard/score-distribution` | DashboardPage histogram | Aggregation |
| GET | `/dashboard/regional-distribution` | DashboardPage heatmap | Aggregation |
| GET | `/dashboard/lead-quality-matrix` | DashboardPage scatter | Aggregation |
| GET | `/dashboard/top-opportunities` | DashboardPage list | Query + Sort |

---

## 🔐 Data Flow Sequences

### Sequence 1: Lead Discovery & Display

```
┌─────────────────┐
│   LeadsPage     │
│   (Frontend)    │
└────────┬────────┘
         │
         │ 1. useEffect() → loadLeads()
         │
         ├─→ BaseCrudService.getAll('leads', [], { limit: 50 })
         │
         ├─→ HTTP GET /leads/new?skip=0&limit=50
         │
┌────────▼────────────────────────────────────────┐
│         FastAPI Backend                         │
│  app/api/leads.py:get_new_leads()               │
└────────┬────────────────────────────────────────┘
         │
         ├─→ Query: SELECT * FROM leads WHERE status='NEW'
         │
         ├─→ JOIN: leads.company_id → company_profiles.id
         │
         ├─→ Fetch: CompanyProfile.name, industry, size_proxy
         │
         ├─→ Pagination: LIMIT 50 OFFSET 0
         │
         ├─→ Return: JSON array of Lead objects
         │
┌────────▼────────────────────────────────────────┐
│         Frontend Response Handler               │
│  setLeads(result.items)                         │
│  setHasNext(result.hasNext)                     │
│  setNextSkip(result.nextSkip)                   │
└────────┬────────────────────────────────────────┘
         │
         ├─→ Render: CompanyCard components
         │
         ├─→ Display: Grid/List view
         │
         └─→ Show: "Load More" button if hasNext
```

### Sequence 2: Lead Scoring & Ranking

```
┌──────────────────────────────────────────┐
│    ScraperService.fetch(url)             │
│    Returns: HTML content                 │
└────────┬─────────────────────────────────┘
         │
         ├─→ IntelligenceService.analyze(html)
         │
         ├─→ LLM Call (OpenAI/Llama)
         │
         ├─→ Extract: company_name, intent, product
         │
┌────────▼──────────────────────────────────┐
│    ScoringEngine.calculate_lead_score()   │
│    Inputs:                                │
│    - created_at (freshness)               │
│    - keyword_density (relevance)          │
│    - company_size (market size)           │
└────────┬──────────────────────────────────┘
         │
         ├─→ freshness_score = 1 / days_old
         │
         ├─→ size_score = log(company_size + 1)
         │
         ├─→ final_score = (keyword * 40) + (freshness * 30) + (size * 30)
         │
         ├─→ Store: Lead.score = final_score
         │
┌────────▼──────────────────────────────────┐
│    Frontend: Sort by leadScore            │
│    filteredLeads.sort((a,b) =>            │
│      (b.leadScore || 0) - (a.leadScore)   │
│    )                                      │
└──────────────────────────────────────────┘
```

### Sequence 3: Lead Feedback & Model Improvement

```
┌─────────────────────────────┐
│   LeadDetailPage            │
│   User clicks "Accept Lead" │
└────────┬────────────────────┘
         │
         │ 1. Optimistic Update
         │
         ├─→ setLead({ ...lead, status: 'Accepted' })
         │
         │ 2. API Call
         │
         ├─→ BaseCrudService.update('leads', {
         │     _id: lead._id,
         │     status: 'Accepted'
         │   })
         │
         ├─→ HTTP POST /leads/{id}/action
         │   Body: { "action": "ACCEPTED" }
         │
┌────────▼──────────────────────────────────┐
│    FastAPI Backend                        │
│    app/api/leads.py:lead_action()         │
└────────┬──────────────────────────────────┘
         │
         ├─→ Query: SELECT * FROM leads WHERE id={id}
         │
         ├─→ Update: lead.status = 'ACCEPTED'
         │
         ├─→ Commit: db.commit()
         │
         ├─→ Log: Feedback for model training
         │
         ├─→ Return: { "status": "updated" }
         │
┌────────▼──────────────────────────────────┐
│    Frontend Success Handler               │
│    toast({ title: 'Lead Accepted' })      │
│    Feedback loop: Improves scoring model  │
└──────────────────────────────────────────┘
```

---

## 📊 Variable Mapping Reference

### HomePage Variables
```typescript
SYSTEM_STATS = [
  {
    label: 'Active Sources',      // ← COUNT(Source WHERE is_active=true)
    value: '247',                 // ← Backend aggregation
    trend: '+12%',                // ← Week-over-week change
    icon: Globe
  },
  {
    label: 'Leads Discovered',    // ← COUNT(Lead)
    value: '1,834',               // ← Total leads
    trend: '+28%',                // ← Growth rate
    icon: Target
  },
  {
    label: 'Conversion Rate',     // ← COUNT(ACCEPTED) / COUNT(ALL)
    value: '34.2%',               // ← Percentage
    trend: '+5.3%',               // ← Improvement
    icon: Activity
  },
  {
    label: 'Avg Response Time',   // ← ScoringEngine latency
    value: '2.4h',                // ← Average time to score
    trend: '-18%',                // ← Improvement
    icon: Zap
  }
]
```

### LeadsPage Variables
```typescript
leads[] = [
  {
    _id: '1',                           // ← Lead.id
    companyName: 'ABC Industries',      // ← CompanyProfile.name
    industryType: 'Manufacturing',      // ← CompanyProfile.industry
    plantLocations: 'Gujarat, MP',      // ← Extracted from HTML
    contactInformation: '+91-9876543210', // ← Extracted from HTML
    leadScore: 85,                      // ← ScoringEngine output
    trustScore: 92,                     // ← Source.trust_score
    status: 'Hot',                      // ← Lead.status
    productRecommendations: 'FO, Bitumen', // ← IntelligenceService
    reasonCodes: 'New plant commission', // ← IntelligenceService
    lastUpdated: '2024-02-07T10:30:00Z' // ← Lead.created_at
  }
]

// Filtering (Client-side)
searchTerm = 'ABC'                      // User input
statusFilter = 'hot'                    // User selection
sortBy = 'score'                        // User preference

// Pagination
hasNext = true                          // result.hasNext
nextSkip = 50                           // result.nextSkip
```

### DashboardPage Variables
```typescript
// Metrics
totalLeads = 1834                       // COUNT(Lead)
hotLeads = 156                          // COUNT(Lead WHERE status='HOT')
acceptedLeads = 628                     // COUNT(Lead WHERE status='ACCEPTED')
conversionRate = 34.2                   // (628 / 1834) * 100
avgLeadScore = 62.5                     // AVG(Lead.score)

// Distributions
statusData = [
  { name: 'Hot', value: 156, color: '#00FFFF' },
  { name: 'Warm', value: 420, color: '#FF00FF' },
  { name: 'Cold', value: 650, color: '#4A4A4A' },
  { name: 'Accepted', value: 628, color: '#00FFFF' },
  { name: 'Rejected', value: 180, color: '#FF4136' }
]

industryData = [
  { name: 'Manufacturing', value: 450 },
  { name: 'Chemical', value: 380 },
  { name: 'Petrochemical', value: 320 },
  ...
]

scoreRanges = [
  { range: '0-20', count: 120 },
  { range: '21-40', count: 280 },
  { range: '41-60', count: 450 },
  { range: '61-80', count: 620 },
  { range: '81-100', count: 364 }
]

regionData = [
  { name: 'Maharashtra', value: 320 },
  { name: 'Gujarat', value: 280 },
  { name: 'Uttar Pradesh', value: 240 },
  ...
]

scatterData = [
  { leadScore: 85, trustScore: 92 },
  { leadScore: 72, trustScore: 68 },
  ...
]
```

---

## 🔄 Service Integration Points

### 1. Scraper Service → Frontend
```
ScraperService.fetch(url)
  ↓ (HTML content)
IntelligenceService.analyze(html)
  ↓ (Extracted data)
ScoringEngine.calculate_lead_score()
  ↓ (Numeric score)
Lead.score = final_score
  ↓ (Stored in DB)
GET /leads/new
  ↓ (API response)
LeadsPage renders CompanyCard
```

### 2. Intelligence Service → Frontend
```
IntelligenceService.analyze(html)
  ↓ Returns:
  {
    "company_name": "ABC Industries",
    "intent": "High",
    "recommended_product": "FO",
    "reason_codes": "New plant commission"
  }
  ↓ Stored as:
  Lead.recommended_product
  Lead.intent
  ↓ Displayed in:
  LeadDetailPage.productRecommendations
  LeadDetailPage.reasonCodes
```

### 3. Scoring Engine → Frontend
```
ScoringEngine.calculate_lead_score(
  created_at,
  keyword_density,
  company_size
)
  ↓ Returns: Float (0-100)
  ↓ Stored as: Lead.score
  ↓ Displayed in:
  - CompanyCard: leadScore badge
  - LeadDetailPage: Large score display
  - DashboardPage: Score distribution chart
  ↓ Used for:
  - Sorting (LeadsPage)
  - Filtering (DashboardPage)
  - Ranking (Top Opportunities)
```

---

## 🎯 Action Button Mapping

### LeadDetailPage Action Buttons

| Button | Frontend Handler | Backend Endpoint | Action |
|--------|---|---|---|
| Accept Lead | `handleFeedback(true)` | `POST /leads/{id}/action` | Update status to "ACCEPTED" |
| Reject Lead | `handleFeedback(false)` | `POST /leads/{id}/action` | Update status to "REJECTED" |
| Send Feedback | `handleSendFeedback()` | (Future: POST /feedback) | Log feedback for model training |
| Call Lead | (Placeholder) | (Future: CRM integration) | Trigger call action |
| Send Email | (Placeholder) | (Future: Email service) | Trigger email action |
| Schedule Meeting | (Placeholder) | (Future: Calendar integration) | Trigger calendar action |

---

## 📈 Performance Considerations

### Frontend Optimization
- **Pagination:** Load 50 leads per page (configurable)
- **Client-side filtering:** No API call for search/sort
- **Lazy loading:** Charts render on scroll
- **Caching:** Lead data cached in component state

### Backend Optimization
- **Database indexing:** `Lead.status`, `CompanyProfile.industry`
- **Query optimization:** JOIN operations pre-computed
- **Scoring caching:** Scores calculated once, stored
- **Pagination:** LIMIT/OFFSET for large datasets

---

## 🔐 Security & Data Integrity

### Frontend Validation
- Input sanitization for search terms
- Status enum validation before API call
- Optimistic update rollback on error

### Backend Validation
- Lead ID verification
- Status enum validation
- User authentication (future)
- Audit logging for all updates

---

## 📝 Summary

This mapping document shows how the FastAPI backend architecture directly correlates with the Wix frontend pages:

1. **HomePage** displays real-time system metrics aggregated from backend
2. **LeadsPage** fetches and displays leads with client-side filtering
3. **LeadDetailPage** shows enriched lead data with LLM analysis
4. **DashboardPage** aggregates all leads for executive analytics

Each frontend variable maps to a specific backend model, service, or database query, ensuring data consistency and enabling seamless integration between the two systems.

---

## 🚀 Future Enhancements

- [ ] Real-time WebSocket updates for dashboard metrics
- [ ] Advanced filtering with saved preferences
- [ ] Export functionality (CSV, PDF)
- [ ] CRM integration for quick actions
- [ ] Machine learning model versioning
- [ ] A/B testing for scoring algorithms
- [ ] Geographic routing automation
- [ ] Feedback loop for continuous model improvement
