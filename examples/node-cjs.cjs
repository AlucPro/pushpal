const { PushPal } = require("../dist/index.cjs");

const client = new PushPal({
  fetch: async () => ({
    ok: true,
    status: 200,
    async json() {
      return { ok: true };
    },
  }),
});

client
  .ntfy(
    { topic: "my-alerts" },
    {
      title: "pushpal example",
      body: "Hello from CommonJS",
    },
  )
  .then((results) => {
    console.log(results);
  });
