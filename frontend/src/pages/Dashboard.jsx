import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderOpen,
  X,
  CheckCircle2,
  Clock,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Layers,
  TrendingUp,
  Search,
  Check,
  Crown,
  Users,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';

/* ─── Avatar helpers ───────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-violet-600', 'bg-indigo-600', 'bg-cyan-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-pink-600',
];
function getAvatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) {
      if (e.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.user_role !== 'OWNER') return; // only owner can toggle
    const newStatus = project.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    setTogglingId(project.id);
    try {
      await api.put(`/projects/${project.id}`, { status: newStatus });
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Split owned vs shared
  const ownedProjects = projects.filter((p) => p.user_role === 'OWNER');
  const sharedProjects = projects.filter((p) => p.user_role === 'CONTRIBUTOR');

  // Metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status !== 'COMPLETED').length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const totalTasks = projects.reduce((sum, p) => sum + (Number(p.task_count) || 0), 0);
  const completedTasks = projects.reduce((sum, p) => sum + (Number(p.completed_task_count) || 0), 0);
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
  const totalTeamMembers = projects.reduce((sum, p) => sum + (Number(p.member_count) || 1), 0);

  // Filter & search
  const applyFilters = (list) =>
    list.filter((p) => {
      const matchesFilter =
        filter === 'ALL' ? true
          : filter === 'IN_PROGRESS' ? p.status !== 'COMPLETED'
          : p.status === 'COMPLETED';
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

  const filteredOwned = useMemo(() => applyFilters(ownedProjects), [ownedProjects, filter, searchQuery]);
  const filteredShared = useMemo(() => applyFilters(sharedProjects), [sharedProjects, filter, searchQuery]);
  const hasResults = filteredOwned.length > 0 || filteredShared.length > 0;

  /* ─── Project Card ─────────────────────────────────────────── */
  const ProjectCard = ({ p, i }) => {
    const isCompleted = p.status === 'COMPLETED';
    const taskCount = Number(p.task_count) || 0;
    const completedTaskCount = Number(p.completed_task_count) || 0;
    const progressPercent = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
    const memberCount = Number(p.member_count) || 1;
    const isOwner = p.user_role === 'OWNER';

    return (
      <Link
        key={p.id}
        to={`/projects/${p.id}`}
        className={`glass-card rounded-2xl p-6 block group relative flex flex-col justify-between animate-fade-in-up animation-delay-${Math.min((i + 1) * 100, 500)}`}
      >
        <div>
          {/* Top row */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-nova-emerald/15 text-nova-emerald border border-nova-emerald/30">
                  <CheckCircle2 size={12} /> Finished
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-nova-amber/15 text-nova-amber border border-nova-amber/30">
                  <Clock size={12} /> In Progress
                </span>
              )}

              {/* Role badge */}
              {isOwner ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-nova-amber/10 text-nova-amber border border-nova-amber/15">
                  <Crown size={10} /> Owner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-nova-accent/10 text-nova-accent-light border border-nova-accent/15">
                  <User size={10} /> Contributor
                </span>
              )}
            </div>

            {/* Quick actions — owner only */}
            <div className="flex items-center gap-1.5">
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(e, p)}
                    disabled={togglingId === p.id}
                    title={isCompleted ? 'Reopen' : 'Mark Complete'}
                    className={`p-1.5 rounded-lg text-xs transition-all ${isCompleted ? 'text-nova-emerald hover:bg-nova-emerald/10' : 'text-nova-text-muted hover:text-nova-emerald hover:bg-nova-emerald/10'}`}
                  >
                    {isCompleted ? <RotateCcw size={15} /> : <Check size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProjectToDelete(p); }}
                    title="Delete Project"
                    className="p-1.5 rounded-lg text-xs text-nova-text-muted hover:text-nova-rose hover:bg-nova-rose/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name & description */}
          <h3 className={`text-lg font-bold mb-2 transition-colors ${isCompleted ? 'text-nova-text-bright line-through decoration-nova-emerald/40 decoration-2 group-hover:text-nova-emerald' : 'text-nova-text-bright group-hover:text-nova-accent-light'}`}>
            {p.name}
          </h3>
          <p className="text-nova-text-muted text-sm line-clamp-2 leading-relaxed mb-4">
            {p.description || 'No description provided.'}
          </p>

          {/* Member count */}
          <div className="flex items-center gap-1.5 mb-4">
            <Users size={13} className="text-nova-text-muted/60" />
            <span className="text-xs text-nova-text-muted">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="pt-4 border-t border-nova-border/60">
          <div className="flex items-center justify-between text-xs text-nova-text-muted mb-1.5">
            <span>Tasks</span>
            <span className="font-medium text-nova-text">{completedTaskCount}/{taskCount} done ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-nova-emerald' : 'bg-gradient-to-r from-nova-accent to-nova-cyan'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-nova-bg">
      <Navbar variant="solid" />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-nova-text-bright mb-1">
                {user.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
              </h1>
              <p className="text-nova-text-muted text-sm">
                Track progress, collaborate with your team, and ship on schedule.
              </p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-nova flex items-center gap-2 text-sm !py-2.5 shrink-0">
              <Plus size={18} /> New Project
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-nova-text-muted">Total Projects</span>
                <div className="w-9 h-9 rounded-xl bg-nova-accent/10 border border-nova-accent/20 flex items-center justify-center text-nova-accent-light">
                  <Layers size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-nova-text-bright mb-1">{totalProjects}</div>
              <p className="text-xs text-nova-text-muted">{ownedProjects.length} owned · {sharedProjects.length} shared</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-nova-accent to-transparent opacity-50" />
            </div>

            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-nova-text-muted">In Progress</span>
                <div className="w-9 h-9 rounded-xl bg-nova-amber/10 border border-nova-amber/20 flex items-center justify-center text-nova-amber">
                  <Clock size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-nova-text-bright">{inProgressProjects}</span>
                {inProgressProjects > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nova-amber opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-nova-amber" />
                  </span>
                )}
              </div>
              <p className="text-xs text-nova-text-muted">Active workflows</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-nova-amber to-transparent opacity-50" />
            </div>

            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-nova-text-muted">Completed</span>
                <div className="w-9 h-9 rounded-xl bg-nova-emerald/10 border border-nova-emerald/20 flex items-center justify-center text-nova-emerald">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-nova-emerald mb-1">{completedProjects}</div>
              <p className="text-xs text-nova-text-muted">Delivered & done</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-nova-emerald to-transparent opacity-50" />
            </div>

            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-nova-text-muted">Team Members</span>
                <div className="w-9 h-9 rounded-xl bg-nova-cyan/10 border border-nova-cyan/20 flex items-center justify-center text-nova-cyan">
                  <Users size={18} />
                </div>
              </div>
              <div className="text-3xl font-black text-nova-text-bright mb-1">{completionRate}%</div>
              <p className="text-xs text-nova-text-muted">{completedTasks} of {totalTasks} tasks done</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-nova-cyan to-transparent opacity-50" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1.5 p-1 glass rounded-xl self-start">
              {[
                { key: 'ALL', label: `All (${totalProjects})` },
                { key: 'IN_PROGRESS', label: `In Progress (${inProgressProjects})`, icon: Clock },
                { key: 'COMPLETED', label: `Finished (${completedProjects})`, icon: CheckCircle2 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    filter === key
                      ? key === 'ALL' ? 'bg-nova-accent text-white shadow-sm'
                        : key === 'IN_PROGRESS' ? 'bg-nova-amber/20 text-nova-amber border border-nova-amber/30'
                        : 'bg-nova-emerald/20 text-nova-emerald border border-nova-emerald/30'
                      : 'text-nova-text-muted hover:text-nova-text'
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nova-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glow !py-1.5 !pl-9 !pr-4 !text-xs !rounded-xl"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-nova-text-muted hover:text-nova-text">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-nova-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasResults && (
            <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5 text-nova-accent-light">
                <FolderOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-nova-text-bright mb-2">
                {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
              </h3>
              <p className="text-nova-text-muted text-sm mb-6">
                {projects.length === 0
                  ? 'Create your first project or get invited to one to start collaborating.'
                  : 'Try clearing your search query or selecting a different filter.'}
              </p>
              {projects.length === 0 ? (
                <button onClick={() => setShowModal(true)} className="btn-nova text-sm inline-flex items-center gap-2">
                  <Plus size={16} /> Create Your First Project
                </button>
              ) : (
                <button onClick={() => { setFilter('ALL'); setSearchQuery(''); }} className="btn-nova-outline text-xs !py-2 !px-4 inline-flex items-center gap-1.5">
                  Reset Filters
                </button>
              )}
            </div>
          )}

          {/* My Projects section */}
          {!loading && filteredOwned.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <Crown size={15} className="text-nova-amber" />
                <h2 className="text-sm font-semibold text-nova-text-bright uppercase tracking-wider">My Projects</h2>
                <span className="text-xs text-nova-text-muted bg-white/5 px-2 py-0.5 rounded-full">{filteredOwned.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOwned.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
              </div>
            </div>
          )}

          {/* Shared with me section */}
          {!loading && filteredShared.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Users size={15} className="text-nova-accent-light" />
                <h2 className="text-sm font-semibold text-nova-text-bright uppercase tracking-wider">Shared with Me</h2>
                <span className="text-xs text-nova-text-muted bg-white/5 px-2 py-0.5 rounded-full">{filteredShared.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShared.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-md shadow-nova-lg animate-fade-in-up">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-nova-text-muted hover:text-nova-text transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-nova-text-bright mb-6">Create Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-nova-text-muted mb-1.5">Project Name</label>
                <input type="text" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required placeholder="e.g., Mobile App Launch" className="input-glow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-nova-text-muted mb-1.5">Description</label>
                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Briefly describe what this project covers..." rows={3} className="input-glow resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-nova-outline text-sm !py-2.5 !px-5">Cancel</button>
                <button type="submit" disabled={creating} className="btn-nova text-sm !py-2.5 !px-5 disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && setProjectToDelete(null)} />
          <div className="relative glass-strong rounded-2xl p-7 w-full max-w-md shadow-2xl border border-nova-rose/20 animate-fade-in-up">
            <div className="w-12 h-12 rounded-xl bg-nova-rose/10 border border-nova-rose/20 flex items-center justify-center text-nova-rose mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-nova-text-bright mb-2">Delete Project</h3>
            <p className="text-sm text-nova-text-muted leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-nova-text-bright font-semibold">"{projectToDelete.name}"</span>?
              All tasks and team memberships will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setProjectToDelete(null)} className="btn-nova-outline text-sm !py-2.5 !px-5 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" disabled={deleting} onClick={confirmDeleteProject} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-nova-rose hover:bg-nova-rose/90 transition-all shadow-lg shadow-nova-rose/25 disabled:opacity-50 flex items-center gap-2">
                {deleting ? (
                  <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Deleting...</>
                ) : (
                  <><Trash2 size={16} /> Delete Project</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
