export function maskIP(ip: string): string {
  return ip.replace(/\.\d{1,3}$/, '.xxx');
}
