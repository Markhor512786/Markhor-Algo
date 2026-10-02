// Standalone Android/local-first API adapter. No Node server required.
const DB_KEY='mobile_shop_erp_local_v1';
const USER_KEY='mobile_shop_erp_user_v1';
const SHOP_KEY='mobile_shop_erp_shop_v1';
const now=()=>new Date().toISOString();
const dateOnly=()=>now().slice(0,10);
const seed=()=>({mobiles:[],accessories:[],customers:[],sales:[],expenses:[],audit:[],seq:{mobile:1,accessory:1,customer:1,sale:1,expense:1,audit:1}});
const load=()=>{try{return normalize(JSON.parse(localStorage.getItem(DB_KEY))||seed())}catch{return seed()}};
const normalize=db=>({...seed(),...db,seq:{...seed().seq,...(db?.seq||{})},expenses:db?.expenses||[],audit:db?.audit||[]});
const save=db=>localStorage.setItem(DB_KEY,JSON.stringify(normalize(db)));
const audit=(action,detail='')=>{const db=normalize(load());db.audit.push({id:db.seq.audit++,action,detail,at:now()});localStorage.setItem(DB_KEY,JSON.stringify(db));};
const ok=data=>Promise.resolve({data:{success:true,data}});
const fail=(msg,status=400)=>{const e=new Error(msg);e.response={status,data:{success:false,error:msg}};return Promise.reject(e)};
const num=v=>Number(v||0);
const contains=(v,q)=>String(v??'').toLowerCase().includes(String(q??'').toLowerCase());
const paginate=(rows,p={})=>{const page=Number(p.page||1),limit=Number(p.limit||50),start=(page-1)*limit;return {rows:rows.slice(start,start+limit),pagination:{total:rows.length,page,limit,totalPages:Math.ceil(rows.length/limit)||1}}};
const user=()=>{try{return JSON.parse(localStorage.getItem(USER_KEY))||{username:'admin',password:'admin123',fullName:'Administrator',role:'admin'}}catch{return {username:'admin',password:'admin123',fullName:'Administrator',role:'admin'}}};
const storeUser=u=>localStorage.setItem(USER_KEY,JSON.stringify(u));
if(!localStorage.getItem(USER_KEY)) storeUser({id:1,username:'admin',password:'admin123',fullName:'Administrator',role:'admin'});

export const shopAPI={
 get:()=>{let s;try{s=JSON.parse(localStorage.getItem(SHOP_KEY))}catch{};return ok(s||{shopName:'Mobile Shop',phone:'',email:'',address:'',currency:'Rs',logo:''})},
 save:data=>{const s={shopName:String(data.shopName||'Mobile Shop'),phone:String(data.phone||''),email:String(data.email||''),address:String(data.address||''),currency:'Rs',logo:data.logo||''};localStorage.setItem(SHOP_KEY,JSON.stringify(s));return ok(s)}
};

export const authAPI={
 login:({username,password})=>{const u=user();return username===u.username&&password===u.password?ok({user:{id:1,username:u.username,fullName:u.fullName,role:u.role},token:'local-device-token'}):fail('Invalid username or password',401)},
 getCurrentUser:()=>{const u=user();return ok({id:1,username:u.username,fullName:u.fullName,role:u.role})},
 changePassword:({currentPassword,newPassword})=>{const u=user();if(currentPassword!==u.password)return fail('Current password is incorrect');storeUser({...u,password:newPassword});audit('PASSWORD_CHANGED','Account password updated');return ok({message:'Password changed'})}
};

export const mobileAPI={
 getAll:(p={})=>{let r=[...load().mobiles].reverse();if(p.status&&p.status!=='all')r=r.filter(x=>x.status===p.status);if(p.brand)r=r.filter(x=>x.brand===p.brand);if(p.search)r=r.filter(x=>contains(x.brand,p.search)||contains(x.model,p.search)||contains(x.imei,p.search));const z=paginate(r,p);return ok({mobiles:z.rows,pagination:z.pagination})},
 getById:id=>{const x=load().mobiles.find(x=>x.id==id);return x?ok(x):fail('Mobile not found',404)},
 getByIMEI:imei=>{const x=load().mobiles.find(x=>x.imei===imei);return x?ok(x):fail('Mobile with this IMEI not found',404)},
 create:data=>{const db=load();const imei=String(data.imei||'').replace(/\D/g,'');if(!imei)return fail('IMEI is required');if(db.mobiles.some(x=>x.imei===imei))return fail('This IMEI already exists in the system');if(num(data.sellingPrice)<num(data.purchasePrice))return fail('Selling price must be greater than or equal to purchase price');const x={...data,id:db.seq.mobile++,imei,status:data.status||'in_stock',purchaseDate:data.purchaseDate||dateOnly(),createdAt:now(),updatedAt:now()};db.mobiles.push(x);save(db);audit('MOBILE_ADDED',x.brand+' '+x.model+' · IMEI '+x.imei);return ok(x)},
 update:(id,data)=>{const db=load(),i=db.mobiles.findIndex(x=>x.id==id);if(i<0)return fail('Mobile not found',404);const imei=String(data.imei??db.mobiles[i].imei).replace(/\D/g,'');if(db.mobiles.some((x,j)=>j!==i&&x.imei===imei))return fail('This IMEI already exists in the system');db.mobiles[i]={...db.mobiles[i],...data,imei,updatedAt:now()};save(db);return ok(db.mobiles[i])},
 delete:id=>{const db=load(),i=db.mobiles.findIndex(x=>x.id==id);if(i<0)return fail('Mobile not found',404);if(db.mobiles[i].status==='sold')return fail('Cannot delete sold mobiles. This would break sale records.',403);db.mobiles.splice(i,1);save(db);return ok({message:'Mobile deleted'})},
 getBrands:()=>ok([...new Set(load().mobiles.map(x=>x.brand).filter(Boolean))])
};

export const accessoryAPI={
 getAll:(p={})=>{let r=[...load().accessories].reverse();if(p.category&&p.category!=='all')r=r.filter(x=>x.category===p.category);if(p.search)r=r.filter(x=>contains(x.name,p.search)||contains(x.category,p.search)||contains(x.brand,p.search));const z=paginate(r,p);return ok({accessories:z.rows,pagination:z.pagination})},
 getById:id=>{const x=load().accessories.find(x=>x.id==id);return x?ok(x):fail('Accessory not found',404)},
 create:data=>{const db=load();if(num(data.sellingPrice)<num(data.purchasePrice))return fail('Selling price must be greater than or equal to purchase price');const x={...data,id:db.seq.accessory++,quantity:num(data.quantity),reorderLevel:num(data.reorderLevel??5),createdAt:now(),updatedAt:now()};db.accessories.push(x);save(db);audit('ACCESSORY_ADDED',x.name);return ok(x)},
 update:(id,data)=>{const db=load(),i=db.accessories.findIndex(x=>x.id==id);if(i<0)return fail('Accessory not found',404);db.accessories[i]={...db.accessories[i],...data,quantity:num(data.quantity??db.accessories[i].quantity),reorderLevel:num(data.reorderLevel??db.accessories[i].reorderLevel),updatedAt:now()};save(db);return ok(db.accessories[i])},
 delete:id=>{const db=load(),i=db.accessories.findIndex(x=>x.id==id);if(i<0)return fail('Accessory not found',404);db.accessories.splice(i,1);save(db);return ok({message:'Accessory deleted'})},
 getLowStock:()=>ok(load().accessories.filter(x=>num(x.quantity)<=num(x.reorderLevel)).sort((a,b)=>a.quantity-b.quantity)),
 getCategories:()=>ok([...new Set(load().accessories.map(x=>x.category).filter(Boolean))])
};

export const customerAPI={
 getAll:(p={})=>{let r=[...load().customers].reverse();if(p.search)r=r.filter(x=>contains(x.name,p.search)||contains(x.phone,p.search)||contains(x.email,p.search));const z=paginate(r,p);return ok({customers:z.rows,pagination:z.pagination})},
 getById:id=>{const x=load().customers.find(x=>x.id==id);return x?ok(x):fail('Customer not found',404)},
 create:data=>{const db=load(),x={...data,id:db.seq.customer++,createdAt:now(),updatedAt:now()};db.customers.push(x);save(db);audit('CUSTOMER_ADDED',x.name+' · '+(x.phone||''));return ok(x)},
 update:(id,data)=>{const db=load(),i=db.customers.findIndex(x=>x.id==id);if(i<0)return fail('Customer not found',404);db.customers[i]={...db.customers[i],...data,updatedAt:now()};save(db);return ok(db.customers[i])},
 delete:id=>{const db=load(),i=db.customers.findIndex(x=>x.id==id);if(i<0)return fail('Customer not found',404);db.customers.splice(i,1);save(db);return ok({message:'Customer deleted'})}
};

const decorateSale=(s,db)=>({...s,customer:db.customers.find(c=>c.id==s.customerId)||null,creator:{id:1,username:user().username,fullName:user().fullName}});
export const saleAPI={
 getAll:(p={})=>{const db=load();let r=[...db.sales].reverse();if(p.startDate)r=r.filter(x=>x.saleDate>=p.startDate);if(p.endDate)r=r.filter(x=>x.saleDate<=p.endDate);const z=paginate(r,p);return ok({sales:z.rows.map(x=>decorateSale(x,db)),pagination:z.pagination})},
 getById:id=>{const db=load(),x=db.sales.find(x=>x.id==id);return x?ok(decorateSale(x,db)):fail('Sale not found',404)},
 create:data=>{const db=load(),items=[];let total=0,profit=0;for(const it of data.items||[]){if(it.itemType==='mobile'){const m=db.mobiles.find(x=>x.id==it.itemId);if(!m||m.status!=='in_stock')return fail('Selected mobile is not available');m.status='sold';m.updatedAt=now();const price=num(it.price||m.sellingPrice);total+=price;profit+=price-num(m.purchasePrice);items.push({...it,quantity:1,price,name:it.name||m.brand+' '+m.model});}else{const a=db.accessories.find(x=>x.id==it.itemId),q=num(it.quantity);if(!a||a.quantity<q)return fail('Insufficient accessory stock');a.quantity-=q;a.updatedAt=now();const price=num(it.price||a.sellingPrice);total+=price*q;profit+=(price-num(a.purchasePrice))*q;items.push({...it,quantity:q,price,name:it.name||a.name});}}const s={id:db.seq.sale++,saleDate:data.saleDate||dateOnly(),customerId:data.customerId?Number(data.customerId):null,totalAmount:total,profit,paymentMethod:data.paymentMethod||'cash',notes:data.notes||'',items,createdBy:1,createdAt:now(),updatedAt:now()};db.sales.push(s);save(db);audit('SALE_CREATED','Sale #'+s.id+' · Rs '+s.totalAmount);return ok(decorateSale(s,db))},
 refund:id=>{const db=load(),s=db.sales.find(x=>x.id==id);if(!s)return fail('Sale not found',404);if(s.refundedAt)return fail('Sale already refunded');for(const it of s.items||[]){if(it.itemType==='mobile'){const m=db.mobiles.find(x=>x.id==it.itemId);if(m)m.status='in_stock';}else{const a=db.accessories.find(x=>x.id==it.itemId);if(a)a.quantity=num(a.quantity)+num(it.quantity);}}s.refundedAt=now();s.status='refunded';save(db);audit('SALE_REFUNDED','Sale #'+s.id+' · Rs '+s.totalAmount);return ok(decorateSale(s,db))},
 delete:id=>{const db=load(),i=db.sales.findIndex(x=>x.id==id);if(i<0)return fail('Sale not found',404);db.sales.splice(i,1);save(db);audit('SALE_DELETED','Sale #'+id);return ok({message:'Sale deleted'})}
};

const inRange=(s,p={})=>(!p.startDate||s.saleDate>=p.startDate)&&(!p.endDate||s.saleDate<=p.endDate);
export const reportAPI={
 getDashboard:()=>{const db=load(),today=dateOnly(),tod=db.sales.filter(s=>s.saleDate===today),weekStart=new Date();weekStart.setDate(weekStart.getDate()-6);const ws=weekStart.toISOString().slice(0,10),by={};db.sales.filter(s=>s.saleDate>=ws).forEach(s=>{by[s.saleDate]??={saleDate:s.saleDate,total:0,profit:0};by[s.saleDate].total+=num(s.totalAmount);by[s.saleDate].profit+=num(s.profit)});return ok({today:{sales:tod.reduce((a,s)=>a+num(s.totalAmount),0),profit:tod.reduce((a,s)=>a+num(s.profit),0)},inventory:{mobilesInStock:db.mobiles.filter(x=>x.status==='in_stock').length,mobilesSold:db.mobiles.filter(x=>x.status==='sold').length,lowStockAccessories:db.accessories.filter(x=>num(x.quantity)<=num(x.reorderLevel)).length,totalValue:db.mobiles.filter(x=>x.status==='in_stock').reduce((a,x)=>a+num(x.purchasePrice),0)+db.accessories.reduce((a,x)=>a+num(x.purchasePrice)*num(x.quantity),0)},weeklySales:Object.values(by).sort((a,b)=>b.saleDate.localeCompare(a.saleDate))})},
 getSalesReport:(p={})=>{const sales=load().sales.filter(s=>inRange(s,p)),by={};sales.forEach(s=>{by[s.saleDate]??={saleDate:s.saleDate,totalSales:0,totalProfit:0,transactionCount:0};by[s.saleDate].totalSales+=num(s.totalAmount);by[s.saleDate].totalProfit+=num(s.profit);by[s.saleDate].transactionCount++});return ok({summary:{totalSales:sales.reduce((a,s)=>a+num(s.totalAmount),0),totalProfit:sales.reduce((a,s)=>a+num(s.profit),0),transactionCount:sales.length},dailyBreakdown:Object.values(by).sort((a,b)=>b.saleDate.localeCompare(a.saleDate))})},
 getProfitReport:(p={})=>reportAPI.getSalesReport(p),
 getInventoryReport:()=>{const db=load();return ok({mobiles:db.mobiles,accessories:db.accessories})}
};

export const globalSearchAPI=(query)=>{const db=load(),q=String(query||'').trim();if(!q)return [];const out=[];db.mobiles.filter(x=>[x.brand,x.model,x.imei,x.color,x.storage].some(v=>contains(v,q))).forEach(x=>out.push({type:'Mobile',title:x.brand+' '+x.model,detail:'IMEI: '+x.imei,path:'/mobiles'}));db.accessories.filter(x=>[x.name,x.category,x.brand].some(v=>contains(v,q))).forEach(x=>out.push({type:'Accessory',title:x.name,detail:x.category,path:'/accessories'}));db.customers.filter(x=>[x.name,x.phone,x.email].some(v=>contains(v,q))).forEach(x=>out.push({type:'Customer',title:x.name,detail:x.phone,path:'/customers'}));db.sales.filter(x=>contains(x.id,q)||contains(x.saleDate,q)).forEach(x=>out.push({type:'Sale',title:'Sale #'+x.id,detail:x.saleDate+' · Rs '+x.totalAmount,path:'/sales'}));return out.slice(0,20)};

export default {local:true};


export const expenseAPI={
 getAll:()=>ok([...load().expenses].reverse()),
 create:data=>{const db=load(),x={id:db.seq.expense++,date:data.date||dateOnly(),category:String(data.category||'Other'),description:String(data.description||''),amount:num(data.amount),createdAt:now()};if(x.amount<=0)return fail('Expense amount must be greater than zero');db.expenses.push(x);save(db);audit('EXPENSE_ADDED',x.category+' · Rs '+x.amount);return ok(x)},
 delete:id=>{const db=load(),i=db.expenses.findIndex(x=>x.id==id);if(i<0)return fail('Expense not found',404);const x=db.expenses[i];db.expenses.splice(i,1);save(db);audit('EXPENSE_DELETED',x.category+' · Rs '+x.amount);return ok({message:'Expense deleted'})}
};

export const auditAPI={getAll:()=>ok([...load().audit].reverse().slice(0,500))};

export const backupAPI={
 export:()=>({version:1,exportedAt:now(),shop:JSON.parse(localStorage.getItem(SHOP_KEY)||'null'),user:{username:user().username,fullName:user().fullName,role:user().role},data:load()}),
 import:payload=>{if(!payload||!payload.data)return fail('Invalid backup file');save(normalize(payload.data));if(payload.shop)localStorage.setItem(SHOP_KEY,JSON.stringify(payload.shop));audit('BACKUP_RESTORED','Backup restored');return ok({message:'Backup restored'})}
};

export const historyAPI={
 customer:id=>{const db=load();return ok(db.sales.filter(s=>s.customerId==id).map(s=>decorateSale(s,db)).reverse())},
 imei:imei=>{const db=load(),m=db.mobiles.find(x=>x.imei===String(imei));if(!m)return ok(null);const sale=db.sales.find(s=>(s.items||[]).some(i=>i.itemType==='mobile'&&i.itemId==m.id));return ok({mobile:m,sale:sale?decorateSale(sale,db):null})}
};