// Reproduces observed UI mismatch, not a passing acceptance test for email login.
// Start server with dedicated DB_NAME=<name_test> and PORT=3001 before running.
import 'dotenv/config';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
if (!process.env.DB_NAME?.endsWith('_test')) throw new Error('Requires dedicated DB_NAME ending in _test and a server using that database');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext();const page=await context.newPage();const base=process.env.REVIEW_BASE_URL || 'http://127.0.0.1:3001';
const tag='ui'+randomBytes(4).toString('hex'),email='a'.repeat(60)+'@'+tag+'.example.com',password=randomBytes(12).toString('hex');
let userId;const findings=[];
const loginAdmin=async()=>{const r=await context.request.post(base+'/api/v1/auth/login',{data:{username:'admin',password:process.env.SEED_ADMIN_PASSWORD}});assert.equal(r.status(),200);};
try{
 await loginAdmin();
 const create=await context.request.post(base+'/api/v1/admin/users',{data:{username:tag,fullName:'UI review',email,password}});assert.equal(create.status(),201);userId=(await create.json()).data.id;
 await context.request.post(base+'/api/v1/auth/logout');
 const apiLogin=await context.request.post(base+'/api/v1/auth/login',{data:{username:email,password}});assert.equal(apiLogin.status(),200);
 await page.goto(base);await page.getByRole('heading',{name:'Khám phá sách.'}).waitFor();
 const sortLabel=await page.getByLabel('Sắp xếp').locator('option[value="newest"]').innerText();
 findings.push({id:'WEB-01',observation:'Nhãn sort newest',label:sortLabel});
 await context.request.post(base+'/api/v1/auth/logout');await page.reload();await page.getByRole('heading',{name:'Thật vui khi gặp lại bạn.'}).waitFor();
 const field=page.getByRole('textbox',{name:'Tên đăng nhập'});await field.pressSequentially(email);
 const actualLength=(await field.inputValue()).length;assert.equal(actualLength,64);
 await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
 const response=page.waitForResponse(r=>r.url().endsWith('/api/v1/auth/login')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();const r=await response;assert.equal(r.status(),401);
 findings.push({id:'WEB-02',observation:'Email hợp lệ đăng nhập API được nhưng form cắt còn 64 ký tự',emailLength:email.length,uiMaxLength:await field.getAttribute('maxlength'),inputActualLength:actualLength,apiLoginStatus:apiLogin.status(),uiLoginStatus:r.status(),verdict:'CONFIRMED_MISMATCH'});
}finally{
 if(userId){await loginAdmin();const del=await context.request.delete(base+'/api/v1/admin/users/'+userId);assert.equal(del.status(),204);}
 await browser.close();writeFileSync(new URL('./evidence/ui-review.json',import.meta.url),JSON.stringify({timestamp:new Date().toISOString(),findings},null,2));console.log(JSON.stringify(findings,null,2));
}
