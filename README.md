# Agentic AI Loan Sales Assistant - Tata Capital

A full-stack real-time loan processing application featuring a Master Agent orchestrating four specialized Worker Agents (Sales, Verification, Underwriting, and Sanction Letter Generator) with deterministic underwriting rules and conversational AI.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Install Backend Dependencies (if needed)
```bash
cd backend
npm install
cd ..
```

### 3. Start Application
```bash
npm start
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎯 Demo Flow

### Test Scenarios

#### Scenario 1: Instant Approval (Amount ≤ Pre-approved Limit)
1. Loan Amount: `250000`
2. Tenure: `24` months
3. Purpose: `Home Renovation`
4. Phone: `9876543210` (John Doe - Pre-approved: ₹3L, Score: 780)
5. **Result**: ✅ Instant Approval

#### Scenario 2: Salary Verification Required (Amount ≤ 2× Limit)
1. Loan Amount: `500000`
2. Tenure: `36` months
3. Purpose: `Wedding`
4. Phone: `9876543210` (Pre-approved: ₹3L)
5. Salary: `60000`
6. **Result**: ✅ Approved (EMI ≤ 50% salary)

#### Scenario 3: Low Credit Score Rejection
1. Loan Amount: `300000`
2. Tenure: `24` months
3. Purpose: `Business`
4. Phone: `8765432109` (Jane Smith - Score: 650)
5. **Result**: ❌ Rejected (Score < 700)

#### Scenario 4: High Amount Rejection
1. Loan Amount: `800000`
2. Tenure: `48` months
3. Purpose: `Education`
4. Phone: `7654321098` (Pre-approved: ₹2L, Max: ₹4L)
5. **Result**: ❌ Rejected (Amount > 2× limit)

#### Scenario 5: EMI/Salary Ratio Failure
1. Loan Amount: `500000`
2. Tenure: `24` months
3. Phone: `9876543210`
4. Salary: `30000`
5. **Result**: ❌ Rejected (EMI > 50% salary)

## 🏗️ System Architecture

### Agents

#### 1. Master Agent (Orchestrator)
- Owns conversation flow and dialogue policy
- Implements state machine for loan processing
- Coordinates all worker agents
- Manages session state and history

**States**:
- `GREET` → Initial greeting
- `COLLECT_AMOUNT` → Loan amount collection
- `COLLECT_TENURE` → Tenure collection
- `COLLECT_PURPOSE` → Purpose collection
- `COLLECT_PHONE` → Phone number collection
- `KYC_VERIFICATION` → KYC verification
- `UNDERWRITING` → Credit evaluation
- `SALARY_UPLOAD` → Salary verification (conditional)
- `APPROVED` → Loan approved
- `REJECTED` → Loan rejected
- `CLOSED` → Conversation ended

#### 2. Sales Agent (Negotiator)
- Collects loan requirements (amount, tenure, purpose)
- Calculates and explains EMI
- Suggests upsell opportunities
- Provides product information

#### 3. Verification Agent (KYC)
- Verifies customer phone number
- Fetches customer details from CRM
- Retrieves credit score from bureau
- Validates customer identity

#### 4. Underwriting Agent
- Applies deterministic underwriting rules
- Evaluates creditworthiness
- Calculates EMI and interest rates
- Performs salary-to-EMI ratio checks
- Makes approval/rejection decisions

#### 5. Sanction Letter Generator
- Generates professional PDF sanction letters
- Includes customer and loan details
- Adds terms & conditions
- Creates unique sanction IDs

## 🧮 Deterministic Underwriting Logic

### Input Parameters
- `loanAmount`: Requested loan amount
- `tenure`: Loan tenure in months
- `creditScore`: CIBIL score (0-900)
- `preApprovedLimit`: Pre-approved limit from Offer Mart
- `salary`: Monthly salary (optional, required for conditional approval)
- `interestRate`: Calculated based on credit score

### Rules

#### Rule 1: Credit Score Check
```
IF creditScore < 700 THEN
  REJECT with reason "Credit score below minimum threshold"
```

#### Rule 2: Instant Approval
```
IF loanAmount <= preApprovedLimit THEN
  INSTANT_APPROVE
  Calculate EMI and generate sanction letter
```

#### Rule 3: Conditional Approval (Salary Verification)
```
IF loanAmount > preApprovedLimit AND loanAmount <= 2 × preApprovedLimit THEN
  REQUEST salary slip
  Calculate EMI
  IF EMI <= 0.5 × salary THEN
    APPROVE
  ELSE
    REJECT with reason "EMI exceeds 50% of salary"
```

#### Rule 4: Amount Exceeds Limit
```
IF loanAmount > 2 × preApprovedLimit THEN
  REJECT with reason "Amount exceeds maximum eligible limit"
```

### EMI Calculation Formula
```
EMI = P × r × (1+r)^n / ((1+r)^n - 1)

Where:
  P = Principal (loan amount)
  r = Monthly interest rate (annual rate / 12 / 100)
  n = Tenure in months
```

### Interest Rate Calculation
```
IF creditScore >= 800 THEN rate = baseRate
IF creditScore >= 750 THEN rate = baseRate + 0.5%
IF creditScore >= 700 THEN rate = baseRate + 1.0%
ELSE rate = baseRate + 2.0%
```

## 🔌 Mock Services (APIs)

### 1. Offer Mart API
**Endpoint**: `GET /api/offers?custId={custId}`

**Response**:
```json
{
  "preApprovedLimit": 300000,
  "baseRate": 8.5,
  "maxTenure": 60
}
```

### 2. CRM API (KYC)
**Endpoint**: `GET /api/kyc?phone={phone}`

**Response**:
```json
{
  "custId": "CUST001",
  "name": "John Doe",
  "phone": "9876543210",
  "address": "123 MG Road, Bangalore",
  "city": "Bangalore",
  "dob": "1990-05-15",
  "pan": "ABCDE1234F"
}
```

### 3. Credit Bureau API
**Endpoint**: `GET /api/score?pan={pan}`

**Response**:
```json
{
  "score": 780,
  "history": "Excellent"
}
```

### 4. File Upload API
**Endpoint**: `POST /api/upload`

**Request**: Multipart form data with file

**Response**:
```json
{
  "fileId": "FILE1234567890",
  "filename": "salary_slip.pdf",
  "message": "File uploaded successfully"
}
```

### 5. Sanction Letter API
**Endpoint**: `GET /api/sanction/{filename}`

**Response**: PDF file download

### 6. Chat API (Main)
**Endpoint**: `POST /api/chat`

**Request**:
```json
{
  "sessionId": "SESSION_123",
  "message": "500000",
  "context": {
    "salary": 60000
  }
}
```

**Response**:
```json
{
  "message": "Bot response text",
  "state": "COLLECT_TENURE",
  "action": "VERIFY_KYC",
  "decision": {},
  "sanctionLetter": {}
}
```

## 📊 Mock Data

### Customers (CRM)

| Phone | Name | Customer ID | Pre-approved | Credit Score | Base Rate |
|-------|------|-------------|--------------|--------------|-----------|
| 9876543210 | John Doe | CUST001 | ₹3,00,000 | 780 | 8.5% |
| 8765432109 | Jane Smith | CUST002 | ₹5,00,000 | 650 | 9.0% |
| 7654321098 | Raj Kumar | CUST003 | ₹2,00,000 | 820 | 10.0% |

## ✨ Features

### Core Features
✅ Conversational AI-driven loan application
✅ Real-time state machine workflow
✅ Automatic KYC verification from mock CRM
✅ Credit score integration with mock bureau
✅ Deterministic underwriting with clear rules
✅ EMI calculation with standard formula
✅ Salary-to-EMI ratio validation (50% threshold)
✅ Professional PDF sanction letter generation
✅ Session management and conversation history
✅ Responsive chatbot UI with gradient design
✅ Real-time typing indicators
✅ Automatic sanction letter download

### Edge Cases Handled
✅ Low credit score rejection (< 700)
✅ Amount exceeding 2× pre-approved limit
✅ EMI exceeding 50% of salary
✅ KYC mismatch or not found
✅ Invalid input validation
✅ Session state persistence
✅ Graceful error handling

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PDFKit** for PDF generation
- **Multer** for file uploads
- **CORS** for cross-origin requests

### Frontend
- **React 18** with Hooks
- **Tailwind CSS** for styling
- **Responsive design** for all devices

### Architecture Pattern
- **Agentic AI** with Master-Worker pattern
- **State Machine** for conversation flow
- **Mock Services** for external integrations
- **RESTful APIs** for communication

## 📁 Project Structure

```
Agentic AI Loan Sales Assistant Project/
├── backend/
│   ├── server.js              # Main backend with all agents
│   ├── sanctions/             # Generated sanction letters
│   ├── uploads/               # Uploaded salary slips
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json               # Root package for scripts
└── README.md
```

## 🧪 Testing Guide

### Manual Testing Steps

1. **Start the application**
   ```bash
   npm start
   ```

2. **Test Instant Approval**
   - Amount: 250000
   - Tenure: 24
   - Phone: 9876543210
   - Expected: Instant approval

3. **Test Salary Verification**
   - Amount: 500000
   - Tenure: 36
   - Phone: 9876543210
   - Salary: 60000
   - Expected: Approved after salary check

4. **Test Low Credit Rejection**
   - Amount: 300000
   - Phone: 8765432109
   - Expected: Rejected (score 650 < 700)

5. **Test High Amount Rejection**
   - Amount: 800000
   - Phone: 7654321098
   - Expected: Rejected (exceeds 2× limit)

6. **Test EMI Ratio Failure**
   - Amount: 500000
   - Phone: 9876543210
   - Salary: 30000
   - Expected: Rejected (EMI > 50% salary)

## 🔧 Troubleshooting

### Frontend not starting
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Backend not starting
```bash
cd backend
npm install
```

### Port already in use
- Frontend (3000): Change in package.json or kill process
- Backend (5000): Change PORT in server.js

### Sanction letter not downloading
- Check if `backend/sanctions/` directory exists
- Verify file permissions

## 🚀 Future Enhancements

- [ ] Real OTP verification via SMS gateway
- [ ] Actual credit bureau integration (CIBIL API)
- [ ] Document upload with OCR for salary slips
- [ ] E-signature integration
- [ ] Loan disbursement tracking
- [ ] EMI payment reminders
- [ ] Customer dashboard
- [ ] Admin panel for loan management
- [ ] WhatsApp/SMS notifications
- [ ] Multi-language support
- [ ] Voice-based interaction
- [ ] Analytics and reporting

## 📞 Support

For queries or issues:
- **Email**: support@tatacapital.com
- **Phone**: 1800-209-8800
- **Grievance**: grievance@tatacapital.com

## 📄 License

© 2024 Tata Capital. All rights reserved.

---

**Built with ❤️ using Agentic AI Architecture**
