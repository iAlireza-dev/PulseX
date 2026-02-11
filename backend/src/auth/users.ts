export type FakeUser = {
  id: string;
  username: string;
  passwordHash: string;
};

export const users: FakeUser[] = [
  {
    id: "u1",
    username: "ali",

    passwordHash:
      "$2b$10$HzAZBiT3xVMyPt519YtibOtCq13vqTYhNTN1ZMMx.vBhnYRQLcCB2",
  },
  {
    id: "u2",
    username: "test",
    passwordHash:
      "$2b$10$HzAZBiT3xVMyPt519YtibOtCq13vqTYhNTN1ZMMx.vBhnYRQLcCB2",
  },
];
