import React, { useState, useEffect } from 'react';
import { ApplicationSummary, ApplicationStatus, ApplicationDetail } from '../types/application';
import { AuditLogEntry, SystemStats } from '../types/admin';
import { ServiceSummary, Department, ServiceCreateRequest } from '../types/service';
import { adminApi } from '../services/adminApi';
import { officerApi } from '../services/officerApi';
import { StatusBadge, MetricCard } from './ui/designSystem';
import {
  ShieldCheck,
  Users,
  Layers,
  FileText,
  CheckCircle2,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Building,
  AlertCircle,
  X,
  History,
  TrendingUp,
  FlaskConical,
  Clock,
  Sparkles,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { ResearchBenchmarkView } from './ResearchBenchmarkView';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'catalogue' | 'audit' | 'analytics' | 'benchmark'>('applications');

  // Stats state
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Applications tab state
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [appSearch, setAppSearch] = useState<string>('');
  const [appsLoading, setAppsLoading] = useState<boolean>(false);

  // Selected dossier inspection modal
  const [inspectedApp, setInspectedApp] = useState<ApplicationDetail | null>(null);

  // Catalogue tab state
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newService, setNewService] = useState<ServiceCreateRequest>({
    code: '',
    name: '',
    description: '',
    departmentId: 1,
    sampleFee: 200,
    processingTimeDays: 7,
    active: true,
  });

  // Audit tab state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      const [statsData, deptsData] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getDepartments(),
      ]);
      setStats(statsData);
      setDepartments(deptsData);
      if (deptsData.length > 0) {
        setNewService((prev) => ({ ...prev, departmentId: deptsData[0].id }));
      }
    } catch (err: any) {
      console.warn('Failed to load admin stats:', err);
    }
  };

  const loadApplications = async () => {
    setAppsLoading(true);
    setErrorMsg(null);
    try {
      const deptId = selectedDeptId === 'ALL' ? undefined : Number(selectedDeptId);
      const status = selectedStatus === 'ALL' ? undefined : (selectedStatus as ApplicationStatus);
      const data = await adminApi.getAllApplications(status, deptId, appSearch || undefined);
      setApplications(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load applications oversight');
    } finally {
      setAppsLoading(false);
    }
  };

  const loadServices = async () => {
    setServicesLoading(true);
    try {
      const data = await adminApi.getAllServices();
      setServices(data);
    } catch (err: any) {
      console.warn('Failed to load services:', err);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const logs = await adminApi.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else if (activeTab === 'catalogue') {
      loadServices();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, selectedDeptId, selectedStatus]);

  const handleInspect = async (appId: number) => {
    setErrorMsg(null);
    try {
      const detail = await officerApi.getApplication(appId);
      setInspectedApp(detail);
    } catch (err: any) {
      setErrorMsg('Failed to inspect application dossier');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await adminApi.createService(newService);
      setSuccessMsg(`Service ${newService.name} (${newService.code}) created successfully.`);
      setIsCreateModalOpen(false);
      setNewService({
        code: '',
        name: '',
        description: '',
        departmentId: departments[0]?.id || 1,
        sampleFee: 200,
        processingTimeDays: 7,
        active: true,
      });
      loadServices();
      loadInitialData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create service');
    }
  };

  const handleDeactivateService = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await adminApi.deactivateService(id);
      setSuccessMsg('Service deactivated successfully.');
      loadServices();
      loadInitialData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to deactivate service');
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch) return true;
    const term = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.actorName.toLowerCase().includes(term) ||
      log.actorEmail.toLowerCase().includes(term) ||
      (log.resourceType && log.resourceType.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admin Top Header Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-[#101828] tracking-tight">Administrator Control Center</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#2563EB] border border-[#2563EB]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" /> Platform Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real-time cross-department queue oversight, automated SLA surveillance, dynamic catalogue provisioning, and immutable system audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            loadInitialData();
            if (activeTab === 'applications') loadApplications();
            if (activeTab === 'catalogue') loadServices();
            if (activeTab === 'audit') loadAuditLogs();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-slate-50 rounded-xl text-xs font-bold text-[#101828] shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Refresh All Metrics</span>
        </button>
      </div>

      {/* Global Executive Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applications"
            value={stats.totalApplications}
            helperText="Cross-department filings"
            icon={FileSpreadsheet}
            tone="blue"
          />

          <MetricCard
            label="Active Citizens & Officers"
            value={stats.totalUsers}
            helperText={`${stats.totalCitizens} citizens • ${stats.totalOfficers} officers`}
            icon={Users}
            tone="default"
          />

          <MetricCard
            label="Ministries & Depts"
            value={stats.totalDepartments}
            helperText="Configured jurisdictions"
            icon={Building}
            tone="amber"
          />

          <MetricCard
            label="Service Catalogue"
            value={stats.totalServices}
            helperText="Live licensing schemes"
            icon={Layers}
            tone="green"
          />
        </div>
      )}

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#B91C1C]" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#15803D]" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 min-w-max">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition ${
              activeTab === 'applications'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" /> Applications Oversight
          </button>

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition ${
              activeTab === 'catalogue'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" /> Service Catalogue
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition ${
              activeTab === 'audit'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" /> System Audit Trail
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition ${
              activeTab === 'analytics'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Status Breakdown
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition ${
              activeTab === 'benchmark'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> Research & Benchmarks
          </button>
        </nav>
      </div>

      {/* TAB 1: Applications Oversight */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference number, applicant name, email..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadApplications()}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="border border-slate-200 rounded-xl text-xs px-3.5 py-2.5 bg-white text-[#101828] font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-slate-200 rounded-xl text-xs px-3.5 py-2.5 bg-white text-[#101828] font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_VERIFICATION">Under Verification</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={loadApplications}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Apply Filter
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            {appsLoading ? (
              <div className="p-16 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2563EB] mb-3" />
                <p className="text-xs font-semibold text-slate-700">Loading cross-department applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-[#101828]">No Applications Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your department, status, or search filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                          {app.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {app.departmentName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#101828]">{app.serviceName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#101828]">{app.citizenName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{app.citizenEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleInspect(app.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-[#EAF2FF] rounded-lg text-xs font-bold text-[#101828] shadow-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Dynamic Service Catalogue Manager */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-[#101828]">Service Catalogue Provisioning</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define new licensing schemes, fee structures, and SLA timeframes</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Provision New Service
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            {servicesLoading ? (
              <div className="p-16 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2563EB] mb-2" />
                <p className="text-xs font-semibold text-slate-700">Loading service catalogue...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Service Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Fee (₹)</th>
                      <th className="py-3 px-4">SLA Timeframe</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#101828]">{srv.code}</td>
                        <td className="py-3.5 px-4 font-bold text-[#101828]">{srv.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{srv.departmentName}</td>
                        <td className="py-3.5 px-4 font-bold text-[#101828]">₹{srv.sampleFee}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{srv.processingTimeDays} working days</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              srv.active ? 'bg-emerald-50 text-[#15803D] border border-emerald-200' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${srv.active ? 'bg-[#15803D]' : 'bg-slate-400'}`} />
                            {srv.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {srv.active && (
                            <button
                              onClick={() => handleDeactivateService(srv.id)}
                              className="text-xs text-[#B91C1C] hover:text-red-800 font-bold hover:underline"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: System Audit Trail Inspector */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions, actors, resources..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Showing last 100 immutable audit entries
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            {auditLoading ? (
              <div className="p-16 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2563EB] mb-2" />
                <p className="text-xs font-semibold text-slate-700">Loading audit trail...</p>
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No audit records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-[#101828]">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {log.resourceType} {log.resourceId ? `#${log.resourceId}` : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="py-3 px-4 text-slate-600 font-sans truncate max-w-xs">{log.details || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Status Breakdown & Platform Health */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-base font-extrabold text-[#101828]">Application Lifecycle Pipeline Breakdown</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats.statusBreakdown || {}).map(([st, cnt]) => {
                const percentage =
                  stats.totalApplications > 0
                    ? Math.round((cnt / stats.totalApplications) * 100)
                    : 0;

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'APPROVED':
                      return { text: 'text-[#15803D]', bar: 'bg-[#15803D]' };
                    case 'REJECTED':
                      return { text: 'text-[#B91C1C]', bar: 'bg-[#B91C1C]' };
                    case 'UNDER_VERIFICATION':
                      return { text: 'text-[#B45309]', bar: 'bg-[#B45309]' };
                    default:
                      return { text: 'text-[#2563EB]', bar: 'bg-[#2563EB]' };
                  }
                };

                const colors = getStatusColor(st);

                return (
                  <div key={st} className="p-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-xs">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">{st}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className={`text-2xl font-black ${colors.text}`}>{cnt}</span>
                      <span className="text-xs font-bold text-slate-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`${colors.bar} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Research Evaluation & Benchmarks */}
      {activeTab === 'benchmark' && (
        <ResearchBenchmarkView />
      )}

      {/* Create Service Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="provision-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 id="provision-modal-title" className="text-base font-extrabold text-[#101828]">
                  Provision New Licensing Service
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close provision modal"
                className="text-slate-400 hover:text-[#101828] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label htmlFor="srv-code" className="block text-xs font-bold text-[#101828] uppercase mb-1">
                  Service Code
                </label>
                <input
                  type="text"
                  id="srv-code"
                  name="code"
                  required
                  placeholder="e.g. SRV_PROPERTY_TAX"
                  value={newService.code}
                  onChange={(e) => setNewService({ ...newService, code: e.target.value })}
                  className="w-full text-xs font-mono uppercase border border-slate-200 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="srv-name" className="block text-xs font-bold text-[#101828] uppercase mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  id="srv-name"
                  name="name"
                  required
                  placeholder="e.g. Property Tax Assessment License"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="srv-dept" className="block text-xs font-bold text-[#101828] uppercase mb-1">
                  Governing Department
                </label>
                <select
                  id="srv-dept"
                  name="departmentId"
                  value={newService.departmentId}
                  onChange={(e) => setNewService({ ...newService, departmentId: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none text-[#101828] font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="srv-fee" className="block text-xs font-bold text-[#101828] uppercase mb-1">
                    Sample Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="srv-fee"
                    name="sampleFee"
                    min="0"
                    value={newService.sampleFee}
                    onChange={(e) => setNewService({ ...newService, sampleFee: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="srv-sla" className="block text-xs font-bold text-[#101828] uppercase mb-1">
                    SLA (Working Days)
                  </label>
                  <input
                    type="number"
                    id="srv-sla"
                    name="processingTimeDays"
                    min="1"
                    value={newService.processingTimeDays}
                    onChange={(e) => setNewService({ ...newService, processingTimeDays: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="srv-desc" className="block text-xs font-bold text-[#101828] uppercase mb-1">
                  Description & Eligibility Criteria
                </label>
                <textarea
                  id="srv-desc"
                  name="description"
                  rows={2}
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Provision Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Dossier Modal (Read-Only Admin View) */}
      {inspectedApp && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-inspect-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Surveillance Dossier</span>
                <h3 id="admin-inspect-title" className="text-base font-extrabold text-[#101828] font-mono">
                  {inspectedApp.referenceNumber}
                </h3>
              </div>
              <button
                onClick={() => setInspectedApp(null)}
                aria-label="Close inspection dialog"
                className="text-slate-400 hover:text-[#101828] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Service</span>
                  <p className="font-bold text-[#101828] mt-0.5">{inspectedApp.serviceName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                  <p className="font-bold text-[#101828] mt-0.5">{inspectedApp.departmentName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
                  <p className="font-bold text-[#101828] mt-0.5">{inspectedApp.citizenName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{inspectedApp.citizenEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifecycle Status</span>
                  <div className="mt-1">
                    <StatusBadge status={inspectedApp.status} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Citizen Form Payload</h4>
                </div>
                <pre className="bg-[#101828] text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(inspectedApp.formData, null, 2)}
                </pre>
              </div>

              {inspectedApp.reviewDecisions && inspectedApp.reviewDecisions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">Adjudication Decisions History</h4>
                  <div className="space-y-2">
                    {inspectedApp.reviewDecisions.map((dec) => (
                      <div key={dec.id} className="p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#101828]">{dec.decision}</span>
                          <span className="text-[10px] text-slate-400">{new Date(dec.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Adjudicated by: <span className="font-semibold text-slate-700">{dec.officerName}</span></p>
                        {dec.reason && <p className="text-slate-800 font-medium bg-rose-50 border border-rose-200 p-2 rounded-lg text-[11px]">Reason: {dec.reason}</p>}
                        {dec.notes && <p className="text-slate-600 text-[11px]">Notes: {dec.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectedApp(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-[#101828] transition"
              >
                Close Surveillance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
