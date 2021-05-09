// Look for a file in __mocks__/
jest.mock('../nats-wrapper');
jest.mock('../queues/expiration-queue');

beforeAll(async () => {
  // temp hack to deal with emulating
  // a k8s secret
});

beforeEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {});
