const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Mock Data - CRM Database
const mockCRM = {
  "9876543210": { 
    custId: "CUST001",
    name: "John Doe", 
    phone: "9876543210",
    address: "123 MG Road, Bangalore",
    city: "Bangalore",
    dob: "1990-05-15",
    pan: "ABCDE1234F"
  },
  "8765432109": { 
    custId: "CUST002",
    name: "Jane Smith", 
    phone: "8765432109",
    address: "456 Park Street, Mumbai",
    city: "Mumbai",
    dob: "1985-08-20",
    pan: "FGHIJ5678K"
  },
  "7654321098": {
    custId: "CUST003",
    name: "Raj Kumar",
    phone: "7654321098",
    address: "789 Anna Salai, Chennai",
    city: "Chennai",
    dob: "1992-03-10",
    pan: "KLMNO9012P"
  }
};

// Mock Offer Mart Data
const mockOfferMart = {
  "CUST001": { preApprovedLimit: 300000, baseRate: 8.5, maxTenure: 60 },
  "CUST002": { preApprovedLimit: 500000, baseRate: 9.0, maxTenure: 60 },
  "CUST003": { preApprovedLimit: 200000, baseRate: 10.0, maxTenure: 48 }
};

// Mock Credit Bureau Data
const mockCreditBureau = {
  "ABCDE1234F": { score: 780, history: "Excellent" },
  "FGHIJ5678K": { score: 650, history: "Fair" },
  "KLMNO9012P": { score: 820, history: "Excellent" }
};

// ==================== AGENTS ====================

class MasterAgent {
  constructor() {
    this.salesAgent = new SalesAgent();
    this.verificationAgent = new VerificationAgent();
    this.underwritingAgent = new UnderwritingAgent();
    this.sanctionAgent = new SanctionAgent();
    this.sessions = {}; // Store conversation sessions
  }

  async processMessage(sessionId, message, context = {}) {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = {
        state: 'GREET',
        data: {},
        history: []
      };
    }

    const session = this.sessions[sessionId];
    session.history.push({ role: 'user', message, timestamp: Date.now() });

    let response;
    
    switch (session.state) {
      case 'GREET':
        response = await this.handleGreet(session, message);
        break;
      case 'COLLECT_AMOUNT':
        response = await this.handleAmount(session, message);
        break;
      case 'COLLECT_TENURE':
        response = await this.handleTenure(session, message);
        break;
      case 'COLLECT_PURPOSE':
        response = await this.handlePurpose(session, message);
        break;
      case 'COLLECT_PHONE':
        response = await this.handlePhone(session, message);
        break;
      case 'KYC_VERIFICATION':
        response = await this.handleKYC(session, message);
        break;
      case 'UNDERWRITING':
        response = await this.handleUnderwriting(session, context);
        break;
      case 'SALARY_UPLOAD':
        response = await this.handleSalaryUpload(session, context);
        break;
      case 'APPROVED':
        response = await this.handleApproved(session);
        break;
      case 'REJECTED':
        response = await this.handleRejected(session);
        break;
      case 'CLOSED':
        response = { message: "Thank you for using Tata Capital services. Have a great day!", state: 'CLOSED' };
        break;
      default:
        response = { message: "I'm sorry, something went wrong. Let's start over.", state: 'GREET' };
    }

    session.history.push({ role: 'bot', message: response.message, timestamp: Date.now() });
    return response;
  }

  async handleGreet(session, message) {
    session.state = 'COLLECT_AMOUNT';
    return {
      message: "Hello! Welcome to Tata Capital. I'm your AI Loan Assistant.\n\nI'll help you get a personal loan quickly and easily.\n\n→ How much loan amount do you need? (e.g., 500000)",
      state: 'COLLECT_AMOUNT'
    };
  }

  async handleAmount(session, message) {
    const amount = parseInt(message.replace(/[^\d]/g, ''));
    if (!amount || amount < 50000) {
      return {
        message: "Please enter a valid loan amount (minimum ₹50,000).",
        state: 'COLLECT_AMOUNT'
      };
    }
    
    session.data.loanAmount = amount;
    session.state = 'COLLECT_TENURE';
    
    return {
      message: `✓ Great! You're looking for a loan of ₹${amount.toLocaleString('en-IN')}.\n\n→ What loan tenure would you prefer? (in months, e.g., 12, 24, 36, 48, 60)`,
      state: 'COLLECT_TENURE'
    };
  }

  async handleTenure(session, message) {
    const tenure = parseInt(message.replace(/[^\d]/g, ''));
    if (!tenure || tenure < 6 || tenure > 60) {
      return {
        message: "Please enter a valid tenure between 6 and 60 months.",
        state: 'COLLECT_TENURE'
      };
    }
    
    session.data.tenure = tenure;
    session.state = 'COLLECT_PURPOSE';
    
    return {
      message: "✓ Perfect! What's the purpose of this loan?\n\n→ Options:\n  1. Home Renovation\n  2. Wedding\n  3. Medical Emergency\n  4. Education\n  5. Business\n  6. Travel\n  7. Debt Consolidation\n  8. Other",
      state: 'COLLECT_PURPOSE'
    };
  }

  async handlePurpose(session, message) {
    session.data.purpose = message;
    session.state = 'COLLECT_PHONE';
    
    const emi = this.calculateEMI(session.data.loanAmount, session.data.tenure, 9.5);
    
    return {
      message: `✓ Excellent! For ${session.data.purpose}.\n\n▸ Estimated EMI: ₹${emi.toLocaleString('en-IN')}/month\n  (at 9.5% interest rate)\n\n→ Now, let me verify your details. Please provide your registered mobile number:`,
      state: 'COLLECT_PHONE'
    };
  }

  async handlePhone(session, message) {
    const phone = message.replace(/[^\d]/g, '');
    if (phone.length !== 10) {
      return {
        message: "Please enter a valid 10-digit mobile number.",
        state: 'COLLECT_PHONE'
      };
    }
    
    session.data.phone = phone;
    session.state = 'KYC_VERIFICATION';
    
    return {
      message: `✓ Thank you! Verifying your details for ${phone}...\n\n⟳ Please wait while I check your KYC and credit profile...`,
      state: 'KYC_VERIFICATION',
      action: 'VERIFY_KYC'
    };
  }

  async handleKYC(session, message) {
    const kycResult = await this.verificationAgent.verifyKYC(session.data.phone);
    
    if (!kycResult.verified) {
      session.state = 'REJECTED';
      session.data.rejectionReason = kycResult.reason;
      return {
        message: `✗ KYC VERIFICATION FAILED\n\n▸ Reason: ${kycResult.reason}\n\n→ Please contact our customer care or visit the nearest branch for manual verification.\n\n☎ Customer Care: 1800-209-8800`,
        state: 'REJECTED'
      };
    }
    
    session.data.customerInfo = kycResult.data;
    session.state = 'UNDERWRITING';
    
    return {
      message: `✓ KYC VERIFIED SUCCESSFULLY\n\n▸ Welcome, ${kycResult.data.name}!\n\n⟳ Now checking your credit score and pre-approved offers...`,
      state: 'UNDERWRITING',
      action: 'UNDERWRITE'
    };
  }

  async handleUnderwriting(session, context) {
    const decision = await this.underwritingAgent.evaluate({
      ...session.data,
      salary: context.salary
    });
    
    session.data.decision = decision;
    
    if (decision.status === 'INSTANT_APPROVED') {
      session.state = 'APPROVED';
      return {
        message: `✓ CONGRATULATIONS ${session.data.customerInfo.name}!\n\n★ Your loan is INSTANTLY APPROVED\n\n▸ Loan Amount: ₹${session.data.loanAmount.toLocaleString('en-IN')}\n▸ Tenure: ${session.data.tenure} months\n▸ Interest Rate: ${decision.interestRate}%\n▸ Monthly EMI: ₹${decision.emi.toLocaleString('en-IN')}\n▸ Credit Score: ${decision.creditScore}\n\n⟳ Generating your sanction letter...`,
        state: 'APPROVED',
        action: 'GENERATE_SANCTION',
        decision
      };
    } else if (decision.status === 'SALARY_REQUIRED') {
      session.state = 'SALARY_UPLOAD';
      return {
        message: `⚠ ADDITIONAL VERIFICATION REQUIRED\n\n▸ Your requested amount (₹${session.data.loanAmount.toLocaleString('en-IN')}) exceeds your pre-approved limit (₹${decision.preApprovedLimit.toLocaleString('en-IN')}).\n\n▸ Credit Score: ${decision.creditScore} - Excellent!\n\n→ To proceed, please provide your monthly salary amount (in ₹):`,
        state: 'SALARY_UPLOAD',
        decision
      };
    } else if (decision.status === 'REJECTED') {
      session.state = 'REJECTED';
      session.data.rejectionReason = decision.reason;
      return {
        message: `✗ LOAN APPLICATION DECLINED\n\n▸ Reason: ${decision.reason}\n\n${decision.alternatives || ''}\n\n→ Tips to improve:\n  • Maintain credit score above 700\n  • Ensure timely EMI payments\n  • Reduce existing debt\n\n☎ For assistance: 1800-209-8800`,
        state: 'REJECTED',
        decision
      };
    }
  }

  async handleSalaryUpload(session, context) {
    if (!context.salary) {
      return {
        message: "Please enter your monthly salary amount.",
        state: 'SALARY_UPLOAD'
      };
    }
    
    const salary = parseInt(context.salary.toString().replace(/[^\d]/g, ''));
    session.data.salary = salary;
    
    const decision = await this.underwritingAgent.evaluateWithSalary({
      ...session.data,
      salary
    });
    
    session.data.decision = decision;
    
    if (decision.status === 'APPROVED') {
      session.state = 'APPROVED';
      return {
        message: `✓ CONGRATULATIONS ${session.data.customerInfo.name}!\n\n★ Your loan is APPROVED\n\n▸ Loan Amount: ₹${session.data.loanAmount.toLocaleString('en-IN')}\n▸ Tenure: ${session.data.tenure} months\n▸ Interest Rate: ${decision.interestRate}%\n▸ Monthly EMI: ₹${decision.emi.toLocaleString('en-IN')}\n▸ Your Salary: ₹${salary.toLocaleString('en-IN')}\n▸ EMI/Salary Ratio: ${decision.emiRatio}%\n\n⟳ Generating your sanction letter...`,
        state: 'APPROVED',
        action: 'GENERATE_SANCTION',
        decision
      };
    } else {
      session.state = 'REJECTED';
      session.data.rejectionReason = decision.reason;
      return {
        message: `✗ LOAN APPLICATION DECLINED\n\n▸ Reason: ${decision.reason}\n\n▸ Your Salary: ₹${salary.toLocaleString('en-IN')}\n▸ Required EMI: ₹${decision.emi.toLocaleString('en-IN')}\n▸ EMI/Salary Ratio: ${decision.emiRatio}% (Max allowed: 50%)\n\n${decision.alternatives}\n\n☎ For assistance: 1800-209-8800`,
        state: 'REJECTED',
        decision
      };
    }
  }

  async handleApproved(session) {
    const sanctionLetter = await this.sanctionAgent.generateLetter({
      ...session.data,
      decision: session.data.decision
    });
    
    session.data.sanctionLetter = sanctionLetter;
    session.state = 'CLOSED';
    
    return {
      message: `✓ SANCTION LETTER GENERATED\n\n▸ Sanction ID: ${sanctionLetter.sanctionId}\n\n→ Next Steps:\n  1. Download your sanction letter\n  2. Submit required documents\n  3. Complete e-sign process\n  4. Loan disbursement in 24 hours\n\n▸ Repayment starts from next month\n▸ Auto-debit will be set up\n\n★ Thank you for choosing Tata Capital!\n\n✉ For queries: support@tatacapital.com\n☎ Grievance: 1800-209-8800`,
      state: 'CLOSED',
      sanctionLetter
    };
  }

  async handleRejected(session) {
    session.state = 'CLOSED';
    return {
      message: "We appreciate your interest. Please feel free to apply again after 3 months.\n\nThank you!",
      state: 'CLOSED'
    };
  }

  calculateEMI(principal, tenure, rate) {
    const r = rate / 12 / 100;
    const emi = principal * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1);
    return Math.round(emi);
  }
}

class SalesAgent {
  async handleEnquiry(data) {
    // Sales agent handles initial data collection and provides loan information
    const { loanAmount, tenure } = data;
    
    // Calculate estimated EMI
    const estimatedRate = 9.5;
    const r = estimatedRate / 12 / 100;
    const emi = loanAmount * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1);
    
    return {
      message: `▸ Based on your requirement:\n\n▸ Loan Amount: ₹${loanAmount.toLocaleString('en-IN')}\n▸ Tenure: ${tenure} months\n▸ Estimated EMI: ₹${Math.round(emi).toLocaleString('en-IN')}\n▸ Interest Rate: Starting from 8.5%*\n\n* Rate depends on credit profile`,
      emi: Math.round(emi)
    };
  }

  suggestUpsell(loanAmount, preApprovedLimit) {
    if (loanAmount < preApprovedLimit * 0.7) {
      return `\n\n★ Good News! You're pre-approved for up to ₹${preApprovedLimit.toLocaleString('en-IN')}. Would you like to increase your loan amount?`;
    }
    return '';
  }
}

class VerificationAgent {
  async verifyKYC(phone) {
    const customer = mockCRM[phone];
    
    if (!customer) {
      return { 
        verified: false, 
        reason: "Phone number not found in our records. Please ensure you're using your registered mobile number." 
      };
    }
    
    // Simulate OTP verification (in real app, send OTP and verify)
    return { 
      verified: true, 
      data: customer 
    };
  }

  async getCreditScore(pan) {
    const creditData = mockCreditBureau[pan];
    return creditData ? creditData.score : 0;
  }
}

class UnderwritingAgent {
  async evaluate(data) {
    const { loanAmount, tenure, customerInfo } = data;
    
    // Get credit score
    const creditScore = await this.getCreditScore(customerInfo.pan);
    
    // Get pre-approved offer
    const offer = mockOfferMart[customerInfo.custId];
    
    // Rule 1: Reject if credit score < 700
    if (creditScore < 700) {
      return {
        status: 'REJECTED',
        reason: `Credit score (${creditScore}) is below minimum requirement of 700.`,
        creditScore,
        alternatives: `→ Alternative Options:\n  • Apply for a secured loan\n  • Add a co-applicant with good credit\n  • Try for a lower amount after 3 months`
      };
    }
    
    // Rule 2: Instant approve if amount <= pre-approved limit
    if (loanAmount <= offer.preApprovedLimit) {
      const interestRate = this.calculateInterestRate(creditScore, offer.baseRate);
      const emi = this.calculateEMI(loanAmount, tenure, interestRate);
      
      return {
        status: 'INSTANT_APPROVED',
        creditScore,
        preApprovedLimit: offer.preApprovedLimit,
        interestRate,
        emi,
        tenure
      };
    }
    
    // Rule 3: If amount <= 2x pre-approved limit, request salary
    if (loanAmount <= 2 * offer.preApprovedLimit) {
      return {
        status: 'SALARY_REQUIRED',
        creditScore,
        preApprovedLimit: offer.preApprovedLimit,
        reason: 'Salary verification required for amount exceeding pre-approved limit'
      };
    }
    
    // Rule 4: Reject if amount > 2x pre-approved limit
    return {
      status: 'REJECTED',
      reason: `Requested amount (₹${loanAmount.toLocaleString('en-IN')}) exceeds maximum eligible amount (₹${(2 * offer.preApprovedLimit).toLocaleString('en-IN')}).`,
      creditScore,
      preApprovedLimit: offer.preApprovedLimit,
      alternatives: `→ You can apply for up to ₹${(2 * offer.preApprovedLimit).toLocaleString('en-IN')}.\n\nWould you like to proceed with a lower amount?`
    };
  }

  async evaluateWithSalary(data) {
    const { loanAmount, tenure, customerInfo, salary } = data;
    
    const creditScore = await this.getCreditScore(customerInfo.pan);
    const offer = mockOfferMart[customerInfo.custId];
    const interestRate = this.calculateInterestRate(creditScore, offer.baseRate);
    const emi = this.calculateEMI(loanAmount, tenure, interestRate);
    
    // Rule: EMI should be <= 50% of salary
    const emiRatio = (emi / salary * 100).toFixed(2);
    
    if (emi <= 0.5 * salary) {
      return {
        status: 'APPROVED',
        creditScore,
        interestRate,
        emi,
        tenure,
        salary,
        emiRatio
      };
    } else {
      const maxLoan = this.calculateMaxLoan(salary, tenure, interestRate);
      return {
        status: 'REJECTED',
        reason: `Monthly EMI (₹${emi.toLocaleString('en-IN')}) exceeds 50% of your salary.`,
        creditScore,
        emi,
        emiRatio,
        alternatives: `→ Based on your salary, you're eligible for up to ₹${maxLoan.toLocaleString('en-IN')}.\n\nWould you like to apply for this amount instead?`
      };
    }
  }

  async getCreditScore(pan) {
    const creditData = mockCreditBureau[pan];
    return creditData ? creditData.score : 0;
  }

  calculateInterestRate(creditScore, baseRate) {
    if (creditScore >= 800) return baseRate;
    if (creditScore >= 750) return baseRate + 0.5;
    if (creditScore >= 700) return baseRate + 1.0;
    return baseRate + 2.0;
  }

  calculateEMI(principal, tenure, rate) {
    const r = rate / 12 / 100;
    const emi = principal * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1);
    return Math.round(emi);
  }

  calculateMaxLoan(salary, tenure, rate) {
    const maxEMI = salary * 0.5;
    const r = rate / 12 / 100;
    const maxLoan = maxEMI * (Math.pow(1 + r, tenure) - 1) / (r * Math.pow(1 + r, tenure));
    return Math.round(maxLoan / 10000) * 10000; // Round to nearest 10k
  }
}

class SanctionAgent {
  async generateLetter(data) {
    const { customerInfo, loanAmount, tenure, decision } = data;
    const sanctionId = `SAN${Date.now()}`;
    const filename = `sanction_${sanctionId}.pdf`;
    const filepath = path.join(__dirname, 'sanctions', filename);
    
    // Ensure sanctions directory exists
    if (!fs.existsSync(path.join(__dirname, 'sanctions'))) {
      fs.mkdirSync(path.join(__dirname, 'sanctions'));
    }
    
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filepath));
    
    // Header
    doc.fontSize(24).fillColor('#1e40af').text('TATA CAPITAL', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor('#000').text('LOAN SANCTION LETTER', { align: 'center' });
    doc.moveDown(1);
    
    // Sanction ID and Date
    doc.fontSize(10).fillColor('#666')
       .text(`Sanction ID: ${sanctionId}`, 50, 150)
       .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 150);
    
    doc.moveDown(2);
    
    // Customer Details
    doc.fontSize(14).fillColor('#000').text('Customer Details:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11)
       .text(`Name: ${customerInfo.name}`)
       .text(`Customer ID: ${customerInfo.custId}`)
       .text(`Phone: ${customerInfo.phone}`)
       .text(`Address: ${customerInfo.address}, ${customerInfo.city}`)
       .text(`PAN: ${customerInfo.pan}`);
    
    doc.moveDown(1.5);
    
    // Loan Details
    doc.fontSize(14).fillColor('#000').text('Loan Details:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11)
       .text(`Sanctioned Amount: ₹${loanAmount.toLocaleString('en-IN')}`)
       .text(`Tenure: ${tenure} months`)
       .text(`Interest Rate: ${decision.interestRate}% per annum`)
       .text(`Monthly EMI: ₹${decision.emi.toLocaleString('en-IN')}`)
       .text(`Total Payable: ₹${(decision.emi * tenure).toLocaleString('en-IN')}`)
       .text(`Credit Score: ${decision.creditScore}`);
    
    doc.moveDown(1.5);
    
    // Terms & Conditions
    doc.fontSize(14).fillColor('#000').text('Terms & Conditions:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9)
       .text('1. This sanction is valid for 30 days from the date of issue.')
       .text('2. Loan disbursement subject to document verification.')
       .text('3. Processing fee: 2% of loan amount + GST.')
       .text('4. Prepayment charges: 4% on outstanding principal.')
       .text('5. Late payment penalty: 2% per month on overdue amount.')
       .text('6. Auto-debit mandate required for EMI payments.');
    
    doc.moveDown(2);
    
    // Footer
    doc.fontSize(10).fillColor('#1e40af')
       .text('For queries: support@tatacapital.com | Customer Care: 1800-209-8800', { align: 'center' });
    
    doc.end();
    
    return { sanctionId, filename, filepath };
  }
}

// Initialize Master Agent
const masterAgent = new MasterAgent();

// ==================== API ROUTES ====================

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;
    const response = await masterAgent.processMessage(sessionId, message, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock Service: Offer Mart
app.get('/api/offers', (req, res) => {
  const { custId } = req.query;
  const offer = mockOfferMart[custId];
  if (offer) {
    res.json(offer);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Mock Service: CRM KYC
app.get('/api/kyc', (req, res) => {
  const { custId, phone } = req.query;
  let customer;
  
  if (custId) {
    customer = Object.values(mockCRM).find(c => c.custId === custId);
  } else if (phone) {
    customer = mockCRM[phone];
  }
  
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Mock Service: Credit Bureau
app.get('/api/score', (req, res) => {
  const { pan } = req.query;
  const creditData = mockCreditBureau[pan];
  if (creditData) {
    res.json(creditData);
  } else {
    res.status(404).json({ error: 'Credit data not found' });
  }
});

// Mock Service: File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileId = `FILE${Date.now()}`;
  res.json({ 
    fileId, 
    filename: req.file.originalname,
    message: 'File uploaded successfully' 
  });
});

// Download Sanction Letter
app.get('/api/sanction/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'sanctions', req.params.filename);
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get session state (for debugging)
app.get('/api/session/:sessionId', (req, res) => {
  const session = masterAgent.sessions[req.params.sessionId];
  if (session) {
    res.json(session);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ensure required directories exist
if (!fs.existsSync(path.join(__dirname, 'sanctions'))) {
  fs.mkdirSync(path.join(__dirname, 'sanctions'));
}
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('Available demo phone numbers:');
  console.log('  9876543210 - John Doe (Pre-approved: ₹3L, Score: 780)');
  console.log('  8765432109 - Jane Smith (Pre-approved: ₹5L, Score: 650)');
  console.log('  7654321098 - Raj Kumar (Pre-approved: ₹2L, Score: 820)');
});
