import connect from '../src/connect';
import useModel from '../src/useModel';
import useDispatch from '../src/useDispatch';

jest.mock('../src/useModel');
jest.mock('../src/useDispatch');

describe('connect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useModel.mockReturnValue(['STATE', jest.fn()]);
    useDispatch.mockReturnValue(jest.fn());
  });

  test('injects model state and setter props', () => {
    const View = () => null;

    const Wrapped = connect('user')(View);
    const element = Wrapped({ p: 1 });

    expect(element.props.userState).toBe('STATE');
    expect(typeof element.props.setuser).toBe('function');
    expect(element.props.p).toBe(1);
  });

  test('injects dispatch prop when action config is provided', () => {
    const dispatchFn = jest.fn();
    useDispatch.mockReturnValue(dispatchFn);

    const View = () => null;

    const Wrapped = connect('user', {
      name: 'doRun',
      action: { type: 'user/run' },
    })(View);

    const element = Wrapped({});

    expect(element.props.doRun).toBe(dispatchFn);
  });
});
