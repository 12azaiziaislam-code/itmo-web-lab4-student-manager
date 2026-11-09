import { ref, onUnmounted } from 'vue';
import { Subject, from, exhaustMap, finalize } from 'rxjs';

// while saving, new clicks are ignored
export function useSubmit(action) {
  const isSubmitting = ref(false);
  const clicks$ = new Subject();

  const subscription = clicks$
    .pipe(
      exhaustMap(() => {
        isSubmitting.value = true;
        return from(action()).pipe(
          finalize(() => {
            isSubmitting.value = false;
          })
        );
      })
    )
    .subscribe();

  onUnmounted(() => subscription.unsubscribe());

  function submit() {
    clicks$.next();
  }

  return { isSubmitting, submit };
}

export default useSubmit;
