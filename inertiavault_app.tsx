import React, { useState, useEffect, useRef } from 'react';
import { 
  HardDrive, Cloud, Calendar, Play, CheckCircle, AlertCircle, Clock,
  Download, Shield, Database, Activity, FileText, Hash, TrendingUp, 
  BarChart3, Plus, X, Trash2
} from 'lucide-react';

const InertiaVault = () => {
  const [backups, setBackups] = useState([]);
  const [activeBackup, setActiveBackup] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [view, setView] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [newBackup, setNewBackup] = useState({
    name: '',
    source: 'Documents',
    destination: 'local',
    schedule: 'manual',
    incremental: true,
    compression: true
  });
  const progressInterval = useRef(null);

  const destinations = [
    { id: 'local', name: 'Local Storage', icon: HardDrive },
    { id: 'google-drive', name: 'Google Drive', icon: Cloud },
    { id: 'dropbox', name: 'Dropbox', icon: Cloud },
    { id: 's3', name: 'Amazon S3', icon: Database }
  ];

  const schedules = [
    { value: 'manual', label: 'Manual Only' },
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily at 2 AM' },
    { value: 'weekly', label: 'Weekly (Sunday)' },
    { value: 'monthly', label: 'Monthly (1st)' }
  ];

  useEffect(() => {
    loadBackups();
    loadLogs();
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const loadBackups = async () => {
    try {
      const result = await window.storage.list('backup:');
      if (result && result.keys) {
        const loaded = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch (err) {
              return null;
            }
          })
        );
        setBackups(loaded.filter(b => b).sort((a, b) => b.created - a.created));
      }
    } catch (error) {
      setBackups([]);
    }
  };

  const loadLogs = async () => {
    try {
      const result = await window.storage.list('log:');
      if (result && result.keys) {
        const loaded = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch (err) {
              return null;
            }
          })
        );
        setLogs(loaded.filter(l => l).sort((a, b) => b.timestamp - a.timestamp).slice(0, 100));
      }
    } catch (error) {
      setLogs([]);
    }
  };

  const createBackup = async () => {
    if (!newBackup.name.trim()) {
      alert('Please enter a backup name');
      return;
    }

    const backup = {
      id: Date.now().toString(),
      ...newBackup,
      created: Date.now(),
      lastRun: null,
      totalRuns: 0,
      successfulRuns: 0,
      totalSize: 0,
      filesBackedUp: 0,
      status: 'ready',
      backupHistory: []
    };

    try {
      await window.storage.set(`backup:${backup.id}`, JSON.stringify(backup));
      setBackups([backup, ...backups]);
      setNewBackup({
        name: '',
        source: 'Documents',
        destination: 'local',
        schedule: 'manual',
        incremental: true,
        compression: true
      });
      setIsCreating(false);
      addLog('info', `Created backup: ${backup.name}`);
    } catch (error) {
      alert('Failed to create backup');
    }
  };

  const runBackup = async (backup) => {
    if (activeBackup) {
      alert('Another backup is running');
      return;
    }

    const startTime = Date.now();
    setActiveBackup(backup.id);
    setProgress(0);
    
    const updatedBackup = {
      ...backup,
      status: 'running',
      lastRun: startTime
    };
    await updateBackup(updatedBackup);
    
    addLog('info', `Starting backup: ${backup.name}`);

    const phases = [
      { name: 'Scanning', duration: 2000, progress: 15 },
      { name: 'Hashing', duration: 2500, progress: 35 },
      { name: 'Changes', duration: 1500, progress: 50 },
      { name: 'Compressing', duration: 2000, progress: 70 },
      { name: 'Uploading', duration: 3000, progress: 90 },
      { name: 'Verifying', duration: 1000, progress: 100 }
    ];

    let currentPhase = 0;
    
    const executePhase = async () => {
      if (currentPhase >= phases.length) {
        const duration = Date.now() - startTime;
        const success = Math.random() > 0.1;
        const filesProcessed = Math.floor(Math.random() * 500) + 100;
        const sizeBytes = Math.floor(Math.random() * 500000000) + 10000000;

        const finalBackup = {
          ...updatedBackup,
          status: success ? 'success' : 'failed',
          totalRuns: backup.totalRuns + 1,
          successfulRuns: backup.successfulRuns + (success ? 1 : 0),
          totalSize: backup.totalSize + sizeBytes,
          filesBackedUp: backup.filesBackedUp + filesProcessed
        };

        await updateBackup(finalBackup);
        setActiveBackup(null);
        setProgress(0);

        if (success) {
          addLog('success', `Backup completed: ${backup.name} (${filesProcessed} files, ${formatBytes(sizeBytes)})`);
        } else {
          addLog('error', `Backup failed: ${backup.name}`);
        }
        return;
      }

      const phase = phases[currentPhase];
      addLog('info', `${backup.name}: ${phase.name}`);
      
      const startProgress = currentPhase > 0 ? phases[currentPhase - 1].progress : 0;
      const endProgress = phase.progress;
      const steps = 20;
      const stepDuration = phase.duration / steps;
      
      let step = 0;
      progressInterval.current = setInterval(() => {
        step++;
        const newProgress = startProgress + ((endProgress - startProgress) * (step / steps));
        setProgress(Math.min(newProgress, 100));
        
        if (step >= steps) {
          clearInterval(progressInterval.current);
          currentPhase++;
          setTimeout(executePhase, 100);
        }
      }, stepDuration);
    };

    executePhase();
  };

  const stopBackup = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (activeBackup) {
      const backup = backups.find(b => b.id === activeBackup);
      if (backup) {
        updateBackup({ ...backup, status: 'cancelled' });
        addLog('warning', `Backup cancelled: ${backup.name}`);
      }
    }
    setActiveBackup(null);
    setProgress(0);
  };

  const updateBackup = async (backup) => {
    try {
      await window.storage.set(`backup:${backup.id}`, JSON.stringify(backup));
      setBackups(backups.map(b => b.id === backup.id ? backup : b));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const deleteBackup = async (id) => {
    if (!window.confirm('Delete this backup?')) return;
    
    try {
      await window.storage.delete(`backup:${id}`);
      setBackups(backups.filter(b => b.id !== id));
      addLog('info', 'Deleted backup');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const addLog = async (type, message) => {
    const log = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      type,
      message
    };

    try {
      await window.storage.set(`log:${log.id}`, JSON.stringify(log));
      setLogs([log, ...logs].slice(0, 100));
    } catch (error) {
      console.error('Log failed:', error);
    }
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inertiavault-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getDestination = (destId) => {
    return destinations.find(d => d.id === destId);
  };

  const getStats = () => {
    const total = backups.length;
    const totalRuns = backups.reduce((sum, b) => sum + b.totalRuns, 0);
    const totalSuccess = backups.reduce((sum, b) => sum + b.successfulRuns, 0);
    const successRate = totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) : 0;
    const totalSize = backups.reduce((sum, b) => sum + b.totalSize, 0);
    
    return { total, totalRuns, successRate, totalSize };
  };

  const getLogIcon = (type) => {
    if (type === 'success') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (type === 'error') return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (type === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return <Activity className="w-5 h-5 text-blue-400" />;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">InertiaVault</h1>
              <p className="text-indigo-200">Intelligent Backup & Recovery</p>
            </div>
          </div>
        </header>

        <nav className="flex gap-2 mb-8 bg-gray-800/50 backdrop-blur rounded-xl p-2">
          <button
            onClick={() => setView('dashboard')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
              view === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setView('backups')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
              view === 'backups'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <HardDrive className="w-5 h-5 inline mr-2" />
            Backups ({backups.length})
          </button>
          <button
            onClick={() => setView('logs')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
              view === 'logs'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Logs
          </button>
        </nav>

        {activeBackup && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-white animate-pulse" />
                <h3 className="text-xl font-bold text-white">Backup in Progress</h3>
              </div>
              <button
                onClick={stopBackup}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
            <div className="bg-white/10 rounded-full h-6 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300 flex items-center justify-end pr-3"
                style={{ width: `${progress}%` }}
              >
                <span className="text-xs font-bold text-white drop-shadow">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <p className="text-indigo-100 text-sm">
              {backups.find(b => b.id === activeBackup)?.name}
            </p>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <HardDrive className="w-8 h-8 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.total}</div>
                <div className="text-blue-100">Backups</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.totalRuns}</div>
                <div className="text-green-100">Total Runs</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-1">{stats.successRate}%</div>
                <div className="text-purple-100">Success Rate</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <Database className="w-8 h-8 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-1">{formatBytes(stats.totalSize)}</div>
                <div className="text-orange-100">Protected</div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Recent Activity
              </h2>
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 8).map(log => (
                    <div key={log.id} className="bg-gray-700/50 rounded-lg p-4 flex items-start gap-3">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-white">{log.message}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Destinations</h2>
                <div className="space-y-3">
                  {destinations.map(dest => {
                    const Icon = dest.icon;
                    const count = backups.filter(b => b.destination === dest.id).length;
                    return (
                      <div key={dest.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-3">
                        <Icon className="w-8 h-8 text-indigo-400" />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{dest.name}</h3>
                          <p className="text-sm text-gray-400">{count} backup{count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
                <div className="space-y-3">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="w-6 h-6 text-indigo-400" />
                      <h3 className="text-white font-semibold">Incremental Backups</h3>
                    </div>
                    <p className="text-sm text-gray-400">Hash-based change detection</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-6 h-6 text-green-400" />
                      <h3 className="text-white font-semibold">Compression</h3>
                    </div>
                    <p className="text-sm text-gray-400">Save storage space</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6 text-purple-400" />
                      <h3 className="text-white font-semibold">Scheduling</h3>
                    </div>
                    <p className="text-sm text-gray-400">Automated backups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'backups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Configurations</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New
              </button>
            </div>

            {isCreating && (
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Create Backup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={newBackup.name}
                      onChange={(e) => setNewBackup({ ...newBackup, name: e.target.value })}
                      placeholder="My Backup"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                      <input
                        type="text"
                        value={newBackup.source}
                        onChange={(e) => setNewBackup({ ...newBackup, source: e.target.value })}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Destination</label>
                      <select
                        value={newBackup.destination}
                        onChange={(e) => setNewBackup({ ...newBackup, destination: e.target.value })}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {destinations.map(dest => (
                          <option key={dest.id} value={dest.id}>{dest.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
                    <select
                      value={newBackup.schedule}
                      onChange={(e) => setNewBackup({ ...newBackup, schedule: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {schedules.map(sched => (
                        <option key={sched.value} value={sched.value}>{sched.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBackup.incremental}
                        onChange={(e) => setNewBackup({ ...newBackup, incremental: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span>Incremental</span>
                    </label>
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBackup.compression}
                        onChange={(e) => setNewBackup({ ...newBackup, compression: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span>Compression</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={createBackup}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {backups.length === 0 && !isCreating ? (
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-12 text-center">
                <HardDrive className="w-20 h-20 mx-auto text-gray-600 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Backups</h3>
                <p className="text-gray-400 mb-6">Create your first backup</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Create Backup
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map(backup => {
                  const dest = getDestination(backup.destination);
                  const DestIcon = dest?.icon || HardDrive;
                  const isRunning = backup.id === activeBackup;
                  
                  return (
                    <div key={backup.id} className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <DestIcon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white">{backup.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{backup.source} → {dest?.name}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-500/20 text-indigo-400">
                                {schedules.find(s => s.value === backup.schedule)?.label}
                              </span>
                              {backup.incremental && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                  Incremental
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => runBackup(backup)}
                            disabled={isRunning}
                            className={`p-2 rounded-lg transition-all ${
                              isRunning 
                                ? 'bg-yellow-500/20 text-yellow-400 cursor-wait' 
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {isRunning ? <Clock className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{backup.totalRuns}</div>
                          <div className="text-sm text-gray-400">Runs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{backup.successfulRuns}</div>
                          <div className="text-sm text-gray-400">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{formatBytes(backup.totalSize)}</div>
                          <div className="text-sm text-gray-400">Size</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
              <button
                onClick={exportLogs}
                disabled={logs.length === 0}
                className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-500/30 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-20 h-20 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Logs</h3>
                  <p className="text-gray-400">Run backups to generate logs</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map(log => (
                    <div key={log.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getLogIcon(log.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-white">{log.message}</p>
                          <p className="text-sm text-gray-400 mt-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InertiaVault;