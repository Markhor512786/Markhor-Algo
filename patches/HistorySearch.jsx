import {useState} from 'react';
import {Search,Smartphone,UserRound} from 'lucide-react';
import {customerAPI,historyAPI} from '../../services/api';

export default function HistorySearch(){
  const [mode,setMode]=useState('imei');
  const [q,setQ]=useState('');
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);

  const run=async e=>{
    e?.preventDefault();
    if(!q.trim())return;
    setBusy(true);setResult(null);
    try{
      if(mode==='imei'){
        const r=await historyAPI.imei(q.trim());
        setResult({mode:'imei',data:r.data.data});
      }else{
        const r=await customerAPI.getAll({search:q.trim(),limit:50});
        const customers=r.data.data.customers||[];
        const detailed=[];
        for(const c of customers){
          const h=await historyAPI.customer(c.id);
          detailed.push({customer:c,sales:h.data.data});
        }
        setResult({mode:'customer',data:detailed});
      }
    }finally{setBusy(false)}
  };

  return <div className="max-w-5xl mx-auto">
    <div className="mb-6"><h2 className="text-2xl font-extrabold">Customer & IMEI History</h2><p className="text-slate-500">Trace customer purchases or a handset from IMEI to invoice.</p></div>
    <div className="card mb-6"><div className="card-body">
      <div className="flex gap-2 mb-4">
        <button onClick={()=>{setMode('imei');setResult(null)}} className={`btn ${mode==='imei'?'btn-primary':'btn-secondary'} flex gap-2`}><Smartphone className="w-4 h-4"/>IMEI History</button>
        <button onClick={()=>{setMode('customer');setResult(null)}} className={`btn ${mode==='customer'?'btn-primary':'btn-secondary'} flex gap-2`}><UserRound className="w-4 h-4"/>Customer History</button>
      </div>
      <form onSubmit={run} className="flex gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 text-blue-400"/><input className="input pl-9" value={q} onChange={e=>setQ(e.target.value)} placeholder={mode==='imei'?'Enter exact IMEI...':'Search customer name, phone or email...'}/></div><button className="btn btn-primary">{busy?'Searching...':'Search'}</button></form>
    </div></div>
    {result?.mode==='imei'&&<IMEIResult data={result.data}/>}
    {result?.mode==='customer'&&<CustomerResults rows={result.data}/>}
  </div>
}
function IMEIResult({data}){if(!data)return <div className="card"><div className="card-body text-center text-slate-400 py-10">No IMEI record found.</div></div>;const m=data.mobile,s=data.sale;return <div className="grid md:grid-cols-2 gap-6"><div className="card"><div className="card-header font-bold">Mobile Record</div><div className="card-body space-y-2"><Row a="Product" b={m.brand+' '+m.model}/><Row a="IMEI" b={m.imei}/><Row a="Storage" b={m.storage||'-'}/><Row a="Color" b={m.color||'-'}/><Row a="Status" b={m.status}/><Row a="Purchase Price" b={'Rs '+Number(m.purchasePrice||0).toLocaleString()}/><Row a="Selling Price" b={'Rs '+Number(m.sellingPrice||0).toLocaleString()}/></div></div><div className="card"><div className="card-header font-bold">Sale Trace</div><div className="card-body">{s?<div className="space-y-2"><Row a="Invoice" b={'INV-'+String(s.id).padStart(6,'0')}/><Row a="Date" b={s.saleDate}/><Row a="Customer" b={s.customer?.name||'Walk-in'}/><Row a="Phone" b={s.customer?.phone||'-'}/><Row a="Amount" b={'Rs '+Number(s.totalAmount||0).toLocaleString()}/><Row a="Status" b={s.refundedAt?'Refunded':'Completed'}/></div>:<p className="text-slate-400">This mobile has not been sold yet.</p>}</div></div></div>}
function CustomerResults({rows}){if(!rows?.length)return <div className="card"><div className="card-body text-center text-slate-400 py-10">No customer found.</div></div>;return <div className="space-y-5">{rows.map(({customer,sales})=><div className="card" key={customer.id}><div className="card-header"><b>{customer.name}</b><span className="text-sm text-slate-500 ml-3">{customer.phone}</span></div><div className="card-body">{sales.length?sales.map(s=><div key={s.id} className="grid md:grid-cols-5 gap-2 py-3 border-b last:border-0 text-sm"><b className="text-blue-700">INV-{String(s.id).padStart(6,'0')}</b><span>{s.saleDate}</span><span>{(s.items||[]).map(i=>i.name).join(', ')}</span><span className="font-semibold">Rs {Number(s.totalAmount||0).toLocaleString()}</span><span>{s.refundedAt?'Refunded':'Completed'}</span></div>):<p className="text-slate-400">No purchases recorded.</p>}</div></div>)}</div>}
function Row({a,b}){return <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">{a}</span><b className="text-right">{b}</b></div>}