

import { Risk, Country, RiskCategory, RiskStatus, ControlRating, ActionPlan, Comment, User, EscalationLevel } from './types';

// Country Config
export const COUNTRIES = [
  { code: Country.UK, label: 'United Kingdom', flagUrl: 'https://flagcdn.com/w80/gb.png' },
  { code: Country.BR, label: 'Brazil', flagUrl: 'https://flagcdn.com/w80/br.png' },
  { code: Country.GQ, label: 'Equatorial Guinea', flagUrl: 'https://flagcdn.com/w80/gq.png' }, 
  { code: Country.CG, label: 'Congo', flagUrl: 'https://flagcdn.com/w80/cg.png' }
];

export const GROUPS = [
  { id: 'REG_BR', label: 'Country Risk Register BR' },
  { id: 'REG_GQ', label: 'Country Risk Register GQ' },
  { id: 'REG_CG', label: 'Country Risk Register CG' },
  { id: 'REG_UK', label: 'Country Risk Register UK' },
];

export const ESCALATION_LEVELS = [
  EscalationLevel.FUNCTIONAL_MANAGER,
  EscalationLevel.TEML_FUNCTIONAL_REVIEW,
  EscalationLevel.TEML_LEADERSHIP,
  EscalationLevel.COUNTRY_MANAGER,
  EscalationLevel.CORPORATE_RISK
];

// Column Definitions for Visibility Toggling - Updated Order
export const AVAILABLE_COLUMNS = [
  { key: 'warning', label: 'Warnings', mandatory: true },
  { key: 'consolidatedIcon', label: 'Linked', mandatory: false },
  { key: 'role', label: 'My Role' },
  { key: 'country', label: 'Country' },
  { key: 'register', label: 'Risk Register' },
  { key: 'id', label: 'Risk ID' }, // Hidden by default in App.tsx
  { key: 'title', label: 'Risk Title', mandatory: true },
  { key: 'parentRiskTitle', label: 'Consolidated Key Business Risk Title' },
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
  { register: "Comms", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
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
  { register: "Government relations", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "Legal", functionArea: "Compliance" },
  { register: "CFO", functionArea: "Finance and Liquidity" },
  { register: "Finance", functionArea: "Finance and Liquidity" },
  { register: "Treasury", functionArea: "Finance and Liquidity" },
  { register: "Tax", functionArea: "Finance and Liquidity" },
  { register: "Integrity Brazil - Flag and Class including walkways Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - General Maintenance Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGIP (Well Integrity) Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGSO Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity Brazil - SGSS ( Subsea & pipeline integrity) Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - General Maintenance, SCE, Walkways, Accommodation Ceiba Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - General Maintenance, SCE, Walkways, Accommodation Okume Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - Subsea structures & Rotative equipment Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - Top side, pipeline and Marine Structural Risk Register", functionArea: "Operations and Integrity" },
  { register: "Integrity EG - Well integrity Risk Register", functionArea: "Operations and Integrity" },
  { register: "EG Drilling Campaign (Project)", functionArea: "Projects" },
  { register: "Foxtrot Compression Project", functionArea: "Projects" },
  { register: "Integrity EG – General Maintenance, SCE, Walkways, Accommodation Risk Register", functionArea: "Operations and Integrity" },
  { register: "Environmental, Social, and Governance (ESG)", functionArea: "HSE" },
  { register: "Subsea decommissioning", functionArea: "Projects" },
  { register: "BRAVO FSO Project", functionArea: "Projects" },
  { register: "Offshore Structures Brazil", functionArea: "Operations and Integrity" },
  { register: "CG Country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "CG Deputy country", functionArea: "Strategic and Entity Level risks (e.g. M&A)" },
  { register: "TEdB Topside Projects", functionArea: "Operations and Integrity" },
  { register: "Well Services", functionArea: "Operations and Integrity" },
  { register: "CG Integrity", functionArea: "Operations and Integrity" },
  { register: "P-65 Decommissioning", functionArea: "Projects" },
  { register: "FLNG", functionArea: "Projects" },
  { register: "BR Asset", functionArea: "Operations and Integrity" }
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

// --- USER DATA SOURCE ---
// Raw data from the mapping provided
const USER_DATA_SOURCE = [
  // BR Managers
  { name: "Luis Felipe Siqueira Furtado", country: Country.BR, role: "Manager", escalation: "" },
  { name: "Tristan Devaux", country: Country.BR, role: "Manager", escalation: "" },
  { name: "Rodrigo Freitas", country: Country.BR, role: "Manager", escalation: "" },
  { name: "Francis Bidoul", country: Country.BR, role: "Manager", escalation: "" },
  { name: "Rafael Kenupp", country: Country.BR, role: "Manager", escalation: "" },
  // GQ Managers
  { name: "Aref Al Kadi", country: Country.GQ, role: "Manager", escalation: "" },
  { name: "Marcos Mbelo Mbula", country: Country.GQ, role: "Manager", escalation: "" },
  { name: "Blair McKnight", country: Country.GQ, role: "Manager", escalation: "" },
  { name: "Julien Garcia", country: Country.GQ, role: "Manager", escalation: "" },
  // CG Managers
  { name: "Juvenal M. Esono", country: Country.CG, role: "Manager", escalation: "" },
  { name: "Jonathan Byfield", country: Country.CG, role: "Manager", escalation: "" },
  // BR Functional
  { name: "Frederic de Meo", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Braulio Bastos", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Igor Viegas", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Matthew Brooks", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Sergio Siqueira", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Guillaume Magnier", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER }, // Listed in image under Functional
  { name: "Vicente Duncan", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Emily Farias", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Andre Menier", country: Country.BR, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  // GQ Functional
  { name: "Yasir Taha", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Tomasa Bisiia Ela Nchama", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Anniesa Nicholas", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Ramiro, Ndong Mba Besili", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Alicante Leon Dora", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Oyono Avomo, Pedro Ndong", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Maria Jose Miko Mbengono", country: Country.GQ, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  // CG Functional
  { name: "Serge Nsiemo", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Jean-Baptiste Chevaillier", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Arnauld Dekambi", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Helmuth Kruger", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Mireille Ngono", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Serena Menad", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Sebastien Garnier", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  { name: "Olivier Jahan", country: Country.CG, role: "Functional Manager", escalation: EscalationLevel.FUNCTIONAL_MANAGER },
  // UK TEML Functional Review
  { name: "Eduardo Cunha", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Jason Pinto", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Simon Lorelli", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Chris Watton", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Kim Kallmeyer", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Olivia Brown", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Stuart Seymour", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Susannah Buswell", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Vijay Pathak", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  { name: "Paula Diaz", country: Country.UK, role: "TEML Functional", escalation: EscalationLevel.TEML_FUNCTIONAL_REVIEW },
  // Country Manager Escalation
  { name: "Julien Vuillemot", country: Country.UK, role: "Country Manager", escalation: EscalationLevel.COUNTRY_MANAGER },
  { name: "Hugues Corrignan", country: Country.BR, role: "Country Manager", escalation: EscalationLevel.COUNTRY_MANAGER },
  { name: "Didier Mutti", country: Country.CG, role: "Country Manager", escalation: EscalationLevel.COUNTRY_MANAGER },
  // TEML Leadership / Corporate
  { name: "Edwin Lopez", country: Country.GQ, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Enrique Valero Torrenterra", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Eric Descourtieux", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Johanna Moreno / Ana Paula Alves", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Kaj Shah", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Oliver Byrne", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Paul Coward", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Rogdy Espinoza", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Jonathan Pim", country: Country.UK, role: "TEML Leadership Team", escalation: EscalationLevel.TEML_LEADERSHIP },
  { name: "Jean-Michel Jacoulet", country: Country.UK, role: "CEO", escalation: EscalationLevel.CORPORATE_RISK },
  { name: "Marissa Santiago", country: Country.UK, role: "RMIA", escalation: "RMIA (Admin)" }
];

export const MOCK_USERS: User[] = USER_DATA_SOURCE.map(u => {
  const cleanName = u.name.split(',').map(s => s.trim()).join(' ');
  const email = `${cleanName.toLowerCase().replace(/[\/\s]/g, '.')}@trident-energy.com`;
  
  const groups = [`REG_${u.country}`];
  if (u.escalation) groups.push(u.escalation);
  if (u.role === 'RMIA') groups.push('RMIA');

  return {
    id: `u-${cleanName.replace(/[\/\s]/g, '')}`,
    name: cleanName,
    email: email,
    role: u.role as any,
    country: u.country,
    groups: groups
  };
});

// Re-map risks to new users
export const MOCK_RISKS: Risk[] = [
  // Brazil Risks
  {
    id: 'BR-0001',
    creationDate: '2023-11-01',
    register: 'BR Asset',
    country: Country.BR,
    title: 'PCE-E3 - PROD - Export Oil Line Failure',
    description: 'Risk of unauthorized access to corporate networks through sophisticated phishing campaigns targeting finance department.',
    owner: 'Francis Bidoul', // BR Manager
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 5,
    inherentLikelihood: 4, 
    controlsText: 'MFA enabled, quarterly training, email filtering.',
    controls: [], 
    controlsRating: ControlRating.EXCELLENT,
    residualImpact: 1,
    residualLikelihood: 1,
    previousScore: 2, 
    historicalScores: [
      { date: '2024-01-01', score: 3, quarter: 'Q1 2024' },
      { date: '2024-04-01', score: 2, quarter: 'Q2 2024' }
    ],
    status: RiskStatus.REVIEWED,
    lastReviewDate: '7/11/2025',
    lastReviewer: 'Frederic de Meo', // BR Functional
    collaborators: ['Tristan Devaux'],
    history: [
      { id: 'h1', date: '2023-11-01T08:00:00Z', user: 'Francis Bidoul', action: 'Risk Created', details: 'Initial risk creation' }
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
    owner: 'Francis Bidoul', // BR Manager
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 4,
    inherentLikelihood: 5,
    controlsText: 'Local warehousing of critical spares started.',
    controls: [], 
    controlsRating: ControlRating.FAIR,
    residualImpact: 3,
    residualLikelihood: 4, 
    previousScore: 12, 
    historicalScores: [
      { date: '2024-01-01', score: 10, quarter: 'Q1 2024' },
      { date: '2024-04-01', score: 12, quarter: 'Q2 2024' },
      { date: '2024-07-01', score: 12, quarter: 'Q3 2024' }
    ],
    status: RiskStatus.REVIEWED,
    lastReviewDate: '',
    lastReviewer: 'Hugues Corrignan',
    collaborators: [],
    history: [],
    escalations: [
       { level: EscalationLevel.FUNCTIONAL_MANAGER, userId: 'u-BraulioBastos', userName: 'Braulio Bastos', date: '2024-03-25T09:00:00Z' }
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
    inherentLikelihood: 4, 
    controlsText: 'Regular inspections scheduled.',
    controls: [],
    controlsRating: ControlRating.POOR,
    residualImpact: 4,
    residualLikelihood: 4, 
    previousScore: 12, 
    status: RiskStatus.REVIEWED,
    lastReviewDate: '7/11/2025',
    lastReviewer: 'Luis Felipe Siqueira Furtado',
    collaborators: [],
    history: []
  },
  
  // EG Risks
  {
    id: 'GQ-0001',
    creationDate: '2024-02-15',
    register: 'EG Country',
    country: Country.GQ,
    title: 'Malabo Logistics Base Lease Renewal',
    description: 'Risk of significant rent increase or non-renewal of the primary logistics base lease in Malabo.',
    owner: 'Aref Al Kadi', // GQ Manager
    functionArea: 'Supply Chain',
    category: RiskCategory.STRATEGIC,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.STRATEGIC][0],
    inherentImpact: 4,
    inherentLikelihood: 3,
    controlsText: 'Early negotiations started. Alternative sites identified.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 2, 
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-02-20',
    lastReviewer: 'Marcos Mbelo Mbula',
    collaborators: ['Guillaume Magnier'],
    history: []
  },
  {
    id: 'GQ-0002',
    creationDate: '2024-03-01',
    register: 'Integrity EG - Well integrity Risk Register',
    country: Country.GQ,
    title: 'Zafiro Field - Aging Flowline Corrosion',
    description: 'Accelerated corrosion rates observed in sector 4 flowlines.',
    owner: 'Julien Garcia', // GQ Manager
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 5,
    inherentLikelihood: 4,
    controlsText: 'Corrosion inhibitor injection increased.',
    controls: [],
    controlsRating: ControlRating.FAIR,
    residualImpact: 4,
    residualLikelihood: 3,
    status: RiskStatus.UPDATED,
    lastReviewDate: '2024-03-10',
    lastReviewer: 'Edwin Lopez',
    collaborators: ['Aref Al Kadi'],
    history: []
  },

  // CG Risks 
  {
    id: 'CG-0001',
    creationDate: '2024-02-18',
    register: 'CG Country',
    country: Country.CG,
    title: 'Regulatory Tax Audit - Pointe Noire',
    description: 'Upcoming comprehensive tax audit by local authorities.',
    owner: 'Juvenal M. Esono', // CG Manager
    functionArea: 'Finance and Liquidity',
    category: RiskCategory.FINANCIAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.FINANCIAL][1],
    inherentImpact: 4,
    inherentLikelihood: 4,
    controlsText: 'External tax counsel engaged.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 3,
    residualLikelihood: 3, 
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-02-25',
    lastReviewer: 'Didier Mutti',
    collaborators: ['Jonathan Byfield'],
    history: []
  },
  {
    id: 'CG-0002',
    creationDate: '2024-03-05',
    register: 'CG Integrity',
    country: Country.CG,
    title: 'Dolphin Platform - Crane Reliability',
    description: 'Main deck crane experiencing intermittent hydraulic failures.',
    owner: 'Jonathan Byfield', // CG Manager
    functionArea: 'Operations and Integrity',
    category: RiskCategory.OPERATIONAL,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[RiskCategory.OPERATIONAL][0],
    inherentImpact: 3,
    inherentLikelihood: 4,
    controlsText: 'Spare parts expedited.',
    controls: [],
    controlsRating: ControlRating.POOR,
    residualImpact: 3,
    residualLikelihood: 3, 
    status: RiskStatus.OPEN,
    lastReviewDate: '2024-03-12',
    lastReviewer: 'Serge Nsiemo',
    collaborators: ['Juvenal M. Esono'],
    history: []
  }
];

// Generate limited UK mock data - Simon Lorelli is the OWNER for ALL UK RISKS
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
    owner: 'Simon Lorelli', // Specific Requirement
    functionArea: 'Strategic and Entity Level risks (e.g. M&A)',
    category: cat,
    groupPrincipalRisk: PRINCIPAL_RISKS_MAPPING[cat][0],
    inherentImpact: 3,
    inherentLikelihood: 3,
    controlsText: 'Standard controls.',
    controls: [],
    controlsRating: ControlRating.GOOD,
    residualImpact: 2,
    residualLikelihood: 3, 
    previousScore: 6, 
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
    riskId: 'BR-0001', 
    title: 'Identify Local Suppliers',
    description: 'Find alternate suppliers within Mercosur region to avoid trans-atlantic shipping delays.',
    owner: 'Frederic de Meo',
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
    riskId: 'BR-0002', 
    title: 'Upgrade Firewall',
    description: 'Implement Next-Gen firewall with AI threat detection.',
    owner: 'Braulio Bastos',
    dueDate: '2024-01-15',
    status: 'Open'
  },
  {
    id: 'A-003',
    riskId: 'BR-0003', 
    title: 'Audit repair',
    description: 'Fix structural issues.',
    owner: 'Francis Bidoul',
    dueDate: '2025-01-15',
    status: 'Approved'
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'C-001',
    riskId: 'BR-0001', 
    userId: 'u-MarissaSantiago',
    userName: 'Marissa Santiago',
    date: '2023-11-02T10:00:00Z',
    text: 'Please prioritize the local supplier search, downtime costs are rising.'
  },
  {
    id: 'C-002',
    riskId: 'BR-0001', 
    userId: 'u-FredericdeMeo',
    userName: 'Frederic de Meo',
    date: '2023-11-02T11:30:00Z',
    text: 'We are already in talks with three potential suppliers in Sao Paulo.',
    parentId: 'C-001'
  }
];