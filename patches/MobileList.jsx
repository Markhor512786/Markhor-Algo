import {useEffect,useMemo,useState} from 'react';
import {Plus,Search,Edit,Trash2,X} from 'lucide-react';
import {mobileAPI} from '../../services/api';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import MobileForm from '../../components/Forms/MobileForm';
import {useAuth} from '../../contexts/AuthContext';

export default function MobileList(){
  const [mobiles,setMobiles]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [statusFilter,setStatusFilter]=useState('all');
  const [isFormOpen,setIsFormOpen]=useState(false);
  const [selectedMobile,setSelectedMobile]=useState(null);
  const {isAdmin}=useAuth();

  const load=async()=>{
    setLoading(true);
    try{
      const r=await mobileAPI.getAll({limit:10000});
      setMobiles(r.data.data.mobiles||[]);
    }catch(e){
      console.error(e);
      alert('Failed to fetch mobiles');
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{load();},[]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return mobiles.filter(x=>{
      const statusOk=statusFilter==='all'||x.status===statusFilter;
      const text=[x.brand,x.model,x.imei,x.color,x.storage,x.supplier].join(' ').toLowerCase();
      return statusOk&&(!q||text.includes(q));
    });
  },[mobiles,search,statusFilter]);

  const handleDelete=async mobile=>{
    if(!confirm('Are you sure you want to delete '+mobile.brand+' '+mobile.model+'?'))return;
    try{
      await mobileAPI.delete(mobile.id);
      await load();
    }catch(e){
      alert(e.response?.data?.error||'Failed to delete mobile');
    }
  };

  const columns=[
    {header:'Brand',accessor:'brand'},
    {header:'Model',accessor:'model'},
    {header:'IMEI',accessor:'imei',render:r=><span className="font-mono text-sm">{r.imei}</span>},
    {header:'Purchase Price',render:r=>'Rs '+Number(r.purchasePrice||0).toLocaleString()},
    {header:'Selling Price',render:r=>'Rs '+Number(r.sellingPrice||0).toLocaleString()},
    {header:'Status',render:r=><span className={'badge '+(r.status==='in_stock'?'badge-success':'badge-warning')}>{r.status==='in_stock'?'In Stock':'Sold'}</span>},
    {header:'Actions',render:r=><div className="flex gap-2">
      <button onClick={e=>{e.stopPropagation();setSelectedMobile(r);setIsFormOpen(true)}} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4"/></button>
      {isAdmin()&&r.status==='in_stock'&&<button onClick={e=>{e.stopPropagation();handleDelete(r)}} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>}
    </div>}
  ];

  return <div>
    <div className="flex justify-between items-center mb-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Mobiles</h2><p className="text-gray-500">Manage mobile phone inventory</p></div>
      <Button onClick={()=>{setSelectedMobile(null);setIsFormOpen(true)}}><Plus className="w-5 h-5 mr-2"/>Add Mobile</Button>
    </div>

    <div className="card mb-6"><div className="card-body">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none"/>
          <input className="input pl-10 pr-10" placeholder="Search brand, model, IMEI, color, storage..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"/>
          {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-3 text-slate-400"><X className="w-5 h-5"/></button>}
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input w-48">
          <option value="all">All Status</option><option value="in_stock">In Stock</option><option value="sold">Sold</option>
        </select>
      </div>
      <p className="text-xs text-slate-400 mt-2">{filtered.length} result(s)</p>
    </div></div>

    <div className="card">{loading?<div className="text-center py-12 text-gray-500">Loading...</div>:<Table columns={columns} data={filtered} emptyMessage="No mobiles found"/>}</div>

    <Modal isOpen={isFormOpen} onClose={()=>{setIsFormOpen(false);setSelectedMobile(null)}} title={selectedMobile?'Edit Mobile':'Add New Mobile'} size="lg">
      <MobileForm mobile={selectedMobile} onSuccess={()=>{setIsFormOpen(false);setSelectedMobile(null);load()}} onCancel={()=>{setIsFormOpen(false);setSelectedMobile(null)}}/>
    </Modal>
  </div>
}