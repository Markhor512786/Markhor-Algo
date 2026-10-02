import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Smartphone, Cable, ShoppingCart, Users, FileText, Settings, AlertTriangle, Store } from 'lucide-react';
const navItems=[
{to:'/',icon:LayoutDashboard,label:'Dashboard'},{to:'/sales',icon:ShoppingCart,label:'Sales / Invoices'},
{to:'/mobiles',icon:Smartphone,label:'Mobiles'},{to:'/accessories',icon:Cable,label:'Accessories'},
{to:'/customers',icon:Users,label:'Customers'},{to:'/reports',icon:FileText,label:'Reports'},
{to:'/settings',icon:Settings,label:'Settings'}];
export default function Sidebar({isOpen,onClose}){
 return <><>{isOpen&&<div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose}/>}</>
 <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 border-r border-blue-100 shadow-[8px_0_30px_rgba(31,82,130,.05)] transform transition-transform duration-300 lg:transform-none ${isOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
 <div className="h-20 px-5 flex items-center gap-3 border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/70">
 <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200"><Store className="w-6 h-6"/></div>
 <div><div className="font-extrabold text-slate-900 leading-tight">Mobile Shop</div><div className="text-[10px] tracking-[.16em] text-blue-600 font-bold">ERP SYSTEM</div></div>
 <button onClick={onClose} className="ml-auto lg:hidden p-2"><X className="w-5 h-5"/></button></div>
 <nav className="p-4 space-y-1.5">{navItems.map(({to,icon:Icon,label})=><NavLink key={to} to={to} end={to==='/'}
 onClick={onClose} className={({isActive})=>`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive?'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-100 font-semibold':'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
 <Icon className="w-5 h-5"/><span>{label}</span></NavLink>)}</nav>
 <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
 <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><AlertTriangle className="w-4 h-4 text-amber-500"/> Low stock alerts</div>
 <p className="text-xs text-slate-500 mt-1">Inventory warnings appear on dashboard.</p></div></aside></>;
}