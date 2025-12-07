# System Architecture - Agentic AI Loan Sales Assistant

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React Frontend - Port 3000)                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Chat UI    │  │  State Mgmt  │  │ PDF Download │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                             │
│                  (Node.js/Express - Port 5000)                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    MASTER AGENT                           │ │
│  │              (Orchestrator & State Machine)               │ │
│  │                                                           │ │
│  │  States: GREET → COLLECT → VERIFY → UNDERWRITE →        │ │
│  │          APPROVE/REJECT → SANCTION → CLOSE               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              │               │               │                 │
│              ▼               ▼               ▼                 │
│  ┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐    │
│  │  SALES AGENT    │ │ VERIFICATION│ │  UNDERWRITING    │    │
│  │                 │ │   AGENT     │ │     AGENT        │    │
│  │ • Collect Data  │ │ • KYC Check │ │ • Credit Check   │    │
│  │ • Calculate EMI │ │ • Phone Ver │ │ • Apply Rules    │    │
│  │ • Upsell        │ │ • Get Score │ │ • EMI/Salary     │    │
│  └─────────────────┘ └─────────────┘ └──────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │ SANCTION AGENT   │                        │
│                    │                  │                        │
│                    │ • Generate PDF   │                        │
│                    │ • Sanction ID    │                        │
│                    │ • Terms & Conds  │                        │
│                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mock Services
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MOCK SERVICES                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Offer Mart  │  │  CRM Server  │  │Credit Bureau │        │
│  │              │  │              │  │              │        │
│  │ Pre-approved │  │ KYC Data     │  │ CIBIL Score  │        │
│  │ Limits       │  │ Customer Info│  │ Credit Hist  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │ File Upload  │  │  Sanction    │                           │
│  │              │  │  Storage     │                           │
│  │ Salary Slips │  │  PDF Files   │                           │
│  └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Architecture

### Master Agent (Orchestrator)

**Responsibilities**:
- Conversation flow management
- State machine implementation
- Worker agent coordination
- Session management
- Decision routing

**State Machine**:
```
START
  │
  ▼
GREET ──────────────────────────────────────┐
  │                                          │
  ▼                                          │
COLLECT_AMOUNT                               │
  │                                          │
  ▼                                          │
COLLECT_TENURE                               │
  │                                          │
  ▼                                          │
COLLECT_PURPOSE                              │
  │                                          │
  ▼                                          │
COLLECT_PHONE                                │
  │                                          │
  ▼                                          │
KYC_VERIFICATION ──────────[FAIL]───────────┤
  │                                          │
  │[SUCCESS]                                 │
  ▼                                          │
UNDERWRITING                                 │
  │                                          │
  ├──[INSTANT_APPROVED]──────────────┐      │
  │                                   │      │
  ├──[SALARY_REQUIRED]───────────┐   │      │
  │                               │   │      │
  │                               ▼   │      │
  │                        SALARY_UPLOAD     │
  │                               │   │      │
  │                    ┌──[FAIL]──┘   │      │
  │                    │               │      │
  └──[REJECTED]────────┼───────────────┤      │
                       │               │      │
                       ▼               ▼      │
                    REJECTED        APPROVED  │
                       │               │      │
                       │               ▼      │
                       │      GENERATE_SANCTION
                       │               │      │
                       ▼               ▼      ▼
                    CLOSED ◄──────────────────┘
```

**Key Methods**:
- `processMessage(sessionId, message, context)` - Main entry point
- `handleGreet()` - Initial greeting
- `handleAmount()` - Loan amount collection
- `handleTenure()` - Tenure collection
- `handlePurpose()` - Purpose collection
- `handlePhone()` - Phone collection
- `handleKYC()` - KYC verification
- `handleUnderwriting()` - Credit evaluation
- `handleSalaryUpload()` - Salary verification
- `handleApproved()` - Approval flow
- `handleRejected()` - Rejection flow

---

### Sales Agent

**Responsibilities**:
- Collect loan requirements
- Calculate estimated EMI
- Explain product features
- Suggest upsell opportunities

**Key Methods**:
- `handleEnquiry(data)` - Process loan enquiry
- `suggestUpsell(amount, limit)` - Suggest higher amount

**Business Logic**:
```javascript
EMI = P × r × (1+r)^n / ((1+r)^n - 1)

Upsell Trigger:
IF loanAmount < 0.7 × preApprovedLimit THEN
  Suggest higher amount
```

---

### Verification Agent

**Responsibilities**:
- KYC verification
- Phone number validation
- Credit score retrieval
- Customer data fetching

**Key Methods**:
- `verifyKYC(phone)` - Verify customer KYC
- `getCreditScore(pan)` - Fetch credit score

**Integration Points**:
- CRM Server API
- Credit Bureau API

**Verification Flow**:
```
Phone Number
    │
    ▼
CRM Lookup ──[NOT FOUND]──► KYC Failed
    │
    │[FOUND]
    ▼
Customer Data
    │
    ▼
Credit Bureau ──[PAN]──► Credit Score
    │
    ▼
Verification Complete
```

---

### Underwriting Agent

**Responsibilities**:
- Apply underwriting rules
- Credit assessment
- EMI calculation
- Salary verification
- Approval/rejection decision

**Key Methods**:
- `evaluate(data)` - Initial evaluation
- `evaluateWithSalary(data)` - Salary-based evaluation
- `calculateInterestRate(score, baseRate)` - Rate calculation
- `calculateEMI(principal, tenure, rate)` - EMI calculation
- `calculateMaxLoan(salary, tenure, rate)` - Max eligible amount

**Underwriting Rules**:

```
┌─────────────────────────────────────────────────────────────┐
│                    RULE 1: Credit Score                     │
│                                                             │
│  IF creditScore < 700 THEN                                 │
│    REJECT                                                   │
│    REASON: "Credit score below minimum threshold"          │
│  END IF                                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RULE 2: Instant Approval                       │
│                                                             │
│  IF loanAmount <= preApprovedLimit THEN                    │
│    INSTANT_APPROVE                                          │
│    Calculate EMI                                            │
│    Generate Sanction Letter                                │
│  END IF                                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         RULE 3: Conditional Approval (Salary Check)         │
│                                                             │
│  IF loanAmount > preApprovedLimit AND                      │
│     loanAmount <= 2 × preApprovedLimit THEN                │
│                                                             │
│    REQUEST salary                                           │
│    Calculate EMI                                            │
│                                                             │
│    IF EMI <= 0.5 × salary THEN                            │
│      APPROVE                                                │
│    ELSE                                                     │
│      REJECT                                                 │
│      REASON: "EMI exceeds 50% of salary"                   │
│    END IF                                                   │
│  END IF                                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RULE 4: Amount Exceeds Limit                   │
│                                                             │
│  IF loanAmount > 2 × preApprovedLimit THEN                 │
│    REJECT                                                   │
│    REASON: "Amount exceeds maximum eligible limit"         │
│  END IF                                                     │
└─────────────────────────────────────────────────────────────┘
```

**Interest Rate Calculation**:
```
IF creditScore >= 800 THEN
  rate = baseRate
ELSE IF creditScore >= 750 THEN
  rate = baseRate + 0.5%
ELSE IF creditScore >= 700 THEN
  rate = baseRate + 1.0%
ELSE
  rate = baseRate + 2.0%
END IF
```

---

### Sanction Letter Generator Agent

**Responsibilities**:
- Generate PDF sanction letters
- Create unique sanction IDs
- Include all loan details
- Add terms & conditions

**Key Methods**:
- `generateLetter(data)` - Generate PDF

**PDF Structure**:
```
┌─────────────────────────────────────────┐
│         TATA CAPITAL                    │
│    LOAN SANCTION LETTER                 │
├─────────────────────────────────────────┤
│ Sanction ID: SANxxxxxxxxxx              │
│ Date: DD/MM/YYYY                        │
├─────────────────────────────────────────┤
│ Customer Details:                       │
│   Name: John Doe                        │
│   Customer ID: CUST001                  │
│   Phone: 9876543210                     │
│   Address: ...                          │
│   PAN: ABCDE1234F                       │
├─────────────────────────────────────────┤
│ Loan Details:                           │
│   Sanctioned Amount: ₹5,00,000          │
│   Tenure: 36 months                     │
│   Interest Rate: 8.5% p.a.              │
│   Monthly EMI: ₹15,800                  │
│   Total Payable: ₹5,68,800              │
│   Credit Score: 780                     │
├─────────────────────────────────────────┤
│ Terms & Conditions:                     │
│   1. Valid for 30 days                  │
│   2. Document verification required     │
│   3. Processing fee: 2% + GST           │
│   4. Prepayment charges: 4%             │
│   5. Late payment penalty: 2%/month     │
│   6. Auto-debit mandate required        │
├─────────────────────────────────────────┤
│ Contact: support@tatacapital.com        │
│ Customer Care: 1800-209-8800            │
└─────────────────────────────────────────┘
```

---

## 🔌 API Architecture

### REST API Endpoints

```
POST /api/chat
├── Request: { sessionId, message, context }
├── Response: { message, state, action, decision, sanctionLetter }
└── Purpose: Main chat interface

GET /api/offers?custId={custId}
├── Response: { preApprovedLimit, baseRate, maxTenure }
└── Purpose: Fetch pre-approved offers

GET /api/kyc?phone={phone}
├── Response: { custId, name, phone, address, city, dob, pan }
└── Purpose: KYC verification

GET /api/score?pan={pan}
├── Response: { score, history }
└── Purpose: Credit score lookup

POST /api/upload
├── Request: Multipart form data (file)
├── Response: { fileId, filename, message }
└── Purpose: Salary slip upload

GET /api/sanction/{filename}
├── Response: PDF file
└── Purpose: Download sanction letter

GET /api/session/{sessionId}
├── Response: { state, data, history }
└── Purpose: Session state (debugging)

GET /api/health
├── Response: { status, timestamp }
└── Purpose: Health check
```

---

## 💾 Data Models

### Session Object
```javascript
{
  state: 'COLLECT_AMOUNT',
  data: {
    loanAmount: 500000,
    tenure: 36,
    purpose: 'Wedding',
    phone: '9876543210',
    customerInfo: { ... },
    salary: 60000,
    decision: { ... },
    sanctionLetter: { ... }
  },
  history: [
    { role: 'user', message: '500000', timestamp: 1234567890 },
    { role: 'bot', message: 'Great!...', timestamp: 1234567891 }
  ]
}
```

### Customer Object (CRM)
```javascript
{
  custId: 'CUST001',
  name: 'John Doe',
  phone: '9876543210',
  address: '123 MG Road, Bangalore',
  city: 'Bangalore',
  dob: '1990-05-15',
  pan: 'ABCDE1234F'
}
```

### Offer Object (Offer Mart)
```javascript
{
  preApprovedLimit: 300000,
  baseRate: 8.5,
  maxTenure: 60
}
```

### Credit Object (Bureau)
```javascript
{
  score: 780,
  history: 'Excellent'
}
```

### Decision Object
```javascript
{
  status: 'APPROVED',
  creditScore: 780,
  preApprovedLimit: 300000,
  interestRate: 8.5,
  emi: 15800,
  tenure: 36,
  salary: 60000,
  emiRatio: 26.33
}
```

### Sanction Letter Object
```javascript
{
  sanctionId: 'SAN1234567890',
  filename: 'sanction_SAN1234567890.pdf',
  filepath: '/path/to/file.pdf'
}
```

---

## 🔄 Sequence Diagrams

### Happy Path - Instant Approval

```
User          Frontend       Master Agent    Sales Agent    Verification    Underwriting    Sanction
 │                │               │               │               │               │             │
 │──Amount────────►│               │               │               │               │             │
 │                │──Process──────►│               │               │               │             │
 │                │               │──Collect──────►│               │               │             │
 │                │               │◄──Response─────│               │               │             │
 │◄──Response─────│◄──────────────│               │               │               │             │
 │                │               │               │               │               │             │
 │──Phone─────────►│               │               │               │               │             │
 │                │──Process──────►│               │               │               │             │
 │                │               │──Verify KYC───────────────────►│               │             │
 │                │               │◄──KYC Data─────────────────────│               │             │
 │                │               │──Get Score─────────────────────►│               │             │
 │                │               │◄──Score 780────────────────────│               │             │
 │                │               │──Evaluate──────────────────────────────────────►│             │
 │                │               │◄──INSTANT_APPROVED─────────────────────────────│             │
 │                │               │──Generate Letter────────────────────────────────────────────►│
 │                │               │◄──PDF Generated─────────────────────────────────────────────│
 │◄──Approved─────│◄──────────────│               │               │               │             │
 │                │               │               │               │               │             │
 │──Download──────►│──────────────────────────────────────────────────────────────────────────►│
 │◄──PDF──────────│◄──────────────────────────────────────────────────────────────────────────│
```

### Conditional Approval - Salary Verification

```
User          Frontend       Master Agent    Underwriting    Sanction
 │                │               │               │             │
 │──Amount────────►│               │               │             │
 │──Phone─────────►│               │               │             │
 │                │──Process──────►│               │             │
 │                │               │──Evaluate─────►│             │
 │                │               │◄──SALARY_REQ───│             │
 │◄──Enter Salary─│◄──────────────│               │             │
 │                │               │               │             │
 │──Salary────────►│               │               │             │
 │                │──Process──────►│               │             │
 │                │               │──Evaluate─────►│             │
 │                │               │  (with salary) │             │
 │                │               │◄──APPROVED─────│             │
 │                │               │──Generate──────────────────►│
 │◄──Approved─────│◄──────────────│               │             │
```

---

## 🔐 Security Architecture

### Input Validation
- Phone number: 10 digits only
- Loan amount: Numeric, min ₹50,000
- Tenure: 6-60 months
- Salary: Numeric, positive

### Session Security
- Unique session IDs
- Server-side session storage
- No sensitive data in frontend

### File Upload Security
- File type validation
- Size limits
- Secure storage path

### API Security
- CORS enabled
- Input sanitization
- Error handling

---

## 📊 Performance Considerations

### Response Times
- Chat message: < 500ms
- KYC verification: < 200ms
- Credit score: < 200ms
- PDF generation: < 2s

### Scalability
- Stateless API design
- Session storage (can use Redis)
- Horizontal scaling ready
- Load balancer compatible

### Optimization
- Async/await for I/O
- Efficient PDF generation
- Minimal database queries
- Caching opportunities

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Frontend     │       │  Frontend     │
│  Instance 1   │       │  Instance 2   │
│  (Port 3000)  │       │  (Port 3001)  │
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      API Gateway / Load Balancer        │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Backend      │       │  Backend      │
│  Instance 1   │       │  Instance 2   │
│  (Port 5000)  │       │  (Port 5001)  │
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Redis        │       │  File Storage │
│  (Sessions)   │       │  (S3/Local)   │
└───────────────┘       └───────────────┘
```

---

## 📈 Monitoring & Logging

### Metrics to Track
- API response times
- Error rates
- Session counts
- Approval/rejection rates
- PDF generation time
- Credit score API latency

### Logging Strategy
- Request/response logs
- Error logs with stack traces
- Business event logs (approval, rejection)
- Audit logs (KYC, credit checks)

---

**Architecture designed for scalability, maintainability, and real-time performance** 🚀
