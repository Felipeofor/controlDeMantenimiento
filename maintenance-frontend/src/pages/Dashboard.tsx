import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/utils';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Car, Wrench, DollarSign, Activity, ChevronRight, Clock } from 'lucide-react';
import api from '../lib/api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/fleet');
        setStats(response.data);
      } catch (error: any) {
        console.error('Error fetching stats', error);
        toast.error(getErrorMessage(error, t('common.error_generic')));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse font-black uppercase tracking-widest text-[10px]">{t('common.loading')}</div>
      </div>
    );
  }

  // Prepara datos para los gráficos
  const typeData = Object.entries(stats.maintenanceByType || {}).map(([name, value]) => ({
    name: t(`maintenance.types.${name}`) || name,
    value
  }));

  const statusData = Object.entries(stats.maintenanceByStatus || {}).map(([name, value]) => ({
    name: t(`status.${name.toLowerCase()}`) || name,
    value
  }));

  const COLORS = ['#ff213b', '#000000', '#666666', '#999999', '#cccccc'];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-12 px-4 md:px-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-gray-900">
            {t('navbar.dashboard')} <span className="text-primary">{t('dashboard.title_highlight')}</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('dashboard.subtitle')}</p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: t('home.total_vehicles'), value: stats.totalVehicles, icon: Car, color: 'bg-black' },
            { label: t('home.in_service'), value: stats.inServiceVehicles, icon: Wrench, color: 'bg-primary' },
            { label: t('home.total_investment'), value: `$${stats.totalSpent?.toLocaleString('es-AR') || '0'}`, icon: DollarSign, color: 'bg-black' },
            { label: t('home.average_cost'), value: `$${stats.averageMaintenanceCost?.toLocaleString('es-AR') || '0'}`, icon: Activity, color: 'bg-gray-400' },
          ].map((kpi, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between gap-4 group hover:shadow-xl transition-all duration-500"
            >
              <div className="flex justify-between items-start">
                <div className={`${kpi.color} p-3 rounded-2xl text-white shadow-lg`}>
                  <kpi.icon size={20} />
                </div>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</span>
                <div className="text-3xl font-bold tracking-tight mt-1">{kpi.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Distribution */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight italic">{t('dashboard.distribution_by_service')}</h3>
              <div className="bg-gray-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{t('dashboard.live_view')}</div>
            </div>
            <div className="h-[300px] min-h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={typeData} 
                  margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#666' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8f8f8' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#ff213b" radius={[0, 8, 8, 0]} barSize={32} label={{ position: 'right', fill: '#000', fontSize: 10, fontWeight: 900 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="bg-black text-white p-10 rounded-[48px] shadow-2xl space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-xl font-bold tracking-tight italic">{t('dashboard.process_status')}</h3>
            </div>
            <div className="h-[300px] min-h-[300px] w-full relative z-10 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ff213b' : index === 1 ? '#ffffff' : '#444444'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{t('dashboard.total')}</span>
                <span className="text-3xl font-black leading-none">{stats.maintenanceByStatus ? (Object.values(stats.maintenanceByStatus) as number[]).reduce((a: number, b: number) => a + b, 0) : 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Brand Cost Analysis - NEW CHART */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
             className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 lg:col-span-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight italic">{t('dashboard.avg_cost_by_brand')}</h3>
              <div className="bg-blue-50 text-blue-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">{t('dashboard.financial_insights')}</div>
            </div>
            <div className="h-[300px] min-h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={Object.entries(stats.averageCostByBrand || {}).map(([name, value]) => ({ name, value }))} margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 500 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8f8f8' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(value: number | undefined) => [value ? `$${value?.toLocaleString('es-AR')}` : '$0', 'Costo Promedio']}
                  />
                  <Bar dataKey="value" fill="#000000" radius={[8, 8, 8, 8]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
           <div className="flex items-center gap-4">
             <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Actividad Reciente Global</h2>
             <div className="h-[1px] flex-grow bg-gray-200"></div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentMaintenances?.map((m: any, idx: number) => (
                <Link to={`/vehicle/${m.vehicleId}`} key={m.id}>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-[32px] border border-gray-100 hover:border-primary/30 transition-all flex flex-col group shadow-sm hover:shadow-xl"
                  >
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                            {t(`maintenance.types.${m.tipoMantenimiento}`)}
                          </div>
                          <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {m.descripcion}
                          </div>
                       </div>
                       <StatusBadge status={m.estado} />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-gray-600 text-xs">
                       <Car size={14} className="text-gray-400" />
                       <span className="font-bold">{m.vehicleBrand} {m.vehicleModel}</span>
                       <span className="text-gray-300">/</span>
                       <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-black tracking-tighter text-gray-500">{m.vehiclePlate}</span>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                       <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} />
                          {new Date(m.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                       </div>

                       <div className="text-right">
                          <div className="text-[9px] font-black uppercase text-gray-400 leading-none tracking-tight">{t('dashboard.cost')}</div>
                          <div className="text-sm font-black text-gray-900">
                             ${(m.costoFinal || m.costoEstimado || 0).toLocaleString('es-AR')}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
};
