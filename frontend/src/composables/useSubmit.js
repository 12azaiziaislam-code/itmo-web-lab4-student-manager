import { ref, onUnmounted } from 'vue';
import { Subject, defer, exhaustMap, finalize, catchError, EMPTY } from 'rxjs';

// exhaustMap ignores new submits while the previous one is running
export function useSubmit(action) {
  const isSubmitting = ref(false);
  const submit$ = new Subject();

  const subscription = submit$
    .pipe(
      exhaustMap((args) => {
        isSubmitting.value = true;
        return defer(() => action(...args)).pipe(
          catchError(() => EMPTY),
          finalize(() => {
            isSubmitting.value = false;
          })
        );
      })
    )
    .subscribe();

  onUnmounted(() => {
    subscription.unsubscribe();
    submit$.complete();
  });

  function submit(...args) {
    submit$.next(args);
  }

  return { isSubmitting, submit };
}

export default useSubmit;
