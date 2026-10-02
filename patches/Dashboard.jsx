import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI, globalSearchAPI } from '../services/api';
import { DollarSign, TrendingUp, Smartphone, AlertTriangle, Search } from 'lucide-react';

export default function Dashboard() {
  const [stats,setStats]=useState(null),[loading,setLoading]=useState(true),[query,setQuery]=useState(''),[results,setResults]=useState([]);
  const navigate=useNavigate();
  useEffect(()=>{reportAPI.getDashboard().then(r=>setStats(r.data.data)).finally(()=>setLoading(false))},[]);
  useEffect(()=>setResults(globalSearchAPI(query)),[query]);
  if(loading)return <div className="flex items-center justify-center h-96"><div className="text-gray-500">Loading...</div></div>;
  return <div>
    <div className="mb-4 md:mb-6"><h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2><p className="text-sm md:text-base text-gray-500">Overview of your shop</p></div>
    <div className="card mb-5"><div className="card-body">
      <div className="relative"><Search className="w-5 h-5 absolute left-3 top-3 text-gray-400"/><input className="input pl-10" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search mobile, IMEI, accessory, customer, sale..."/></div>
      {query && <div className="mt-2 border rounded-lg overflow-hidden">{results.length?results.map((r,i)=><button key={i} onClick={()=>navigate(r.path)} className="w-full text-left px-3 py-3 border-b last:border-0 hover:bg-gray-50"><div className="font-medium">{r.title}</div><div className="text-xs text-gray-500">{r.type} · {r.detail}</div></button>):<div className="p-3 text-sm text-gray-500">No matching record found</div>}</div>}
    </div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <StatCard title="Today's Sales" value={'Rs '+Number(stats?.today?.sales||0).toLocaleString()} icon={DollarSign} color="blue"/>
      <StatCard title="Today's Profit" value={'Rs '+Number(stats?.today?.profit||0).toLocaleString()} icon={TrendingUp} color="green"/>
      <StatCard title="Mobiles in Stock" value={stats?.inventory?.mobilesInStock||0} icon={Smartphone} color="purple"/>
      <StatCard title="Low Stock Items" value={stats?.inventory?.lowStockAccessories||0} icon={AlertTriangle} color="red"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card"><div className="card-header"><h3 className="text-lg font-semibold">Inventory Summary</h3></div><div className="card-body space-y-4">
        <Row a="Mobiles in Stock" b={stats?.inventory?.mobilesInStock||0}/><Row a="Mobiles Sold" b={stats?.inventory?.mobilesSold||0}/><Row a="Total Inventory Value" b={'Rs '+Number(stats?.inventory?.totalValue||0).toLocaleString()}/>
      </div></div>
      <div className="card"><div className="card-header"><h3 className="text-lg font-semibold">Recent Sales (Last 7 Days)</h3></div><div className="card-body">{stats?.weeklySales?.length?stats.weeklySales.map((d,i)=><div key={i} className="flex justify-between py-2 border-b"><span>{new Date(d.saleDate).toLocaleDateString()}</span><span className="text-right">Rs {Number(d.total||0).toLocaleString()}<small className="block text-green-600">Profit: Rs {Number(d.profit||0).toLocaleString()}</small></span></div>):<p className="text-center text-gray-500 py-4">No sales data available</p>}</div></div>
    </div>
  </div>
}
function Row({a,b}){return <div className="flex justify-between items-center pb-3 border-b"><span className="text-gray-600">{a}</span><span className="font-semibold">{b}</span></div>}
function StatCard({title,value,icon:Icon,color}){const colors={blue:'bg-blue-500',green:'bg-green-500',purple:'bg-purple-500',red:'bg-red-500'};return <div className="card"><div className="card-body p-3 md:p-4"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-xs md:text-sm text-gray-500 truncate">{title}</p><p className="text-lg md:text-2xl font-bold truncate">{value}</p></div><div className={colors[color]+' p-2 md:p-3 rounded-lg'}><Icon className="w-5 h-5 md:w-6 md:h-6 text-white"/></div></div></div></div>}
