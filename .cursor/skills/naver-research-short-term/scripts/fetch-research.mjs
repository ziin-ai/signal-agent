#!/usr/bin/env node
/**
 * Fetch Naver Pay Securities research list via mobile front-api.
 * Usage: node fetch-research.mjs [--date YYYY-MM-DD] [--category daily|company|...]
 */
import https from 'https';

const CATEGORIES = ['daily', 'company', 'industry', 'invest', 'economy', 'debenture'];
const CATEGORY_LABEL = {
  daily: '데일리',
  company: '종목분석',
  industry: '산업분석',
  invest: '투자전략',
  economy: '경제분석',
  debenture: '채권분석',
};

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse failed: ${data.slice(0, 200)}`));
          }
        });
      })
      .on('error', reject);
  });
}

function kstToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function shortTermScore(r) {
  const t = `${r.title} ${r.category} ${r.itemName || ''} ${r.researchCategory || ''}`;
  let score = 0;
  if (r.apiCategory === 'daily') score += 3;
  if (r.apiCategory === 'company') score += 2;
  if (r.apiCategory === 'industry') score += 1;
  if (r.apiCategory === 'invest') score += 1;
  if (/마감|morning|snapshot|데일리|weekly|시황|전략|특징|실적|목표가|매수|상향|촉매|프리미엄|급등|코스닥|반도체/i.test(t)) score += 2;
  if (/채권|bond|ESG snapshot|비상장|carbon/i.test(t)) score -= 2;
  const rc = parseInt(r.readCount || '0', 10);
  if (rc >= 3000) score += 1;
  return score;
}

function normalizeUrl(r) {
  if (r.endUrl) return r.endUrl.replace('m.stock.naver.com', 'stock.naver.com');
  return `https://stock.naver.com/research/${r.apiCategory}/${r.researchId}`;
}

const args = process.argv.slice(2);
let targetDate = null;
let onlyCategory = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--date' && args[i + 1]) targetDate = args[++i];
  if (args[i] === '--category' && args[i + 1]) onlyCategory = args[++i];
}

const requested = targetDate || kstToday();
const cats = onlyCategory ? [onlyCategory] : CATEGORIES;

const all = [];
for (const cat of cats) {
  const url = `https://m.stock.naver.com/front-api/research/list?category=${cat}&page=1&pageSize=50`;
  const data = await get(url);
  if (!data.result) continue;
  for (const r of data.result) {
    all.push({ ...r, apiCategory: cat, categoryLabel: CATEGORY_LABEL[cat] });
  }
}

let anchor = requested;
let picked = all.filter((r) => r.writeDate === anchor);
if (!picked.length) {
  const dates = [...new Set(all.map((r) => r.writeDate))].sort().reverse();
  anchor = dates[0] || requested;
  picked = all.filter((r) => r.writeDate === anchor);
}

picked.sort((a, b) => shortTermScore(b) - shortTermScore(a));

const dateCounts = {};
for (const r of all) dateCounts[r.writeDate] = (dateCounts[r.writeDate] || 0) + 1;

const output = {
  requestedDate: requested,
  anchorDate: anchor,
  isFallback: anchor !== requested,
  totalFetched: all.length,
  dateCounts,
  pickedCount: picked.length,
  reports: picked.map((r) => ({
    category: r.researchCategory,
    apiCategory: r.apiCategory,
    itemCode: r.itemCode,
    itemName: r.itemName,
    title: r.title,
    brokerName: r.brokerName,
    writeDate: r.writeDate,
    readCount: r.readCount,
    researchId: r.researchId,
    url: normalizeUrl(r),
    shortTermScore: shortTermScore(r),
  })),
};

console.log(JSON.stringify(output, null, 2));
