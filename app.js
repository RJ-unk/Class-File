// EmpTrack Dashboard JavaScript
class EmpTrackDashboard {
    constructor() {
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.isSidebarCollapsed = false;
        this.isMobileSidebarOpen = false;
        this.currentSection = 'dashboard';
        this.currentView = 'card'; // 'card' or 'table'
        this.employees = JSON.parse(localStorage.getItem('employees')) || [];
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        this.birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
        this.files = JSON.parse(localStorage.getItem('files')) || [];
        this.editingEmployeeId = null;
        this.editingTransactionId = null;
        this.editingMeetingId = null;
        this.searchTerm = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyDarkMode();
        this.initializeCharts();
        this.handleResponsiveLayout();
        this.initializeSampleData();
        this.renderEmployees();
        this.initializeFinancialData();
        this.updateFinancialStats();
        this.renderTransactions();
        this.renderBirthdays();
        this.renderMeetings();
        this.renderFiles();
        
        // Set initial page title
        this.updatePageTitle();
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.addEventListener('click', () => this.toggleDarkMode());

        // Sidebar toggle for desktop
        const toggleSidebar = document.getElementById('toggleSidebar');
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Sidebar overlay for mobile
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Window resize handler
        window.addEventListener('resize', () => this.handleResponsiveLayout());

        // Close mobile sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && this.isMobileSidebarOpen) {
                const sidebar = document.getElementById('sidebar');
                const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                
                if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    this.closeMobileSidebar();
                }
            }
        });

        // Employee management event listeners
        this.setupEmployeeEventListeners();
    }

    setupEmployeeEventListeners() {
        // Add employee button
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => this.openEmployeeModal());
        }

        // Search functionality
        const employeeSearch = document.getElementById('employeeSearch');
        if (employeeSearch) {
            employeeSearch.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderEmployees();
            });
        }

        // View toggle buttons
        const cardViewBtn = document.getElementById('cardViewBtn');
        const tableViewBtn = document.getElementById('tableViewBtn');
        
        if (cardViewBtn && tableViewBtn) {
            cardViewBtn.addEventListener('click', () => this.switchView('card'));
            tableViewBtn.addEventListener('click', () => this.switchView('table'));
        }

        // Modal event listeners
        const employeeModal = document.getElementById('employeeModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const employeeForm = document.getElementById('employeeForm');

        if (closeModal) closeModal.addEventListener('click', () => this.closeEmployeeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeEmployeeModal());
        if (employeeForm) employeeForm.addEventListener('submit', (e) => this.handleEmployeeSubmit(e));

        // Delete modal event listeners
        const deleteModal = document.getElementById('deleteModal');
        const confirmDelete = document.getElementById('confirmDelete');
        const cancelDelete = document.getElementById('cancelDelete');

        if (confirmDelete) confirmDelete.addEventListener('click', () => this.confirmDeleteEmployee());
        if (cancelDelete) cancelDelete.addEventListener('click', () => this.closeDeleteModal());

        // Close modals when clicking outside
        if (employeeModal) {
            employeeModal.addEventListener('click', (e) => {
                if (e.target === employeeModal) this.closeEmployeeModal();
            });
        }

        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) this.closeDeleteModal();
            });
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyDarkMode();
    }

    applyDarkMode() {
        const html = document.documentElement;
        if (this.isDarkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (this.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.style.marginLeft = '70px';
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.style.marginLeft = '256px';
        }
    }

    toggleMobileSidebar() {
        this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (this.isMobileSidebarOpen) {
            sidebar.classList.add('mobile-open');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.remove('mobile-open');
            overlay.classList.add('hidden');
        }
    }

    closeMobileSidebar() {
        this.isMobileSidebarOpen = false;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.add('hidden');
    }

    switchSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }

        // Update navigation active state
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });

        // Update current section
        this.currentSection = sectionName;
        this.updatePageTitle();

        // Close mobile sidebar when navigating
        if (window.innerWidth <= 1024) {
            this.closeMobileSidebar();
        }
    }

    updatePageTitle() {
        const pageTitle = document.getElementById('pageTitle');
        const titles = {
            dashboard: 'Dashboard',
            employees: 'Employees',
            finances: 'Financial Management',
            birthdays: 'Employee Birthdays',
            meetings: 'Meetings & Events',
            files: 'File Management',
            departments: 'Departments',
            attendance: 'Attendance',
            reports: 'Reports',
            settings: 'Settings'
        };
        
        if (pageTitle && titles[this.currentSection]) {
            pageTitle.textContent = titles[this.currentSection];
        }

        // Initialize section-specific content
        if (this.currentSection === 'finances') {
            setTimeout(() => this.updateFinancialChart(), 100);
        }
    }

    handleResponsiveLayout() {
        const mainContent = document.getElementById('mainContent');
        
        if (window.innerWidth <= 1024) {
            // Mobile layout
            mainContent.style.marginLeft = '0';
            this.closeMobileSidebar();
        } else {
            // Desktop layout
            if (this.isSidebarCollapsed) {
                mainContent.style.marginLeft = '70px';
            } else {
                mainContent.style.marginLeft = '256px';
            }
        }
    }

    // Employee Management Methods
    initializeSampleData() {
        if (this.employees.length === 0) {
            this.employees = [
                {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john.smith@company.com',
                    phone: '+1 (555) 123-4567',
                    department: 'Engineering',
                    position: 'Senior Developer',
                    salary: 95000,
                    startDate: '2022-03-15',
                    status: 'Active'
                },
                {
                    id: 2,
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    email: 'sarah.johnson@company.com',
                    phone: '+1 (555) 234-5678',
                    department: 'Marketing',
                    position: 'Marketing Manager',
                    salary: 75000,
                    startDate: '2021-07-20',
                    status: 'Active'
                },
                {
                    id: 3,
                    firstName: 'Mike',
                    lastName: 'Davis',
                    email: 'mike.davis@company.com',
                    phone: '+1 (555) 345-6789',
                    department: 'Sales',
                    position: 'Sales Representative',
                    salary: 65000,
                    startDate: '2023-01-10',
                    status: 'On Leave'
                },
                {
                    id: 4,
                    firstName: 'Emily',
                    lastName: 'Chen',
                    email: 'emily.chen@company.com',
                    phone: '+1 (555) 456-7890',
                    department: 'HR',
                    position: 'HR Specialist',
                    salary: 60000,
                    startDate: '2022-11-05',
                    status: 'Active'
                },
                {
                    id: 5,
                    firstName: 'David',
                    lastName: 'Wilson',
                    email: 'david.wilson@company.com',
                    phone: '+1 (555) 567-8901',
                    department: 'Finance',
                    position: 'Financial Analyst',
                    salary: 70000,
                    startDate: '2021-09-12',
                    status: 'Active'
                }
            ];
            this.saveEmployees();
        }
    }

    switchView(view) {
        this.currentView = view;
        const cardViewBtn = document.getElementById('cardViewBtn');
        const tableViewBtn = document.getElementById('tableViewBtn');
        const employeeGrid = document.getElementById('employeeGrid');
        const employeeTable = document.getElementById('employeeTable');

        if (view === 'card') {
            cardViewBtn.classList.add('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            cardViewBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
            tableViewBtn.classList.remove('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            tableViewBtn.classList.add('text-gray-500', 'dark:text-gray-400');
            
            employeeGrid.classList.remove('hidden');
            employeeTable.classList.add('hidden');
        } else {
            tableViewBtn.classList.add('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            tableViewBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
            cardViewBtn.classList.remove('bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            cardViewBtn.classList.add('text-gray-500', 'dark:text-gray-400');
            
            employeeTable.classList.remove('hidden');
            employeeGrid.classList.add('hidden');
        }
        
        this.renderEmployees();
    }

    getFilteredEmployees() {
        return this.employees.filter(employee => {
            const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
            const searchFields = [
                fullName,
                employee.email.toLowerCase(),
                employee.department.toLowerCase(),
                employee.position.toLowerCase()
            ];
            
            return searchFields.some(field => field.includes(this.searchTerm));
        });
    }

    renderEmployees() {
        const filteredEmployees = this.getFilteredEmployees();
        const noEmployeesMessage = document.getElementById('noEmployeesMessage');

        if (filteredEmployees.length === 0) {
            document.getElementById('employeeGrid').innerHTML = '';
            document.getElementById('employeeTableBody').innerHTML = '';
            noEmployeesMessage.classList.remove('hidden');
        } else {
            noEmployeesMessage.classList.add('hidden');
            
            if (this.currentView === 'card') {
                this.renderEmployeeCards(filteredEmployees);
            } else {
                this.renderEmployeeTable(filteredEmployees);
            }
        }
    }

    renderEmployeeCards(employees) {
        const grid = document.getElementById('employeeGrid');
        grid.innerHTML = employees.map(employee => `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                            <span class="text-white font-medium text-lg">${employee.firstName[0]}${employee.lastName[0]}</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${employee.firstName} ${employee.lastName}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${employee.position}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusColor(employee.status)}">
                        ${employee.status}
                    </span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <i class="fas fa-envelope w-4 mr-2 text-gray-400"></i>
                        <span class="truncate">${employee.email}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <i class="fas fa-building w-4 mr-2 text-gray-400"></i>
                        <span>${employee.department}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <i class="fas fa-calendar w-4 mr-2 text-gray-400"></i>
                        <span>Started ${new Date(employee.startDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="dashboard.editEmployee(${employee.id})" class="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="dashboard.deleteEmployee(${employee.id})" class="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderEmployeeTable(employees) {
        const tbody = document.getElementById('employeeTableBody');
        tbody.innerHTML = employees.map(employee => `
            <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="py-4 px-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                            <span class="text-white font-medium text-sm">${employee.firstName[0]}${employee.lastName[0]}</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800 dark:text-white">${employee.firstName} ${employee.lastName}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${employee.email}</p>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-gray-800 dark:text-white">${employee.department}</td>
                <td class="py-4 px-4 text-gray-800 dark:text-white">${employee.position}</td>
                <td class="py-4 px-4">
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full ${this.getStatusColor(employee.status)}">
                        ${employee.status}
                    </span>
                </td>
                <td class="py-4 px-4">
                    <button onclick="dashboard.editEmployee(${employee.id})" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="dashboard.deleteEmployee(${employee.id})" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        switch (status) {
            case 'Active':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            case 'Inactive':
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
            case 'On Leave':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    }

    openEmployeeModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const modalTitle = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        const form = document.getElementById('employeeForm');

        if (employee) {
            modalTitle.textContent = 'Edit Employee';
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Employee';
            this.editingEmployeeId = employee.id;
            this.populateForm(employee);
        } else {
            modalTitle.textContent = 'Add Employee';
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Employee';
            this.editingEmployeeId = null;
            form.reset();
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeEmployeeModal() {
        const modal = document.getElementById('employeeModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.editingEmployeeId = null;
    }

    populateForm(employee) {
        document.getElementById('firstName').value = employee.firstName;
        document.getElementById('lastName').value = employee.lastName;
        document.getElementById('email').value = employee.email;
        document.getElementById('phone').value = employee.phone || '';
        document.getElementById('department').value = employee.department;
        document.getElementById('position').value = employee.position;
        document.getElementById('salary').value = employee.salary || '';
        document.getElementById('startDate').value = employee.startDate;
        document.getElementById('status').value = employee.status;
    }

    handleEmployeeSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const employeeData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            department: formData.get('department'),
            position: formData.get('position'),
            salary: parseInt(formData.get('salary')) || 0,
            startDate: formData.get('startDate'),
            status: formData.get('status')
        };

        if (this.editingEmployeeId) {
            this.updateEmployee(this.editingEmployeeId, employeeData);
        } else {
            this.addEmployee(employeeData);
        }

        this.closeEmployeeModal();
    }

    addEmployee(employeeData) {
        const newEmployee = {
            id: Math.max(...this.employees.map(e => e.id), 0) + 1,
            ...employeeData
        };
        
        this.employees.push(newEmployee);
        this.saveEmployees();
        this.renderEmployees();
        this.updateDashboardStats();
    }

    updateEmployee(id, employeeData) {
        const index = this.employees.findIndex(e => e.id === id);
        if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...employeeData };
            this.saveEmployees();
            this.renderEmployees();
            this.updateDashboardStats();
        }
    }

    editEmployee(id) {
        const employee = this.employees.find(e => e.id === id);
        if (employee) {
            this.openEmployeeModal(employee);
        }
    }

    deleteEmployee(id) {
        const employee = this.employees.find(e => e.id === id);
        if (employee) {
            document.getElementById('deleteEmployeeName').textContent = `${employee.firstName} ${employee.lastName}`;
            document.getElementById('deleteModal').classList.remove('hidden');
            this.deletingEmployeeId = id;
        }
    }

    confirmDeleteEmployee() {
        if (this.deletingEmployeeId) {
            this.employees = this.employees.filter(e => e.id !== this.deletingEmployeeId);
            this.saveEmployees();
            this.renderEmployees();
            this.updateDashboardStats();
            this.closeDeleteModal();
        }
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deletingEmployeeId = null;
    }

    saveEmployees() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
    }

    updateDashboardStats() {
        const totalEmployees = this.employees.length;
        const activeEmployees = this.employees.filter(e => e.status === 'Active').length;
        
        // Update stats on dashboard
        const statsElements = document.querySelectorAll('.text-2xl.font-bold');
        if (statsElements.length >= 2) {
            statsElements[0].textContent = totalEmployees;
            statsElements[1].textContent = activeEmployees;
        }
    }

    initializeCharts() {
        // Initialize employee distribution chart
        this.initEmployeeChart();
        
        // Initialize department chart
        this.initDepartmentChart();
    }

    initEmployeeChart() {
        const ctx = document.getElementById('employeeChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Employees',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Departures',
                    data: [8, 5, 10, 7, 12, 8],
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.isDarkMode ? '#ffffff' : '#374151',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: this.isDarkMode ? '#ffffff' : '#374151'
                        }
                    },
                    x: {
                        grid: {
                            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: this.isDarkMode ? '#ffffff' : '#374151'
                        }
                    }
                }
            }
        });
    }

    initDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#4F46E5',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#8B5CF6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.isDarkMode ? '#ffffff' : '#374151',
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    // Financial Management Methods
    initializeFinancialData() {
        if (this.transactions.length === 0) {
            // Add sample financial data
            this.transactions = [
                {
                    id: 1,
                    type: 'income',
                    description: 'Project Payment',
                    category: 'services',
                    amount: 15000,
                    date: '2025-08-01'
                },
                {
                    id: 2,
                    type: 'expense',
                    description: 'Office Rent',
                    category: 'office',
                    amount: 3500,
                    date: '2025-08-01'
                },
                {
                    id: 3,
                    type: 'income',
                    description: 'Software License Sales',
                    category: 'sales',
                    amount: 8500,
                    date: '2025-07-30'
                },
                {
                    id: 4,
                    type: 'expense',
                    description: 'Marketing Campaign',
                    category: 'marketing',
                    amount: 2000,
                    date: '2025-07-28'
                }
            ];
            this.saveTransactions();
        }

        // Setup financial event listeners
        this.setupFinancialEventListeners();
    }

    setupFinancialEventListeners() {
        // Transaction buttons
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => this.openTransactionModal('income'));
        }
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.openTransactionModal('expense'));
        }

        // Transaction modal
        const transactionModal = document.getElementById('transactionModal');
        const closeTransactionModal = document.getElementById('closeTransactionModal');
        const cancelTransactionBtn = document.getElementById('cancelTransactionBtn');
        const transactionForm = document.getElementById('transactionForm');

        if (closeTransactionModal) {
            closeTransactionModal.addEventListener('click', () => this.closeTransactionModal());
        }
        if (cancelTransactionBtn) {
            cancelTransactionBtn.addEventListener('click', () => this.closeTransactionModal());
        }
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => this.saveTransaction(e));
        }

        // Export buttons
        const exportFinancialPDF = document.getElementById('exportFinancialPDF');
        const exportFinancialExcel = document.getElementById('exportFinancialExcel');
        if (exportFinancialPDF) {
            exportFinancialPDF.addEventListener('click', () => this.exportFinancialPDF());
        }
        if (exportFinancialExcel) {
            exportFinancialExcel.addEventListener('click', () => this.exportFinancialExcel());
        }

        // Meeting and birthday event listeners
        this.setupMeetingEventListeners();
        this.setupBirthdayEventListeners();
        this.setupFileEventListeners();
    }

    openTransactionModal(type = 'income') {
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const typeSelect = document.getElementById('transactionType');
        const title = document.getElementById('transactionModalTitle');
        
        if (modal && form && typeSelect && title) {
            form.reset();
            typeSelect.value = type;
            title.textContent = type === 'income' ? 'Add Income' : 'Add Expense';
            
            // Set today's date as default
            const dateInput = document.getElementById('transactionDate');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            
            modal.classList.remove('hidden');
            this.editingTransactionId = null;
        }
    }

    closeTransactionModal() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.classList.add('hidden');
            this.editingTransactionId = null;
        }
    }

    saveTransaction(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const transaction = {
            id: this.editingTransactionId || Date.now(),
            type: formData.get('transactionType'),
            description: formData.get('description'),
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')),
            date: formData.get('date')
        };

        if (this.editingTransactionId) {
            const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
            if (index !== -1) {
                this.transactions[index] = transaction;
            }
        } else {
            this.transactions.push(transaction);
        }

        this.saveTransactions();
        this.renderTransactions();
        this.updateFinancialStats();
        this.updateFinancialChart();
        this.closeTransactionModal();
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderTransactions();
            this.updateFinancialStats();
            this.updateFinancialChart();
        }
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    updateFinancialStats() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netProfit = income - expenses;
        const profitMargin = income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0;

        // Update UI elements
        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpensesEl = document.getElementById('totalExpenses');
        const netProfitEl = document.getElementById('netProfit');
        const profitMarginEl = document.getElementById('profitMargin');

        if (totalIncomeEl) totalIncomeEl.textContent = `$${income.toLocaleString()}`;
        if (totalExpensesEl) totalExpensesEl.textContent = `$${expenses.toLocaleString()}`;
        if (netProfitEl) {
            netProfitEl.textContent = `$${netProfit.toLocaleString()}`;
            netProfitEl.className = netProfit >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
        }
        if (profitMarginEl) profitMarginEl.textContent = `${profitMargin}%`;

        this.updateRecentTransactions();
    }

    updateRecentTransactions() {
        const recentContainer = document.getElementById('recentTransactions');
        if (!recentContainer) return;

        const recent = this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        recentContainer.innerHTML = recent.map(t => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                        t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }">
                        <i class="fas fa-${t.type === 'income' ? 'arrow-up' : 'arrow-down'} text-sm"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-800 dark:text-white">${t.description}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${t.category}</p>
                    </div>
                </div>
                <span class="text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}
                </span>
            </div>
        `).join('');
    }

    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(t => `
                <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="py-3 px-4 text-gray-800 dark:text-white">${new Date(t.date).toLocaleDateString()}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-white">${t.description}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                            ${t.category}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                        ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 text-xs rounded-full ${
                            t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">
                            ${t.type}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <button onclick="dashboard.deleteTransaction(${t.id})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    updateFinancialChart() {
        const ctx = document.getElementById('financialChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.financialChart) {
            this.financialChart.destroy();
        }

        const monthlyData = this.getMonthlyFinancialData();

        this.financialChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyData.income,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: monthlyData.expenses,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: this.isDarkMode ? '#ffffff' : '#374151'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: this.isDarkMode ? '#ffffff' : '#374151'
                        }
                    },
                    x: {
                        grid: {
                            color: this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: this.isDarkMode ? '#ffffff' : '#374151'
                        }
                    }
                }
            }
        });
    }

    getMonthlyFinancialData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const income = [12000, 15000, 18000, 14000, 16000, 19000];
        const expenses = [8000, 9500, 10000, 8500, 9000, 11000];
        
        return { labels: months, income, expenses };
    }

    exportFinancialPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Financial Report', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        
        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netProfit = income - expenses;
        
        doc.text(`Total Income: $${income.toLocaleString()}`, 20, 50);
        doc.text(`Total Expenses: $${expenses.toLocaleString()}`, 20, 60);
        doc.text(`Net Profit: $${netProfit.toLocaleString()}`, 20, 70);
        
        const tableData = this.transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description,
            t.category,
            `${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}`,
            t.type
        ]);
        
        doc.autoTable({
            head: [['Date', 'Description', 'Category', 'Amount', 'Type']],
            body: tableData,
            startY: 80
        });
        
        doc.save('financial-report.pdf');
    }

    exportFinancialExcel() {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(this.transactions.map(t => ({
            Date: t.date,
            Description: t.description,
            Category: t.category,
            Amount: t.amount,
            Type: t.type
        })));
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, 'financial-report.xlsx');
    }

    // Meeting Management Methods
    setupMeetingEventListeners() {
        const addMeetingBtn = document.getElementById('addMeetingBtn');
        const meetingModal = document.getElementById('meetingModal');
        const closeMeetingModal = document.getElementById('closeMeetingModal');
        const cancelMeetingBtn = document.getElementById('cancelMeetingBtn');
        const meetingForm = document.getElementById('meetingForm');

        if (addMeetingBtn) {
            addMeetingBtn.addEventListener('click', () => this.openMeetingModal());
        }
        if (closeMeetingModal) {
            closeMeetingModal.addEventListener('click', () => this.closeMeetingModal());
        }
        if (cancelMeetingBtn) {
            cancelMeetingBtn.addEventListener('click', () => this.closeMeetingModal());
        }
        if (meetingForm) {
            meetingForm.addEventListener('submit', (e) => this.saveMeeting(e));
        }
    }

    openMeetingModal() {
        const modal = document.getElementById('meetingModal');
        const form = document.getElementById('meetingForm');
        
        if (modal && form) {
            form.reset();
            const dateInput = document.getElementById('meetingDate');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            modal.classList.remove('hidden');
            this.editingMeetingId = null;
        }
    }

    closeMeetingModal() {
        const modal = document.getElementById('meetingModal');
        if (modal) {
            modal.classList.add('hidden');
            this.editingMeetingId = null;
        }
    }

    saveMeeting(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const meeting = {
            id: this.editingMeetingId || Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            location: formData.get('location'),
            attendees: formData.get('attendees')
        };

        if (this.editingMeetingId) {
            const index = this.meetings.findIndex(m => m.id === this.editingMeetingId);
            if (index !== -1) {
                this.meetings[index] = meeting;
            }
        } else {
            this.meetings.push(meeting);
        }

        this.saveMeetings();
        this.renderMeetings();
        this.closeMeetingModal();
    }

    deleteMeeting(id) {
        if (confirm('Are you sure you want to delete this meeting?')) {
            this.meetings = this.meetings.filter(m => m.id !== id);
            this.saveMeetings();
            this.renderMeetings();
        }
    }

    saveMeetings() {
        localStorage.setItem('meetings', JSON.stringify(this.meetings));
    }

    renderMeetings() {
        this.renderTodaysMeetings();
        this.renderUpcomingMeetings();
        this.renderMeetingCalendar();
    }

    renderTodaysMeetings() {
        const container = document.getElementById('todaysMeetings');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todaysMeetings = this.meetings.filter(m => m.date === today);

        if (todaysMeetings.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No meetings scheduled for today</p>';
            return;
        }

        container.innerHTML = todaysMeetings.map(m => `
            <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-medium text-gray-800 dark:text-white">${m.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${m.startTime} - ${m.endTime}</p>
                        ${m.location ? `<p class="text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-map-marker-alt mr-1"></i>${m.location}</p>` : ''}
                    </div>
                    <button onclick="dashboard.deleteMeeting(${m.id})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderUpcomingMeetings() {
        const container = document.getElementById('upcomingMeetings');
        if (!container) return;

        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcoming = this.meetings
            .filter(m => {
                const meetingDate = new Date(m.date);
                return meetingDate > today && meetingDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No upcoming meetings</p>';
            return;
        }

        container.innerHTML = upcoming.map(m => `
            <div class="border-l-4 border-blue-500 pl-4 py-2">
                <h4 class="font-medium text-gray-800 dark:text-white">${m.title}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">${new Date(m.date).toLocaleDateString()} at ${m.startTime}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${m.attendees || 'No attendees listed'}</p>
            </div>
        `).join('');
    }

    renderMeetingCalendar() {
        const container = document.getElementById('meetingCalendar');
        if (!container) return;
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Calendar view coming soon...</p>';
    }

    // Birthday Management Methods
    setupBirthdayEventListeners() {
        const addBirthdayBtn = document.getElementById('addBirthdayBtn');
        const birthdayModal = document.getElementById('birthdayModal');
        const closeBirthdayModal = document.getElementById('closeBirthdayModal');
        const cancelBirthdayBtn = document.getElementById('cancelBirthdayBtn');
        const birthdayForm = document.getElementById('birthdayForm');

        if (addBirthdayBtn) {
            addBirthdayBtn.addEventListener('click', () => this.openBirthdayModal());
        }
        if (closeBirthdayModal) {
            closeBirthdayModal.addEventListener('click', () => this.closeBirthdayModal());
        }
        if (cancelBirthdayBtn) {
            cancelBirthdayBtn.addEventListener('click', () => this.closeBirthdayModal());
        }
        if (birthdayForm) {
            birthdayForm.addEventListener('submit', (e) => this.saveBirthday(e));
        }
    }

    openBirthdayModal() {
        const modal = document.getElementById('birthdayModal');
        const form = document.getElementById('birthdayForm');
        const employeeSelect = document.getElementById('birthdayEmployee');
        
        if (modal && form && employeeSelect) {
            form.reset();
            
            // Populate employee dropdown
            employeeSelect.innerHTML = '<option value="">Select Employee</option>' +
                this.employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
            
            modal.classList.remove('hidden');
        }
    }

    closeBirthdayModal() {
        const modal = document.getElementById('birthdayModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    saveBirthday(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const employeeId = parseInt(formData.get('employeeId'));
        const employee = this.employees.find(emp => emp.id === employeeId);
        
        if (!employee) return;

        const birthday = {
            id: Date.now(),
            employeeId: employeeId,
            employeeName: employee.name,
            birthday: formData.get('birthday')
        };

        this.birthdays.push(birthday);
        this.saveBirthdays();
        this.renderBirthdays();
        this.closeBirthdayModal();
    }

    saveBirthdays() {
        localStorage.setItem('birthdays', JSON.stringify(this.birthdays));
    }

    renderBirthdays() {
        this.renderTodaysBirthdays();
        this.renderUpcomingBirthdays();
    }

    renderTodaysBirthdays() {
        const container = document.getElementById('todaysBirthdays');
        if (!container) return;

        const today = new Date();
        const todayString = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const todaysBirthdays = this.birthdays.filter(b => {
            const birthDate = new Date(b.birthday);
            const birthString = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
            return birthString === todayString;
        });

        if (todaysBirthdays.length === 0) {
            container.innerHTML = '<p class="text-white/80">No birthdays today</p>';
            return;
        }

        container.innerHTML = todaysBirthdays.map(b => `
            <div class="bg-white/20 rounded-lg p-4 text-center">
                <i class="fas fa-birthday-cake text-2xl mb-2"></i>
                <h4 class="font-medium">${b.employeeName}</h4>
                <p class="text-sm text-white/80">Happy Birthday!</p>
            </div>
        `).join('');
    }

    renderUpcomingBirthdays() {
        const container = document.getElementById('upcomingBirthdays');
        if (!container) return;

        const today = new Date();
        const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const upcoming = this.birthdays
            .filter(b => {
                const birthDate = new Date(b.birthday);
                const thisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                return thisYear > today && thisYear <= nextMonth;
            })
            .sort((a, b) => {
                const aDate = new Date(today.getFullYear(), new Date(a.birthday).getMonth(), new Date(a.birthday).getDate());
                const bDate = new Date(today.getFullYear(), new Date(b.birthday).getMonth(), new Date(b.birthday).getDate());
                return aDate - bDate;
            });

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No upcoming birthdays in the next 30 days</p>';
            return;
        }

        container.innerHTML = upcoming.map(b => {
            const birthDate = new Date(b.birthday);
            const thisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            const age = today.getFullYear() - birthDate.getFullYear();
            
            return `
                <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <i class="fas fa-birthday-cake text-purple-600 dark:text-purple-300"></i>
                        </div>
                        <div class="ml-3">
                            <h4 class="font-medium text-gray-800 dark:text-white">${b.employeeName}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-300">Turning ${age + 1}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-800 dark:text-white">${thisYear.toLocaleDateString()}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // File Management Methods
    setupFileEventListeners() {
        const fileUpload = document.getElementById('fileUpload');
        const ocrScanBtn = document.getElementById('ocrScanBtn');
        const exportAllPDF = document.getElementById('exportAllPDF');
        const exportAllExcel = document.getElementById('exportAllExcel');

        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        if (ocrScanBtn) {
            ocrScanBtn.addEventListener('click', () => this.openOcrModal());
        }
        if (exportAllPDF) {
            exportAllPDF.addEventListener('click', () => this.exportAllFilesPDF());
        }
        if (exportAllExcel) {
            exportAllExcel.addEventListener('click', () => this.exportAllFilesExcel());
        }

        this.setupOcrEventListeners();
    }

    setupOcrEventListeners() {
        const ocrModal = document.getElementById('ocrModal');
        const closeOcrModal = document.getElementById('closeOcrModal');
        const cancelOcrBtn = document.getElementById('cancelOcrBtn');
        const processOcrBtn = document.getElementById('processOcrBtn');
        const saveOcrBtn = document.getElementById('saveOcrBtn');
        const ocrImageUpload = document.getElementById('ocrImageUpload');

        if (closeOcrModal) {
            closeOcrModal.addEventListener('click', () => this.closeOcrModal());
        }
        if (cancelOcrBtn) {
            cancelOcrBtn.addEventListener('click', () => this.closeOcrModal());
        }
        if (processOcrBtn) {
            processOcrBtn.addEventListener('click', () => this.processOCR());
        }
        if (saveOcrBtn) {
            saveOcrBtn.addEventListener('click', () => this.saveOcrResult());
        }
        if (ocrImageUpload) {
            ocrImageUpload.addEventListener('change', (e) => this.handleOcrImageUpload(e));
        }
    }

    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            const fileObj = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                content: null // In a real app, you'd store this in a proper file system
            };
            
            this.files.push(fileObj);
        });
        
        this.saveFiles();
        this.renderFiles();
        this.updateFileStats();
    }

    openOcrModal() {
        const modal = document.getElementById('ocrModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeOcrModal() {
        const modal = document.getElementById('ocrModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleOcrImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('ocrPreview');
                const image = document.getElementById('ocrImage');
                if (preview && image) {
                    image.src = event.target.result;
                    preview.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    processOCR() {
        // Simulate OCR processing
        const resultTextarea = document.getElementById('ocrResult');
        if (resultTextarea) {
            resultTextarea.value = 'OCR processing would extract text from the uploaded image. This is a demo implementation. In a real application, you would integrate with an OCR service like Tesseract.js or Google Vision API.';
        }
    }

    saveOcrResult() {
        const resultTextarea = document.getElementById('ocrResult');
        if (resultTextarea && resultTextarea.value) {
            const fileObj = {
                id: Date.now(),
                name: `OCR_Result_${new Date().toISOString().split('T')[0]}.txt`,
                size: resultTextarea.value.length,
                type: 'text/plain',
                uploadDate: new Date().toISOString(),
                content: resultTextarea.value
            };
            
            this.files.push(fileObj);
            this.saveFiles();
            this.renderFiles();
            this.updateFileStats();
            this.closeOcrModal();
        }
    }

    deleteFile(id) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.files = this.files.filter(f => f.id !== id);
            this.saveFiles();
            this.renderFiles();
            this.updateFileStats();
        }
    }

    saveFiles() {
        localStorage.setItem('files', JSON.stringify(this.files));
    }

    renderFiles() {
        const container = document.getElementById('fileGrid');
        if (!container) return;

        if (this.files.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.files.map(f => `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between mb-3">
                    <i class="fas fa-${this.getFileIcon(f.type)} text-2xl text-blue-600"></i>
                    <button onclick="dashboard.deleteFile(${f.id})" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <h4 class="font-medium text-gray-800 dark:text-white text-sm mb-1 truncate" title="${f.name}">${f.name}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">${this.formatFileSize(f.size)}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(f.uploadDate).toLocaleDateString()}</p>
            </div>
        `).join('');
    }

    updateFileStats() {
        const totalFiles = this.files.length;
        const pdfFiles = this.files.filter(f => f.type === 'application/pdf').length;
        const excelFiles = this.files.filter(f => f.type.includes('sheet') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')).length;
        const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);

        const totalFilesEl = document.getElementById('totalFiles');
        const pdfFilesEl = document.getElementById('pdfFiles');
        const excelFilesEl = document.getElementById('excelFiles');
        const storageUsedEl = document.getElementById('storageUsed');

        if (totalFilesEl) totalFilesEl.textContent = totalFiles;
        if (pdfFilesEl) pdfFilesEl.textContent = pdfFiles;
        if (excelFilesEl) excelFilesEl.textContent = excelFiles;
        if (storageUsedEl) storageUsedEl.textContent = this.formatFileSize(totalSize);
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return 'file-pdf';
        if (type.includes('sheet') || type.includes('excel')) return 'file-excel';
        if (type.includes('word')) return 'file-word';
        if (type.includes('image')) return 'file-image';
        if (type.includes('text')) return 'file-alt';
        return 'file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    exportAllFilesPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('File Management Report', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Total Files: ${this.files.length}`, 20, 40);
        
        const tableData = this.files.map(f => [
            f.name,
            f.type,
            this.formatFileSize(f.size),
            new Date(f.uploadDate).toLocaleDateString()
        ]);
        
        doc.autoTable({
            head: [['File Name', 'Type', 'Size', 'Upload Date']],
            body: tableData,
            startY: 50
        });
        
        doc.save('file-management-report.pdf');
    }

    exportAllFilesExcel() {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(this.files.map(f => ({
            'File Name': f.name,
            'Type': f.type,
            'Size': this.formatFileSize(f.size),
            'Upload Date': new Date(f.uploadDate).toLocaleDateString()
        })));
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Files');
        XLSX.writeFile(workbook, 'file-management-report.xlsx');
    }
}

// Initialize the dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new EmpTrackDashboard();
});