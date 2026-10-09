import { ConfigOptions } from '../types';

export function generateVlessLink(options: ConfigOptions): string {
  const {
    uuid,
    railwayDomain,
    sni,
    hostHeader,
    cleanIp,
    port,
    protocol,
    path,
    fingerprint,
    alpn,
    remark,
  } = options;

  // Address to connect to: if Clean IP is provided, use Clean IP, otherwise railway domain
  const connectAddress = cleanIp.trim() ? cleanIp.trim() : railwayDomain.trim();
  
  // Effective SNI: use custom SNI if provided, otherwise railway domain
  const effectiveSni = sni.trim() ? sni.trim() : railwayDomain.trim();

  // Effective Host Header: use custom host if provided, otherwise sni or railway domain
  const effectiveHost = hostHeader.trim() ? hostHeader.trim() : (sni.trim() || railwayDomain.trim());

  const label = encodeURIComponent(remark.trim() || 'PXPanel-Fixed');

  if (protocol === 'vless-ws') {
    const defaultPath = path.trim() || `/ws/${uuid}`;
    const params = new URLSearchParams({
      encryption: 'none',
      security: 'tls',
      type: 'ws',
      host: effectiveHost,
      path: defaultPath,
      sni: effectiveSni,
      fp: fingerprint || 'chrome',
      alpn: alpn || 'http/1.1',
    });
    return `vless://${uuid}@${connectAddress}:${port}?${params.toString()}#${label}`;
  }

  if (protocol.startsWith('xhttp-')) {
    const mode = protocol.replace('xhttp-', '');
    const defaultPath = path.trim() || `/xhttp-siz10/${mode}/${uuid}`;
    const params = new URLSearchParams({
      encryption: 'none',
      security: 'tls',
      type: 'xhttp',
      mode: mode,
      host: effectiveHost,
      path: defaultPath,
      sni: effectiveSni,
      fp: fingerprint || 'chrome',
      alpn: alpn || 'h2,http/1.1',
    });
    return `vless://${uuid}@${connectAddress}:${port}?${params.toString()}#${label}`;
  }

  if (protocol === 'vmess-ws') {
    const defaultPath = path.trim() || `/ws/${uuid}`;
    const vmessJson = {
      v: '2',
      ps: remark.trim() || 'PXPanel-VMess',
      add: connectAddress,
      port: port,
      id: uuid,
      aid: 0,
      scy: 'auto',
      net: 'ws',
      type: 'none',
      host: effectiveHost,
      path: defaultPath,
      tls: 'tls',
      sni: effectiveSni,
      fp: fingerprint || 'chrome',
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(vmessJson))));
    return `vmess://${b64}`;
  }

  if (protocol === 'trojan-ws') {
    const defaultPath = encodeURIComponent(path.trim() || `/ws/${uuid}`);
    return `trojan://${uuid}@${connectAddress}:${port}?security=tls&type=ws&host=${encodeURIComponent(effectiveHost)}&path=${defaultPath}&sni=${encodeURIComponent(effectiveSni)}&fp=${fingerprint || 'chrome'}#${label}`;
  }

  if (protocol === 'hysteria2') {
    return `hysteria2://${uuid}@${connectAddress}:${port}/?sni=${encodeURIComponent(effectiveSni)}&insecure=0#${label}`;
  }

  if (protocol === 'tuic') {
    return `tuic://${uuid}:${uuid}@${connectAddress}:${port}?sni=${encodeURIComponent(effectiveSni)}&alpn=${alpn || 'h3'}#${label}`;
  }

  return `vless://${uuid}@${connectAddress}:${port}#${label}`;
}

export function generateSubscription(
  options: ConfigOptions,
  cleanIpsList: string[]
): string {
  const configs: string[] = [];

  if (cleanIpsList.length > 0) {
    cleanIpsList.forEach((cip, index) => {
      const config = generateVlessLink({
        ...options,
        cleanIp: cip,
        remark: `${options.remark || 'PXPanel'} | CleanIP-${index + 1}`,
      });
      configs.push(config);
    });
  } else {
    configs.push(generateVlessLink(options));
  }

  const rawCombined = configs.join('\n');
  return btoa(unescape(encodeURIComponent(rawCombined)));
}
