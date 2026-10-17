const {reply,hash,checkOrigin,parse,db,safeEqual}=require('./_shared.cjs');
exports.handler=async e=>{if(e.httpMethod!=='POST')return reply(405,{error:'method'});if(!checkOrigin(e))return reply(403,{error:'origin'});
 try{const b=parse(e);if(!/^WSL-[0-9A-F]{16}$/.test(String(b.number||''))||String(b.token||'').length<30||String(b.token||'').length>200)return reply(400,{error:'invalid_credentials'});
 const rows=await db('wesal_requests',{query:'?select=reference_code,status,tracking_token_hash,created_at&reference_code=eq.'+encodeURIComponent(b.number)+'&limit=1'});
 if(!rows?.length||!rows[0].tracking_token_hash||!safeEqual(hash(b.token),rows[0].tracking_token_hash))return reply(404,{error:'not_found'});
 return reply(200,{number:rows[0].reference_code,status:rows[0].status,created_at:rows[0].created_at});
 }catch(_){return reply(503,{error:'temporarily_unavailable'})}
};
