 export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    Pending: '#f39c12',
    Approved: '#2ecc71',
    Rejected: '#e74c3c',
    'In Progress': '#3498db',
  };
  return colors[status] || '#95a5a6';
};

