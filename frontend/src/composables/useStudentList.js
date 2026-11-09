import { onMounted, onUnmounted } from 'vue';
import { Subject, merge, EMPTY, debounceTime, tap, switchMap, catchError } from 'rxjs';
import { useStudentStore } from '../stores/students';
import studentService from '../services/studentService';
import { fromRequest } from '../utils/rx';
import { getErrorMessage } from '../utils/errors';

export function useStudentList() {
  const store = useStudentStore();
  const search$ = new Subject();
  const reload$ = new Subject();
  let subscription = null;

  const filtersChanged$ = search$.pipe(
    debounceTime(400),
    tap((values) => {
      store.filters = { ...store.filters, ...values, offset: 0 };
    })
  );

  const students$ = merge(filtersChanged$, reload$).pipe(
    tap(() => {
      store.loading = true;
      store.error = null;
    }),
    switchMap(() =>
      fromRequest((signal) => studentService.getStudents(store.filters, signal)).pipe(
        catchError((err) => {
          store.loading = false;
          store.error = getErrorMessage(err, 'Could not load students');
          return EMPTY;
        })
      )
    )
  );

  onMounted(() => {
    subscription = students$.subscribe((page) => {
      store.loading = false;
      store.students = page.items;
      store.total = page.total;

      if (page.items.length === 0 && store.filters.offset > 0) {
        goToPage(store.currentPage - 1);
      }
    });
    reload$.next();
  });

  onUnmounted(() => {
    if (subscription) subscription.unsubscribe();
  });

  function search(values) {
    search$.next(values);
  }

  function reload() {
    reload$.next();
  }

  function sortBy(field) {
    if (store.filters.sortBy === field) {
      store.filters.order = store.filters.order === 'asc' ? 'desc' : 'asc';
    } else {
      store.filters.sortBy = field;
      store.filters.order = 'asc';
    }
    store.filters.offset = 0;
    reload();
  }

  function goToPage(page) {
    if (page < 1) return;
    store.filters.offset = (page - 1) * store.filters.limit;
    reload();
  }

  function setLimit(limit) {
    store.filters.limit = limit;
    store.filters.offset = 0;
    reload();
  }

  function resetFilters(emptyValues) {
    store.resetFilters();
    search(emptyValues);
  }

  return { search, reload, sortBy, goToPage, setLimit, resetFilters };
}

export default useStudentList;
