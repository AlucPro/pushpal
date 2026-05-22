export function createJsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    async json() {
      return body;
    },
    async text() {
      return typeof body === "string" ? body : JSON.stringify(body);
    },
  };
}

export function createTextResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    async json() {
      throw new Error("not json");
    },
    async text() {
      return body;
    },
  };
}

export function readJsonRequest(fetchMock, index = 0) {
  const [, init] = fetchMock.mock.calls[index];
  return JSON.parse(init.body);
}
