import { Image } from '@tarojs/components'

const paths: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m5 0h1m-7 3h1"/>',
  book: '<path d="M12 5v16m0-16C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 10v-3a6 6 0 0 0-2-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14m0-10H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-9 12a3 3 0 0 0 6 0"/>',
  shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01"/>',
  settings: '<path d="m9 3-1 3-3 1-2 3 2 2v3l3 2 1 4h6l1-4 3-2v-3l2-2-2-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  id: '<rect x="2" y="4" width="20" height="16" rx="3"/><circle cx="8" cy="10" r="2"/><path d="M4.5 17a3.5 3.5 0 0 1 7 0M15 9h4m-4 4h4m-4 4h2"/>',
  car: '<path d="m5 7 2-4h10l2 4m-16 3 2-3h14l2 3v9H3v-9Zm0 4h18M6 19v2m12-2v2M6 11h2m8 0h2"/>',
  passport: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="5"/><path d="M7 10h10m-5-5c-3 3-3 7 0 10 3-3 3-7 0-10ZM9 19h6"/>',
  travel: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="m8 10 8-3-4 8-1-4-3-1Zm0 8h8"/>',
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z"/>',
  inspection: '<path d="m4 8 2-4h12l2 4M3 11l1-3h16l1 3v7H3v-7Zm3 7v3m12-3v3M6 11h2m8 0h2m-8 3 2 2 3-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/>',
  file: '<path d="M13 2H5v20h14V8l-6-6Zm0 0v6h6M8 13h8m-8 4h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  alert: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 3 6 6M3 21l6-1L21 8a2 2 0 0 0-5-5L4 15l-1 6Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 0-10 7 7 0 0 1 13 2 4 4 0 0 1-1 8M12 12v10m-4-6 4-4 4 4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5"/>',
  heart: '<path d="M20 4a5 5 0 0 0-8 2 5 5 0 0 0-8-2c-6 5 3 12 8 17 5-5 14-12 8-17Z"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Zm7 1 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/>',
  sort: '<path d="M8 3v18m-4-4 4 4 4-4M16 3v18m-4-14 4-4 4 4"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
}
export function Icon({ name, size = 20, color = 'currentColor', className = '' }: { name: string; size?: number; color?: string; className?: string }) {
  const stroke = color === 'currentColor' ? '#72756f' : color
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.file}</svg>`
  return <Image className={`icon ${className}`} style={{ width: `${size}px`, height: `${size}px` }} src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} mode='aspectFit' />
}
