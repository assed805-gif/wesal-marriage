const crypto=require('node:crypto');
const HEAD={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(status,body,extra={})=>({statusCode:status,headers:{...HEAD,...extra},body:JSON.stringify(body)});
const hash=x=>crypto.createHash('sha256').update(String(x)).digest('hex');
const safeEqual=(a,b)=>{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)};
const checkOrigin=e=>{const origin=e.headers?.origin||e.headers?.Origin;const allow=process.env.PUBLIC_ORIGIN;return !origin||(!!allow&&origin===allow)};
function parse(e){if((e.body||'').length>25000)throw Error('too_large');return JSON.parse(e.body||'{}')}
async function db(table,{method='GET',query='',body,prefer}={}){
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)throw Error('backend_not_configured');
 const r=await fetch(base.replace(/\/$/,'')+'/rest/v1/'+table+query,{method,
 headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:'Bearer '+key}),'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},
 ...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok){console.error('Database failure',r.status);throw Error('database_error')}
 const result=await r.text();return result?JSON.parse(result):null;
}
function session(e){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)return false;const raw=(e.headers?.cookie||e.headers?.Cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('wesal_admin='));if(!raw)return false;const parts=raw.slice('wesal_admin='.length).split('.');if(parts.length!==2)return false;const valid=crypto.createHmac('sha256',secret).update(parts[0]).digest('base64url');if(!safeEqual(parts[1],valid))return false;const exp=Number(Buffer.from(parts[0],'base64url').toString());return Number.isFinite(exp)&&exp>Date.now()}
function secure(e){return session(e)&&checkOrigin(e)}
module.exports={crypto,reply,hash,safeEqual,checkOrigin,parse,db,session,secure};
