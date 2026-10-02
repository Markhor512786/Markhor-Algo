import {useRef,useState} from 'react';
import {Download,Upload,Database,ShieldCheck} from 'lucide-react';
import {backupAPI} from '../../services/api';

export default function BackupRestore(){
  const ref=useRef();
  const [msg,setMsg]=useState('');

  const download=()=>{
    const data=backupAPI.export();
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='mobile-shop-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore=async e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    try{
      const data=JSON.parse(await file.text());
      await backupAPI.import(data);
      setMsg('Backup restored successfully.');
      setTimeout(()=>location.reload(),1200);
    }catch{
      setMsg('Invalid backup file.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Backup & Restore</h2>
        <p className="text-slate-500">Protect complete shop data with a portable backup file.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body p-7">
            <Database className="w-10 h-10 text-blue-600 mb-4"/>
            <h3 className="font-bold text-lg">Create Full Backup</h3>
            <p className="text-sm text-slate-500 mt-2 mb-5">Inventory, sales, customers, expenses, shop profile and audit history.</p>
            <button onClick={download} className="btn btn-primary flex gap-2">
              <Download className="w-4 h-4"/>Download Backup
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-7">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mb-4"/>
            <h3 className="font-bold text-lg">Restore Backup</h3>
            <p className="text-sm text-slate-500 mt-2 mb-5">Restore a previously exported JSON backup. Current local data will be replaced.</p>
            <input ref={ref} type="file" accept=".json,application/json" className="hidden" onChange={restore}/>
            <button onClick={()=>ref.current?.click()} className="btn btn-secondary flex gap-2">
              <Upload className="w-4 h-4"/>Choose Backup File
            </button>
            {msg && <p className="mt-4 text-sm font-semibold text-blue-700">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}