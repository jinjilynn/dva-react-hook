import useHState from '../useHState';
import useModel from '../useModel';
import useDispatch from '../useDispatch';
function connect(model,action){
    useHState();
    return (Component) => {
      return (props) =>{
        const [ state,setState ] = useModel(model);
        const dispatch = action ? useDispatch(action) : null;
        return <Component hookState = { state } setHookState={ setState } dispatch={dispatch} {...props}/>
      }
    }
}

export default connect;