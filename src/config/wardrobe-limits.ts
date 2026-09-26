export const EXTRA_ITEMS_ALLOWED = 5;

const CURRENT_CML_BASELINE: Record<string, number> = {
  "josue.calero@cml52.com": 10,
  "josue.torrez@cml52.com": 10,
  "gabriel.soto@cml52.com": 10,
  "cynthia.nicolas@cml52.com": 11,
  "fernanda.duarte@cml52.com": 11,
  "irma.boza@cml52.com": 11,
  "lloyda.avellan@cml52.com": 11,
  "sara.travers@cml52.com": 11,
  "sarahi.espinoza@cml52.com": 11,
};

export function getWardrobeCap(email: string | undefined): number | null {
  if (!email) return null;

  const baseline = CURRENT_CML_BASELINE[email.toLowerCase().trim()];

  if (baseline === undefined) return null;

  return baseline + EXTRA_ITEMS_ALLOWED;
}
