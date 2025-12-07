# Quick Reference Guide - Agentic AI Loan Sales Assistant

## 🚀 Start Application (3 Commands)

```bash
# 1. Install dependencies (first time only)
npm run install-all

# 2. Start application
npm start

# 3. Open browser
http://localhost:3000
```

**OR** Double-click: `START_APPLICATION.bat`

---

## 📱 Demo Phone Numbers

| Phone | Name | Pre-approved | Score | Use For |
|-------|------|--------------|-------|---------|
| **9876543210** | John Doe | ₹3L | 780 | ✅ Instant, Salary tests |
| **8765432109** | Jane Smith | ₹5L | 650 | ❌ Low credit rejection |
| **7654321098** | Raj Kumar | ₹2L | 820 | ❌ High amount rejection |

---

## 🧪 Quick Test Scenarios

### ✅ Test 1: Instant Approval (30 seconds)
```
Amount: 250000
Tenure: 24
Purpose: Home Renovation
Phone: 9876543210
Result: ✅ Instant approval + PDF
```

### ✅ Test 2: Salary Verification (45 seconds)
```
Amount: 500000
Tenure: 36
Purpose: Wedding
Phone: 9876543210
Salary: 60000
Result: ✅ Approved after salary check
```

### ❌ Test 3: Low Credit Rejection (30 seconds)
```
Amount: 300000
Tenure: 24
Purpose: Business
Phone: 8765432109
Result: ❌ Rejected (score 650 < 700)
```

### ❌ Test 4: High Amount Rejection (30 seconds)
```
Amount: 800000
Tenure: 48
Purpose: Education
Phone: 7654321098
Result: ❌ Rejected (exceeds 2× limit)
```

### ❌ Test 5: EMI Ratio Failure (45 seconds)
```
Amount: 500000
Tenure: 24
Purpose: Travel
Phone: 9876543210
Salary: 30000
Result: ❌ Rejected (EMI > 50% salary)
```

---

## 🔧 Troubleshooting

### Frontend won't start
```bash
cd frontend
rmdir /s /q node_modules
npm install
```

### Backend won't start
```bash
cd backend
npm install
```

### Port already in use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### PDF not downloading
- Check `backend/sanctions/` folder exists
- Try different browser
- Check browser download settings

---

## 📊 Underwriting Rules (Quick Reference)

```
┌─────────────────────────────────────────────────────┐
│ Rule 1: Credit Score < 700        → REJECT         │
│ Rule 2: Amount ≤ Pre-approved     → INSTANT APPROVE│
│ Rule 3: Amount ≤ 2× Pre-approved  → SALARY CHECK   │
│         └─ EMI ≤ 50% Salary       → APPROVE        │
│         └─ EMI > 50% Salary       → REJECT         │
│ Rule 4: Amount > 2× Pre-approved  → REJECT         │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 API Quick Test

### Health Check
```bash
curl http://localhost:5000/api/health
```

### KYC Check
```bash
curl http://localhost:5000/api/kyc?phone=9876543210
```

### Credit Score
```bash
curl http://localhost:5000/api/score?pan=ABCDE1234F
```

### Offers
```bash
curl http://localhost:5000/api/offers?custId=CUST001
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/server.js` | All agents + APIs |
| `frontend/src/App.js` | Chat UI |
| `README.md` | Complete guide |
| `ARCHITECTURE.md` | Technical docs |
| `TESTING_GUIDE.md` | All test cases |
| `PROJECT_SUMMARY.md` | Project overview |

---

## 🎯 State Machine Flow

```
GREET
  ↓
COLLECT_AMOUNT (Enter: 500000)
  ↓
COLLECT_TENURE (Enter: 24)
  ↓
COLLECT_PURPOSE (Enter: Wedding)
  ↓
COLLECT_PHONE (Enter: 9876543210)
  ↓
KYC_VERIFICATION (Auto)
  ↓
UNDERWRITING (Auto)
  ↓
[SALARY_UPLOAD] (If needed: 60000)
  ↓
APPROVED / REJECTED
  ↓
CLOSED
```

---

## 💡 Tips

### For Demo
1. Start with instant approval (Test 1)
2. Show salary verification (Test 2)
3. Demonstrate rejection (Test 3)
4. Show PDF download
5. Start new application

### For Development
- Check console for errors
- Use browser DevTools Network tab
- Monitor backend logs
- Test API endpoints separately

### For Testing
- Use all 3 phone numbers
- Try different amounts
- Test edge cases
- Verify PDF generation
- Check all rejection scenarios

---

## 📊 EMI Calculator (Quick Reference)

```javascript
// Formula
EMI = P × r × (1+r)^n / ((1+r)^n - 1)

// Where:
P = Principal (loan amount)
r = Monthly rate (annual rate / 12 / 100)
n = Tenure (months)

// Example:
P = 500000
Rate = 9% annual = 0.75% monthly
n = 24 months
EMI = ₹22,867
```

---

## 🎨 UI Components

### Chat Interface
- Message bubbles (user: blue, bot: white)
- Typing indicator (3 dots)
- Auto-scroll
- Timestamps

### Info Cards
- Demo numbers (blue border)
- Features (green border)
- Test scenarios (purple border)

### Buttons
- Send (blue gradient)
- New Application (green gradient)

---

## 🔐 Security Notes

- No real credentials needed
- Mock data only
- Session-based (no login)
- File uploads validated
- Input sanitization enabled

---

## 📞 Support

### Documentation
- README.md - User guide
- ARCHITECTURE.md - Technical details
- TESTING_GUIDE.md - Test cases

### Contact
- Email: support@tatacapital.com
- Phone: 1800-209-8800

---

## ✅ Pre-Demo Checklist

- [ ] Application running (http://localhost:3000)
- [ ] Backend running (http://localhost:5000)
- [ ] Test instant approval works
- [ ] Test salary verification works
- [ ] Test rejection scenarios work
- [ ] PDF downloads successfully
- [ ] UI looks good
- [ ] No console errors

---

## 🎓 Key Features to Highlight

1. **Agentic AI** - 5 specialized agents
2. **State Machine** - 11 states, smooth flow
3. **Deterministic Rules** - Clear, testable logic
4. **Real-time Chat** - Conversational interface
5. **PDF Generation** - Professional sanction letters
6. **Mock Services** - All integrations simulated
7. **Responsive UI** - Works on all devices
8. **Complete Flow** - End-to-end processing

---

## 📈 Project Stats

- **Agents**: 5
- **States**: 11
- **Rules**: 4
- **APIs**: 8
- **Test Cases**: 10+
- **Lines of Code**: ~1100
- **Documentation**: 5 files

---

**Everything you need in one place!** 🚀

**Ready to demo? Let's go!** 🎉
