
import { ContractData } from '../types';

export const formatEmailBody = (contract: ContractData): string => {
  return `
SUBJECT: Contract Update - ${contract.contractorName} (${contract.status})

DEAR USER,

The following contract requires your attention or has been updated.

--- OVERVIEW ---
Contractor: ${contract.contractorName}
Entity: ${contract.entity}
Department: ${contract.department}
Amount: $${contract.amount.toLocaleString()} ${contract.currency}
Duration: ${contract.startDate} to ${contract.endDate}

--- EXECUTIVE SUMMARY ---
${contract.backgroundNeed}

--- SCOPE OF WORK ---
${contract.scopeOfWork}

--- VENDOR QUALIFICATION ---
DDQ Number: ${contract.ddqNumber || 'N/A'}
Validity: ${contract.ddqValidityDate || 'N/A'}

Please log in to the Trident Contract Guard system to review full details.
  `.trim();
};

export const triggerEmailNotification = (toName: string, subject: string, _body: string) => {
  // 1. Log to console for debugging
  console.log(`[EMAIL SENT] To: ${toName} | Subject: ${subject}`);
  
  // 2. Dispatch event for UI Toast
  const event = new CustomEvent('email-sent', { 
    detail: { to: toName, subject } 
  });
  window.dispatchEvent(event);
};
