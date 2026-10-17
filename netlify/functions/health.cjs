const {reply}=require('./_shared.cjs');
exports.handler=async e=>{
 if(e.httpMethod!=='GET')return reply(405,{error:'method'});
 return reply(200,{functions:true,configured:!!(process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY)),registration_live:false});
};
