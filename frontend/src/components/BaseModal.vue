<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-backdrop"
      @mousedown.self="pressedOnBackdrop = true"
      @click.self="onBackdropClick"
    >
      <div class="modal" role="dialog" aria-modal="true" @mousedown="pressedOnBackdrop = false">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  closable: { type: Boolean, default: true }
});

const emit = defineEmits(['close']);

const pressedOnBackdrop = ref(false);

function requestClose() {
  if (props.closable) emit('close');
}

function onBackdropClick() {
  const wasPressedHere = pressedOnBackdrop.value;
  pressedOnBackdrop.value = false;
  if (wasPressedHere) requestClose();
}

function onKeydown(event) {
  if (event.key === 'Escape') requestClose();
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  },
  { immediate: true }
);

onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>
