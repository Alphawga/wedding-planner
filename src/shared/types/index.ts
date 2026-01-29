export interface Task {
    task_id: string;
    task_name: string;
    phase: string;
    category: string;
    assigned_to: string;
    due_date: string;
    status: TaskStatus;
    priority: Priority;
    estimated_cost: number;
    actual_cost: number;
    vendor_name: string;
    vendor_phone: string;
    notes: string;
    completed_date: string;
    created_at: string;
    updated_at: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Phase {
    phase_id: string;
    phase_name: string;
    phase_order: number;
    color_code: string;
}

export interface Vendor {
    vendor_id: string;
    vendor_name: string;
    category: string;
    contact_person: string;
    phone: string;
    email: string;
    instagram: string;
    contract_signed: boolean;
    deposit_paid: boolean;
    total_cost: number;
    amount_paid: number;
    balance: number;
    payment_due_date: string;
    rating: number;
    notes: string;
}

export interface BudgetItem {
    budget_id: string;
    category: string;
    item: string;
    estimated_cost: number;
    actual_cost: number;
    amount_paid: number;
    payment_date: string;
    vendor: string;
    payment_method: string;
    notes: string;
}

export interface BridalPartyMember {
    member_id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    outfit_status: string;
    shoe_size: string;
    rehearsal_confirmed: boolean;
    notes: string;
}

export interface Settings {
    wedding_date: string;
    bride_name: string;
    groom_name: string;
    wedding_hashtag: string;
    total_budget: number;
}
