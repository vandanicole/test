export type ProtocolType = 
  | 'vless-ws'
  | 'xhttp-packet-up'
  | 'xhttp-stream-up'
  | 'xhttp-stream-one'
  | 'vmess-ws'
  | 'trojan-ws'
  | 'hysteria2'
  | 'tuic';

export type OperatorType = 'mci' | 'irancell' | 'rightel' | 'mokhaberat' | 'shatel' | 'all';

export interface CleanIpItem {
  ip: string;
  isp: OperatorType;
  ispName: string;
  pingEstimate: string;
  datacenter: string;
  reliability: 'عالی' | 'خوب' | 'متوسط';
}

export interface ConfigOptions {
  uuid: string;
  railwayDomain: string;
  sni: string;
  hostHeader: string;
  cleanIp: string;
  port: number;
  protocol: ProtocolType;
  path: string;
  fingerprint: string;
  alpn: string;
  remark: string;
  allowInsecure: boolean;
}

export interface PackageFile {
  name: string;
  filename: string;
  description: string;
  content: string;
  language: string;
}
