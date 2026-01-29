import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, ProgressBar } from '../components/ui';
import { useTasks } from '../hooks/useTasks';
import { useBudget } from '../hooks/useBudget';
import { useSettings } from '../hooks/useSettings';
import { PHASES } from '../shared/constants';
import { formatCurrency, getDaysUntil, formatShortDate, isOverdue } from '../lib/utils';

export function Dashboard() {
    const { tasks, stats, getUrgentTasks, isLoading: tasksLoading } = useTasks();
    const { stats: budgetStats, isLoading: budgetLoading } = useBudget();
    const { settings, isLoading: settingsLoading } = useSettings();

    const isLoading = tasksLoading || budgetLoading || settingsLoading;

    const daysUntilWedding = getDaysUntil(settings.wedding_date);
    const urgentTasks = getUrgentTasks().slice(0, 4);
    const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const phaseProgress = useMemo(() => {
        return PHASES.map(phase => {
            const phaseTasks = tasks.filter(t => t.phase === phase.phase_name);
            const completed = phaseTasks.filter(t => t.status === 'Completed').length;
            return {
                ...phase,
                total: phaseTasks.length,
                completed,
                percent: phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0,
            };
        }).filter(p => p.total > 0).slice(0, 5);
    }, [tasks]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
                    <p className="text-warm-500">Loading your wedding planner...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 px-4 pt-5">
            {/* Header with couple illustration */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-primary-500" fill="currentColor" />
                </div>
                <h1 className="text-2xl font-semibold text-warm-800 heading-serif">
                    {settings.bride_name} & {settings.groom_name}
                </h1>
                <p className="text-sm text-warm-500 mt-1">{settings.wedding_hashtag}</p>
            </div>

            {/* Countdown Card */}
            <Card elevated className="mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-6 py-6 text-white text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 opacity-80" />
                        <span className="text-sm opacity-90">Days until D-Day</span>
                    </div>
                    <p className="text-5xl font-bold heading-serif">{daysUntilWedding}</p>
                    <p className="text-sm opacity-80 mt-2">{formatShortDate(settings.wedding_date)}</p>
                </div>
            </Card>

            {/* My Progress Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-warm-800 heading-serif">My Progress</h2>
                    <span className="text-sm text-primary-500 font-medium">{stats.completed} of {stats.total}</span>
                </div>
                <Card>
                    <CardContent className="py-5">
                        <ProgressBar value={progressPercent} size="lg" showLabel />
                        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-warm-100">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-warm-800">{stats.completed}</p>
                                <p className="text-xs text-warm-500 mt-1">Completed</p>
                            </div>
                            <div className="text-center border-x border-warm-100">
                                <p className="text-2xl font-bold text-warm-800">{stats.inProgress}</p>
                                <p className="text-xs text-warm-500 mt-1">In Progress</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-warm-800">{stats.notStarted}</p>
                                <p className="text-xs text-warm-500 mt-1">To Do</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Overview */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-warm-800 heading-serif">Budget</h2>
                    <Link to="/budget" className="text-sm text-primary-500 font-medium">See all</Link>
                </div>
                <Card>
                    <CardContent className="py-5">
                        <div className="flex items-baseline justify-between mb-4">
                            <div>
                                <p className="text-xs text-warm-500 mb-1">Total Balance</p>
                                <p className="text-2xl font-bold text-warm-800">{formatCurrency(budgetStats.totalBudget)}</p>
                            </div>
                            <div className="text-right">
                                <span className="pill pill-coral">{budgetStats.totalBudget > 0 ? Math.round((budgetStats.totalPaid / budgetStats.totalBudget) * 100) : 0}% Used</span>
                            </div>
                        </div>
                        <ProgressBar value={budgetStats.totalPaid} max={budgetStats.totalBudget || 1} size="md" />
                        <div className="flex justify-between mt-3 text-sm">
                            <span className="text-warm-500">Paid: <span className="text-warm-700 font-medium">{formatCurrency(budgetStats.totalPaid)}</span></span>
                            <span className="text-warm-500">Remaining: <span className="text-primary-500 font-medium">{formatCurrency(budgetStats.totalBudget - budgetStats.totalPaid)}</span></span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Next Tasks */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-warm-800 heading-serif">Next Task</h2>
                    <Link to="/tasks" className="text-sm text-primary-500 font-medium">See all</Link>
                </div>
                <div className="space-y-3">
                    {urgentTasks.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                                <p className="text-warm-500">All caught up! No urgent tasks.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        urgentTasks.map(task => (
                            <Card key={task.task_id} onClick={() => { }}>
                                <CardContent className="flex items-center gap-4">
                                    <div className={`checkbox-elegant ${task.status === 'Completed' ? 'checked' : ''}`}>
                                        {task.status === 'Completed' && (
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-warm-400 line-through' : isOverdue(task.due_date, task.status) ? 'text-red-500' : 'text-warm-700'}`}>
                                            {task.task_name}
                                        </p>
                                        <p className="text-xs text-warm-400 mt-1">
                                            Due: {formatShortDate(task.due_date)}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-warm-300" />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Phase Progress */}
            {phaseProgress.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-warm-800 heading-serif mb-4">Categories</h2>
                    <Card>
                        <CardContent className="space-y-5 py-5">
                            {phaseProgress.map(phase => (
                                <div key={phase.phase_id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: phase.color_code }}
                                            />
                                            <span className="text-sm text-warm-700">{phase.phase_name}</span>
                                        </div>
                                        <span className="text-xs text-warm-500">{phase.completed}/{phase.total}</span>
                                    </div>
                                    <ProgressBar value={phase.percent} size="sm" />
                                </div>
                            ))}
                            <Link
                                to="/tasks"
                                className="block text-center text-sm text-primary-500 font-medium pt-3 hover:text-primary-600 transition-colors"
                            >
                                View all categories →
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
