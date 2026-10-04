/** Matches the page_reports.reason CHECK in the database. */
export const REPORT_REASONS = [
  { id: 'scam_or_phishing', label: 'Scam or phishing', hint: 'Tries to take money, passwords or personal details.' },
  { id: 'malware', label: 'Harmful downloads', hint: 'Links to viruses or other harmful software.' },
  { id: 'impersonation', label: 'Pretending to be someone else', hint: 'Uses another person’s or business’s identity.' },
  { id: 'spam', label: 'Spam', hint: 'Misleading, repetitive or unwanted promotion.' },
  { id: 'hate_or_harassment', label: 'Hate or harassment', hint: 'Attacks or threatens people.' },
  { id: 'illegal', label: 'Illegal content', hint: 'Sells or promotes something unlawful.' },
  { id: 'other', label: 'Something else', hint: 'Tell us what’s wrong below.' },
] as const
