<template>
  <div class="modal-backdrop" v-if="isOpen && student" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="header-info">
          <h3>Student Dossier</h3>
          <span class="isu-tag">ISU: {{ student.isuId }}</span>
        </div>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="dossier-grid">
          <div class="dossier-item">
            <span class="item-label">Full Name</span>
            <span class="item-value highlight">{{ student.fullName }}</span>
          </div>

          <div class="dossier-item">
            <span class="item-label">Student Group</span>
            <span class="item-value group-badge">{{ student.group }}</span>
          </div>

          <div class="dossier-item">
            <span class="item-label">Dormitory Number</span>
            <span class="item-value">Dorm #{{ student.dormitoryNumber }}</span>
          </div>

          <div class="dossier-item">
            <span class="item-label">Room Number</span>
            <span class="item-value">Room {{ student.room }}</span>
          </div>

          <div class="dossier-item">
            <span class="item-label">Accommodation Date</span>
            <span class="item-value">{{ formatDate(student.accommodationPeriod) }}</span>
          </div>

          <div class="dossier-item">
            <span class="item-label">Residency Status</span>
            <span
              class="status-pill"
              :class="student.isInternational ? 'pill-international' : 'pill-local'"
            >
              {{ student.isInternational ? 'International Student' : 'Domestic Student' }}
            </span>
          </div>
        </div>

        <div class="dossier-notes">
          <span class="item-label">Dossier Notes & Requests</span>
          <div class="notes-content">
            {{ student.notes || 'No special requests or notes registered.' }}
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">
          Close
        </button>
        <button
          v-if="isAdmin"
          type="button"
          class="btn-primary"
          @click="$emit('edit', student)"
        >
          Edit Dossier
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  student: {
    type: Object,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close', 'edit']);

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border);
  border-radius: 10px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-info h3 {
  font-size: 1.2rem;
  color: var(--text-main);
}
.isu-tag {
  background-color: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-family: monospace;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.btn-close {
  background: transparent;
  font-size: 1.5rem;
  color: var(--text-muted);
  padding: 0 4px;
}
.btn-close:hover {
  color: var(--text-main);
}
.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dossier-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.dossier-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
.item-value {
  color: var(--text-main);
  font-size: 0.95rem;
  font-weight: 500;
}
.item-value.highlight {
  font-size: 1.05rem;
  color: #f8fafc;
  font-weight: 600;
}
.group-badge {
  display: inline-block;
  background-color: var(--border);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  width: fit-content;
}
.status-pill {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 9999px;
  font-weight: 600;
  width: fit-content;
}
.pill-international {
  background-color: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.4);
}
.pill-local {
  background-color: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}
.dossier-notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.notes-content {
  background-color: var(--bg-color);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 14px;
  color: var(--text-main);
  font-size: 0.9rem;
  line-height: 1.5;
  min-height: 50px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}
.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--text-main);
}
.btn-secondary:hover {
  background-color: var(--border);
}
.btn-primary {
  background-color: var(--primary);
  color: white;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
}
</style>
