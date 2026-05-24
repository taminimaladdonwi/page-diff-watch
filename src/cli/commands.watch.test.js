const { registerWatchCommands } = require('./commands.watch');

jest.mock('../storage/watchlist');
jest.mock('../fetcher/urlValidator');
jest.mock('./parseInterval');
jest.mock('./parseSelector');
jest.mock('./formatTable');

const watchlist = require('../storage/watchlist');
const { validateUrl, normalizeUrl } = require('../fetcher/urlValidator');
const { parseInterval } = require('./parseInterval');
const { formatTable } = require('./formatTable');

function makeProgram() {
  const commands = {};
  const program = {
    command(name) {
      const cmd = {
        _name: name,
        description() { return this; },
        option(f, d, def) { this._opts = this._opts || {}; if (def !== undefined) this._opts[f] = def; return this; },
        action(fn) { this._action = fn; commands[name.split(' ')[0]] = this; return this; },
      };
      return cmd;
    },
  };
  registerWatchCommands(program);
  return commands;
}

beforeEach(() => {
  jest.clearAllMocks();
  validateUrl.mockReturnValue({ valid: true });
  normalizeUrl.mockImplementation((u) => u);
  parseInterval.mockReturnValue(300000);
  watchlist.addEntry.mockResolvedValue({ label: 'example', url: 'https://example.com', intervalMs: 300000 });
  watchlist.removeEntry.mockResolvedValue(true);
  watchlist.load.mockResolvedValue([]);
  formatTable.mockReturnValue('table output');
});

test('add command calls addEntry with correct args', async () => {
  const cmds = makeProgram();
  const opts = { interval: '5m', selector: null, label: undefined };
  await cmds['add']._action('https://example.com', opts);
  expect(watchlist.addEntry).toHaveBeenCalledWith(expect.objectContaining({
    url: 'https://example.com',
    intervalMs: 300000,
  }));
});

test('add command exits on invalid URL', async () => {
  validateUrl.mockReturnValue({ valid: false, reason: 'bad url' });
  const cmds = makeProgram();
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(cmds['add']._action('bad', {})).rejects.toThrow('exit');
  mockExit.mockRestore();
});

test('remove command calls removeEntry', async () => {
  const cmds = makeProgram();
  await cmds['remove']._action('https://example.com');
  expect(watchlist.removeEntry).toHaveBeenCalledWith('https://example.com');
});

test('remove command exits when entry not found', async () => {
  watchlist.removeEntry.mockResolvedValue(false);
  const cmds = makeProgram();
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(cmds['remove']._action('https://missing.com')).rejects.toThrow('exit');
  mockExit.mockRestore();
});

test('list command prints table when entries exist', async () => {
  watchlist.load.mockResolvedValue([{ label: 'Test', url: 'https://test.com', intervalMs: 60000, selector: null }]);
  const cmds = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await cmds['list']._action();
  expect(formatTable).toHaveBeenCalled();
  spy.mockRestore();
});

test('list command prints empty message when no entries', async () => {
  const cmds = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await cmds['list']._action();
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No URLs'));
  spy.mockRestore();
});
