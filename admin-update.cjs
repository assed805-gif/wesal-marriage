const {reply,secure,parse,db}=require('./_shared.cjs');
exports.handler=async e=>{if(e.httpMethod!=='POST')return reply(405,{error:'method'});if(!secure(e))return reply(401,{error:'unauthorized'});
 try{const b=parse(e),allow=['awaiting_payment','payment_review','active_search','matched','closed','rejected'];if(!/^[0-9a-f-]{36}$/i.test(String(b.id||''))||!allow.includes(b.status))return reply(400,{error:'invalid'});
 await db('wesal_requests',{method:'PATCH',query:'?id=eq.'+encodeURIComponent(b.id),body:{status:b.status},prefer:'return=minimal'});return reply(200,{ok:true})}
 catch(_){return reply(503,{error:'temporarily_unavailable'})}};
