export function maskEmail(email: string): string {
  const atIndex = email.lastIndexOf('@');
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex);

  const maskedLocalPart = localPart.length > 3 ? localPart.slice(0, 3) + '***' : localPart + '***'.slice(localPart.length);

  return maskedLocalPart + domainPart;
}
