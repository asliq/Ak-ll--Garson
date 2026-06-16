// English translations
export const en = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    tables: 'Tables',
    orders: 'Orders',
    kitchen: 'Kitchen',
    menu: 'Menu Management',
    reservations: 'Reservations',
    analytics: 'Analytics',
    settings: 'Settings',
    help: 'Help',
    logout: 'Logout'
  },

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    loading: 'Loading...',
    noData: 'No data found',
    error: 'An error occurred',
    success: 'Operation successful',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    viewAll: 'View All',
    refresh: 'Refresh'
  },

  // Dashboard
  dashboard: {
    greeting: 'Hello',
    todaySummary: "Here's today's summary",
    totalRevenue: 'Total Revenue',
    activeOrders: 'Active Orders',
    completedOrders: 'Completed',
    avgOrderValue: 'Avg. Order',
    tableStatus: 'Table Status',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    popularItems: 'Popular Items',
    recentOrders: 'Recent Orders',
    quickActions: 'Quick Actions',
    newOrder: 'New Order',
    openTables: 'Open Tables',
    payment: 'Take Payment',
    liveActivity: 'Live Activity',
    orders: 'orders'
  },

  // Tables
  tables: {
    title: 'Table Management',
    tableNumber: 'Table',
    capacity: 'Capacity',
    status: 'Status',
    currentOrder: 'Current Order',
    noActiveOrder: 'No active order',
    changeStatus: 'Change Status',
    viewOrder: 'View Order',
    createOrder: 'Create Order',
    people: 'people',
    statuses: {
      available: 'Available',
      occupied: 'Occupied',
      reserved: 'Reserved',
      maintenance: 'Maintenance'
    }
  },

  // Orders
  orders: {
    title: 'Order Management',
    orderNumber: 'Order No',
    table: 'Table',
    waiter: 'Waiter',
    items: 'Items',
    total: 'Total',
    status: 'Status',
    createdAt: 'Created',
    actions: 'Actions',
    addItem: 'Add Item',
    removeItem: 'Remove Item',
    updateStatus: 'Update Status',
    printReceipt: 'Print Receipt',
    statuses: {
      pending: 'Pending',
      preparing: 'Preparing',
      ready: 'Ready',
      served: 'Served',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
  },

  // Kitchen
  kitchen: {
    title: 'Kitchen Display',
    pendingOrders: 'Pending Orders',
    preparingOrders: 'Preparing',
    readyOrders: 'Ready',
    orderTime: 'Order Time',
    prepTime: 'Prep Time',
    markAsPreparing: 'Mark as Preparing',
    markAsReady: 'Mark as Ready',
    priority: 'Priority',
    high: 'High',
    normal: 'Normal',
    low: 'Low'
  },

  // Menu
  menu: {
    title: 'Menu Management',
    categories: 'Categories',
    items: 'Items',
    name: 'Item Name',
    price: 'Price',
    category: 'Category',
    description: 'Description',
    available: 'Available',
    unavailable: 'Unavailable',
    addItem: 'Add Item',
    editItem: 'Edit Item',
    deleteItem: 'Delete Item',
    image: 'Image'
  },

  // Reservations
  reservations: {
    title: 'Reservation Management',
    customerName: 'Customer Name',
    phone: 'Phone',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    table: 'Table',
    notes: 'Notes',
    status: 'Status',
    newReservation: 'New Reservation',
    editReservation: 'Edit Reservation',
    statuses: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      seated: 'Seated',
      completed: 'Completed',
      cancelled: 'Cancelled',
      noShow: 'No Show'
    }
  },

  // Analytics
  analytics: {
    title: 'Reports & Analytics',
    salesReport: 'Sales Report',
    revenue: 'Revenue',
    orders: 'Orders',
    avgOrderValue: 'Average Order',
    topProducts: 'Top Products',
    topCategories: 'Top Categories',
    waiterPerformance: 'Waiter Performance',
    dailySales: 'Daily Sales',
    monthlySales: 'Monthly Sales',
    period: 'Period',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    custom: 'Custom'
  },

  // Settings
  settings: {
    title: 'Settings',
    profile: 'Profile',
    appearance: 'Appearance',
    notifications: 'Notifications',
    kitchen: 'Kitchen Display',
    system: 'System',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    soundEnabled: 'Notification Sounds',
    notificationTypes: 'Notification Types',
    newOrder: 'New Order',
    orderReady: 'Order Ready',
    payment: 'Payment',
    autoRefresh: 'Auto Refresh',
    refreshInterval: 'Refresh Interval',
    seconds: 'seconds',
    clearCache: 'Clear Cache',
    version: 'Version',
    apiStatus: 'API Status',
    connected: 'Connected',
    disconnected: 'Disconnected'
  },

  // Login
  login: {
    title: 'Waiter Login',
    subtitle: 'Enter your PIN to sign in',
    selectWaiter: 'Select Waiter',
    enterPin: 'Enter PIN',
    login: 'Login',
    invalidPin: 'Invalid PIN',
    loginSuccess: 'Login successful',
    loginError: 'Login failed'
  },

  // Customer
  customer: {
    welcome: 'Welcome',
    scanQr: 'Scan QR Code',
    tableNumber: 'Your Table Number',
    menu: 'Menu',
    myOrders: 'My Orders',
    callWaiter: 'Call Waiter',
    requestBill: 'Request Bill',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    checkout: 'Place Order',
    total: 'Total',
    orderPlaced: 'Order placed',
    orderStatus: 'Order Status',
    thankYou: 'Thank you'
  },

  // Voice Commands
  voice: {
    listening: 'Listening...',
    command: 'Voice Command',
    examples: 'Example: "Tables", "Orders", "Kitchen"',
    notSupported: 'Your browser does not support speech recognition',
    error: 'Speech recognition error'
  },

  // Notifications
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark All as Read',
    clear: 'Clear',
    noNotifications: 'No notifications',
    newOrder: 'New order',
    orderReady: 'Order ready',
    orderCompleted: 'Order completed',
    paymentReceived: 'Payment received',
    reservationConfirmed: 'Reservation confirmed'
  },

  // Performance Monitor
  performance: {
    fps: 'FPS',
    memory: 'Memory',
    cache: 'Cache',
    apiResponse: 'API Response',
    uptime: 'Uptime',
    renderPerformance: 'Render Performance',
    memoryUsage: 'Memory Usage',
    queries: 'Queries'
  },

  // Errors
  errors: {
    network: 'Network connection error',
    server: 'Server error',
    notFound: 'Not found',
    unauthorized: 'Unauthorized access',
    validation: 'Validation error',
    unknown: 'Unknown error'
  }
}

