"""Generate OpenAPI/Postman artifacts from an explicit versioned contract. No runtime introspection."""
import json
from pathlib import Path
S=lambda max=255:dict(type='string',minLength=1,maxLength=max)
I=dict(type='integer',minimum=1)
user_props=dict(id=I,username=S(64),fullName=S(150),email=dict(type=['string','null'],format='email'),role=dict(type='string',enum=['USER','ADMIN']),createdAt=dict(type='string'))
book_props=dict(id=I,bookCode=S(50),title=S(),author=S(),category=dict(type=['string','null']),description=dict(type=['string','null']),totalQuantity=dict(type='integer',minimum=0),availableQuantity=dict(type='integer',minimum=0),createdAt=dict(type='string'))
schemas={
'User':dict(type='object',properties=user_props),
'Book':dict(type='object',properties=book_props),
'Register':dict(type='object',additionalProperties=False,required=['username','fullName','password'],properties=dict(username={**S(64),'pattern':'^[a-zA-Z0-9_.-]+$'},fullName=S(150),email=dict(type=['string','null'],description='Optional; empty string is treated as null'),password=dict(type='string',minLength=8,maxLength=128,writeOnly=True))),
'Login':dict(type='object',additionalProperties=False,required=['username','password'],properties=dict(username=S(254),password=dict(type='string',minLength=1,maxLength=128,writeOnly=True))),
'BookWrite':dict(type='object',additionalProperties=False,required=['bookCode','title','author','totalQuantity'],properties={k:v for k,v in book_props.items() if k not in ['id','createdAt']},description='availableQuantity is optional. Create defaults to totalQuantity. Update computes total minus existing loans and rejects a conflicting availableQuantity.'),
'BorrowCreate':dict(type='object',additionalProperties=False,required=['bookId','borrowDate','dueDate'],properties=dict(bookId=I,borrowDate=dict(type='string',format='date'),dueDate=dict(type='string',format='date')),description='dueDate must be strictly later than borrowDate. userId/status/reviewedBy are rejected.'),
'BorrowDecision':dict(type='object',additionalProperties=False,required=['decision'],properties=dict(decision=dict(type='string',enum=['APPROVE','DENY']),note=dict(type='string',maxLength=500))),
'BorrowRequest':dict(type='object',properties=dict(id=I,book=dict(type='object',properties=dict(id=I,title=S(),bookCode=S(50))),user=dict(type='object',properties=dict(id=I,fullName=S(150),username=S(64))),borrowDate=dict(type='string',format='date'),dueDate=dict(type='string',format='date'),status=dict(type='string',enum=['PENDING','APPROVED','DENIED']),reviewedBy=dict(type=['integer','null']),reviewedAt=dict(type=['string','null']),decisionNote=dict(type=['string','null']),createdAt=dict(type='string'))),
'Error':dict(type='object',required=['success','error','requestId'],properties=dict(success=dict(type='boolean',const=False),error=dict(type='object',properties=dict(code=S(),message=S(10000),details=dict(type='array',items=dict(type='object',properties=dict(field=S(),reason=S()))))),requestId=S()))
}
schemas['UserCreate']={**schemas['Register'],'properties':{**schemas['Register']['properties'],'role':dict(type='string',enum=['USER','ADMIN'])}}
schemas['UserUpdate']={**schemas['UserCreate'],'required':['username','fullName'],'description':'Password is optional; omitting preserves existing hash. Role/password change invalidates existing sessions. Self-demotion/last-admin demotion is rejected.'}
ref=lambda name: {'$ref':'#/components/schemas/'+name}
envelope=lambda model:dict(type='object',properties=dict(success=dict(type='boolean',const=True),data=model,meta=dict(type='object',properties=dict(requestId=S()))))
paged=lambda name:dict(type='object',properties=dict(items=dict(type='array',items=ref(name)),total=dict(type='integer'),page=I,pageSize=I,totalPages=dict(type='integer')))
ops=[
('post','/auth/register','FR-01 · Đăng ký','public','Register',201,ref('User')),
('post','/auth/login','FR-02 · Đăng nhập','public','Login',200,dict(type='object',properties=dict(user=ref('User')))),
('post','/auth/logout','FR-08 · Đăng xuất và thu hồi session','public',None,204,None),
('get','/me','FR-06 · Hồ sơ của chính mình','member',None,200,ref('User')),
('get','/books','FR-03 · Tìm kiếm sách','member',None,200,{**paged('Book'),'description':'Also returns categories: distinct non-empty category values.'}),
('get','/books/{id}','FR-04 · Chi tiết sách','member',None,200,ref('Book')),
('post','/borrow-requests','FR-05 · Gửi yêu cầu mượn','user','BorrowCreate',201,dict(type='object',properties=dict(id=I,bookId=I,borrowDate=dict(type='string'),dueDate=dict(type='string'),status=dict(const='PENDING')))),
('get','/me/borrow-requests','FR-07 · Lịch sử của chính mình','member',None,200,paged('BorrowRequest')),
('get','/admin/stats','FR-09 · Thống kê','admin',None,200,dict(type='object',properties={k:dict(type='integer',minimum=0) for k in ['totalBooks','totalCopies','availableCopies','totalUsers','totalRequests','pending','approved','denied']})),
('get','/admin/books','FR-10 · Danh sách sách','admin',None,200,paged('Book')),
('post','/admin/books','FR-10 · Tạo sách','admin','BookWrite',201,ref('Book')),
('put','/admin/books/{id}','FR-10 · Cập nhật sách','admin','BookWrite',200,ref('Book')),
('delete','/admin/books/{id}','FR-10 · Xóa sách không có lịch sử','admin',None,204,None),
('get','/admin/borrow-requests','FR-11 · Danh sách yêu cầu','admin',None,200,paged('BorrowRequest')),
('patch','/admin/borrow-requests/{id}','FR-11 · Duyệt/từ chối yêu cầu','admin','BorrowDecision',200,dict(type='object',properties=dict(id=I,status=dict(type='string'),reviewedBy=I))),
('get','/admin/users','FR-12 · Danh sách người dùng','admin',None,200,paged('User')),
('post','/admin/users','FR-12 · Tạo người dùng','admin','UserCreate',201,ref('User')),
('put','/admin/users/{id}','FR-12 · Cập nhật người dùng','admin','UserUpdate',200,ref('User')),
('delete','/admin/users/{id}','FR-12 · Xóa người dùng không có lịch sử','admin',None,204,None),
('get','/health','Kiểm tra DB readiness','public',None,200,dict(type='object',properties=dict(status=dict(const='ok'))))]
paths={}
for method,url,summary,auth,body,status,output in ops:
 errors={str(code):dict(description=desc,content={'application/json':{'schema':ref('Error')}}) for code,desc in [(400,'Validation / invalid request'),(401,'Unauthenticated'),(403,'Forbidden / origin rejected'),(404,'Not found'),(409,'Duplicate / state / inventory / FK conflict'),(429,'Auth rate limit'),(500,'Internal error') ]}
 operation=dict(summary=summary,description='Authorization: '+auth+'. Server-side session cookie. Mutation requests must be same-origin.',security=[] if auth=='public' else [{'sessionCookie':[]}],responses={str(status):dict(description='Success',**({'content':{'application/json':{'schema':envelope(output)}}} if output else {})),**errors})
 params=[]
 if '{id}' in url: params.append(dict(name='id',**{'in':'path'},required=True,schema=I))
 if method=='get' and url in ['/books','/admin/books','/me/borrow-requests','/admin/borrow-requests','/admin/users']:
  params.extend([dict(name='page',**{'in':'query'},schema=dict(type='integer',minimum=1,default=1)),dict(name='pageSize',**{'in':'query'},schema=dict(type='integer',minimum=1,maximum=100,default=12))])
  if 'borrow-requests' in url: params.append(dict(name='status',**{'in':'query'},schema=dict(type='string',enum=['','PENDING','APPROVED','DENIED'])))
  else: params.append(dict(name='q',**{'in':'query'},schema=dict(type='string',maxLength=255)))
  if 'books' in url: params.extend([dict(name='category',**{'in':'query'},schema=dict(type='string',maxLength=100)),dict(name='sort',**{'in':'query'},schema=dict(type='string',enum=['newest','title','available'],default='newest'))])
 if params:operation['parameters']=params
 if body:operation['requestBody']=dict(required=True,content={'application/json':dict(schema=ref(body))})
 paths.setdefault(url,{})[method]=operation
spec=dict(openapi='3.1.0',info=dict(title='Lá Thư Viện API',version='1.0.0',description='SRS baseline. See decisions.md for approved choices and remaining TBDs. Authentication uses cookie sessions, not Bearer JWT.'),servers=[dict(url='/api/v1')],paths=paths,components=dict(securitySchemes=dict(sessionCookie=dict(type='apiKey',**{'in':'cookie'},name='library_session')),schemas=schemas))
Path('docs/openapi.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
examples={
'Register':dict(username='{{newUsername}}',fullName='Nguyễn An',email='',password='{{newPassword}}'),
'Login':dict(username='{{username}}',password='{{password}}'),
'BookWrite':dict(bookCode='{{bookCode}}',title='Sách mới',author='Tác giả',category='Văn học',description='Giới thiệu sách',totalQuantity=5),
'BorrowCreate':dict(bookId='{{bookId}}',borrowDate='2026-10-16',dueDate='2026-10-30'),
'BorrowDecision':dict(decision='APPROVE',note='Mời bạn nhận sách'),
'UserCreate':dict(username='{{newUsername}}',fullName='Độc giả mới',password='{{newPassword}}',role='USER'),
'UserUpdate':dict(username='{{newUsername}}',fullName='Độc giả đã cập nhật',role='USER')}
items=[]
for method,url,title,auth,body,status,output in ops:
 parameter='requestId' if 'borrow-requests/{id}' in url else 'userId' if 'users/{id}' in url else 'bookId'
 req=dict(method=method.upper(),header=[],url='{{baseUrl}}'+url.replace('{id}','{{'+parameter+'}}'),description='Authorization: '+auth+'. Use the Postman cookie jar; run Login first.')
 if body:
  raw=json.dumps(examples[body],ensure_ascii=False,indent=2)
  if body=='BorrowCreate':raw=raw.replace('"{{bookId}}"','{{bookId}}')
  req['header']=[dict(key='Content-Type',value='application/json')];req['body']=dict(mode='raw',raw=raw,options=dict(raw=dict(language='json')))
 items.append(dict(name=title,request=req))
collection=dict(info=dict(name='Lá Thư Viện · SRS baseline',schema='https://schema.getpostman.com/json/collection/v2.1.0/collection.json'),variable=[dict(key=k,value=v) for k,v in dict(baseUrl='http://localhost:3000/api/v1',username='',password='',newUsername='',newPassword='',bookCode='BK-NEW',bookId='1',requestId='1',userId='1').items()],item=items)
Path('docs/postman_collection.json').write_text(json.dumps(collection,ensure_ascii=False,indent=2)+'\n')
