# Backend Architecture - Lead Discovery & Management System

## Overview
This document outlines the backend architecture for the Lead Discovery and Management System built on the Wix platform. The system leverages Wix's serverless infrastructure, CMS collections, and member management to provide a scalable, production-ready solution.

---

## 1. Architecture Layers

### 1.1 Data Layer (CMS Collections)
The system uses Wix's native CMS collections as the primary data store:

#### **CustomerLeads Collection** (`leads`)
- **Purpose**: Stores all discovered leads with scoring and status information
- **Fields**:
  - `_id`: Unique identifier (auto-generated)
  - `companyName`: Company name (text)
  - `industryType`: Industry classification (text)
  - `plantLocations`: Geographic locations of facilities (text)
  - `contactInformation`: Contact details (text)
  - `leadScore`: AI-generated lead quality score (0-100, number)
  - `trustScore`: Data source reliability score (0-100, number)
  - `status`: Lead status - Hot/Warm/Cold/Accepted/Rejected (text)
  - `productRecommendations`: AI-suggested products (text)
  - `reasonCodes`: Scoring justification (text)
  - `lastUpdated`: Last modification timestamp (datetime)
  - `_createdDate`: Creation timestamp (auto)
  - `_updatedDate`: Update timestamp (auto)

#### **Products Collection** (`products`)
- **Purpose**: Product catalog for recommendations
- **Fields**:
  - `productName`: Product name (text)
  - `productDescription`: Detailed description (text)
  - `category`: Product category (text)
  - `productCode`: SKU/product code (text)
  - `recommendationDetails`: Why this product is recommended (text)
  - `productImage`: Product image URL (image)

#### **RegionalOffices Collection** (`regionaloffices`)
- **Purpose**: Geographic distribution of sales offices
- **Fields**:
  - `officeName`: Office name (text)
  - `regionIdentifier`: Region code (text)
  - `address`: Full address (text)
  - `city`: City name (text)
  - `stateProvince`: State/Province (text)
  - `contactPerson`: Office manager name (text)
  - `contactEmail`: Office email (text)
  - `contactPhone`: Office phone (text)
  - `latitude`: Geographic latitude (number)
  - `longitude`: Geographic longitude (number)

#### **Sources Collection** (`sources`)
- **Purpose**: Data source tracking for lead quality assessment
- **Fields**:
  - `sourceName`: Source name (text)
  - `sourceType`: Type of source (text)
  - `url`: Source URL (url)
  - `trustScore`: Source reliability score (number)
  - `description`: Source description (text)
  - `lastCrawled`: Last data fetch timestamp (datetime)
  - `isActive`: Source active status (boolean)

### 1.2 Service Layer (Integration Services)

#### **BaseCrudService** (`@/integrations/cms/service.ts`)
Core CRUD operations for all collections:

```typescript
// Read Operations
getAll<T>(collectionId, references?, options?)
  - Fetches paginated items from a collection
  - Supports reference population (singleRef, multiRef)
  - Returns: { items, totalCount, hasNext, currentPage, pageSize, nextSkip }

getById<T>(collectionId, itemId, references?)
  - Fetches a single item with all references populated
  - Returns: T (fully populated item)

// Write Operations
create<T>(collectionId, itemData, multiReferences?)
  - Creates new item with optional multi-reference fields
  - Returns: { _id, ...itemData }

update<T>(collectionId, itemData)
  - Updates existing item (partial update, preserves other fields)
  - Returns: updated item

delete<T>(collectionId, itemId)
  - Deletes item from collection
  - Returns: void

// Reference Management
addReferences(collectionId, itemId, references)
  - Adds items to multi-reference fields
  - Example: addReferences('leads', 'lead-1', { tags: ['tag-1'] })

removeReferences(collectionId, itemId, references)
  - Removes items from multi-reference fields
```

#### **MemberService** (`@/integrations/members/service.ts`)
User authentication and profile management:

```typescript
// Authentication
login()
  - Redirects to Wix login page
  - Auto-redirects back to current page after login

logout()
  - Clears member session
  - Redirects to home page

loadCurrentMember()
  - Fetches current authenticated member data
  - Returns: Member object or null

// Member Data Structure
{
  loginEmail?: string
  loginEmailVerified?: boolean
  status?: 'UNKNOWN' | 'PENDING' | 'APPROVED' | 'BLOCKED' | 'OFFLINE'
  contact?: {
    firstName?: string
    lastName?: string
    phones?: string[]
  }
  profile?: {
    nickname?: string
    photo?: { url, height, width, offsetX, offsetY }
    title?: string
  }
  _createdDate?: Date
  _updatedDate?: Date
  lastLoginDate?: Date
}
```

### 1.3 API Layer (Frontend Integration)

#### **React Hooks**
- `useMember()`: Access member context and authentication state
- `useToast()`: Display notifications

#### **Data Flow Pattern**
```
React Component
    ↓
useMember() / useState()
    ↓
BaseCrudService.getAll/getById/create/update/delete()
    ↓
Wix CMS API
    ↓
Database Collections
```

---

## 2. Data Flow Architecture

### 2.1 Lead Discovery Flow
```
1. External Data Source (Web Scraper/API)
   ↓
2. Lead Scoring Engine (AI/ML)
   ↓
3. BaseCrudService.create('leads', leadData)
   ↓
4. CMS Collection Storage
   ↓
5. Frontend Display (LeadsPage)
```

### 2.2 Lead Interaction Flow
```
1. User Views Lead (LeadDetailPage)
   ↓
2. BaseCrudService.getById('leads', leadId)
   ↓
3. Display Lead Details + Recommendations
   ↓
4. User Provides Feedback (Accept/Reject)
   ↓
5. BaseCrudService.update('leads', { _id, status })
   ↓
6. Feedback Stored in Collection
   ↓
7. Analytics Updated (DashboardPage)
```

### 2.3 Dashboard Analytics Flow
```
1. DashboardPage Loads
   ↓
2. Promise.all([
     BaseCrudService.getAll('leads', {}, { limit: 1000 }),
     BaseCrudService.getAll('regionaloffices', {}, { limit: 100 })
   ])
   ↓
3. Calculate Metrics:
   - Total Leads
   - Hot Leads Count
   - Conversion Rate
   - Average Scores
   - Geographic Distribution
   - Industry Distribution
   ↓
4. Render Charts (Recharts)
   - Pie Chart: Status Distribution
   - Bar Chart: Industry Distribution
   - Bar Chart: Score Distribution
   - Bar Chart: Geographic Distribution
   - Scatter Chart: Lead Quality Matrix
   - Funnel: Conversion Pipeline
```

---

## 3. Authentication & Authorization

### 3.1 Member Protection
- **MemberProvider**: Wraps entire app, auto-checks auth on load
- **MemberProtectedRoute**: Wrapper for protected pages
- **useMember Hook**: Access auth state in components

### 3.2 Permission Model
- **Public Pages**: HomePage (shows different content for authenticated users)
- **Protected Pages**: ProfilePage (requires authentication)
- **Mixed Pages**: LeadsPage, DashboardPage (accessible to all, enhanced for authenticated users)

### 3.3 Data Access Control
- All CMS collections have "ANYONE" read/write permissions
- In production, implement role-based access control (RBAC)
- Validate user permissions in backend before data operations

---

## 4. Scalability & Performance

### 4.1 Pagination Strategy
```typescript
// Initial Load
const result = await BaseCrudService.getAll('leads', [], { limit: 50, skip: 0 });

// Load More
const nextResult = await BaseCrudService.getAll('leads', [], { 
  limit: 50, 
  skip: result.nextSkip 
});

// Result Structure
{
  items: Lead[],           // Current page items
  totalCount: number,      // Total items in collection
  hasNext: boolean,        // More items available
  currentPage: number,     // Current page (0-indexed)
  pageSize: number,        // Items per page
  nextSkip: number | null  // Offset for next page
}
```

### 4.2 Caching Strategy
- **Frontend**: React state management with Zustand (optional)
- **API**: Wix CMS handles caching automatically
- **Optimization**: Load only required fields, use pagination

### 4.3 Query Optimization
```typescript
// Efficient: Load with references
const leads = await BaseCrudService.getAll('leads', {
  singleRef: ['sourceId'],
  multiRef: ['tags', 'products']
}, { limit: 50 });

// Inefficient: Separate queries
const leads = await BaseCrudService.getAll('leads');
const products = await BaseCrudService.getAll('products');
// Then filter/match in code
```

---

## 5. Error Handling & Resilience

### 5.1 Error Handling Pattern
```typescript
try {
  const data = await BaseCrudService.getAll('leads');
  setLeads(data.items);
} catch (error) {
  console.error('Failed to load leads:', error);
  toast({
    title: 'Error',
    description: 'Failed to load leads',
    variant: 'destructive'
  });
}
```

### 5.2 Retry Logic
- Implement exponential backoff for failed requests
- Retry failed operations up to 3 times
- Log errors for monitoring

### 5.3 Fallback States
- Loading states: Show spinner or skeleton
- Error states: Display error message with retry option
- Empty states: Show helpful message with call-to-action

---

## 6. Data Consistency & Integrity

### 6.1 Optimistic Updates
```typescript
// Update UI immediately
setState(newValue);

// Then sync with backend
try {
  await BaseCrudService.update('leads', { _id, status });
} catch (error) {
  // Revert on failure
  loadData();
}
```

### 6.2 Data Validation
- Validate input data before sending to API
- Use TypeScript interfaces for type safety
- Implement field-level validation in forms

### 6.3 Referential Integrity
- Validate reference IDs exist before creating relationships
- Handle orphaned references gracefully
- Cascade delete when necessary

---

## 7. Monitoring & Analytics

### 7.1 Metrics Tracked
- Total leads discovered
- Hot leads count
- Conversion rate
- Average lead score
- Trust score distribution
- Geographic distribution
- Industry distribution
- Lead quality matrix (score vs trust)

### 7.2 Dashboard Visualizations
- **Pie Chart**: Status distribution (Hot/Warm/Cold/Accepted/Rejected)
- **Bar Chart**: Top industries by lead count
- **Bar Chart**: Lead score distribution (0-20, 21-40, etc.)
- **Bar Chart**: Geographic distribution by region
- **Scatter Chart**: Lead quality matrix (Lead Score vs Trust Score)
- **Funnel Chart**: Conversion pipeline (Discovered → Hot → Accepted)
- **List**: Top opportunities (highest scoring leads)

---

## 8. Security Considerations

### 8.1 Data Protection
- All data transmitted over HTTPS
- Wix handles SSL/TLS encryption
- No sensitive data stored in localStorage

### 8.2 Authentication Security
- Session tokens managed by Wix
- Auto-logout on inactivity (configurable)
- CSRF protection built-in

### 8.3 API Security
- Rate limiting (handled by Wix)
- Input validation on all endpoints
- Output encoding to prevent XSS

---

## 9. Deployment & DevOps

### 9.1 Deployment Process
1. Code pushed to repository
2. Automated tests run
3. Build process compiles TypeScript/React
4. Deploy to Wix hosting
5. Auto-scaling handles traffic spikes

### 9.2 Environment Configuration
- Development: Local testing with mock data
- Staging: Full integration testing
- Production: Live data with monitoring

### 9.3 Backup & Recovery
- Wix handles automatic backups
- Point-in-time recovery available
- Data retention policy: 30 days

---

## 10. Future Enhancements

### 10.1 Advanced Features
- **Machine Learning**: Improve lead scoring with feedback loop
- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Filtering**: Complex query builder
- **Export Functionality**: CSV/Excel export of leads
- **Bulk Operations**: Batch update/delete leads
- **Custom Fields**: Allow users to add custom lead attributes

### 10.2 Integration Opportunities
- **CRM Integration**: Sync with Salesforce/HubSpot
- **Email Marketing**: Integrate with email platforms
- **Calendar Integration**: Schedule follow-ups
- **Slack Notifications**: Alert team of hot leads
- **Webhook Support**: Custom integrations

### 10.3 Performance Improvements
- **Elasticsearch**: Full-text search on leads
- **Redis Caching**: Cache frequently accessed data
- **GraphQL API**: More efficient data fetching
- **CDN**: Serve static assets globally

---

## 11. API Reference

### Collection IDs
```typescript
const CollectionIds = {
  LEADS: 'leads',
  PRODUCTS: 'products',
  REGIONAL_OFFICES: 'regionaloffices',
  SOURCES: 'sources'
};
```

### Common Operations

#### Get All Leads with Pagination
```typescript
const result = await BaseCrudService.getAll<CustomerLeads>(
  'leads',
  [],
  { limit: 50, skip: 0 }
);
```

#### Get Single Lead
```typescript
const lead = await BaseCrudService.getById<CustomerLeads>(
  'leads',
  'lead-id'
);
```

#### Create Lead
```typescript
const newLead = await BaseCrudService.create<CustomerLeads>(
  'leads',
  {
    _id: crypto.randomUUID(),
    companyName: 'Acme Corp',
    industryType: 'Manufacturing',
    leadScore: 85,
    trustScore: 90,
    status: 'Hot'
  }
);
```

#### Update Lead
```typescript
await BaseCrudService.update<CustomerLeads>(
  'leads',
  {
    _id: 'lead-id',
    status: 'Accepted'
  }
);
```

#### Delete Lead
```typescript
await BaseCrudService.delete<CustomerLeads>(
  'leads',
  'lead-id'
);
```

---

## 12. Troubleshooting Guide

### Common Issues

#### Issue: "Collection not found"
- **Cause**: Collection ID mismatch
- **Solution**: Verify collection ID in CMS matches code

#### Issue: "Reference not populated"
- **Cause**: Forgot to include in singleRef/multiRef
- **Solution**: Add reference field to getAll/getById call

#### Issue: "Slow queries"
- **Cause**: Loading too many items or missing pagination
- **Solution**: Implement pagination, limit results to 50-100

#### Issue: "Authentication fails"
- **Cause**: Member not logged in or session expired
- **Solution**: Check MemberProvider wraps app, implement login redirect

---

## 13. Code Examples

### Example: Fetch and Display Leads
```typescript
import { BaseCrudService } from '@/integrations';
import { CustomerLeads } from '@/entities';

export default function LeadsPage() {
  const [leads, setLeads] = useState<CustomerLeads[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const result = await BaseCrudService.getAll<CustomerLeads>(
        'leads',
        [],
        { limit: 50 }
      );
      setLeads(result.items);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <div>
          {leads.map(lead => (
            <div key={lead._id}>
              <h3>{lead.companyName}</h3>
              <p>Score: {lead.leadScore}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example: Update Lead Status
```typescript
const handleAcceptLead = async (leadId: string) => {
  try {
    // Optimistic update
    setLeads(prev => prev.map(l => 
      l._id === leadId ? { ...l, status: 'Accepted' } : l
    ));

    // Sync with backend
    await BaseCrudService.update<CustomerLeads>('leads', {
      _id: leadId,
      status: 'Accepted'
    });

    toast({ title: 'Lead Accepted' });
  } catch (error) {
    // Revert on failure
    loadLeads();
    toast({ title: 'Error', variant: 'destructive' });
  }
};
```

---

## Conclusion

This backend architecture provides a scalable, secure, and maintainable foundation for the Lead Discovery and Management System. By leveraging Wix's managed infrastructure, we eliminate operational overhead while maintaining flexibility for future enhancements.

**Key Takeaways:**
- ✅ Serverless architecture (no server management)
- ✅ Built-in authentication & authorization
- ✅ Automatic scaling & backups
- ✅ Type-safe data operations
- ✅ Real-time analytics & dashboards
- ✅ Production-ready error handling
