const { Command } = require('commander');
const proxyManager = require('../fetcher/proxyManager');
const { registerProxyCommands } = require('./commands.proxy');

jest.mock('../fetcher/proxyManager');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerProxyCommands(program);
  return program;
}

describe('commands.proxy', () => {
  let consoleSpy;
  let errorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('proxy add calls addProxy and logs success', () => {
    proxyManager.addProxy.mockImplementation(() => {});
    makeProgram().parse(['proxy', 'add', 'http://proxy.example.com:8080'], { from: 'user' });
    expect(proxyManager.addProxy).toHaveBeenCalledWith('http://proxy.example.com:8080', { weight: 1 });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Proxy added'));
  });

  test('proxy add with --weight option', () => {
    proxyManager.addProxy.mockImplementation(() => {});
    makeProgram().parse(['proxy', 'add', 'http://p:3128', '--weight', '3'], { from: 'user' });
    expect(proxyManager.addProxy).toHaveBeenCalledWith('http://p:3128', { weight: 3 });
  });

  test('proxy add logs error on failure', () => {
    proxyManager.addProxy.mockImplementation(() => { throw new Error('invalid url'); });
    makeProgram().parse(['proxy', 'add', 'bad'], { from: 'user' });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('invalid url'));
  });

  test('proxy remove calls removeProxy', () => {
    proxyManager.removeProxy.mockImplementation(() => {});
    makeProgram().parse(['proxy', 'remove', 'http://proxy.example.com:8080'], { from: 'user' });
    expect(proxyManager.removeProxy).toHaveBeenCalledWith('http://proxy.example.com:8080');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Proxy removed'));
  });

  test('proxy reset calls resetProxy', () => {
    proxyManager.resetProxy.mockImplementation(() => {});
    makeProgram().parse(['proxy', 'reset', 'http://proxy.example.com:8080'], { from: 'user' });
    expect(proxyManager.resetProxy).toHaveBeenCalledWith('http://proxy.example.com:8080');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Proxy reset'));
  });

  test('proxy list prints each proxy', () => {
    proxyManager.listProxies.mockReturnValue([
      { url: 'http://a:3128', weight: 1, failures: 0, disabled: false },
      { url: 'http://b:3128', weight: 2, failures: 3, disabled: true },
    ]);
    makeProgram().parse(['proxy', 'list'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('http://a:3128'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('disabled'));
  });

  test('proxy list shows message when empty', () => {
    proxyManager.listProxies.mockReturnValue([]);
    makeProgram().parse(['proxy', 'list'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No proxies'));
  });

  test('proxy next shows selected proxy', () => {
    proxyManager.getNextProxy.mockReturnValue({ url: 'http://a:3128' });
    makeProgram().parse(['proxy', 'next'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('http://a:3128'));
  });

  test('proxy next shows message when none available', () => {
    proxyManager.getNextProxy.mockReturnValue(null);
    makeProgram().parse(['proxy', 'next'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No available proxy'));
  });
});
