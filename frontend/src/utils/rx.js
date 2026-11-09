import { Observable } from 'rxjs';

export function fromRequest(request) {
  return new Observable((subscriber) => {
    const controller = new AbortController();

    request(controller.signal)
      .then((data) => {
        subscriber.next(data);
        subscriber.complete();
      })
      .catch((err) => subscriber.error(err));

    // cancel old request
    return () => controller.abort();
  });
}
