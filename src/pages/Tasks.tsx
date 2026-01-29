import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, Badge, Button, Modal, Input, Select, Textarea } from '../components/ui';
import { useTasks } from '../hooks/useTasks';
import { PHASES, TASK_CATEGORIES } from '../shared/constants';
import type { Task, TaskStatus, Priority } from '../shared/types';
import { formatShortDate, isOverdue, getWhatsAppLink, getPhoneLink } from '../lib/utils';

export function Tasks() {
    const { tasks, updateTaskStatus, addTask, deleteTask } = useTasks();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(PHASES.map(p => p.phase_name)));
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.task_name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, search, statusFilter]);

    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};
        PHASES.forEach(phase => {
            const phaseTasks = filteredTasks.filter(t => t.phase === phase.phase_name);
            if (phaseTasks.length > 0) {
                groups[phase.phase_name] = phaseTasks;
            }
        });
        return groups;
    }, [filteredTasks]);

    const togglePhase = (phase: string) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            if (next.has(phase)) next.delete(phase);
            else next.add(phase);
            return next;
        });
    };

    const handleToggleComplete = (task: Task) => {
        const newStatus: TaskStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
        updateTaskStatus(task.task_id, newStatus);
    };

    const completedCount = tasks.filter(t => t.status === 'Completed').length;

    return (
        <div className="pb-24 px-5 pt-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-warm-800 heading-serif">To-Do List</h1>
                <p className="text-sm text-warm-500 mt-1">{completedCount} of {tasks.length} tasks completed</p>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 bg-white rounded-2xl text-sm border border-warm-200 focus:border-primary-400 focus:ring-3 focus:ring-primary-100"
                />
                {!search && (
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                )}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {['all', 'Not Started', 'In Progress', 'Completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-warm-600 border border-warm-200'
                            }`}
                    >
                        {status === 'all' ? 'All Tasks' : status}
                    </button>
                ))}
            </div>

            {/* Task Groups */}
            <div className="space-y-5">
                {Object.entries(groupedTasks).map(([phase, phaseTasks]) => {
                    const phaseData = PHASES.find(p => p.phase_name === phase);
                    const isExpanded = expandedPhases.has(phase);
                    const completedInPhase = phaseTasks.filter(t => t.status === 'Completed').length;

                    return (
                        <div key={phase}>
                            <button
                                onClick={() => togglePhase(phase)}
                                className="flex items-center justify-between w-full py-3 px-1"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: phaseData?.color_code }}
                                    />
                                    <span className="font-semibold text-warm-800">{phase}</span>
                                    <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">
                                        {completedInPhase}/{phaseTasks.length}
                                    </span>
                                </div>
                                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDown className="w-5 h-5 text-warm-400" />
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="space-y-3 pl-1 animate-fade-in">
                                    {phaseTasks.map(task => (
                                        <Card key={task.task_id} onClick={() => setSelectedTask(task)}>
                                            <CardContent className="flex items-start gap-4 py-4">
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleToggleComplete(task); }}
                                                    className={`mt-0.5 checkbox-elegant ${task.status === 'Completed' ? 'checked' : ''}`}
                                                >
                                                    {task.status === 'Completed' && <Check className="w-3.5 h-3.5 text-white" />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${task.status === 'Completed'
                                                        ? 'text-warm-400 line-through'
                                                        : isOverdue(task.due_date, task.status)
                                                            ? 'text-red-500'
                                                            : 'text-warm-700'
                                                        }`}>
                                                        {task.task_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        <Badge variant="priority" value={task.priority} />
                                                        <span className={`text-xs ${isOverdue(task.due_date, task.status) ? 'text-red-400' : 'text-warm-400'}`}>
                                                            Due: {formatShortDate(task.due_date)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-warm-300 mt-0.5" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fab fixed bottom-24 right-5"
            >
                <Plus className="w-6 h-6" />
            </button>

            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onDelete={deleteTask}
                onToggleComplete={handleToggleComplete}
            />

            <AddTaskModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addTask}
            />
        </div>
    );
}

function TaskDetailModal({
    task,
    onClose,
    onDelete,
    onToggleComplete
}: {
    task: Task | null;
    onClose: () => void;
    onDelete: (id: string) => void;
    onToggleComplete: (task: Task) => void;
}) {
    if (!task) return null;

    const phaseData = PHASES.find(p => p.phase_name === task.phase);

    return (
        <Modal isOpen={!!task} onClose={onClose} title="Task Details">
            <div className="p-5 space-y-5">
                <div>
                    <h3 className="text-xl font-semibold text-warm-800 heading-serif">{task.task_name}</h3>
                    <div className="flex items-center gap-2 mt-3">
                        <Badge variant="priority" value={task.priority} />
                        <Badge variant="status" value={task.status} />
                    </div>
                </div>

                <div className="space-y-4 bg-warm-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phaseData?.color_code }} />
                        <span className="text-sm text-warm-600">{task.phase}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-warm-500">Category</span>
                        <span className="text-warm-700 font-medium">{task.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-warm-500">Assigned to</span>
                        <span className="text-warm-700 font-medium">{task.assigned_to || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-warm-500">Due date</span>
                        <span className={isOverdue(task.due_date, task.status) ? 'text-red-500 font-medium' : 'text-warm-700 font-medium'}>
                            {formatShortDate(task.due_date)}
                        </span>
                    </div>
                </div>

                {task.vendor_name && (
                    <div className="bg-warm-50 rounded-2xl p-4">
                        <p className="text-sm text-warm-500 mb-2">Vendor</p>
                        <p className="text-sm font-medium text-warm-700">{task.vendor_name}</p>
                        {task.vendor_phone && (
                            <div className="flex gap-2 mt-3">
                                <a
                                    href={getPhoneLink(task.vendor_phone)}
                                    className="flex-1 py-2.5 text-center bg-white rounded-xl text-sm font-medium text-warm-600 border border-warm-200"
                                >
                                    Call
                                </a>
                                <a
                                    href={getWhatsAppLink(task.vendor_phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2.5 text-center bg-green-50 rounded-xl text-sm font-medium text-green-600 border border-green-200"
                                >
                                    WhatsApp
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {task.notes && (
                    <div>
                        <p className="text-sm text-warm-500 mb-2">Notes</p>
                        <p className="text-sm text-warm-700 bg-warm-50 p-4 rounded-2xl">{task.notes}</p>
                    </div>
                )}

                <div className="pt-4 space-y-3">
                    <Button
                        fullWidth
                        variant={task.status === 'Completed' ? 'secondary' : 'primary'}
                        onClick={() => { onToggleComplete(task); onClose(); }}
                    >
                        {task.status === 'Completed' ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </Button>
                    <Button
                        fullWidth
                        variant="danger"
                        onClick={() => { onDelete(task.task_id); onClose(); }}
                    >
                        Delete Task
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

function AddTaskModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (task: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>) => void;
}) {
    const [formData, setFormData] = useState({
        task_name: '',
        phase: PHASES[0].phase_name,
        category: TASK_CATEGORIES[0],
        assigned_to: '',
        due_date: '',
        status: 'Not Started' as TaskStatus,
        priority: 'Medium' as Priority,
        estimated_cost: 0,
        actual_cost: 0,
        vendor_name: '',
        vendor_phone: '',
        notes: '',
        completed_date: '',
    });

    const handleSubmit = () => {
        if (!formData.task_name || !formData.due_date) return;
        onAdd(formData);
        setFormData({
            task_name: '',
            phase: PHASES[0].phase_name,
            category: TASK_CATEGORIES[0],
            assigned_to: '',
            due_date: '',
            status: 'Not Started',
            priority: 'Medium',
            estimated_cost: 0,
            actual_cost: 0,
            vendor_name: '',
            vendor_phone: '',
            notes: '',
            completed_date: '',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
            <div className="p-5 space-y-4">
                <Input
                    label="Task Name"
                    value={formData.task_name}
                    onChange={e => setFormData(prev => ({ ...prev, task_name: e.target.value }))}
                    placeholder="e.g., Book venue"
                />
                <Select
                    label="Phase"
                    value={formData.phase}
                    onChange={e => setFormData(prev => ({ ...prev, phase: e.target.value }))}
                    options={PHASES.map(p => ({ value: p.phase_name, label: p.phase_name }))}
                />
                <Select
                    label="Category"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    options={TASK_CATEGORIES.map(c => ({ value: c, label: c }))}
                />
                <Select
                    label="Priority"
                    value={formData.priority}
                    onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                    options={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' },
                        { value: 'Urgent', label: 'Urgent' },
                    ]}
                />
                <Input
                    label="Due Date"
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
                <Input
                    label="Assigned To"
                    value={formData.assigned_to}
                    onChange={e => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    placeholder="e.g., Bride, Groom"
                />
                <Textarea
                    label="Notes"
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional details..."
                />
                <div className="pt-2">
                    <Button fullWidth onClick={handleSubmit}>Add Task</Button>
                </div>
            </div>
        </Modal>
    );
}
