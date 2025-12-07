# Testing Guide - Agentic AI Loan Sales Assistant

## 🧪 Complete Testing Scenarios

### Prerequisites
- Application running on http://localhost:3000
- Backend running on http://localhost:5000

---

## Test Case 1: Instant Approval ✅

**Objective**: Test instant approval when loan amount is within pre-approved limit

**Steps**:
1. Open http://localhost:3000
2. Enter loan amount: `250000`
3. Enter tenure: `24`
4. Enter purpose: `Home Renovation`
5. Enter phone: `9876543210`

**Expected Result**:
- ✅ KYC verified successfully
- ✅ Credit score: 780
- ✅ Instant approval
- ✅ Interest rate: 8.5%
- ✅ EMI calculated and displayed
- ✅ Sanction letter generated and downloaded

**Validation Points**:
- Amount (₹2,50,000) ≤ Pre-approved limit (₹3,00,000)
- Credit score (780) ≥ 700
- No salary verification required

---

## Test Case 2: Salary Verification - Approved ✅

**Objective**: Test conditional approval with salary verification

**Steps**:
1. Start new application
2. Enter loan amount: `500000`
3. Enter tenure: `36`
4. Enter purpose: `Wedding`
5. Enter phone: `9876543210`
6. Enter salary: `60000`

**Expected Result**:
- ✅ KYC verified
- ✅ Credit score: 780
- ⚠️ Salary verification required (amount > pre-approved limit)
- ✅ EMI calculated: ~₹16,000
- ✅ EMI/Salary ratio: ~27% (< 50%)
- ✅ Approved
- ✅ Sanction letter generated

**Validation Points**:
- Amount (₹5,00,000) > Pre-approved (₹3,00,000)
- Amount (₹5,00,000) ≤ 2× Pre-approved (₹6,00,000)
- EMI (₹16,000) ≤ 50% of salary (₹30,000)

---

## Test Case 3: Low Credit Score Rejection ❌

**Objective**: Test rejection due to low credit score

**Steps**:
1. Start new application
2. Enter loan amount: `300000`
3. Enter tenure: `24`
4. Enter purpose: `Business`
5. Enter phone: `8765432109`

**Expected Result**:
- ✅ KYC verified
- ❌ Credit score: 650 (< 700)
- ❌ Application rejected
- 💡 Alternative options suggested
- 📞 Customer care number provided

**Validation Points**:
- Credit score (650) < Minimum required (700)
- Rejection reason clearly stated
- Helpful alternatives provided

---

## Test Case 4: High Amount Rejection ❌

**Objective**: Test rejection when amount exceeds 2× pre-approved limit

**Steps**:
1. Start new application
2. Enter loan amount: `800000`
3. Enter tenure: `48`
4. Enter purpose: `Education`
5. Enter phone: `7654321098`

**Expected Result**:
- ✅ KYC verified
- ✅ Credit score: 820
- ❌ Amount exceeds maximum eligible limit
- ❌ Application rejected
- 💡 Maximum eligible amount shown (₹4,00,000)

**Validation Points**:
- Amount (₹8,00,000) > 2× Pre-approved (₹4,00,000)
- Credit score is good but amount too high
- Alternative amount suggested

---

## Test Case 5: EMI/Salary Ratio Failure ❌

**Objective**: Test rejection when EMI exceeds 50% of salary

**Steps**:
1. Start new application
2. Enter loan amount: `500000`
3. Enter tenure: `24`
4. Enter purpose: `Debt Consolidation`
5. Enter phone: `9876543210`
6. Enter salary: `30000`

**Expected Result**:
- ✅ KYC verified
- ✅ Credit score: 780
- ⚠️ Salary verification required
- ❌ EMI (₹23,000) > 50% of salary (₹15,000)
- ❌ Application rejected
- 💡 Maximum eligible amount based on salary shown

**Validation Points**:
- EMI calculated correctly
- EMI/Salary ratio > 50%
- Alternative loan amount suggested
- Clear rejection reason

---

## Test Case 6: KYC Failure ❌

**Objective**: Test rejection when phone number not found

**Steps**:
1. Start new application
2. Enter loan amount: `300000`
3. Enter tenure: `24`
4. Enter purpose: `Travel`
5. Enter phone: `1234567890` (invalid)

**Expected Result**:
- ❌ KYC verification failed
- ❌ Phone number not found in records
- 📞 Customer care contact provided
- 💡 Suggestion to use registered number

**Validation Points**:
- Invalid phone number detected
- Clear error message
- Helpful guidance provided

---

## Test Case 7: Maximum Approved Amount with Salary ✅

**Objective**: Test approval at maximum limit with salary verification

**Steps**:
1. Start new application
2. Enter loan amount: `600000`
3. Enter tenure: `60`
4. Enter purpose: `Home Renovation`
5. Enter phone: `9876543210`
6. Enter salary: `100000`

**Expected Result**:
- ✅ KYC verified
- ✅ Credit score: 780
- ⚠️ Salary verification required
- ✅ EMI: ~₹12,000
- ✅ EMI/Salary ratio: 12% (< 50%)
- ✅ Approved
- ✅ Sanction letter generated

**Validation Points**:
- Amount at 2× pre-approved limit
- Long tenure reduces EMI
- Salary sufficient for approval

---

## Test Case 8: Edge Case - Minimum Loan Amount ✅

**Objective**: Test minimum loan amount processing

**Steps**:
1. Start new application
2. Enter loan amount: `50000`
3. Enter tenure: `12`
4. Enter purpose: `Medical Emergency`
5. Enter phone: `9876543210`

**Expected Result**:
- ✅ Minimum amount accepted
- ✅ Instant approval
- ✅ Low EMI calculated
- ✅ Sanction letter generated

**Validation Points**:
- Minimum amount (₹50,000) accepted
- Short tenure processed correctly
- Quick approval for small amount

---

## Test Case 9: Different Credit Scores - Interest Rate Variation

**Objective**: Verify interest rate calculation based on credit score

### 9a. Excellent Score (820)
- Phone: `7654321098`
- Expected Rate: 10.0% (base rate)

### 9b. Very Good Score (780)
- Phone: `9876543210`
- Expected Rate: 8.5% (base rate)

### 9c. Good Score (650)
- Phone: `8765432109`
- Expected Rate: 9.0% (base rate)

**Validation Points**:
- Higher credit score = Lower interest rate
- Rate calculation follows defined rules
- EMI varies based on rate

---

## Test Case 10: Session Management

**Objective**: Test conversation flow and state management

**Steps**:
1. Start application
2. Complete partial application (stop at tenure)
3. Refresh page
4. Start new application
5. Complete full application

**Expected Result**:
- ✅ New session created on refresh
- ✅ Previous session data cleared
- ✅ State machine works correctly
- ✅ No data leakage between sessions

---

## API Testing (Using Postman/cURL)

### 1. Chat API
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "TEST_SESSION_001",
    "message": "500000",
    "context": {}
  }'
```

### 2. KYC API
```bash
curl http://localhost:5000/api/kyc?phone=9876543210
```

### 3. Credit Score API
```bash
curl http://localhost:5000/api/score?pan=ABCDE1234F
```

### 4. Offer Mart API
```bash
curl http://localhost:5000/api/offers?custId=CUST001
```

### 5. Health Check
```bash
curl http://localhost:5000/api/health
```

---

## Performance Testing

### Load Test Scenarios

1. **Concurrent Users**: 10 simultaneous chat sessions
2. **Response Time**: < 2 seconds per message
3. **PDF Generation**: < 3 seconds
4. **Session Management**: 100+ active sessions

---

## UI/UX Testing

### Responsive Design
- ✅ Desktop (1920×1080)
- ✅ Laptop (1366×768)
- ✅ Tablet (768×1024)
- ✅ Mobile (375×667)

### Browser Compatibility
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

### Accessibility
- ✅ Keyboard navigation
- ✅ Screen reader compatible
- ✅ Color contrast (WCAG AA)
- ✅ Focus indicators

---

## Error Handling Testing

### 1. Network Errors
- Disconnect internet during application
- Expected: Graceful error message

### 2. Invalid Inputs
- Negative loan amount
- Tenure > 60 months
- Non-numeric phone number
- Expected: Validation errors

### 3. Backend Errors
- Stop backend server
- Expected: Connection error message

---

## Security Testing

### 1. Input Validation
- SQL injection attempts
- XSS attempts
- Expected: Sanitized inputs

### 2. File Upload
- Upload malicious files
- Expected: File type validation

### 3. Session Security
- Session hijacking attempts
- Expected: Secure session management

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] All 10 test cases pass
- [ ] PDF generation works
- [ ] State machine transitions correctly
- [ ] EMI calculations accurate
- [ ] Interest rates calculated correctly
- [ ] Sanction letter downloads
- [ ] UI renders properly
- [ ] No console errors
- [ ] API responses correct
- [ ] Session management works

---

## Bug Reporting Template

```
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:

**Actual Result**:

**Screenshots**: [If applicable]

**Environment**:
- Browser: 
- OS: 
- Node Version: 

**Additional Notes**:
```

---

## Test Data Summary

| Phone | Name | Pre-approved | Credit Score | Base Rate | Test Scenarios |
|-------|------|--------------|--------------|-----------|----------------|
| 9876543210 | John Doe | ₹3,00,000 | 780 | 8.5% | Instant, Salary, EMI Ratio |
| 8765432109 | Jane Smith | ₹5,00,000 | 650 | 9.0% | Low Credit |
| 7654321098 | Raj Kumar | ₹2,00,000 | 820 | 10.0% | High Amount, Excellent Score |

---

## Success Criteria

✅ All test cases pass
✅ No critical bugs
✅ Response time < 2 seconds
✅ PDF generation successful
✅ UI responsive on all devices
✅ Error handling graceful
✅ State machine reliable
✅ Calculations accurate

---

**Happy Testing! 🧪**
