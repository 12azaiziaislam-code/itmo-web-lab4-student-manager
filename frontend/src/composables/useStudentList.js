import { onMounted, onUnmounted } from 'vue';
import {
  Subject,
  merge,
  of,
  timer,
  debounce,
  distinctUntilChanged,
  map,
  tap,
  switchMap,
  catchError
} from 'rxjs';
import { useStudentStore } from '../stores/students';
import studentService from '../services/studentService';
import { fromRequest } from '../utils/rx';
import { getErrorMessage } from '../utils/errors';

const sameFilters = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function useStudentList() {
  const store = useStudentStore();
  const filterInput$ = new Subject();
  const reload$ = new Subject();
  let subscription = null;

  const filterChanges$ = filterInput$.pipe(
    debounce(({ immediate }) => timer(immediate ? 0 : 400)),
    map(({ values }) => values),
    distinctUntilChanged(sameFilters),
    tap((values) => {
      store.filters = { ...store.filters, ...values, offset: 0 };
    })
  );

  const result$ = merge(filterChanges$, reload$).pipe(
    tap(() => {
      store.loading = true;
      store.error = null;
    }),
    switchMap(() =>
      fromRequest((signal) => studentService.getStudents(store.filters, signal)).pipe(
        map((page) => ({ page })),
        catchError((error) => of({ error }))
      )
    )
  );

  onMounted(() => {
    subscription = result$.subscribe(({ page, error }) => {
      store.loading = false;
      if (error) {
        store.error = getErrorMessage(error, 'Could not load students');
        return;
      }
      store.students = page.items;
      store.total = page.total;

      if (page.items.length === 0 && store.filters.offset > 0) {
        store.filters.offset = Math.max(0, store.filters.offset - store.filters.limit);
        reload$.next();
      }
    });
    reload$.next();
  });

  onUnmounted(() => {
    subscription?.unsubscribe();
    filterInput$.complete();
    reload$.complete();
  });

  function changeFilters(values) {
    filterInput$.next({ values: { ...values }, immediate: false });
  }

  function applyFilters(values) {
    filterInput$.next({ values: { ...values }, immediate: true });
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
    reload$.next();
  }

  function goToPage(page) {
    if (page < 1 || page > store.totalPages) return;
    store.filters.offset = (page - 1) * store.filters.limit;
    reload$.next();
  }

  function setLimit(limit) {
    store.filters.limit = Number(limit);
    store.filters.offset = 0;
    reload$.next();
  }

  function resetFilters(emptyValues) {
    store.resetFilters();
    applyFilters(emptyValues);
    reload$.next();
  }

  return { changeFilters, applyFilters, reload, sortBy, goToPage, setLimit, resetFilters };
}

export default useStudentList;
