const originalWarn = console.warn;

jest.spyOn(console, "warn").mockImplementation((...args) => {
  const message = args.map(String).join(" ");
  if (message.includes("ExpoModulesCoreJSLogger")) return;
  originalWarn(...args);
});
