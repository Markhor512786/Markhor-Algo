import {useEffect,useState} from 'react';
import {Plus,Trash2,WalletCards} from 'lucide-react';
import {expenseAPI} from '../../services/api';

export default function Expenses(){
  const [rows,setRows]=useState([]);
  const [f,setF]=useState({
    date:new Date().toISOString().slice(0,10),
    category:'Other',
    description:'',
    amount:''
  });

  const load=()=>expenseAPI.getAll().then(r=>setRows(r.data.data));
  useEffect(()=>{load();},[]);

  const add=async e=>{
    e.preventDefault();
    await expenseAPI.create(f);
    setF({...f,description:'',amount:''});
    load();
  };

  const total=rows.reduce((a,x)=>a+Number(x.amount||0),0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Expenses</h2>
        <p className="text-slate-500">Track shop costs for cleaner net-profit reporting.</p>
      </div>

      <div className="grid lg:grid-cols-[.9fr_1.5fr] gap-6">
        <form onSubmit={add} className="card">
          <div className="card-header font-bold">Add Expense</div>
          <div className="card-body space-y-4">
            <label className="block text-sm font-semibold">
              Date
              <input type="date" className="input mt-1.5" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/>
            </label>

            <label className="block text-sm font-semibold">
              Category
              <select className="input mt-1.5" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
                <option>Rent</option>
                <option>Salary</option>
                <option>Electricity</option>
                <option>Transport</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Description
              <input className="input mt-1.5" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/>
            </label>

            <label className="block text-sm font-semibold">
              Amount (Rs)
              <input type="number" min="1" className="input mt-1.5" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/>
            </label>

            <button className="btn btn-primary w-full flex justify-center gap-2">
              <Plus className="w-4 h-4"/>Save Expense
            </button>
          </div>
        </form>

        <div className="card">
          <div className="card-header flex justify-between">
            <b>Expense History</b>
            <b className="text-red-600">Total Rs {total.toLocaleString()}</b>
          </div>
          <div className="card-body p-0 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(x=>(
                  <tr key={x.id} className="border-t">
                    <td className="p-3">{x.date}</td>
                    <td className="p-3">{x.category}</td>
                    <td className="p-3">{x.description||'-'}</td>
                    <td className="p-3 text-right font-semibold">Rs {Number(x.amount).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={async()=>{
                          if(confirm('Delete this expense?')){
                            await expenseAPI.delete(x.id);
                            load();
                          }
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!rows.length && (
              <div className="p-10 text-center text-slate-400">
                <WalletCards className="w-8 h-8 mx-auto mb-2"/>
                No expenses yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}