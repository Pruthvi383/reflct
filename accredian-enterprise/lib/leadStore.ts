type Lead = {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  message: string;
  createdAt: string;
};

const leads: Lead[] = [];

export const addLead = (lead: Omit<Lead, "createdAt">) => {
  const completeLead = {
    ...lead,
    createdAt: new Date().toISOString()
  };

  leads.unshift(completeLead);

  return completeLead;
};

export const getLeads = () => leads;
