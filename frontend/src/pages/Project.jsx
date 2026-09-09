import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Circle,
  Clock,
  CheckCircle2,
  Calendar,
  Trash2,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Users,
  Crown,
  UserPlus,
  UserMinus,
  Flag,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';

/* ─── Status config ───────────────────────────────────────────────── */
const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    icon: Circle,
    color: 'text-nova-accent-light',
    bg: 'bg-nova-accent/10',
    border: 'border-nova-accent/20',
    dot: 'bg-nova-accent',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-nova-amber',
    bg: 'bg-nova-amber/10',
    border: 'border-nova-amber/20',
    dot: 'bg-nova-amber',
  },
  DONE: {
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-nova-emerald',
    bg: 'bg-nova-emerald/10',
    border: 'border-nova-emerald/20',
    dot: 'bg-nova-emerald',
  },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'text-nova-text-muted', bg: 'bg-white/5', border: 'border-white/10' },
  MEDIUM: { label: 'Medium', color: 'text-nova-amber', bg: 'bg-nova-amber/10', border: 'border-nova-amber/20' },
  HIGH: { label: 'High', color: 'text-nova-rose', bg: 'bg-nova-rose/10', border: 'border-nova-rose/20' },
};

/* ─── Avatar helpers ──────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-violet-600', 'bg-indigo-600', 'bg-cyan-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-pink-600',
];

function getAvatarColor(userId) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

/* ─── MemberAvatar ────────────────────────────────────────────────── */
function MemberAvatar({ member, size = 'sm', showTooltip = true }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <div className="relative group/avatar">
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-nova-bg ${getAvatarColor(member.id)}`}
        title={member.name}
      >
        {getInitials(member.name)}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-nova-surface text-nova-text-bright text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/avatar:opacity-100 transition-opacity z-10 border border-nova-border shadow-lg">
          {member.name}
          {member.role && (
            <span className={`ml-1.5 ${member.role === 'OWNER' ? 'text-nova-amber' : 'text-nova-text-muted'}`}>
              · {member.role === 'OWNER' ? 'Owner' : 'Contributor'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'OWNER' | 'CONTRIBUTOR'

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', priority: 'MEDIUM', assignee_ids: [] });
  const [creating, setCreating] = useState(false);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Remove member
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Delete project
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Toggle project status
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Edit task
  const [editingTask, setEditingTask] = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setUserRole(res.data.user_role);
    } catch (e) {
      if (e.response?.status === 401) navigate('/login');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  /* ── Task creation ──────────────────────────────────────────────── */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: newTask.title,
        description: newTask.description,
        deadline: newTask.deadline || null,
        priority: newTask.priority,
        assignee_ids: newTask.assignee_ids,
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', deadline: '', priority: 'MEDIUM', assignee_ids: [] });
      fetchProject();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  /* ── Task status update ─────────────────────────────────────────── */
  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchProject();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Task delete ────────────────────────────────────────────────── */
  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Toggle project status ──────────────────────────────────────── */
  const handleToggleProjectStatus = async () => {
    if (!project) return;
    const newStatus = project.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    setTogglingStatus(true);
    try {
      await api.put(`/projects/${id}`, { status: newStatus });
      fetchProject();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(false);
    }
  };

  /* ── Delete project ─────────────────────────────────────────────── */
  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setDeletingProject(false);
    }
  };

  /* ── Invite member ──────────────────────────────────────────────── */
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await api.post(`/projects/${id}/members`, { email: inviteEmail });
      setInviteSuccess(res.data.message);
      setInviteEmail('');
      fetchProject();
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to invite member.');
    } finally {
      setInviting(false);
    }
  };

  /* ── Remove member ──────────────────────────────────────────────── */
  const handleRemoveMember = async (userId) => {
    setRemovingMemberId(userId);
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingMemberId(null);
    }
  };

  /* ── Assignee toggle in task modal ─────────────────────────────── */
  const toggleAssignee = (userId) => {
    setNewTask((prev) => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(userId)
        ? prev.assignee_ids.filter((id) => id !== userId)
        : [...prev.assignee_ids, userId],
    }));
  };

  /* ── Deadline helpers ───────────────────────────────────────────── */
  const formatDeadline = (deadlineStr) => {
    if (!deadlineStr) return null;
    try {
      const parts = deadlineStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString(undefined, {
          month: 'short', day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });
      }
      return new Date(deadlineStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return deadlineStr; }
  };

  const getDeadlineState = (deadlineStr, taskStatus) => {
    if (!deadlineStr) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    const deadlineDate = deadlineStr.slice(0, 10);
    if (taskStatus === 'DONE') return { type: 'done', label: `Due ${formatDeadline(deadlineStr)}` };
    if (deadlineDate < todayStr) return { type: 'overdue', label: `Overdue (${formatDeadline(deadlineStr)})` };
    if (deadlineDate === todayStr) return { type: 'today', label: 'Due Today' };
    return { type: 'upcoming', label: `Due ${formatDeadline(deadlineStr)}` };
  };

  /* ── Loading state ──────────────────────────────────────────────── */
  if (!project) {
    return (
      <div className="min-h-screen bg-nova-bg">
        <Navbar variant="solid" />
        <div className="flex items-center justify-center pt-32">
          <svg className="animate-spin h-8 w-8 text-nova-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  const columns = [
    { status: 'TODO', nextStatus: 'IN_PROGRESS' },
    { status: 'IN_PROGRESS', nextStatus: 'DONE' },
    { status: 'DONE', nextStatus: null },
  ];
  const prevStatus = { IN_PROGRESS: 'TODO', DONE: 'IN_PROGRESS' };

  const isOwner = userRole === 'OWNER';
  const isCompleted = project.status === 'COMPLETED';
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => t.status === 'DONE').length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const members = project.members || [];

  /* ── Can the current user move a task? ───────────────────────────── */
  const canMoveTask = (task) => {
    if (isOwner) return true;
    return task.assignees?.some((a) => a.id === currentUser.id);
  };

  return (
    <div className="min-h-screen bg-nova-bg">
      <Navbar variant="solid" />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-nova-text-muted hover:text-nova-accent-light transition-colors text-sm mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Projects
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Title & meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-nova-text-bright">{project.name}</h1>

                  {/* Project status badge */}
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-nova-emerald/15 text-nova-emerald border border-nova-emerald/30">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-nova-amber/15 text-nova-amber border border-nova-amber/30">
                      <Clock size={14} /> In Progress
                    </span>
                  )}

                  {/* My role badge */}
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-nova-amber/10 text-nova-amber border border-nova-amber/20">
                      <Crown size={12} /> Owner
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-nova-accent/10 text-nova-accent-light border border-nova-accent/20">
                      <User size={12} /> Contributor
                    </span>
                  )}
                </div>

                {project.description && (
                  <p className="text-nova-text-muted text-sm max-w-2xl leading-relaxed">{project.description}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {isOwner && (
                  <>
                    <button
                      onClick={handleToggleProjectStatus}
                      disabled={togglingStatus}
                      className={`flex items-center gap-2 text-sm !py-2.5 !px-4 rounded-lg font-semibold transition-all shadow-sm ${
                        isCompleted
                          ? 'btn-nova-outline text-nova-text hover:text-nova-text-bright'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-emerald-900/30'
                      }`}
                    >
                      {isCompleted ? <><RotateCcw size={16} /> Reopen</> : <><CheckCircle2 size={16} /> Mark Complete</>}
                    </button>

                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-lg font-semibold border border-nova-border hover:border-nova-accent/40 text-nova-text-muted hover:text-nova-accent-light hover:bg-nova-accent/5 transition-all"
                    >
                      <UserPlus size={16} /> Invite
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="btn-nova flex items-center gap-2 text-sm !py-2.5"
                >
                  <Plus size={18} /> Add Task
                </button>

                {isOwner && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2.5 rounded-lg border border-nova-border hover:border-nova-rose/40 text-nova-text-muted hover:text-nova-rose hover:bg-nova-rose/10 transition-all"
                    title="Delete Project"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {isCompleted ? <Sparkles size={20} className="text-nova-emerald" /> : <Clock size={20} className="text-nova-accent-light" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-nova-text-bright">
                    {isCompleted ? 'Project Successfully Finished 🎉' : 'Project Progress'}
                  </div>
                  <div className="text-xs text-nova-text-muted">
                    {completedTasks} of {totalTasks} tasks completed ({progressPercent}%)
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-nova-emerald' : 'bg-gradient-to-r from-nova-accent to-nova-cyan'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Main layout: Kanban + Team ──────────────────────────── */}
          <div className="flex flex-col xl:flex-row gap-6">

            {/* Kanban Board */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5">
              {columns.map(({ status, nextStatus }) => {
                const config = STATUS_CONFIG[status];
                const StatusIcon = config.icon;
                const tasks = project.tasks.filter((t) => t.status === status);

                return (
                  <div key={status} className="glass rounded-2xl p-5 min-h-[380px] flex flex-col">
                    {/* Column header */}
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                      <h3 className="text-sm font-semibold text-nova-text-bright uppercase tracking-wider">
                        {config.label}
                      </h3>
                      <span className="ml-auto text-xs text-nova-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3 flex-1">
                      {tasks.map((t) => {
                        const deadlineInfo = getDeadlineState(t.deadline, t.status);
                        const priorityConf = PRIORITY_CONFIG[t.priority || 'MEDIUM'];
                        const movable = canMoveTask(t);

                        return (
                          <div
                            key={t.id}
                            className={`glass-card rounded-xl p-4 !border ${config.border} group/task relative`}
                          >
                            {/* Title row */}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className={`font-semibold text-sm leading-snug ${t.status === 'DONE' ? 'text-nova-text-muted line-through' : 'text-nova-text-bright'}`}>
                                {t.title}
                              </h4>
                              {isOwner && (
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  className="text-nova-text-muted hover:text-nova-rose opacity-0 group-hover/task:opacity-100 transition-opacity p-1 shrink-0"
                                  title="Delete task"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            {/* Description */}
                            {t.description && (
                              <p className="text-xs text-nova-text-muted mb-2.5 leading-relaxed line-clamp-2">
                                {t.description}
                              </p>
                            )}

                            {/* Assignees row */}
                            {t.assignees && t.assignees.length > 0 && (
                              <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="flex -space-x-1.5">
                                  {t.assignees.slice(0, 3).map((a) => (
                                    <MemberAvatar key={a.id} member={a} size="sm" />
                                  ))}
                                  {t.assignees.length > 3 && (
                                    <div className="w-7 h-7 rounded-full bg-nova-surface flex items-center justify-center text-[10px] text-nova-text-muted font-medium ring-2 ring-nova-bg">
                                      +{t.assignees.length - 3}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[11px] text-nova-text-muted">
                                  {t.assignees.length === 1 ? t.assignees[0].name.split(' ')[0] : `${t.assignees.length} assignees`}
                                </span>
                              </div>
                            )}

                            {/* No assignees */}
                            {(!t.assignees || t.assignees.length === 0) && (
                              <div className="flex items-center gap-1 mb-2.5">
                                <User size={11} className="text-nova-text-muted/40" />
                                <span className="text-[11px] text-nova-text-muted/40">Unassigned</span>
                              </div>
                            )}

                            {/* Priority + Deadline badges */}
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${priorityConf.color} ${priorityConf.bg} ${priorityConf.border}`}>
                                <Flag size={9} />
                                {priorityConf.label}
                              </span>

                              {deadlineInfo && (
                                <>
                                  {deadlineInfo.type === 'overdue' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-nova-rose bg-nova-rose/15 px-1.5 py-0.5 rounded-md border border-nova-rose/30">
                                      <AlertCircle size={10} /> {deadlineInfo.label}
                                    </span>
                                  )}
                                  {deadlineInfo.type === 'today' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-nova-amber bg-nova-amber/15 px-1.5 py-0.5 rounded-md border border-nova-amber/30">
                                      <Clock size={10} /> {deadlineInfo.label}
                                    </span>
                                  )}
                                  {deadlineInfo.type === 'upcoming' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-nova-text-muted bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10">
                                      <Calendar size={10} /> {deadlineInfo.label}
                                    </span>
                                  )}
                                  {deadlineInfo.type === 'done' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-nova-emerald bg-nova-emerald/10 px-1.5 py-0.5 rounded-md border border-nova-emerald/20">
                                      <CheckCircle2 size={10} /> {deadlineInfo.label}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Move buttons */}
                            {movable && (
                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                {prevStatus[status] && (
                                  <button
                                    onClick={() => updateTaskStatus(t.id, prevStatus[status])}
                                    className="flex items-center gap-1 text-xs text-nova-text-muted hover:text-nova-accent-light transition-colors group"
                                    title={`Move to ${STATUS_CONFIG[prevStatus[status]].label}`}
                                  >
                                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                    Back
                                  </button>
                                )}
                                {nextStatus && (
                                  <button
                                    onClick={() => updateTaskStatus(t.id, nextStatus)}
                                    className={`flex items-center gap-1 text-xs ml-auto transition-colors group ${
                                      nextStatus === 'DONE'
                                        ? 'text-nova-emerald/70 hover:text-nova-emerald font-medium'
                                        : 'text-nova-text-muted hover:text-nova-accent-light'
                                    }`}
                                    title={`Move to ${STATUS_CONFIG[nextStatus].label}`}
                                  >
                                    {STATUS_CONFIG[nextStatus].label}
                                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Empty column */}
                      {tasks.length === 0 && (
                        <div className="text-center py-10 text-nova-text-muted/30">
                          <StatusIcon size={28} className="mx-auto mb-2 opacity-50" />
                          <p className="text-xs">No tasks in {config.label}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Team Panel ──────────────────────────────────────── */}
            <div className="xl:w-72 shrink-0">
              <div className="glass rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-nova-accent-light" />
                    <h3 className="text-sm font-semibold text-nova-text-bright">Team</h3>
                    <span className="text-xs text-nova-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                      {members.length}
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="p-1.5 rounded-lg text-nova-text-muted hover:text-nova-accent-light hover:bg-nova-accent/10 transition-all"
                      title="Invite member"
                    >
                      <UserPlus size={15} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 group/member">
                      <MemberAvatar member={m} size="md" showTooltip={false} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-nova-text-bright truncate flex items-center gap-1.5">
                          {m.name}
                          {m.id === currentUser.id && (
                            <span className="text-[10px] text-nova-text-muted">(you)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {m.role === 'OWNER' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-nova-amber">
                              <Crown size={10} /> Owner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-nova-text-muted">
                              <User size={10} /> Contributor
                            </span>
                          )}
                        </div>
                      </div>
                      {isOwner && m.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          disabled={removingMemberId === m.id}
                          className="opacity-0 group-hover/member:opacity-100 p-1.5 rounded-lg text-nova-text-muted hover:text-nova-rose hover:bg-nova-rose/10 transition-all disabled:opacity-50"
                          title="Remove member"
                        >
                          {removingMemberId === m.id ? (
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <UserMinus size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  ))}

                  {members.length === 0 && (
                    <p className="text-xs text-nova-text-muted/50 text-center py-4">No team members yet</p>
                  )}
                </div>

                {isOwner && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-nova-border hover:border-nova-accent/40 text-nova-text-muted hover:text-nova-accent-light text-xs font-medium transition-all hover:bg-nova-accent/5"
                  >
                    <UserPlus size={14} /> Invite Contributor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Create Task Modal ───────────────────────────────────────── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTaskModal(false)} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-md shadow-nova-lg animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-4 right-4 text-nova-text-muted hover:text-nova-text transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-nova-text-bright mb-6">Add Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-nova-text-muted mb-1.5">Task Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  placeholder="e.g., Implement auth middleware"
                  className="input-glow"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-nova-text-muted mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Details, requirements, or notes..."
                  rows={3}
                  className="input-glow resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-nova-text-muted mb-1.5">
                  <Flag size={14} className="inline mr-1.5 text-nova-accent-light" />
                  Priority
                </label>
                <div className="flex gap-2">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        newTask.priority === p
                          ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} ${PRIORITY_CONFIG[p].border}`
                          : 'border-white/10 text-nova-text-muted hover:border-white/20'
                      }`}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-nova-text-muted flex items-center gap-1.5">
                    <Calendar size={14} className="text-nova-accent-light" /> Deadline (Optional)
                  </label>
                  {newTask.deadline && (
                    <button type="button" onClick={() => setNewTask({ ...newTask, deadline: '' })} className="text-xs text-nova-rose hover:underline">
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="input-glow [color-scheme:dark]"
                />
              </div>

              {/* Assignees */}
              {members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-nova-text-muted mb-2">
                    <Users size={14} className="inline mr-1.5 text-nova-accent-light" />
                    Assign To
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {members.map((m) => {
                      const selected = newTask.assignee_ids.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${
                            selected
                              ? 'border-nova-accent/40 bg-nova-accent/10'
                              : 'border-white/5 hover:border-white/15 hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleAssignee(m.id)}
                            className="sr-only"
                          />
                          <MemberAvatar member={m} size="sm" showTooltip={false} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-nova-text-bright truncate">{m.name}</div>
                            <div className="text-[11px] text-nova-text-muted">{m.role === 'OWNER' ? 'Owner' : 'Contributor'}</div>
                          </div>
                          {selected && <CheckCircle2 size={15} className="text-nova-accent-light shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-nova-outline text-sm !py-2.5 !px-5">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-nova text-sm !py-2.5 !px-5 disabled:opacity-50">
                  {creating ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Invite Member Modal ─────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); setInviteEmail(''); }} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-sm shadow-nova-lg animate-fade-in-up">
            <button
              onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); setInviteEmail(''); }}
              className="absolute top-4 right-4 text-nova-text-muted hover:text-nova-text transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-11 h-11 rounded-xl bg-nova-accent/10 border border-nova-accent/20 flex items-center justify-center text-nova-accent-light mb-5">
              <UserPlus size={22} />
            </div>
            <h2 className="text-xl font-bold text-nova-text-bright mb-1">Invite Contributor</h2>
            <p className="text-sm text-nova-text-muted mb-6">Enter the email of a registered user to add them to this project.</p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nova-text-muted mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess(''); }}
                  required
                  placeholder="colleague@example.com"
                  className="input-glow"
                />
              </div>

              {inviteError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-nova-rose/10 border border-nova-rose/20 text-nova-rose text-sm">
                  <AlertCircle size={15} className="shrink-0" /> {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-nova-emerald/10 border border-nova-emerald/20 text-nova-emerald text-sm">
                  <CheckCircle2 size={15} className="shrink-0" /> {inviteSuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); setInviteEmail(''); }} className="btn-nova-outline text-sm !py-2.5 !px-5">
                  Cancel
                </button>
                <button type="submit" disabled={inviting} className="btn-nova text-sm !py-2.5 !px-5 disabled:opacity-50 flex items-center gap-2">
                  {inviting ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Inviting...</> : <><UserPlus size={16} /> Add Member</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Project Modal ────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deletingProject && setShowDeleteModal(false)} />
          <div className="relative glass-strong rounded-2xl p-7 w-full max-w-md shadow-2xl border border-nova-rose/20 animate-fade-in-up">
            <div className="w-12 h-12 rounded-xl bg-nova-rose/10 border border-nova-rose/20 flex items-center justify-center text-nova-rose mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-nova-text-bright mb-2">Delete Project</h3>
            <p className="text-sm text-nova-text-muted leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-nova-text-bright font-semibold">"{project.name}"</span>?
              All tasks and team memberships will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" disabled={deletingProject} onClick={() => setShowDeleteModal(false)} className="btn-nova-outline text-sm !py-2.5 !px-5 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" disabled={deletingProject} onClick={handleDeleteProject} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-nova-rose hover:bg-nova-rose/90 transition-all shadow-lg shadow-nova-rose/25 disabled:opacity-50 flex items-center gap-2">
                {deletingProject ? (
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
