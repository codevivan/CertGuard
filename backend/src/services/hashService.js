import crypto from 'crypto';

/**
 * Computes a deterministic SHA-256 hash of core certificate data
 * string: recipientName + eventName + issueDate + certCode
 */
export const computeCertificateHash = ({ recipientName, eventName, issueDate, certCode }) => {
  const formattedDate = new Date(issueDate).toISOString().split('T')[0];
  const payload = `${recipientName.trim()}|${eventName.trim()}|${formattedDate}|${certCode.trim()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};
