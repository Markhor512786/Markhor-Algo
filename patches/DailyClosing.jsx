import {useEffect,useMemo,useState} from 'react';
import {Download,Printer} from 'lucide-react';
import {saleAPI,expenseAPI} from '../../services/api';

export default function DailyClosing(){
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [sales,setSales]=useState([]);
  const [expenses,setExpenses]=useState([]);

  useEffect(()=>{
    Promise.all([
      saleAPI.getAll({limit:1000}),
      expenseAPI.getAll()
    ]).then(([s,e])=>{
      setSales(s.data.data.sales);
      setExpenses(e.data.data);
    });
  },[]);

  const d=useMemo(()=>{
    const ss=sales.filter(x=>x.saleDate===date&&!x.refundedAt);
    const ee=expenses.filter(x=>x.date===date);
    const sum=a=>a.reduce((t,x)=>t+Number(x||0),0);
    const gross=sum(ss.map(x=>x.totalAmount));
    const profit=sum(ss.map(x=>x.profit));
    const exp=sum(ee.map(x=>x.amount));
    const payments={};

    ss.forEach(x=>{
      payments[x.paymentMethod]=(payments[x.paymentMethod]||0)+Number(x.totalAmount||0);
    });

    return{
      ss,
      ee,
      gross,
      profit,
      exp,
      net:profit-exp,
      payments
    };
  },[date,sales,expenses]);

  const csv=()=>{
    const rows=[
      ['Date',date],
      ['Sales',d.gross],
      ['Gross Profit',d.profit],
      ['Expenses',d.exp],
      ['Net Profit',d.net],
      [],
      ['Invoice','Customer','Amount','Payment'],
      ...d.ss.map(s=>[
        'INV-'+String(s.id).padStart(6,'0'),
        s.customer?.name||'',
        s.totalAmount,
        s.paymentMethod
      ])
    ];

    const text=rows
      .map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(','))
      .join('\n');

    const blob=new Blob([text],{type:'text/csv'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='daily-closing-'+date+'.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cards=[
    ['Sales',d.gross],
    ['Gross Profit',d.profit],
    ['Expenses',d.exp],
    ['Net Profit',d.net],
    ['Transactions',d.ss.length]
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">Daily Closing</h2>
          <p className="text-slate-500">End-of-day sales, payments, expenses and net profit.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            className="input"
            value={date}
            onChange={e=>setDate(e.target.value)}
          />
          <button onClick={()=>window.print()} className="btn btn-secondary">
            <Printer className="w-4 h-4"/>
          </button>
          <button onClick={csv} className="btn btn-primary flex gap-2">
            <Download className="w-4 h-4"/>CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {cards.map(([label,value])=>(
          <div className="card" key={label}>
            <div className="card-body">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-extrabold">
                {label==='Transactions'
                  ? value
                  : 'Rs '+Number(value).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header font-bold">Payment Breakdown</div>
          <div className="card-body space-y-3">
            {Object.entries(d.payments).length ? (
              Object.entries(d.payments).map(([key,value])=>(
                <div className="flex justify-between border-b pb-2" key={key}>
                  <span className="capitalize">{key.replace('_',' ')}</span>
                  <b>Rs {Number(value).toLocaleString()}</b>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No sales.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header font-bold">Expenses</div>
          <div className="card-body space-y-3">
            {d.ee.length ? (
              d.ee.map(x=>(
                <div className="flex justify-between border-b pb-2" key={x.id}>
                  <span>
                    {x.category}{' '}
                    <small className="text-slate-400">{x.description}</small>
                  </span>
                  <b>Rs {Number(x.amount).toLocaleString()}</b>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No expenses.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}