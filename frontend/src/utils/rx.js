import { Observable } from 'rxjs';

// request is aborted on unsubscribe
export function fromRequest(makeRequest) {
  return new Observable((subscriber) => {
    const controller = new AbortController();

    makeRequest(controller.signal)
      .then((result) => {
        subscriber.next(result);
        subscriber.complete();
      })
      .catch((err) => subscriber.error(err));

    return () => controller.abort();
  });
}
