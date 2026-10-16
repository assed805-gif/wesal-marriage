const {crypto,reply,hash,safeEqual,checkOrigin,parse}=require('./_shared.cjs');
exports.handler=async e=>{if(e.httpMethod!=='POST')return reply(405,{error:'method'});if(!checkOrigin(e))return reply(403,{error:'origin'});
 try{const b=parse(e),email=process.env.ADMIN_EMAIL||'',password=process.env.ADMIN_PASSWORD||'',secret=process.env.ADMIN_SESSION_SECRET||'';
 if(!email||password.length<16||secret.length<32)return reply(503,{error:'not_configured'});
 if(!safeEqual(String(b.email||'').toLowerCase(),email.toLowerCase())||!safeEqual(hash(b.password||''),hash(password)))return reply(401,{error:'invalid_credentials'});
 const payload=Buffer.from(String(Date.now()+2*60*60*1000)).toString('base64url'),sig=crypto.createHmac('sha256',secret).update(payload).digest('base64url');
 return reply(200,{ok:true},{'Set-Cookie':`wesal_admin=${payload}.${sig}; Path=/.netlify/functions; HttpOnly; Secure; SameSite=Strict; Max-Age=7200`});
 }catch(_){return reply(400,{error:'invalid'})}
};
