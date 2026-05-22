export function createMockFetch({ failTimes = 0 } = {}) {
  let attempts = 0;

  return async (url, init = {}) => {
    attempts += 1;
    if (attempts <= failTimes) {
      throw new Error("temporary network failure");
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ok: true,
          url,
          method: init.method,
          attempts,
        };
      },
    };
  };
}
