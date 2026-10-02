import {useEffect,useMemo,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {globalSearchAPI} from '../../services/api';
import {LogOut,User,Menu,Lock,ChevronDown,Search,X} from 'lucide-react';

export default function Navbar({onMenuClick}){
  const {user,logout}=useAuth();
  const navigate=useNavigate();
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [searchOpen,setSearchOpen]=useState(false);
  const ref=useRef(null);
  const searchRef=useRef(null);
  const results=useMemo(()=>globalSearchAPI(query),[query]);

  useEffect(()=>{
    const h=e=>{
      if(ref.current&&!ref.current.contains(e.target))setOpen(false);
      if(searchRef.current&&!searchRef.current.contains(e.target))setSearchOpen(false);
    };
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);

  const choose=r=>{
    setQuery('');
    setSearchOpen(false);
    navigate(r.path);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-blue-100 px-4 md:px-6 py-3 shadow-[0_8px_25px_rgba(31,82,130,.04)]">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-blue-50 rounded-xl">
          <Menu className="w-6 h-6 text-slate-600"/>
        </button>

        <div className="hidden md:block">
          <h1 className="text-xl font-extrabold text-slate-900">Mobile Shop ERP</h1>
          <p className="text-xs text-blue-600 font-medium">Inventory & Sales Management</p>
        </div>

        <div ref={searchRef} className="flex-1 max-w-2xl mx-auto relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-blue-500 pointer-events-none"/>
          <input
            className="input pl-10 pr-10 text-sm"
            value={query}
            onChange={e=>{setQuery(e.target.value);setSearchOpen(true);}}
            onFocus={()=>setSearchOpen(true)}
            placeholder="Search mobile, IMEI, customer, invoice..."
            autoComplete="off"
          />
          {query&&(
            <button type="button" onClick={()=>{setQuery('');setSearchOpen(false);}} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5"/>
            </button>
          )}

          {searchOpen&&query.trim()&&(
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-blue-100 shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {results.length?results.map((r,i)=>(
                <button type="button" key={i} onClick={()=>choose(r)} className="w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-blue-50">
                  <div className="font-semibold text-slate-800">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.type} · {r.detail}</div>
                </button>
              )):<div className="px-4 py-5 text-sm text-slate-500">No matching record found.</div>}
            </div>
          )}
        </div>

        <div className="relative ml-auto" ref={ref}>
          <button onClick={()=>setOpen(!open)} className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center"><User className="w-4 h-4"/></div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
              <p className="text-[11px] text-slate-500">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500"/>
          </button>

          {open&&(
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-blue-100 py-2">
              <button onClick={()=>{setOpen(false);navigate('/change-password')}} className="w-full flex gap-3 px-4 py-3 hover:bg-blue-50 text-sm">
                <Lock className="w-4 h-4"/>Change Password
              </button>
              <button onClick={()=>{setOpen(false);logout()}} className="w-full flex gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-sm">
                <LogOut className="w-4 h-4"/>Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}