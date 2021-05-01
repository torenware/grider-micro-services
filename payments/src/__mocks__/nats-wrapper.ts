// Mocked version.
export const natsWrapper = {
  client: {
    // publish: (subject: string, data: string, callback: () => {}) => {
    //   callback();
    // },
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => {}) => {
          callback();
        }
      ),
  },
};
