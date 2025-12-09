

import { Risk, Country, RiskCategory, RiskStatus, ControlRating, ActionPlan, Comment, User, EscalationLevel } from './types';

// Country Config
export const COUNTRIES = [
  { code: Country.UK, label: 'United Kingdom', flagUrl: 'https://flagcdn.com/w80/gb.png' },
  { code: Country.BR, label: 'Brazil', flagUrl: 'https://flagcdn.com/w80/br.png' },
  { code: Country.GQ, label: 'Equatorial Guinea', flagUrl: 'https://flagcdn.com/w80/gq.png' }, // Updated flag and code
  { code: Country.CG, label: 'Congo', flagUrl: 'https://flagcdn.com/w80/cg.png' }
];

export const GROUPS = [
  { id: 'REG_BR', label: 'Country Risk Register BR' },
  { id: 'REG_GQ', label: 'Country Risk Register GQ' },
  { id: 'REG_CG', label: 'Country Risk Register CG' },
];

export const ESCALATION_LEVELS = [
  EscalationLevel.FUNCTIONAL_MANAGER,
  EscalationLevel.TEML_FUNCTIONAL_REVIEW,
  EscalationLevel.COUNTRY_MANAGER, // Moved before Leadership based on hierarchy
  EscalationLevel.TEML_LEADERSHIP,
  EscalationLevel.CORPORATE_RISK
];

// Column Definitions for Visibility Toggling - Updated Order
export const AVAILABLE_COLUMNS = [
  { key: 'warning', label: 'Warnings', mandatory: true },
  { key: 'role', label: 'My Role' },
  { key: 'country', label: 'Country' },
  { key: 'register', label: 'Risk Register' },
  { key: 'id', label: 'Risk ID' }, // Hidden by default in App.tsx
  { key: 'title', label: 'Risk Title', mandatory: true },
  { key: 'functionArea', label: 'Function/Area' },
  { key: 'trend', label: 'Trend' },
  { key: 'inherentScore', label: 'Inherent Score' },
  { key: 'controlsRating', label: 'Controls Rating' },
  { key: 'residualScore', label: 'Residual Score' },
  { key: 'owner', label: 'Risk Owner' },
  { key: 'status', label: 'Status' },
  { key: 'comments', label: 'Comments' },
  { key: 'escalation', label: 'Escalation' },
  { key: 'creationDate', label: 'Created Date' },
  { key: 'lastReviewDate', label: 'Last Review Date' },
  { key: 'lastReviewer', label: 'Last Reviewer' },
];

// Options Configuration
export const IMPACT_OPTIONS = [
  { value: 1, label: '1 - Negligible' },
  { value: 2, label: '2 - Marginal' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Severe' },
  { value: 5, label: '5 - Catastrophic' },
];

export const LIKELIHOOD_OPTIONS = [
  { value: 1, label: '1 - Extremely Remote' },
  { value: 2, label: '2 - Remote' },
  { value: 3, label: '3 - Unlikely' },
  { value: 4, label: '4 - Likely' },
  { value: 5, label: '5 - Very Likely' },
];

export const PRINCIPAL_RISKS_MAPPING: Record<RiskCategory, string[]> = {
  [RiskCategory.STRATEGIC]: [
    'Failure to secure new successful venture opportunities'
  ],
  [RiskCategory.OPERATIONAL]: [
    'Risk of asset integrity breach or major production failure',
    'Risk of failure to deliver operations, development and subsurface objectives',
    'Risk of major cyber-attack and business continuity',
    'Lack of adherence to Health, Safety and Environment policies',
    'Failure to embed and deliver our environmental, social and governance (ESG) related plan'
  ],
  [RiskCategory.FINANCIAL]: [
    'Risk of insufficient liquidity and funding capacity',
    'Financial performance impacted by fluctuating oil and gas prices'
  ],
  [RiskCategory.COMPLIANCE]: [
    'Control environment gaps leading to financial reporting, legal or regulatory non-compliance and ethical misconduct'
  ]
};

export const PRINCIPAL_RISKS = [
  ...PRINCIPAL_RISKS_MAPPING[RiskCategory.STRATEGIC],
  ...PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL],
  ...PRINCIPAL_RISKS_MAPPING[RiskCategory.FINANCIAL],
  ...PRINCIPAL_RISKS_MAPPING[RiskCategory.COMPLIANCE]
];

// Full Risk Register to Function/Area Mapping
export const RISK_REGISTER_DATA = [
  { register: "CEO", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "Business Development", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "BR Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "EG Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "Supply Chain", functionArea: "Supply Chain" },
  { register: "Comms", functionArea: "HR" },
  { register: "HR", functionArea: "HR" },
  { register: "IT", functionArea: "IT" },
  { register: "COO", functionArea: "Operations and Integrity" },
  { register: "Production", functionArea: "Operations and Integrity" },
  { register: "Subsurface", functionArea: "Operations and Integrity" },
  { register: "Operations", functionArea: "Operations and Integrity" },
  { register: "Group Drilling Manager", functionArea: "Operations and Integrity" },
  { register: "CTO", functionArea: "Projects" },
  { register: "Well decommissioning", functionArea: "Projects" },
  { register: "HSE", functionArea: "HSE" },
  { register: "Government relations", functionArea: "HSE" },
  { register: "Legal", functionArea: "Compliance" },
  { register: "CFO", functionArea: "Finance and Liquidity" },
  { register: "Finance", functionArea: "Finance and Liquidity" },
  { register: "Treasury", functionArea: "Finance and Liquidity" },
  { register: "Tax", functionArea: "Finance and Liquidity" },
  { register: "Integrity Brazil - Flag and Class including walkway", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - General Maintenance Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGIP (Well Integrity) Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGSO Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGSS ( Subsea & pipeline integrity) Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - General Maintenance, SCE, Walkways", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - Subsea structures & Rotative equipment", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - Top side, pipeline and Marine Structures", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - Well integrity Risk Register", functionArea: "Operations and Integrity" },
  { register: "EG Drilling Campaign (Project)", functionArea: "Projects" },
  { register: "Foxtrot Compression Project", functionArea: "Projects" },
  { register: "Integrity EG – General Maintenance, SCE, Walkways", functionArea: "Operations and Integrity" },
  { register: "Environmental, Social, and Governance (ESG)", functionArea: "HSE" },
  { register: "Subsea decommissioning", functionArea: "Projects" },
  { register: "BRAVO FSO Project", functionArea: "Projects" },
  { register: "Offshore Structures Brazil", functionArea: "Operations and Integrity" },
  { register: "CG Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "CG Deputy country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "TEdB Topside Projects", functionArea: "Operations and Integrity" },
  { register: "Well Services", functionArea: "Projects" },
  { register: "CG Integrity", functionArea: "Operations and Integrity" },
  { register: "P-65 Decommissioning", functionArea: "Projects" },
  { register: "FLNG", functionArea: "Projects" },
  { register: "BR Asset", functionArea: "Operations and Integrity" },
  
  // Fallbacks for existing mock data if needed
  { register: "UK Corporate", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "Corporate", functionArea: "Strategic and Entity Level risks (e.g. M&A)" }
].sort((a, b) => a.register.localeCompare(b.register));


// Calculation Logic
export const calculateRiskScore = (impact: number, likelihood: number): number => impact * likelihood;

/**
 * Calculates Risk Level based on the Heat Map Matrix.
 * Red (Significant): Score >= 15
 * Yellow (Moderate): Score >= 5
 * Green (Low): Score < 5
 */
export const getRiskLevel = (score: number, impact: number) => {
  if (score >= 15) return { label: 'Significant', color: 'bg-red-600 text-white', dot: 'bg-white' };
  
  // Moderate: Score >= 5. This ensures 1x5 (5) is Moderate, as well as 2x3 (6), etc.
  if (score >= 5) return { label: 'Moderate', color: 'bg-yellow-400 text-slate-900', dot: 'bg-slate-900' };
  
  return { label: 'Low', color: 'bg-emerald-600 text-white', dot: 'bg-white' };
};

/**
 * Control Rating Classification Logic:
 * Adequate (Green): Excellent (5), Good (4)
 * Fair (Amber): Fair (3)
 * Inadequate (Red): Poor (2), Unsatisfactory (1)
 */
export const getControlRatingColor = (rating: string) => {
  switch (rating) {
    case ControlRating.EXCELLENT: 
    case ControlRating.GOOD: 
      return 'bg-green-600 text-white'; // Adequate
    case ControlRating.FAIR: 
      return 'bg-amber-400 text-slate-900'; // Fair
    case ControlRating.POOR: 
    case ControlRating.UNSATISFACTORY: 
      return 'bg-red-600 text-white'; // Inadequate
    default: return 'bg-slate-200 text-slate-600';
  }
};

// Numeric Mapping for Ratings (5-Star System)
export const getRatingValue = (rating: ControlRating): number => {
  switch(rating) {
    case ControlRating.EXCELLENT: return 5;
    case ControlRating.GOOD: return 4;
    case ControlRating.FAIR: return 3;
    case ControlRating.POOR: return 2;
    case ControlRating.UNSATISFACTORY: return 1;
    default: return 0;
  }
};

export const getRatingFromValue = (value: number): ControlRating => {
  switch(Math.round(value)) {
    case 5: return ControlRating.EXCELLENT;
    case 4: return ControlRating.GOOD;
    case 3: return ControlRating.FAIR;
    case 2: return ControlRating.POOR;
    case 1: return ControlRating.UNSATISFACTORY;
    default: return ControlRating.UNSATISFACTORY;
  }
};

// Mock Data - Updated with New Roles
export const MOCK_USERS: User[] = [
  { id: 'U1', name: 'Jane Doe', email: 'jane.doe@company.com', role: 'RMIA', groups: [] },
  { id: 'U2', name: 'Carlos Silva', email: 'carlos.silva@company.com', role: 'Functional Manager', groups: ['REG_BR', EscalationLevel.FUNCTIONAL_MANAGER] },
  { id: 'U3', name: 'Amara Ndiaye', email: 'amara.ndiaye@company.com', role: 'TEML Functional', groups: ['REG_GQ', EscalationLevel.TEML_FUNCTIONAL_REVIEW] },
  { id: 'U4', name: 'Jean-Luc M', email: 'jean.luc@company.com', role: 'Country Manager', groups: ['REG_CG', EscalationLevel.COUNTRY_MANAGER] },
  { id: 'U5', name: 'John Smith', email: 'john.smith@company.com', role: 'TEML Leadership Team', groups: [EscalationLevel.TEML_LEADERSHIP] },
  { id: 'U6', name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', role: 'CEO', groups: [EscalationLevel.CORPORATE_RISK] },
  { id: 'U7', name: 'Francis Bidoul', email: 'francis.bidoul@company.com', role: 'Manager', groups: [] }, // Changed to Manager
  { id: 'U8', name: 'Elodie Saurat', email: 'elodie.saurat@company.com', role: 'Manager', groups: [] }, // Changed to Manager
];

export const MOCK_RISKS: Risk[] = [
  // Brazil Risks
  {
    id: 'BR-0001',
    creationDate: '2023-11-01',
    register: 'BR Asset',
    country: Country.BR,
    title: 'PCE-E3 - PROD - Export Oil Line Failure',
    description: 'Risk of unauthorized access to corporate networks through sophisticated phishing campaigns targeting finance department.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 5,
    inherentLikelihood: 4, // 20
    controlsText: 'MFA enabled, quarterly training, email filtering.',
    controls: [], // Filled at runtime if empty
    controlsRating: ControlRating.EXCELLENT,
    residualImpact: 1,
    residualLikelihood: 1, // Score 1 (Low)
    previousScore: 2, // Was 2, now 1 (Decreased)
    historicalScores: [
      { date: '2024-01-01', score: 3, quarter: 'Q1 2024' },
      { date: '2024-04-01', score: 2, quarter: 'Q2 2024' }
    ],
    status: RiskStatus.REVIEWED,
    lastReviewDate: '7/11/2025',
    lastReviewer: 'Elodie Saurat',
    collaborators: ['Mike Smith'],
    history: [
      { id: 'h1', date: '2023-11-01T08:00:00Z', user: 'Francis Bidoul', action: 'Risk Created', details: 'Initial risk creation' },
      { id: 'h2', date: '2024-05-12T14:30:00Z', user: 'Elodie Saurat', action: 'Residual Impact Changed', details: "From '3' to '1'" }, // Mock decrease
      { id: 'h2b', date: '2024-05-12T14:30:00Z', user: 'Elodie Saurat', action: 'Status Changed', details: 'From Open to Reviewed' }
    ],
    escalations: []
  },
  {
    id: 'BR-0002',
    creationDate: '2023-11-05',
    register: 'BR Asset',
    country: Country.BR,
    title: 'AII-E10 - CIM - O&G Import/Export Lines',
    description: 'Customs delays in Brazil impacting import of critical turbine spares leading to extended downtime.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 4,
    inherentLikelihood: 5, // 20
    controlsText: 'Local warehousing of critical spares started.',
    controls: [], 
    controlsRating: ControlRating.FAIR,
    residualImpact: 3,
    residualLikelihood: 4, // Score 12 (Moderate)
    previousScore: 12, // Stable
    historicalScores: [
      { date: '2024-01-01', score: 10, quarter: 'Q1 2024' },
      { date: '2024-04-01', score: 12, quarter: 'Q2 2024' },
      { date: '2024-07-01', score: 12, quarter: 'Q3 2024' }
    ],
    status: RiskStatus.REVIEWED,
    lastReviewDate: '',
    lastReviewer: 'Simon Grenville-Wood',
    collaborators: [],
    history: [
      { id: 'h3', date: '2023-11-05T09:15:00Z', user: 'Francis Bidoul', action: 'Risk Created', details: 'Initial risk creation' }
    ],
    escalations: [
       { level: EscalationLevel.FUNCTIONAL_MANAGER, userId: 'U2', userName: 'Carlos Silva', date: '2024-03-25T09:00:00Z' }
    ]
  },
  {
    id: 'BR-0003',
    creationDate: '2023-11-10',
    register: 'BR Asset',
    country: Country.BR,
    title: 'AII-E2 - CIM - Structural RTI / Audit Risk',
    description: 'Structural integrity issues identified during recent audit requiring immediate attention.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL, 
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 5,
    inherentLikelihood: 4, // 20
    controlsText: 'Regular inspections scheduled.',
    controls: [],
    controlsRating: ControlRating.POOR,
    residualImpact: 4,
    residualLikelihood: 4, // Score 16 (Significant)
    previousScore: 12, // Was 12, now 16 (Increased)
    status: RiskStatus.REVIEWED,
    lastReviewDate: '7/11/2025',
    lastReviewer: 'Elodie Saurat',
    collaborators: [],
    history: [
      { id: 'h_inc1', date: '2024-06-01T09:00:00Z', user: 'Francis Bidoul', action: 'Residual Impact Changed', details: "From '3' to '4'" } // Mock Increase
    ]
  },
  // Added Mock Risk for Stable trend
   {
    id: 'BR-0004',
    creationDate: '2023-12-01',
    register: 'BR Asset',
    country: Country.BR,
    title: 'P-65 Production Bottleneck',
    description: 'Production limitation due to compressor availability.',
    owner: 'Francis Bidoul',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][1],
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'Maintenance overhaul planned.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2,
    previousScore: 6, // Stable
    status: RiskStatus.REVIEWED,
    lastReviewDate: '2024-01-15',
    lastReviewer: 'Francis Bidoul',
    collaborators: [],
    history: [
       { id: 'h_stable', date: '2024-01-15T10:00:00Z', user: 'Francis Bidoul', action: 'Risk Reviewed', details: 'No changes to score.' }
    ]
  },
  
  // EG Risks (Updated from GQ to match new register list names where possible)
  {
    id: 'GQ-0001',
    creationDate: '2024-02-15',
    register: 'EG Country',
    country: Country.GQ,
    title: 'Malabo Logistics Base Lease Renewal',
    description: 'Risk of significant rent increase or non-renewal of the primary logistics base lease in Malabo, potentially impacting supply chain continuity.',
    owner: 'Jane Doe',
    functionArea: 'Supply Chain',
    category: RiskCategory.STRATEGIC,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.STRATEGIC][0],
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'Early negotiations started. Alternative sites identified.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2, // Score 6 -> Moderate
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-02-20',
    lastReviewer: 'Jane Doe',
    collaborators: ['Amara Ndiaye'],
    history: [
      { id: 'h4', date: '2024-02-15T11:00:00Z', user: 'Jane Doe', action: 'Risk Created', details: 'Initial risk creation' },
      { id: 'h5', date: '2024-02-20T10:00:00Z', user: 'Amara Ndiaye', action: 'Controls Updated', details: 'Added alternative sites to mitigation strategy' }
    ]
  },
  {
    id: 'GQ-0002',
    creationDate: '2024-03-01',
    register: 'Integrity EG - Well integrity Risk Register',
    country: Country.GQ,
    title: 'Zafiro Field - Aging Flowline Corrosion',
    description: 'Accelerated corrosion rates observed in sector 4 flowlines. Potential for leak if not replaced before next wet season.',
    owner: 'Amara Ndiaye',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 5,
    inherentLikelihood: 4,
    controlsText: 'Corrosion inhibitor injection increased. Inspection frequency doubled.',
    controls: [],
    controlsRating: ControlRating.FAIR,
    residualImpact: 4,
    residualLikelihood: 3,
    status: RiskStatus.UPDATED,
    lastReviewDate: '2024-03-10',
    lastReviewer: 'Amara Ndiaye',
    collaborators: ['Jane Doe'],
    history: []
  },
  {
    id: 'GQ-0003',
    creationDate: '2024-03-15',
    register: 'Supply Chain',
    country: Country.GQ,
    title: 'Malabo Port Congestion',
    description: 'Increased vessel waiting times at Malabo port due to new customs clearance procedures, impacting critical material delivery.',
    owner: 'Jane Doe',
    functionArea: 'Supply Chain',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][1],
    inherentImpact: 3,
    inherentLikelihood: 4,
    controlsText: 'Fast-track clearance agent engaged. Inventory buffers increased.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2, // Score 6 -> Moderate
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-03-18',
    lastReviewer: 'Jane Doe',
    collaborators: [],
    history: []
  },
  {
    id: 'GQ-0004',
    creationDate: '2024-03-20',
    register: 'Legal',
    country: Country.GQ,
    title: 'Local Content Quota Update',
    description: 'Proposed legislative changes to increase local hiring quotas by 15% within 6 months.',
    owner: 'Amara Ndiaye',
    functionArea: 'Compliance',
    category: RiskCategory.COMPLIANCE,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.COMPLIANCE][0],
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'HR audit in progress. Recruitment drive planned.',
    controls: [],
    controlsRating: ControlRating.FAIR,
    residualImpact: 3,
    residualLikelihood: 3, // Score 9 -> Moderate
    status: RiskStatus.OPEN,
    lastReviewDate: '',
    lastReviewer: '',
    collaborators: ['Jane Doe'],
    history: []
  },

  // CG Risks (Existing 2 + 2 New = 4 Total)
  {
    id: 'CG-0001',
    creationDate: '2024-02-18',
    register: 'CG Country',
    country: Country.CG,
    title: 'Regulatory Tax Audit - Pointe Noire',
    description: 'Upcoming comprehensive tax audit by local authorities. Potential for disputed interpretations of new tax code amendments.',
    owner: 'Jane Doe',
    functionArea: 'Finance and Liquidity',
    category: RiskCategory.FINANCIAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.FINANCIAL][1],
    inherentImpact: 4,
    inherentLikelihood: 4,
    controlsText: 'External tax counsel engaged. Pre-audit internal review completed.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 3, // Score 9 -> Moderate
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-02-25',
    lastReviewer: 'Jane Doe',
    collaborators: ['Jean-Luc M', 'Mike Smith'],
    history: []
  },
  {
    id: 'CG-0002',
    creationDate: '2024-03-05',
    register: 'CG Integrity',
    country: Country.CG,
    title: 'Dolphin Platform - Crane Reliability',
    description: 'Main deck crane experiencing intermittent hydraulic failures. Critical for upcoming maintenance campaign.',
    owner: 'Jean-Luc M',
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 3,
    inherentLikelihood: 4,
    controlsText: 'Spare parts expedited. Specialist technician mobilized.',
    controls: [],
    controlsRating: ControlRating.POOR,
    residualImpact: 3,
    residualLikelihood: 3, // Score 9 -> Moderate
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-03-12',
    lastReviewer: 'Jean-Luc M',
    collaborators: ['Jane Doe', 'Sarah Jenkins'],
    history: []
  },
  {
    id: 'CG-0003',
    creationDate: '2024-03-25',
    register: 'Treasury',
    country: Country.CG,
    title: 'CEMAC Currency Restrictions',
    description: 'Stricter enforcement of central bank FX regulations delaying vendor payments.',
    owner: 'Jane Doe',
    functionArea: 'Finance and Liquidity',
    category: RiskCategory.FINANCIAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.FINANCIAL][0],
    inherentImpact: 4,
    inherentLikelihood: 4,
    controlsText: 'Meeting with Central Bank scheduled. Payment prioritization framework.',
    controls: [],
    controlsRating: ControlRating.FAIR,
    residualImpact: 4,
    residualLikelihood: 3, // Score 12 -> Moderate
    status: RiskStatus.OPEN,
    lastReviewDate: '',
    lastReviewer: '',
    collaborators: [],
    history: []
  },
  {
    id: 'CG-0004',
    creationDate: '2024-03-28',
    register: 'HSE',
    country: Country.CG,
    title: 'Offshore Security Zone Encroachment',
    description: 'Increase in unauthorized fishing vessels entering exclusion zones around offshore assets.',
    owner: 'Jean-Luc M',
    functionArea: 'HSE',
    category: RiskCategory.STRATEGIC,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.STRATEGIC][0],
    inherentImpact: 3,
    inherentLikelihood: 3, // Score 9 -> Moderate
    controlsText: 'Coast guard liaison strengthened. Radar monitoring enhanced.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 2,
    residualLikelihood: 2, // Score 4 -> Low
    status: RiskStatus.OPEN,
    lastReviewDate: '',
    lastReviewer: '',
    collaborators: ['Jane Doe'],
    history: []
  }
];

// Generate limited UK mock data (Only 5 items)
for (let i = 0; i < 5; i++) {
  const seq = String(i + 1).padStart(4, '0');
  const cat = i % 2 === 0 ? RiskCategory.OPERATIONAL : RiskCategory.FINANCIAL;
  MOCK_RISKS.push({
    id: `UK-${seq}`,
    creationDate: '2024-03-01',
    register: 'UK Corporate',
    country: Country.UK,
    title: `UK Corporate Risk ${i + 1}`,
    description: 'Standard corporate risk entry for UK operations.',
    owner: 'System Admin',
    functionArea: 'Strategic and Entity Level risks (e.g. M&A)',
    category: cat,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[cat][0],
    inherentImpact: 3,
    inherentLikelihood: 3,
    controlsText: 'Standard controls.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 2,
    residualLikelihood: 3, // Score 6 -> Moderate
    previousScore: 6, // Stable
    status: RiskStatus.OPEN,
    lastReviewDate: '2023-11-01',
    lastReviewer: 'System',
    collaborators: [],
    history: []
  });
}

export const MOCK_ACTIONS: ActionPlan[] = [
  {
    id: 'A-001',
    riskId: 'BR-0001', // Linked to BR-0001
    title: 'Identify Local Suppliers',
    description: 'Find alternate suppliers within Mercosur region to avoid trans-atlantic shipping delays.',
    owner: 'Carlos Silva',
    dueDate: '2023-12-31',
    status: 'Open',
    attachments: [
      {
        id: 'att-1',
        name: 'Supplier_Shortlist_v2.pdf',
        url: '#',
        type: 'application/pdf',
        size: 2048576,
        uploadDate: '2023-11-05T10:00:00Z'
      }
    ]
  },
   {
    id: 'A-002',
    riskId: 'BR-0002', // Linked to BR-0002
    title: 'Upgrade Firewall',
    description: 'Implement Next-Gen firewall with AI threat detection.',
    owner: 'Sarah Jenkins',
    dueDate: '2024-01-15',
    status: 'Open'
  },
  {
    id: 'A-003',
    riskId: 'BR-0003', // Linked to BR-0003
    title: 'Audit repair',
    description: 'Fix structural issues.',
    owner: 'Francis Bidoul',
    dueDate: '2025-01-15',
    status: 'Approved'
  },
  {
    id: 'A-004',
    riskId: 'BR-0002', // Linked to BR-0002 (O&G Import/Export)
    title: 'Order Spare',
    description: 'Order backup exchanger.',
    owner: 'Francis Bidoul',
    dueDate: '2025-02-01',
    status: 'Open'
  }
  // Risk 1059 intentionally has no actions for testing the warning icon
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'C-001',
    riskId: 'BR-0001', // Linked to BR-0001
    userId: 'U1',
    userName: 'Head of Ops',
    date: '2023-11-02T10:00:00Z',
    text: 'Please prioritize the local supplier search, downtime costs are rising.'
  },
  {
    id: 'C-002',
    riskId: 'BR-0001', // Linked to BR-0001
    userId: 'U2',
    userName: 'Carlos Silva',
    date: '2023-11-02T11:30:00Z',
    text: 'We are already in talks with three potential suppliers in Sao Paulo.',
    parentId: 'C-001'
  },
  {
    id: 'C-003',
    riskId: 'BR-0001', // Linked to BR-0001
    userId: 'U1',
    userName: 'Jane Doe',
    date: '2023-11-03T09:00:00Z',
    text: 'That sounds promising, Carlos. When can we expect a quote?',
    parentId: 'C-002'
  }
];