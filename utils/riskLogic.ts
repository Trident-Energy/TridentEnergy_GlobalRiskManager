
import { ContractData, RiskTrigger } from '../types';
import { INITIAL_TRIGGERS } from '../constants';

export const evaluateRisk = (data: Partial<ContractData>): { isHighRisk: boolean; triggers: RiskTrigger[] } => {
  const triggers: RiskTrigger[] = JSON.parse(JSON.stringify(INITIAL_TRIGGERS)); // Deep copy
  let isHighRisk = false;

  // 1. Financial: OPEX > 1M (ID: t1)
  // Check if type includes OPEX (OPEX or MIXED)
  if (data.contractType === 'OPEX' || data.contractType === 'MIXED') {
      if ((data.amount || 0) > 1000000) {
         const t = triggers.find(t => t.id === 't1');
         if (t) t.triggered = true;
      }
  }

  // 2. Financial: CAPEX > 5M (ID: t2)
  // Check if type includes CAPEX (CAPEX or MIXED)
  if (data.contractType === 'CAPEX' || data.contractType === 'MIXED') {
      if ((data.amount || 0) > 5000000) {
          const t = triggers.find(t => t.id === 't2');
          if (t) t.triggered = true;
      }
  }

  // 3. Legal: Liability Cap < 100% (ID: t3)
  if (data.liabilityCapPercent !== undefined && data.liabilityCapPercent < 100) {
      const t = triggers.find(t => t.id === 't3');
      if (t) t.triggered = true;
  }

  // 4. Operational: > 3 years (ID: t4)
  const start = data.startDate ? new Date(data.startDate) : new Date();
  const end = data.endDate ? new Date(data.endDate) : new Date();
  const durationYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (durationYears > 3) {
      const t = triggers.find(t => t.id === 't4');
      if (t) t.triggered = true;
  }

  // 5. Third Party: Subcontracting > 30% (ID: t5)
  if ((data.subcontractingPercent || 0) > 30) {
      const t = triggers.find(t => t.id === 't5');
      if (t) t.triggered = true;
  }

  // Check if any trigger is active
  isHighRisk = triggers.some(t => t.triggered);

  return { isHighRisk, triggers };
};
