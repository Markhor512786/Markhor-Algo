import {useEffect,useMemo,useState} from 'react';
import {Plus,Edit,Trash2,Search,X} from 'lucide-react';
import {accessoryAPI} from '../../services/api';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import AccessoryForm from '../../components/Forms/AccessoryForm';
import {useAuth} from '../../contexts/AuthContext';

export default function AccessoryList(){
  const [accessories,setAccessories]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [categoryFilter,setCategoryFilter]=useState('all');
  const [isFormOpen,setIsFormOpen]=useState(false);
  const [selectedAccessory,setSelectedAccessory]=useState(null);
  const {isAdmin}=useAuth();

  const load=async()=>{
    setLoading(true);
    try{
      const r=await accessoryAPI.getAll({limit:10000});
      setAccessories(r.data.data.accessories||[]);
    }catch(e){
      console.error(e);
      alert('Failed to fetch accessories');
    }finally{setLoading(false)}
  };
  useEffect(()=>{load();},[]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return accessories.filter(x=>{
      const catOk=categoryFilter==='all'||x.category===categoryFilter;
      const text=[x.name,x.category,x.brand,x.supplier,x.description].join(' ').toLowerCase();
      return catOk&&(!q||text.includes(q));
    });
  },[accessories,search,categoryFilter]);

  const del=async x=>{
    if(!confirm('Are you sure you want to delete '+x.name+'?'))return;
    try{await accessoryAPI.delete(x.id);await load()}catch(e){alert(e.response?.data?.error||'Failed to delete accessory')}
  };

  const columns=[
    {header:'Name',accessor:'name'},
    {header:'Category',accessor:'category'},
    {header:'Brand',render:r=>r.brand||'-'},
    {header:'Quantity',render:r=><span className={r.quantity<=r.reorderLevel?'text-red-600 font-semibold':''}>{r.quantity}</span>},
    {header:'Purchase Price',render:r=>'Rs '+Number(r.purchasePrice||0).toLocaleString()},
    {header:'Selling Price',render:r=>'Rs '+Number(r.sellingPrice||0).toLocaleString()},
    {header:'Stock Status',render:r=><span className={'badge '+(r.quantity<=r.reorderLevel?'badge-danger':'badge-success')}>{r.quantity<=r.reorderLevel?'Low Stock':'In Stock'}</span>},
    {header:'Actions',render:r=><div className="flex gap-2">
      <button onClick={e=>{e.stopPropagation();setSelectedAccessory(r);setIsFormOpen(true)}} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4"/></button>
      {isAdmin()&&<button onClick={e=>{e.stopPropagation();del(r)}} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>}
    </div>}
  ];

  return <div>
    <div className="flex justify-between items-center mb-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Accessories</h2><p className="text-gray-500">Manage accessory inventory</p></div>
      <Button onClick={()=>{setSelectedAccessory(null);setIsFormOpen(true)}}><Plus className="w-5 h-5 mr-2"/>Add Accessory</Button>
    </div>

    <div className="card mb-6"><div className="card-body">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none"/>
          <input className="input pl-10 pr-10" placeholder="Search name, category, brand, supplier..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"/>
          {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-3 text-slate-400"><X className="w-5 h-5"/></button>}
        </div>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="input w-52">
          <option value="all">All Categories</option><option>Charger</option><option>Handsfree</option><option>Earphones</option><option>Cover</option><option>Screen Protector</option><option>Cable</option><option>Power Bank</option><option>Other</option>
        </select>
      </div>
      <p className="text-xs text-slate-400 mt-2">{filtered.length} result(s)</p>
    </div></div>

    <div className="card">{loading?<div className="text-center py-12 text-gray-500">Loading...</div>:<Table columns={columns} data={filtered} emptyMessage="No accessories found"/>}</div>

    <Modal isOpen={isFormOpen} onClose={()=>{setIsFormOpen(false);setSelectedAccessory(null)}} title={selectedAccessory?'Edit Accessory':'Add New Accessory'} size="lg">
      <AccessoryForm accessory={selectedAccessory} onSuccess={()=>{setIsFormOpen(false);setSelectedAccessory(null);load()}} onCancel={()=>{setIsFormOpen(false);setSelectedAccessory(null)}}/>
    </Modal>
  </div>
}