import React, { useState, useEffect } from 'react';
import { ApplicationSummary, ApplicationStatus, ApplicationDetail } from '../types/application';
import { AuditLogEntry, SystemStats } from '../types/admin';
import { ServiceSummary, Department, ServiceCreateRequest } from '../types/service';
import { adminApi } from '../services/adminApi';
import { officerApi } from '../services/officerApi';
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
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Administrator Control Center</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" /> Platform Admin
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            System-wide oversight, cross-department queue surveillance, catalogue provisioning, and audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            loadInitialData();
            if (activeTab === 'applications') loadApplications();
            if (activeTab === 'catalogue') loadServices();
            if (activeTab === 'audit') loadAuditLogs();
          }}
          className="inline-flex items-center px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2 text-slate-500" /> Refresh Data
        </button>
      </div>

      {/* Global Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</span>
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalApplications}</p>
            <span className="text-xs text-slate-400 mt-1 block">Cross-department filings</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
            <span className="text-xs text-slate-500 mt-1 block">
              {stats.totalCitizens} citizens • {stats.totalOfficers} officers
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</span>
              <Building className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalDepartments}</p>
            <span className="text-xs text-slate-400 mt-1 block">Configured ministries</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Catalogue</span>
              <Layers className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalServices}</p>
            <span className="text-xs text-slate-400 mt-1 block">Active licensing schemes</span>
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" /> Applications Oversight
          </button>

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 ${
              activeTab === 'catalogue'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" /> Service Catalogue
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <History className="w-4 h-4" /> System Audit Trail
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Status Breakdown
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 ${
              activeTab === 'benchmark'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, applicant, email..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadApplications()}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="border border-slate-300 rounded-lg text-sm px-3 py-2 bg-white text-slate-700"
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
                className="border border-slate-300 rounded-lg text-sm px-3 py-2 bg-white text-slate-700"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {appsLoading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                <p>Loading platform applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No Applications Found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your department or status filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{app.referenceNumber}</td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {app.departmentName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{app.serviceName}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{app.citizenName}</div>
                          <div className="text-xs text-slate-400">{app.citizenEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              app.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : app.status === 'UNDER_VERIFICATION'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleInspect(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Dossier
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Service Catalogue Provisioning</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Provision New Service
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {servicesLoading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                <p>Loading service catalogue...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Service Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Fee (₹)</th>
                      <th className="py-3 px-4">SLA (Days)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{srv.code}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{srv.name}</td>
                        <td className="py-3 px-4 text-slate-600">{srv.departmentName}</td>
                        <td className="py-3 px-4 text-slate-700">₹{srv.sampleFee}</td>
                        <td className="py-3 px-4 text-slate-700">{srv.processingTimeDays} days</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              srv.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {srv.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {srv.active && (
                            <button
                              onClick={() => handleDeactivateService(srv.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-medium"
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
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit actions, actors, resources..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500">Showing last 100 immutable audit entries</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {auditLoading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                <p>Loading audit trail...</p>
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm">No audit records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          <div className="font-semibold text-slate-800">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400">{log.actorEmail}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {log.resourceType} {log.resourceId ? `#${log.resourceId}` : ''}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="py-2.5 px-4 text-slate-600 font-sans truncate max-w-xs">{log.details || '—'}</td>
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Application Lifecycle Pipeline Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats.statusBreakdown || {}).map(([st, cnt]) => {
                const percentage =
                  stats.totalApplications > 0
                    ? Math.round((cnt / stats.totalApplications) * 100)
                    : 0;
                return (
                  <div key={st} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{st}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-extrabold text-slate-900">{cnt}</span>
                      <span className="text-xs font-semibold text-slate-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
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
          className="fixed inset-0 z-50 bg-slate-900 bg-opacity-60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="provision-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="provision-modal-title" className="text-lg font-bold text-slate-900">Provision New Service</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close provision modal"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label htmlFor="srv-code" className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Code</label>
                <input
                  type="text"
                  id="srv-code"
                  name="code"
                  required
                  placeholder="e.g. SRV_PROPERTY_TAX"
                  value={newService.code}
                  onChange={(e) => setNewService({ ...newService, code: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 font-mono uppercase"
                />
              </div>

              <div>
                <label htmlFor="srv-name" className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Name</label>
                <input
                  type="text"
                  id="srv-name"
                  name="name"
                  required
                  placeholder="e.g. Property Tax Assessment License"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label htmlFor="srv-dept" className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                <select
                  id="srv-dept"
                  name="departmentId"
                  value={newService.departmentId}
                  onChange={(e) => setNewService({ ...newService, departmentId: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
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
                  <label htmlFor="srv-fee" className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    id="srv-fee"
                    name="sampleFee"
                    min="0"
                    value={newService.sampleFee}
                    onChange={(e) => setNewService({ ...newService, sampleFee: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label htmlFor="srv-sla" className="block text-xs font-bold text-slate-700 uppercase mb-1">SLA Days</label>
                  <input
                    type="number"
                    id="srv-sla"
                    name="processingTimeDays"
                    min="1"
                    value={newService.processingTimeDays}
                    onChange={(e) => setNewService({ ...newService, processingTimeDays: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="srv-desc" className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  id="srv-desc"
                  name="description"
                  rows={2}
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
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
          className="fixed inset-0 z-50 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-inspect-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h3 id="admin-inspect-title" className="text-base font-bold text-slate-900">
                Admin Dossier Inspection: {inspectedApp.referenceNumber}
              </h3>
              <button
                onClick={() => setInspectedApp(null)}
                aria-label="Close inspection dialog"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Service</span>
                  <p className="font-semibold text-slate-800">{inspectedApp.serviceName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Department</span>
                  <p className="font-semibold text-slate-800">{inspectedApp.departmentName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Applicant</span>
                  <p className="font-semibold text-slate-800">{inspectedApp.citizenName} ({inspectedApp.citizenEmail})</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Status</span>
                  <p className="font-semibold text-indigo-700">{inspectedApp.status}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Form Data Payload</h4>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto">
                  {JSON.stringify(inspectedApp.formData, null, 2)}
                </pre>
              </div>

              {inspectedApp.reviewDecisions && inspectedApp.reviewDecisions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Adjudication Decisions</h4>
                  <div className="space-y-2">
                    {inspectedApp.reviewDecisions.map((dec) => (
                      <div key={dec.id} className="p-3 bg-slate-50 border rounded-lg text-xs">
                        <span className="font-bold">{dec.decision}</span> by {dec.officerName} on{' '}
                        {new Date(dec.createdAt).toLocaleString()}
                        {dec.reason && <p className="mt-1 text-slate-700">Reason: {dec.reason}</p>}
                        {dec.notes && <p className="text-slate-500">Notes: {dec.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setInspectedApp(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
