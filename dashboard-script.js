// ====================================
// OKUL TAKVİM SİSTEMİ - STANDALONE DASHBOARD
// Bağımsız Çalışan Versiyon
// ====================================

console.log('%c🎓 Okul Takvim Sistemi Başlatılıyor...', 'color: #667eea; font-size: 16px; font-weight: bold;');

// Global Variables
let currentUser = {
    id: 1,
    name: 'Demo Kullanıcı',
    email: 'demo@okul.com',
    role: 'teacher'
};

let events = [];
let filteredEvents = [];
let editingEventId = null;
let currentView = 'grid';

// Event Types
const eventTypes = {
    lesson: { label: 'Ders', color: '#10b981' },
    exam: { label: 'Sınav', color: '#ef4444' },
    lab: { label: 'Laboratuvar', color: '#3b82f6' },
    meeting: { label: 'Toplantı', color: '#f59e0b' },
    event: { label: 'Etkinlik', color: '#8b5cf6' },
    homework: { label: 'Ödev', color: '#ec4899' }
};

const priorityLevels = {
    low: { label: 'Düşük', color: '#6b7280' },
    medium: { label: 'Orta', color: '#f59e0b' },
    high: { label: 'Yüksek', color: '#ef4444' }
};

const statusOptions = {
    scheduled: { label: 'Planlandı', color: '#3b82f6' },
    inprogress: { label: 'Devam Ediyor', color: '#f59e0b' },
    completed: { label: 'Tamamlandı', color: '#10b981' },
    cancelled: { label: 'İptal Edildi', color: '#6b7280' }
};

// ====================================
// INITIALIZE - Sayfa yüklendiğinde çalışır
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Dashboard başlatılıyor...');
    console.log('✅ Kullanıcı:', currentUser.name);
    
    loadUserInfo();
    loadEvents();
    setupEventListeners();
    filterEvents();
    updateStats();
    
    console.log('✨ Dashboard hazır! Toplam etkinlik:', events.length);
});

// ====================================
// EVENT LISTENERS
// ====================================
function setupEventListeners() {
    const form = document.getElementById('eventForm');
    if (form) {
        form.addEventListener('submit', saveEvent);
    }
    
    const dateInput = document.getElementById('eventDate');
    const startTimeInput = document.getElementById('eventStartTime');
    const endTimeInput = document.getElementById('eventEndTime');
    
    if (dateInput) dateInput.addEventListener('change', checkForConflicts);
    if (startTimeInput) startTimeInput.addEventListener('change', checkForConflicts);
    if (endTimeInput) endTimeInput.addEventListener('change', checkForConflicts);
}

// ====================================
// USER INFO
// ====================================
function loadUserInfo() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = 'Öğretmen';
}

// ====================================
// LOAD EVENTS
// ====================================
function loadEvents() {
    const saved = localStorage.getItem('schoolCalendarEvents');
    
    if (saved) {
        try {
            events = JSON.parse(saved);
            console.log('📦 Kaydedilmiş etkinlikler yüklendi:', events.length);
        } catch (e) {
            createDemoData();
        }
    } else {
        createDemoData();
    }
}

function createDemoData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    events = [
        {
            id: 1,
            owner: 1,
            title: 'Matematik Sınavı',
            type: 'exam',
            priority: 'high',
            date: formatDateForInput(today),
            startTime: '09:00',
            endTime: '10:30',
            location: 'A101 Sınıfı',
            teacher: 'Ahmet Yılmaz',
            description: 'Ünite 3-4 konularından ara sınav',
            students: '9A, 9B',
            status: 'scheduled'
        },
        {
            id: 2,
            owner: 1,
            title: 'Fizik Laboratuvarı',
            type: 'lab',
            priority: 'medium',
            date: formatDateForInput(today),
            startTime: '10:00',
            endTime: '11:30',
            location: 'Fizik Lab',
            teacher: 'Ayşe Demir',
            description: 'Elektrik deneyleri',
            students: '10A',
            status: 'scheduled'
        },
        {
            id: 3,
            owner: 999,
            title: 'Edebiyat Dersi',
            type: 'lesson',
            priority: 'medium',
            date: formatDateForInput(tomorrow),
            startTime: '13:00',
            endTime: '14:30',
            location: 'B205',
            teacher: 'Mehmet Kaya',
            description: 'Divan Edebiyatı',
            students: '11A, 11B',
            status: 'scheduled'
        },
        {
            id: 4,
            owner: 1,
            title: 'Kimya Ödevi',
            type: 'homework',
            priority: 'high',
            date: formatDateForInput(tomorrow),
            startTime: '14:00',
            endTime: '15:00',
            location: 'Online',
            teacher: 'Zeynep Arslan',
            description: 'Kimyasal bağlar raporu',
            students: '10A, 10B',
            status: 'scheduled'
        },
        {
            id: 5,
            owner: 1,
            title: 'Veli Toplantısı',
            type: 'meeting',
            priority: 'high',
            date: formatDateForInput(nextWeek),
            startTime: '10:00',
            endTime: '12:00',
            location: 'Konferans Salonu',
            teacher: '',
            description: 'Dönem sonu değerlendirme',
            students: 'Tüm Sınıflar',
            status: 'scheduled'
        },
        {
            id: 6,
            owner: 999,
            title: 'Spor Etkinliği',
            type: 'event',
            priority: 'low',
            date: formatDateForInput(nextWeek),
            startTime: '14:00',
            endTime: '16:00',
            location: 'Spor Salonu',
            teacher: 'Beden Eğitimi',
            description: 'Basketbol turnuvası',
            students: 'Tüm Öğrenciler',
            status: 'scheduled'
        }
    ];
    
    saveEvents();
    console.log('✨ 6 demo etkinlik oluşturuldu!');
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ====================================
// SAVE EVENTS
// ====================================
function saveEvents() {
    try {
        localStorage.setItem('schoolCalendarEvents', JSON.stringify(events));
        console.log('💾 Etkinlikler kaydedildi');
    } catch (e) {
        console.error('❌ Kayıt hatası:', e);
    }
}

// ====================================
// FILTER & RENDER
// ====================================
function filterEvents() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    const filterOwnership = document.getElementById('filterOwnership');
    
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const type = filterType ? filterType.value : 'all';
    const status = filterStatus ? filterStatus.value : 'all';
    const ownership = filterOwnership ? filterOwnership.value : 'all';
    
    filteredEvents = events.filter(event => {
        const matchSearch = event.title.toLowerCase().includes(search) ||
                           (event.description && event.description.toLowerCase().includes(search));
        const matchType = type === 'all' || event.type === type;
        const matchStatus = status === 'all' || event.status === status;
        let matchOwnership = true;
        if (ownership === 'my') matchOwnership = event.owner === currentUser.id;
        else if (ownership === 'others') matchOwnership = event.owner !== currentUser.id;
        
        return matchSearch && matchType && matchStatus && matchOwnership;
    });
    
    renderEvents();
}

function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    if (filteredEvents.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    
    filteredEvents.sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return parseTime(a.startTime) - parseTime(b.startTime);
    });
    
    grid.innerHTML = filteredEvents.map(event => createEventCard(event)).join('');
    console.log('✓ ' + filteredEvents.length + ' etkinlik gösteriliyor');
}

function createEventCard(event) {
    const isOwner = event.owner === currentUser.id;
    const isLocked = !isOwner;
    const conflicts = checkConflicts(event);
    
    return `
        <div class="event-card ${isLocked ? 'locked' : ''}" data-id="${event.id}">
            ${isLocked ? `
                <div class="lock-badge" title="Kilitli - Sadece sahibi düzenleyebilir">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
            ` : ''}
            
            <div class="event-header">
                <div>
                    <div class="event-type-badge" style="background: ${eventTypes[event.type].color};">
                        ${eventTypes[event.type].label}
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${formatDate(event.date)} • ${event.startTime} - ${event.endTime}
                    </div>
                </div>
                
                ${!isLocked ? `
                    <div class="event-actions">
                        <button class="event-action-btn edit" onclick="editEvent(${event.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="event-action-btn delete" onclick="deleteEvent(${event.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <div class="event-meta">
                ${event.location ? `<div class="event-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${event.location}</div>` : ''}
                ${event.teacher ? `<div class="event-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>${event.teacher}</div>` : ''}
                ${event.students ? `<div class="event-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>${event.students}</div>` : ''}
            </div>
            
            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
            
            <div class="event-badges">
                <span class="priority-badge" style="background: ${priorityLevels[event.priority].color}33; color: ${priorityLevels[event.priority].color};">
                    ${priorityLevels[event.priority].label}
                </span>
                <span class="status-badge" style="background: ${statusOptions[event.status].color}33; color: ${statusOptions[event.status].color};">
                    ${statusOptions[event.status].label}
                </span>
                ${isOwner ? `<span class="owner-badge" style="background: #10b98133; color: #10b981;">Benim</span>` : ''}
            </div>
            
            ${conflicts.length > 0 ? `
                <div class="conflict-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>${conflicts.length} çakışma!</span>
                </div>
            ` : ''}
        </div>
    `;
}

// ====================================
// UTILITY FUNCTIONS
// ====================================
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function checkConflicts(event) {
    return events.filter(e => {
        if (e.id === event.id) return false;
        if (e.date !== event.date) return false;
        const eStart = parseTime(e.startTime);
        const eEnd = parseTime(e.endTime);
        const eventStart = parseTime(event.startTime);
        const eventEnd = parseTime(event.endTime);
        return (eventStart < eEnd && eventEnd > eStart);
    });
}

function checkForConflicts() {
    const date = document.getElementById('eventDate').value;
    const startTime = document.getElementById('eventStartTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    
    if (!date || !startTime || !endTime) return;
    
    const tempEvent = { id: editingEventId, date, startTime, endTime };
    const conflicts = checkConflicts(tempEvent);
    const warning = document.getElementById('conflictWarning');
    const message = document.getElementById('conflictMessage');
    
    if (conflicts.length > 0) {
        warning.style.display = 'flex';
        message.textContent = `${conflicts.length} etkinlik: ${conflicts.map(c => c.title).join(', ')}`;
    } else {
        warning.style.display = 'none';
    }
}

// ====================================
// MODAL FUNCTIONS
// ====================================
function openAddEventModal() {
    console.log('➕ Modal açılıyor...');
    editingEventId = null;
    document.getElementById('modalTitle').textContent = 'Yeni Etkinlik';
    document.getElementById('eventForm').reset();
    document.getElementById('eventDate').value = formatDateForInput(new Date());
    document.getElementById('eventModal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
}

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    if (event.owner !== currentUser.id) {
        alert('Bu etkinliği düzenleyemezsiniz!');
        return;
    }
    
    editingEventId = eventId;
    document.getElementById('modalTitle').textContent = 'Etkinliği Düzenle';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventPriority').value = event.priority;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventStartTime').value = event.startTime;
    document.getElementById('eventEndTime').value = event.endTime;
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventTeacher').value = event.teacher || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventStudents').value = event.students || '';
    document.getElementById('eventStatus').value = event.status;
    document.getElementById('eventModal').classList.add('active');
}

function saveEvent(e) {
    e.preventDefault();
    
    const formData = {
        id: editingEventId || Date.now(),
        owner: editingEventId ? events.find(e => e.id === editingEventId).owner : currentUser.id,
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        priority: document.getElementById('eventPriority').value,
        date: document.getElementById('eventDate').value,
        startTime: document.getElementById('eventStartTime').value,
        endTime: document.getElementById('eventEndTime').value,
        location: document.getElementById('eventLocation').value,
        teacher: document.getElementById('eventTeacher').value,
        description: document.getElementById('eventDescription').value,
        students: document.getElementById('eventStudents').value,
        status: document.getElementById('eventStatus').value
    };
    
    const conflicts = checkConflicts(formData);
    if (conflicts.length > 0) {
        if (!confirm(`Çakışma var: ${conflicts.map(c => c.title).join(', ')}\n\nKaydetmek istiyor musunuz?`)) return;
    }
    
    if (editingEventId) {
        events = events.map(e => e.id === editingEventId ? formData : e);
        showToast('Etkinlik güncellendi!', 'success');
    } else {
        events.push(formData);
        showToast('Etkinlik eklendi!', 'success');
    }
    
    saveEvents();
    closeEventModal();
    filterEvents();
    updateStats();
}

function deleteEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    if (event.owner !== currentUser.id) {
        alert('Bu etkinliği silemezsiniz!');
        return;
    }
    
    if (!confirm(`"${event.title}" silinecek. Emin misiniz?`)) return;
    
    events = events.filter(e => e.id !== eventId);
    saveEvents();
    filterEvents();
    updateStats();
    showToast('Etkinlik silindi!', 'success');
}

// ====================================
// STATS & UI
// ====================================
function updateStats() {
    const myEvents = events.filter(e => e.owner === currentUser.id);
    const conflicts = events.filter(e => checkConflicts(e).length > 0);
    
    const totalEl = document.getElementById('totalEvents');
    const myEl = document.getElementById('myEvents');
    const conflictEl = document.getElementById('conflictCount');
    
    if (totalEl) totalEl.textContent = events.length;
    if (myEl) myEl.textContent = myEvents.length;
    if (conflictEl) conflictEl.textContent = conflicts.length;
}

function changeView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    const viewBtn = document.querySelector(`.view-btn[data-view="${view}"]`);
    if (viewBtn) viewBtn.classList.add('active');
    
    const grid = document.getElementById('eventsGrid');
    if (view === 'list') grid.classList.add('list-view');
    else grid.classList.remove('list-view');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterOwnership').value = 'all';
    filterEvents();
}

function refreshEvents() {
    loadEvents();
    filterEvents();
    updateStats();
    showToast('Yenilendi!', 'info');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
    if (confirm('Çıkış yapmak istiyor musunuz?')) {
        alert('Demo modda çıkış yapılamaz');
    }
}

// Make functions global
window.openAddEventModal = openAddEventModal;
window.closeEventModal = closeEventModal;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.filterEvents = filterEvents;
window.resetFilters = resetFilters;
window.refreshEvents = refreshEvents;
window.changeView = changeView;
window.toggleSidebar = toggleSidebar;
window.logout = logout;

console.log('%c✨ Dashboard Hazır - Tamamen Çalışıyor!', 'color: #10b981; font-size: 18px; font-weight: bold;');