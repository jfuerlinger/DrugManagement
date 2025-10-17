import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // Anzahl gleichzeitiger Benutzer
  duration: '120s', // Testdauer
};

export default function () {
  const url = 'https://app-backend-dev.jollyfield-c85494b9.westeurope.azurecontainerapps.io/api/slots?day=2025-09-04';
  const params = {
    headers: {
      'accept': '*/*',
    },
  };

  let res = http.get(url, params);

  check(res, {
    'Status ist 200': (r) => r.status === 200,
  });

  sleep(1); // optional: kleine Pause zwischen Requests
}
