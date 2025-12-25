import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Create Supabase client
export const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Helper functions for database operations
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOrders(limit = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function getOrderByNumber(orderNumber) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOrderStats() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('amount, status, created_at');
  
  if (error) throw error;
  
  const total = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
  const completed = orders.filter(o => o.status === 'completed').length;
  const pending = orders.filter(o => o.status === 'pending').length;
  
  return {
    totalOrders: orders.length,
    totalRevenue: total,
    completedOrders: completed,
    pendingOrders: pending,
  };
}

export async function updateOrderStatus(orderNumber, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('order_number', orderNumber)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
