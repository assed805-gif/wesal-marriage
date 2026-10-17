const {reply,secure,db}=require('./_shared.cjs');
exports.handler=async e=>{if(e.httpMethod!=='GET')return reply(405,{error:'method'});if(!secure(e))return reply(401,{error:'unauthorized'});
 try {const rows=await db('wesal_requests',{query:'?select=id,reference_code,applicant_type,full_name,age_years,residence_country,region,city,nationality,residence_status,marital_status,children_count,occupation,phone,preferred_partner,status,created_at&order=created_at.desc&limit=100'});return reply(200,{rows})}
 catch(_){return reply(503,{error:'temporarily_unavailable'})}};
