<template>
  <div class="filter-box">
    <h3>Student Search & Filter</h3>

    <div class="filter-inputs">
      <div class="filter-field">
        <label>Search</label>
        <input type="text" v-model="values.search" placeholder="Name, ISU, group, notes" @input="emitTyping" />
      </div>
      <div class="filter-field">
        <label>Full Name</label>
        <input type="text" v-model="values.fullName" maxlength="50" placeholder="Full Name (e.g. Islam)" @input="emitTyping" />
      </div>
      <div class="filter-field">
        <label>Group</label>
        <input type="text" v-model="values.group" maxlength="5" placeholder="Group (e.g. P3278)" @input="emitTyping" />
      </div>
      <div class="filter-field">
        <label>Dormitory</label>
        <input type="number" v-model="values.dormitoryNumber" min="1" max="99" placeholder="Dormitory (1-99)" @input="emitTyping" />
      </div>
      <div class="filter-field">
        <label>Room</label>
        <input type="number" v-model="values.room" min="1" max="9999" placeholder="Room (1-9999)" @input="emitTyping" />
      </div>
      <div class="filter-field">
        <label>ISU ID</label>
        <input type="text" v-model="values.isuId" maxlength="6" placeholder="ISU ID (6 digits)" @input="emitTyping" />
      </div>
      <div class="filter-field">
        <label>Accommodation from</label>
        <input type="date" v-model="values.accommodationFrom" @change="emitApply" />
      </div>
      <div class="filter-field">
        <label>Accommodation to</label>
        <input type="date" v-model="values.accommodationTo" @change="emitApply" />
      </div>
      <div class="filter-field">
        <label>International</label>
        <select v-model="values.isInternational" @change="emitApply">
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div class="filter-field">
        <label>Notes</label>
        <input type="text" v-model="values.notes" placeholder="Notes" @input="emitTyping" />
      </div>
    </div>

    <div class="filter-buttons">
      <button type="button" class="btn btn-danger" @click="reset">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const FIELDS = [
  'search', 'isuId', 'fullName', 'group', 'dormitoryNumber', 'room',
  'accommodationFrom', 'accommodationTo', 'isInternational', 'notes'
];

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['typing', 'apply', 'reset']);

function emptyValues() {
  return Object.fromEntries(FIELDS.map((f) => [f, '']));
}

const values = reactive(emptyValues());
for (const f of FIELDS) {
  if (props.initial[f] !== undefined && props.initial[f] !== null) values[f] = props.initial[f];
}

function emitTyping() {
  emit('typing', { ...values });
}

function emitApply() {
  emit('apply', { ...values });
}

function reset() {
  Object.assign(values, emptyValues());
  emit('reset', emptyValues());
}
</script>
