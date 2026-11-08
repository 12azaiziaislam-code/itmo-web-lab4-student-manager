import { onMounted, onUnmounted } from 'vue';
import { Subject, from, EMPTY, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs';
import { useStudentStore } from '../stores/students';

/**
 * RxJS Reactive Search and Filtering Pipeline for Student Dashboard
 */
export function useStudentSearch() {
  const studentStore = useStudentStore();
  const searchSubject$ = new Subject();
  let subscription = null;

  onMounted(() => {
    subscription = searchSubject$
      .pipe(
        debounceTime(350),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap((filters) =>
          from(studentStore.fetchStudents(filters)).pipe(
            catchError((err) => {
              console.error('RxJS search pipeline caught error:', err);
              return EMPTY;
            })
          )
        )
      )
      .subscribe();
  });

  onUnmounted(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
    searchSubject$.complete();
  });

  function emitSearch(filters) {
    searchSubject$.next({ ...filters });
  }

  return {
    emitSearch
  };
}

export default useStudentSearch;

