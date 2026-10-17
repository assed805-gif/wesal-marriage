const {crypto,reply,hash,checkOrigin,parse,db}=require('./_shared.cjs');
const marital={'أعزب / عزباء':'single','متزوج / متزوجة':'married','مطلق / مطلقة':'divorced','أرمل / أرملة':'widowed'};
const residence={'مواطن / مواطنة':'citizen','مقيم / مقيمة':'resident','زائر / زائرة':'visitor','أخرى':'other'};
const trim=(v,max=150)=>String(v??'').trim().slice(0,max);
exports.handler=async e=>{
 if(e.httpMethod!=='POST')return reply(405,{error:'method'});
 if(!checkOrigin(e))return reply(403,{error:'origin'});
 try {
 const v=parse(e);
 if(v.website)return reply(400,{error:'invalid_form'});
 const name=trim(v.name),phone=trim(v.phone,40),age=Number(v.age),children=Number(v.children);
 if(name.length<2||name.length>150||!Number.isInteger(age)||age<18||age>100||!['YE','SA'].includes(v.country)||!['عروس','عريس'].includes(v.seeking)||!marital[v.status]||!residence[v.residency]||!Number.isInteger(children)||children<0||children>30||phone.length<7||phone.length>30||!v.agree||!v.privacyConsent||!v.termsAccepted)return reply(400,{error:'invalid_form'});
 if(trim(v.region).length<1||trim(v.nationality).length<2||trim(v.area).length<1||trim(v.prefs,1501).length>1500)return reply(400,{error:'invalid_form'});
 const min=Number(v.preferred_age_min),max=Number(v.preferred_age_max);
 if(!Number.isInteger(min)||!Number.isInteger(max)||min<18||max>100||min>max)return reply(400,{error:'invalid_form'});
 const token=crypto.randomBytes(32).toString('base64url');
 const now=new Date().toISOString();
 const rows=await db('wesal_requests',{method:'POST',prefer:'return=representation',body:{
 applicant_type:v.seeking==='عروس'?'seeking_bride':'seeking_groom',full_name:name,age_years:age,nationality:trim(v.nationality,80),residence_country:v.country,region:trim(v.region,120),city:trim(v.area,120),residence_status:residence[v.residency],occupation:trim(v.job,150)||null,marital_status:marital[v.status],children_count:children,phone,preferred_partner:{age_min:min,age_max:max,height:trim(v.preferred_height,100),country:trim(v.preferred_country,70),nationality:trim(v.preferred_nationality,80),marital_status:trim(v.preferred_status,100),accept_children:trim(v.preferred_children,40),origin:trim(v.preferred_origin,100),notes:trim(v.prefs,1500)},notes:null,privacy_consent_at:now,terms_accepted_at:now,status:'awaiting_payment',tracking_token_hash:hash(token)}});
 if(!Array.isArray(rows)||!rows[0]?.reference_code)throw Error('database_error');
 return reply(201,{number:rows[0].reference_code,token,status:'awaiting_payment'});
 }catch(err){console.error('register',err.message);return reply(err.message==='too_large'?413:503,{error:'temporarily_unavailable'})}
};
