// Supplementary assertions only; does not execute all cases.
// Run from repository root with DB_NAME=<dedicated_seeded_name_test> node docs/blackbox/check-api-alignment.mjs
import request from 'supertest';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if (!process.env.DB_NAME?.endsWith('_test')) throw new Error('Requires dedicated DB_NAME ending in _test');
import {app} from '../../server/app.js';
import {pool} from '../../server/db.js';
const base='/api/v1', tag='rv'+randomBytes(4).toString('hex'), pass=randomBytes(12).toString('hex');
const admin=request.agent(app),user=request.agent(app), results=[];
const req=(client,method,path,body)=>client[method](base+path).send(body);
const run=async(id,name,f)=>{try{await f();results.push({id,name,status:'PASS'});}catch(e){results.push({id,name,status:'FAIL',error:e.message});}};
const csvPath=fileURLToPath(new URL('./test-cases.csv',import.meta.url));
const cases=JSON.parse(execFileSync('python',['-c',"import csv,json,sys; print(json.dumps(list(csv.DictReader(open(sys.argv[1],encoding='utf-8-sig')))))",csvPath],{encoding:'utf8'}));
let counter=0;
const fresh=()=>({username:tag+(++counter),fullName:'Review User',email:tag+counter+'@example.com',password:pass});
const bodyData=r=>r.body.data;
try {
 await req(admin,'post','/auth/login',{username:'admin',password:process.env.SEED_ADMIN_PASSWORD}).expect(200);
 const u=fresh(); await req(request(app),'post','/auth/register',u).expect(201);
 await req(user,'post','/auth/login',{username:u.username,password:pass}).expect(200);
 for(const c of cases.filter(c=>c['Yêu cầu']==='FR-01' && Number(c.ID.slice(4))<=33)) {
  await run(c.ID,c['Tên test case'],async()=>{
   let payload=fresh(), field,value, expected=Number(c['HTTP mong đợi']);
   const name=c['Tên test case'];
   if(name.includes(' = ')){
    [field,value]=name.split(' = ');value=JSON.parse(value);
    if(typeof value==='string'){
     const m=value.match(/^repeat\(a,(\d+)\)$/); if(m)value='a'.repeat(Number(m[1]));
     value=value.replaceAll('{RUN}',tag+counter);
    }
    if(value==='<OMIT>')delete payload[field];else payload[field]=value;
   }else if(name.startsWith('Thiếu '))delete payload[name.slice(6)];
   else if(name==='Đăng ký trùng username')payload.username=u.username;
   else if(name==='Đăng ký trùng email')payload.email=u.email;
   else if(name==='Chèn role ADMIN khi đăng ký')payload.role='ADMIN';
   const res=await req(request(app),'post','/auth/register',payload);
   assert.equal(res.status,expected);
   assert.equal(res.body.success,expected===201);
   if(expected===201){
    const d=bodyData(res);assert.equal(d.role,'USER');
    for(const key of ['username','fullName','email'])assert.equal(d[key],payload[key]||null);
    assert.ok(!('password' in d)&&!('passwordHash' in d));
    const list=bodyData(await req(admin,'get','/admin/users?q='+encodeURIComponent(payload.username)).expect(200));
    assert.ok(list.items.some(x=>x.id===d.id));
    if(field==='password')await req(request.agent(app),'post','/auth/login',{username:payload.username,password:payload.password}).expect(200);
    await req(admin,'delete','/admin/users/'+d.id).expect(204);
   } else {
    assert.equal(res.body.error.code,expected===409?'DUPLICATE':'VALIDATION_ERROR');
    const list=bodyData(await req(admin,'get','/admin/users?pageSize=100&q='+tag).expect(200));
    if(payload.username!==u.username)assert.ok(!list.items.some(x=>x.username===payload.username));
   }
  });
 }
 const b={bookCode:tag,title:'Review '+tag,author:tag,totalQuantity:2};
 const book=bodyData(await req(admin,'post','/admin/books',b).expect(201));
 for(const c of cases.filter(c=>/^BB2-0(8[4-9]|9[01])$/.test(c.ID)))await run(c.ID,c['Tên test case'],async()=>{
  const [field,raw]=c['Tên test case'].split(' = ');
  const payload={bookId:book.id,borrowDate:'2028-01-01',dueDate:'2029-01-01',[field]:JSON.parse(raw)};
  const res=await req(user,'post','/borrow-requests',payload).expect(400);assert.equal(res.body.error.code,'VALIDATION_ERROR');
  const history=bodyData(await req(user,'get','/me/borrow-requests').expect(200));assert.equal(history.total,0);
  assert.equal(bodyData(await req(user,'get','/books/'+book.id).expect(200)).availableQuantity,2);
 });
 await run('OBS-SORT','newest vẫn theo tạo mới sau sửa sách cũ',async()=>{
  const cat=tag+'SORT';
  const b1={bookCode:tag+'old',title:'Old '+tag,author:tag,totalQuantity:1,category:cat};
  const first=bodyData(await req(admin,'post','/admin/books',b1).expect(201));
  const second=bodyData(await req(admin,'post','/admin/books',{...b1,bookCode:tag+'new',title:'New '+tag}).expect(201));
  await req(admin,'put','/admin/books/'+first.id,{...b1,title:'Recently edited '+tag}).expect(200);
  const list=bodyData(await req(user,'get','/books?category='+cat+'&sort=newest').expect(200));
  assert.deepEqual(list.items.map(x=>x.id),[second.id,first.id]);
  await req(admin,'delete','/admin/books/'+first.id).expect(204);await req(admin,'delete','/admin/books/'+second.id).expect(204);
 });
 await run('OBS-EMAIL-LOGIN','API đăng nhập bằng email dài hơn 64',async()=>{
  const d=fresh();d.email='a'.repeat(60)+'@'+tag+'.example.com';
  const newUser=bodyData(await req(admin,'post','/admin/users',d).expect(201));
  await req(request.agent(app),'post','/auth/login',{username:d.email,password:pass}).expect(200);
  await req(admin,'delete','/admin/users/'+newUser.id).expect(204);
 });
 await req(admin,'delete','/admin/books/'+book.id).expect(204);
 const current=bodyData(await req(user,'get','/me').expect(200));await req(admin,'delete','/admin/users/'+current.id).expect(204);
} finally {
 await pool.end();writeFileSync(new URL('./evidence/api-review.json',import.meta.url),JSON.stringify({timestamp:new Date().toISOString(),database:process.env.DB_NAME,results},null,2));
 console.log(JSON.stringify({passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,results},null,2));
 if(results.some(x=>x.status==='FAIL'))process.exitCode=1;
}
