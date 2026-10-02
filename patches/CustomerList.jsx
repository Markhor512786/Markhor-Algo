import {useEffect,useMemo,useState} from 'react';
import {Plus,Edit,Trash2,Search,X} from 'lucide-react';
import {customerAPI} from '../../services/api';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import CustomerForm from '../../components/Forms/CustomerForm';
import {useAuth} from '../../contexts/AuthContext';

export default function CustomerList(){
  const [customers,setCustomers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [isFormOpen,setIsFormOpen]=useState(false);
  const [selectedCustomer,setSelectedCustomer]=useState(null);
  const {isAdmin}=useAuth();

  const load=async()=>{
    setLoading(true);
    try{
      const r=await customerAPI.getAll({limit:10000});
      setCustomers(r.data.data.customers||[]);
    }catch(e){
      console.error(e);
      alert('Failed to fetch customers');
    }finally{setLoading(false)}
  };
  useEffect(()=>{load();},[]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    if(!q)return customers;
    return customers.filter(x=>[x.name,x.phone,x.email,x.address].join(' ').toLowerCase().includes(q));
  },[customers,search]);

  const del=async x=>{
    if(!confirm('Are you sure you want to delete '+x.name+'?'))return;
    try{await customerAPI.delete(x.id);await load()}catch(e){alert(e.response?.data?.error||'Failed to delete customer')}
  };

  const columns=[
    {header:'Name',accessor:'name'},
    {header:'Phone',accessor:'phone'},
    {header:'Email',render:r=>r.email||'-'},
    {header:'Address',render:r=>r.address?<span className="text-sm text-gray-600" title={r.address}>{r.address.substring(0,30)}{r.address.length>30?'...':''}</span>:'-'},
    {header:'Registered',render:r=>new Date(r.createdAt).toLocaleDateString()},
    {header:'Actions',render:r=><div className="flex gap-2">
      <button onClick={e=>{e.stopPropagation();setSelectedCustomer(r);setIsFormOpen(true)}} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4"/></button>
      {isAdmin()&&<button onClick={e=>{e.stopPropagation();del(r)}} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>}
    </div>}
  ];

  return <div>
    <div className="flex justify-between items-center mb-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Customers</h2><p className="text-gray-500">Manage customer records</p></div>
      <Button onClick={()=>{setSelectedCustomer(null);setIsFormOpen(true)}}><Plus className="w-5 h-5 mr-2"/>Add Customer</Button>
    </div>

    <div className="card mb-6"><div className="card-body">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none"/>
        <input className="input pl-10 pr-10" placeholder="Search name, phone, email or address..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"/>
        {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-3 text-slate-400"><X className="w-5 h-5"/></button>}
      </div>
      <p className="text-xs text-slate-400 mt-2">{filtered.length} result(s)</p>
    </div></div>

    <div className="card">{loading?<div className="text-center py-12 text-gray-500">Loading...</div>:<Table columns={columns} data={filtered} emptyMessage="No customers found"/>}</div>

    <Modal isOpen={isFormOpen} onClose={()=>{setIsFormOpen(false);setSelectedCustomer(null)}} title={selectedCustomer?'Edit Customer':'Add New Customer'} size="md">
      <CustomerForm customer={selectedCustomer} onSuccess={()=>{setIsFormOpen(false);setSelectedCustomer(null);load()}} onCancel={()=>{setIsFormOpen(false);setSelectedCustomer(null)}}/>
    </Modal>
  </div>
}